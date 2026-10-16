import {
    Application,
    Graphics,
    Text
} from "pixi.js";

import {
    Box2D,
    METER,
    world
} from "./world.js";

import {
    createParticleGraphics,
    updateParticleGraphics,
    resetWater,
    changeWaterAmount,
    createFluidAt,
    syncParticleGraphics
} from "./fluids.js";

import {
    createTerrainBlock
} from "./terrain.js";

import {
    setupSettings
} from "./settings.js";

import {
    setupDebug,
    setGridVisible,
    setFPSVisible,
    updateDebug
} from "./debug.js";

import "./ui.js";

import{
    getCurrentFluid,
    getCurrentTerrain,
    getCurrentTool
} from "./ui.js";


console.log("LiquidFun loaded");


// ----------------------------------
// PIXI
// ----------------------------------

const app = new Application();

await app.init({
    width: 800,
    height: 600,
    background: "#87ceeb"
});

const canvasContainer =
    document.getElementById("canvas-container");

canvasContainer.appendChild(app.canvas);


// ----------------------------------
// TERRAIN TEST
// ----------------------------------

createTerrainBlock(
    app,
    400,
    550,
    800,
    100
);


// ----------------------------------
// WATER GRAPHICS
// ----------------------------------

createParticleGraphics(app);

setupDebug(app);


// ----------------------------------
// SETTINGS
// ----------------------------------

setupSettings({
    app,
    world,
    Box2D,

    onRadiusChange: (value) => {

        resetWater(
            app,
            value
        );
    },

    onWaterAmountChange: (value) => {

        changeWaterAmount(
            app,
            value
        );
    },

    onFPSChange: (visible) => {

    setFPSVisible(visible);
},

onGridChange: (visible) => {

    setGridVisible(visible);
}
});


// ----------------------------------
// PHYSICS LOOP
// ----------------------------------

const particleIterations =
    world.CalculateReasonableParticleIterations(
        1 / 60
    );

app.ticker.add(() => {

    world.Step(
        1 / 60,
        8,
        3,
        particleIterations
    );

    // Create particles while the mouse button is held down

    const now = performance.now();

    const canCreateFluid = ispointerDown && getCurrentTool() === "fluid" && now - lastParticleSpawn >= particleSpawnInterval;

    if(canCreateFluid){
         createFluidAt(
            pointerX,
            pointerY,
            getCurrentFluid()
        );

        syncParticleGraphics(app);
        lastParticleSpawn = now;
    }

    updateParticleGraphics();
       updateDebug();
});

app.stage.eventMode = "static";
app.stage.hitArea = app.screen;

let ispointerDown = false;


// Current mouse position inside the simulation
let pointerX = 0;
let pointerY = 0;


// Controls how often a particle can be created

let lastParticleSpawn = 0;
const particleSpawnInterval = 100;

app.stage.on("pointerdown",(event) =>{
    ispointerDown = true;

    const x = event.global.x;
    const y = event.global.y;

})

app.stage.on("pointerup",() =>{
    ispointerDown = false;
})

app.stage.on("pointerupoutside",() =>{
    ispointerDown = false;
})

app.stage.on("pointermove",(event) => {
    pointerX = event.global.x;
    pointerY = event.global.y;
})