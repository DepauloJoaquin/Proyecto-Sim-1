import { Graphics } from "pixi.js";
import { Box2D, METER, world } from "./world.js";
import { discoverElement} from "./discoveries.js";

//This is the container to manage the particles

const particleSystemDef = new Box2D.b2ParticleSystemDef();
let particleSystem = world.CreateParticleSystem(particleSystemDef);

// Smaller particle radius = particles are smaller,
// so more particles can fit in the same area.

particleSystem.SetRadius(0.08);

// This defines where the particle group will be created.

const particleGroupDef = new Box2D.b2ParticleGroupDef();

// The group needs a shape, just like a Body.

const watershape = new Box2D.b2PolygonShape();

// Larger shape = larger volume of water,
// so more particles will be generated.

let waterWidth = 1;
const waterWeight = 0.5;

const waterSpawnX = 4;
const waterSpawnY = 1;

// Stores the type of every LiquidFun particle
const particleTypes = [];

const particleTemperatures = [];


const fluids = {
    water:{
         color: "#3399ff",
         velocity: new Box2D.b2Vec2(0,0),
         gravityScale: 1,
         viscosity: 0,
         temperature: 20
    },

     lava: {
        color: "#ff5a1f",
        velocity: new Box2D.b2Vec2(0, 0.5),
        gravityScale: 1.2,
        viscosity: 0.08,
        temperature: 900
    },

       steam: {
        color: "#dddddd",
        velocity: new Box2D.b2Vec2(0, -2),
        gravityScale: -0.5,
        viscosity: 0,
        temperature: 120
    }
}

watershape.SetAsBox(
    waterWidth,
    waterWeight,
    new Box2D.b2Vec2(waterSpawnX, waterSpawnY),
    0
);

//Generate particles inside this shape

particleGroupDef.shape = watershape;

particleSystem.CreateParticleGroup(particleGroupDef);

// Get how many particles were created
const initialParticleCount =
    particleSystem.GetParticleCount();


// Mark all startup particles as water
for (let i = 0; i < initialParticleCount; i++) {
    particleTypes[i] = "water";

    particleTemperatures[i] = fluids.water.temperature;
}


// ----------------------------------
// PARTICLE GRAPHICS
// ----------------------------------

let particleCount = 0;
let positionOffset = 0;

const particleGraphics = [];







let brushSize = 30;
let brushAmount = 5;

function setBrushSize(value) {
    brushSize = Number(value);
}

function setBrushAmount(value) {
    brushAmount = Number(value);
}


function getFluidMetrics(){
    let water = 0;
    let lava = 0;
    let steam = 0;

    for(let i = 0; i < particleCount; i++){
        const fluidType = particleTypes[i];

        if(fluidType === "water"){
            water++;
        }

        if(fluidType === "lava"){
            lava++;
        }

        if(fluidType === "steam"){
            steam++;
        }
    }

    return{
        total: particleCount,
        water,
        lava,
        steam
    };
}


function createParticleGraphics(particleLayer) {

    //To represent the particles we must first count how many there are

    particleCount = particleSystem.GetParticleCount();

    //Index where the positions of the particles begin

    positionOffset =
        Box2D.getPointer(
            particleSystem.GetPositionBuffer()
        ) >> 2;

    //Now, to visualize them, we can create one Graphics

    for (let i = 0; i < particleCount; i++) {

        const particleGraphic = new Graphics();

        const visualRadius =
            particleSystem.GetRadius() * METER * 1.5;

        particleGraphic
            .circle(0, 0, visualRadius)
            .fill("#3399ff");

        particleLayer.addChild(particleGraphic);

        particleGraphics.push(particleGraphic);

        //Then we move that Graphics to the actual position that says LiquidFun.
    }
}


function destroyParticleGraphics(particleLayer) {

    for (const particleGraphic of particleGraphics) {

        particleLayer.removeChild(particleGraphic);

        particleGraphic.destroy();
    }

    particleGraphics.length = 0;
}


