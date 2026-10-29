import { Graphics } from "pixi.js";
import { Box2D, METER, world } from "./world.js";

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
}


// ----------------------------------
// PARTICLE GRAPHICS
// ----------------------------------

let particleCount = 0;
let positionOffset = 0;

const particleGraphics = [];




const fluids = {
    water:{
         color: "#3399ff",
         velocity: new Box2D.b2Vec2(0,0),
         gravityScale: 1,
         viscocity: 0
    },

     lava: {
        color: "#ff5a1f",
        velocity: new Box2D.b2Vec2(0, 0.5),
        gravityScale: 1.2,
        viscocity: 0.08
    },

       steam: {
        color: "#dddddd",
        velocity: new Box2D.b2Vec2(0, -2),
        gravityScale: -0.5,
        viscosity: 0
    }
}


let brushSize = 30;
let brushAmount = 5;

function setBrushSize(value) {
    brushSize = Number(value);
}

function setBrushAmount(value) {
    brushAmount = Number(value);
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
    setBrushAmount
    
};

function createFluidAt(x,y,fluidType){
    const particleDef = new Box2D.b2ParticleDef();

    particleDef.position = new Box2D.b2Vec2(x/METER,y/METER);

    // Default initial velocity

    particleDef.velocity = fluids[fluidType].velocity;



    const particleIndex = particleSystem.CreateParticle(particleDef);

    particleTypes[particleIndex] = fluidType;
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
        }
    }
    particleCount =
        particleGraphics.length;

    positionOffset =
        Box2D.getPointer(
            particleSystem.GetPositionBuffer()
        ) >> 2;
}