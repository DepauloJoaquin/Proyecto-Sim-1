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
    changeWaterAmount
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

    updateParticleGraphics();
       updateDebug();
});