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

watershape.SetAsBox(
    waterWidth,
    waterWeight,
    new Box2D.b2Vec2(waterSpawnX, waterSpawnY),
    0
);

//Generate particles inside this shape

particleGroupDef.shape = watershape;

particleSystem.CreateParticleGroup(particleGroupDef);


// ----------------------------------
// PARTICLE GRAPHICS
// ----------------------------------

let particleCount = 0;
let positionOffset = 0;

const particleGraphics = [];

const particleTypes = [];

const fluidColors = {
    water: "#3399ff",
    lava: "#ff5a1f",
    steam: "#dddddd"
};


function createParticleGraphics(app) {

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
            particleSystem.GetRadius() * METER;

        particleGraphic
            .circle(0, 0, visualRadius)
            .fill("#3399ff");

        app.stage.addChild(particleGraphic);

        particleGraphics.push(particleGraphic);

        //Then we move that Graphics to the actual position that says LiquidFun.
    }
}


function destroyParticleGraphics(app) {

    for (const particleGraphic of particleGraphics) {

        app.stage.removeChild(particleGraphic);

        particleGraphic.destroy();
    }

    particleGraphics.length = 0;
}


function resetWater(app, newRadius) {

    // 1. Remove Pixi graphics

    destroyParticleGraphics(app);

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

    createParticleGraphics(app);
}


function changeWaterAmount(app, value) {

    waterWidth = Number(value);

    resetWater(
        app,
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
    syncParticleGraphics
};

function createFluidAt(x,y,fluidType){
    const particleDef = new Box2D.b2ParticleDef();

    particleDef.position = new Box2D.b2Vec2(x/METER,y/METER);

    const particleIndex = particleSystem.CreateParticle(particleDef);

    particleTypes[particleIndex] = fluidType;
}

function syncParticleGraphics(app){

    const newParticleCount = particleSystem.GetParticleCount();

    const visualRadius = particleSystem.GetRadius() * METER;

    while(particleGraphics.length < newParticleCount){
        const particleGraphic = new Graphics();

        const particleIndex = particleGraphics.length;

        const fluidType = particleTypes[particleIndex];

        const particleColor = fluidColors[fluidType];


        particleGraphic.circle(0,0,visualRadius).fill(particleColor);

        app.stage.addChild(particleGraphic);

        particleGraphics.push(particleGraphic);
    }

    particleCount = newParticleCount;

    positionOffset = Box2D.getPointer(particleSystem.GetPositionBuffer()) >> 2;
}