function resetWater(particleLayer, newRadius) {

    // 1. Remove Pixi graphics

    destroyParticleGraphics(particleLayer);

    // Remove the type information from the old particle system
    particleTypes.length = 0;

    particleTemperatures.length = 0;

    // 2. Delete the entire old LiquidFun particle system

    world.DestroyParticleSystem(particleSystem);

    // 3. Create a completely new particle system

    particleSystem =
        world.CreateParticleSystem(particleSystemDef);

    // 4. Change particle radius

    particleSystem.SetRadius(newRadius);

    watershape.SetAsBox(
        waterWidth,
        waterWeight,
        new Box2D.b2Vec2(
            waterSpawnX,
            waterSpawnY
        ),
        0
    );

    // 5. Create water again

    particleGroupDef.shape = watershape;

    particleSystem.CreateParticleGroup(
        particleGroupDef
    );

    // Get the amount of particles created at startup
    const initialParticleCount = particleSystem.GetParticleCount();

    // Mark all initial particles as water
    for(let i = 0; i < initialParticleCount; i++){
        particleTypes[i] = "water";
        particleTemperatures[i] = fluids.water.temperature;
    }

    


    // 6. Recreate Pixi graphics

    createParticleGraphics(particleLayer);
}


function changeWaterAmount(particleLayer, value) {

    waterWidth = Number(value);

    resetWater(
        particleLayer,
        particleSystem.GetRadius()
    );
}


function updateParticleGraphics() {

    const positions = Box2D.HEAPF32;

    for (let i = 0; i < particleCount; i++) {

        const index =
            positionOffset + i * 2;

        const x = positions[index];
        const y = positions[index + 1];

        particleGraphics[i].x =
            x * METER;

        particleGraphics[i].y =
            y * METER;
    }
}


export {
    particleSystem,
    createParticleGraphics,
    resetWater,
    changeWaterAmount,
    updateParticleGraphics,
    createFluidAt,
    createFluidBrush,
    syncParticleGraphics,
    updateFluidBehaviour,
    cleanupParticles,
    eraseFluidAt,
    setBrushSize,
    setBrushAmount,
    detectWaterLavaReactions,
    processWaterLavaReactions,
    getFluidMetrics,
    getReactionChecks,
    updateWaterTemperature,
    getTemperatureMetrics,
    createPendingSteam
    
};

function createFluidAt(x,y,fluidType){
    const particleDef = new Box2D.b2ParticleDef();

    particleDef.position = new Box2D.b2Vec2(x/METER,y/METER);

    // Default initial velocity

    particleDef.velocity = fluids[fluidType].velocity;



    const particleIndex = particleSystem.CreateParticle(particleDef);

    particleTypes[particleIndex] = fluidType;

    particleTemperatures[particleIndex] = fluids[fluidType].temperature;
}



function createFluidBrush(x, y, fluidType) {

     for (let i = 0; i < brushAmount; i++) {

        const offsetX =
            (Math.random() - 0.5) * brushSize;

        const offsetY =
            (Math.random() - 0.5) * brushSize;

        createFluidAt(
            x + offsetX,
            y + offsetY,
            fluidType
        );
    }
}

function syncParticleGraphics(particleLayer){

    const newParticleCount = particleSystem.GetParticleCount();

    const visualRadius = particleSystem.GetRadius() * METER * 1.5;

    while(particleGraphics.length < newParticleCount){
        const particleGraphic = new Graphics();

        const particleIndex = particleGraphics.length;

        const fluidType = particleTypes[particleIndex];

        const particleColor = fluids[fluidType].color;


        particleGraphic.circle(0,0,visualRadius).fill(particleColor);

        particleLayer.addChild(particleGraphic);

        particleGraphics.push(particleGraphic);
    }

    particleCount = newParticleCount;

    positionOffset = Box2D.getPointer(particleSystem.GetPositionBuffer()) >> 2;
}

function updateFluidBehaviour(){
    const velocities = Box2D.HEAPF32;

    const velocityOffset = Box2D.getPointer(particleSystem.GetVelocityBuffer()) >> 2;

    for(let i = 0; i < particleCount; i++){
        const fluidType = particleTypes[i];

        const fluid = fluids[fluidType];

        

        if(!fluid){
            continue;
        }
        
        const index = velocityOffset + i * 2;
        
         // Steam upward behaviour
        if (fluid.gravityScale < 0) {

            velocities[index + 1] +=
                0.5 * fluid.gravityScale;
        }

        // Viscosity behaviour

        if (fluid.viscosity > 0) {

            velocities[index] *=
                1 - fluid.viscosity;

            velocities[index + 1] *=
                1 - fluid.viscosity;
        }    


    }
}

// Removes steam particles that are outside the top of the canvas
function cleanupParticles(particleLayer){
    const positions = Box2D.HEAPF32;

    const currentParticleCount = particleSystem.GetParticleCount();

    // Go backwards so indexes do not shift while deleting

    for(let i = currentParticleCount - 1; i>= 0 ;  i--){
        const index = positionOffset + i * 2;

         const y =
            positions[index + 1] * METER;

        const fluidType =
        particleTypes[i];


        if (
            fluidType === "steam" &&
            y < -50
        ){
             particleSystem.DestroyParticle(i);

            const graphic =
                particleGraphics[i];

            particleLayer.removeChild(graphic);

            graphic.destroy();

            particleGraphics.splice(i, 1);

            particleTypes.splice(i, 1);

            particleTemperatures.splice(i, 1);
        }
    }
      // Keep our graphic count synchronized
    particleCount = particleGraphics.length;

    // Refresh the position buffer
    positionOffset =
    Box2D.getPointer(
        particleSystem.GetPositionBuffer()
    ) >> 2;
}

function eraseFluidAt(x,y,particleLayer){
    const positions = Box2D.HEAPF32;

    const currentParticleCount =
        particleSystem.GetParticleCount();

      const eraseRadius = 30;

       for (let i = currentParticleCount - 1; i >= 0; i--){
             const index =
            positionOffset + i * 2;

        const particleX =
            positions[index] * METER;

        const particleY =
            positions[index + 1] * METER;

        const deltaX =
            particleX - x;

        const deltaY =
            particleY - y;


        const distance =
            Math.sqrt(
                deltaX * deltaX +
                deltaY * deltaY
        );

         if (distance <= eraseRadius) {

            particleSystem.DestroyParticle(i);

            const graphic =
                particleGraphics[i];

            particleLayer.removeChild(graphic);

            graphic.destroy();

            particleGraphics.splice(i, 1);

            particleTypes.splice(i, 1);

            particleTemperatures.splice(i, 1);
        }
    }
    particleCount =
        particleGraphics.length;

    positionOffset =
        Box2D.getPointer(
            particleSystem.GetPositionBuffer()
        ) >> 2;
}


let reactionChecks = 0;



function detectWaterLavaReactions(){
    reactionChecks = 0;

    const usedLavaParticles = new Set();
    const positions = Box2D.HEAPF32;

    const reactions = []

    const reactionRadius = 20;

    for(let i = 0; i < particleCount ; i++){
        if(particleTypes[i] !== "water"){
            continue;
        }

        const indexA = positionOffset + i *2;

        const waterX = positions[indexA] * METER;

        const waterY = positions[indexA + 1] * METER;

        for(let j = 0; j < particleCount; j++){
            if (particleTypes[j] !== "lava") {
                continue;
            }

            if (usedLavaParticles.has(j)) {
            continue;
            }

            const indexB = positionOffset + j * 2;

            const lavaX = positions[indexB] * METER;

            const lavaY = positions[indexB + 1] * METER;

            reactionChecks++;
            
            const deltaX = lavaX - waterX;

            const deltaY = lavaY - waterY;

            const distanceSquared = deltaX * deltaX + deltaY * deltaY


            if(distanceSquared <= reactionRadius * reactionRadius){
                reactions.push({
                    waterIndex: i,
                    lavaIndex: j,
                    x: (waterX + lavaX) / 2,
                    y: (waterY + lavaY) / 2
                });

                       usedLavaParticles.add(j);
                           break;
            }

         

            


        }
        
        
    }

    return reactions;
}


const pendingSteam = [];

function createPendingSteam(particleLayer) {

    if (pendingSteam.length === 0) return;

    for (const position of pendingSteam) {

        createFluidAt(
            position.x,
            position.y - 15,
            "steam"
        );

        discoverElement("steam");
    }

    pendingSteam.length = 0;

    syncParticleGraphics(particleLayer);
}


function processWaterLavaReactions(reactions, particleLayer) {

    const particlesToDelete = new Set();

    for (const reaction of reactions) {

        particlesToDelete.add(reaction.waterIndex);
        particlesToDelete.add(reaction.lavaIndex);

        pendingSteam.push({
            x: reaction.x,
            y: reaction.y
        });
    }

    const sortedIndexes = Array.from(particlesToDelete)
        .sort((a, b) => b - a);

    for (const index of sortedIndexes) {

        particleSystem.DestroyParticle(index);

        const graphic = particleGraphics[index];

        particleLayer.removeChild(graphic);
        graphic.destroy();

        particleGraphics.splice(index, 1);
        particleTypes.splice(index, 1);
        particleTemperatures.splice(index, 1);
    }

    particleCount = particleGraphics.length;

    positionOffset =
        Box2D.getPointer(
            particleSystem.GetPositionBuffer()
        ) >> 2;
}


function getReactionChecks(){
    return reactionChecks;
}


function updateWaterTemperature() {

    const positions = Box2D.HEAPF32;

    const heatRadius = 30;
    const heatAmount = 2;
    const coolingAmount = 0.2;

    for (let i = 0; i < particleCount; i++) {

        if (particleTypes[i] !== "water") {
            continue;
        }

        const waterIndex =
            positionOffset + i * 2;

        const waterX =
            positions[waterIndex] * METER;

        const waterY =
            positions[waterIndex + 1] * METER;

        let isBeingHeated = false;

        for (let j = 0; j < particleCount; j++) {

            if (particleTypes[j] !== "lava") {
                continue;
            }

            const lavaIndex =
                positionOffset + j * 2;

            const lavaX =
                positions[lavaIndex] * METER;

            const lavaY =
                positions[lavaIndex + 1] * METER;

            const deltaX =
                lavaX - waterX;

            const deltaY =
                lavaY - waterY;

            const distanceSquared =
                deltaX * deltaX +
                deltaY * deltaY;

            if (
                distanceSquared <=
                heatRadius * heatRadius
            ) {

                isBeingHeated = true;

                particleTemperatures[i] +=
                    heatAmount;

                if (
                    particleTemperatures[i] >= 100
                ) {
                    convertWaterToSteam(i);
                    updateParticleGraphicToSteam(i);
                }

                break;
            }
        }

        if (!isBeingHeated) {

            particleTemperatures[i] -=
                coolingAmount;

            if (
                particleTemperatures[i] <
                fluids.water.temperature
            ) {
                particleTemperatures[i] =
                    fluids.water.temperature;
            }
        }
    }
}

function convertWaterToSteam(i) {

    particleTypes[i] = "steam";

    particleTemperatures[i] =
        fluids.steam.temperature;

    const velocities =
        Box2D.HEAPF32;

    const velocityOffset =
        Box2D.getPointer(
            particleSystem.GetVelocityBuffer()
        ) >> 2;

    const velocityIndex =
        velocityOffset + i * 2;

    velocities[velocityIndex] =
        fluids.steam.velocity.x;

    velocities[velocityIndex + 1] =
        fluids.steam.velocity.y;

    discoverElement("steam")
}

function updateParticleGraphicToSteam(i) {

    const particleGraphic =
        particleGraphics[i];

    particleGraphic.clear();

    const visualRadius =
        particleSystem.GetRadius() * METER * 1.5;

    particleGraphic
        .circle(0, 0, visualRadius)
        .fill(fluids.steam.color);
}

function getTemperatureMetrics() {

    let waterTemperatureTotal = 0;
    let waterCount = 0;
    let maxWaterTemperature = 0;

    for (let i = 0; i < particleCount; i++) {

        if (particleTypes[i] !== "water") {
            continue;
        }

        const temperature =
            particleTemperatures[i];

        waterTemperatureTotal +=
            temperature;

        waterCount++;

        if (
            temperature >
            maxWaterTemperature
        ) {
            maxWaterTemperature =
                temperature;
        }
    }

    let averageWaterTemperature;

    if (waterCount > 0) {

        averageWaterTemperature =
            waterTemperatureTotal / waterCount;

    } else {

        averageWaterTemperature = 0;
    }

    return {
        averageWaterTemperature,
        maxWaterTemperature
    };
}