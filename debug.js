import {
    Graphics,
    Text
} from "pixi.js";

import {
    METER
} from "./world.js";


// ----------------------------------
// DEBUG OBJECTS
// ----------------------------------

const GRID_SIZE = 50;

let gridGraphics = null;
let coordinateText = null;
let crosshair = null;
let fpsText = null;

let gridVisible = false;


// ----------------------------------
// FPS
// ----------------------------------

let frames = 0;
let lastTime = performance.now();
let currentFPS = 0;


function countFPS(now) {

    frames += 1;

    const elapsed =
        now - lastTime;

    if (elapsed >= 1000) {

        currentFPS =
            Math.round(
                (frames * 1000) / elapsed
            );

        frames = 0;
        lastTime = now;
    }

    requestAnimationFrame(countFPS);
}


// ----------------------------------
// CREATE DEBUG
// ----------------------------------

function setupDebug(app) {

    // -----------------------------
    // GRID
    // -----------------------------

    gridGraphics = new Graphics();

    gridGraphics.eventMode = "none";

    drawGrid(app);

    app.stage.addChild(gridGraphics);


    // -----------------------------
    // COORDINATES
    // -----------------------------

    coordinateText = new Text({
        text: "Pixels: (0, 0)",
        style: {
            fontFamily: "Arial",
            fontSize: 16,
            fill: "#ffffff",
            stroke: {
                color: "#000000",
                width: 3
            }
        }
    });

    coordinateText.x = 20;
    coordinateText.y = 50;

    coordinateText.eventMode = "none";

    app.stage.addChild(
        coordinateText
    );


    // -----------------------------
    // CROSSHAIR
    // -----------------------------

    crosshair = new Graphics();

    crosshair.eventMode = "none";

    app.stage.addChild(
        crosshair
    );


    // -----------------------------
    // FPS TEXT
    // -----------------------------

    fpsText = new Text({
        text: "FPS: 0",
        style: {
            fontFamily: "Arial",
            fontSize: 20,
            fill: "#ffffff"
        }
    });

    fpsText.x = 20;
    fpsText.y = 20;

    app.stage.addChild(
        fpsText
    );


    // Hide everything initially
    gridGraphics.visible = false;
    coordinateText.visible = false;
    crosshair.visible = false;
    fpsText.visible = false;


    // -----------------------------
    // MOUSE POSITION
    // -----------------------------

    app.stage.eventMode = "static";
    app.stage.hitArea = app.screen;

    app.stage.on(
        "pointermove",
        (event) => {

            if (!gridVisible)
                return;

            const { x, y } =
                app.stage.toLocal(
                    event.global
                );

            const pixelX =
                Math.round(x);

            const pixelY =
                Math.round(y);

            const meterX =
                (x / METER)
                    .toFixed(2);

            const meterY =
                (y / METER)
                    .toFixed(2);

            coordinateText.text =
                `Pixels: (${pixelX}, ${pixelY})\n` +
                `Meters: (${meterX}, ${meterY})`;

            crosshair.clear();

            crosshair
                .moveTo(x, 0)
                .lineTo(
                    x,
                    app.screen.height
                )
                .moveTo(0, y)
                .lineTo(
                    app.screen.width,
                    y
                )
                .stroke({
                    color: "#ff0000",
                    alpha: 0.7,
                    width: 1
                });
        }
    );

    requestAnimationFrame(
        countFPS
    );
}


// ----------------------------------
// DRAW GRID
// ----------------------------------

function drawGrid(app) {

    gridGraphics.clear();

    for (
        let x = 0;
        x <= app.screen.width;
        x += GRID_SIZE
    ) {

        gridGraphics
            .moveTo(x, 0)
            .lineTo(
                x,
                app.screen.height
            )
            .stroke({
                color: "#ffffff",
                alpha: 0.3,
                width: 1
            });
    }

    for (
        let y = 0;
        y <= app.screen.height;
        y += GRID_SIZE
    ) {

        gridGraphics
            .moveTo(0, y)
            .lineTo(
                app.screen.width,
                y
            )
            .stroke({
                color: "#ffffff",
                alpha: 0.3,
                width: 1
            });
    }
}


// ----------------------------------
// VISIBILITY
// ----------------------------------

function setGridVisible(visible) {

    gridVisible = visible;

    gridGraphics.visible =
        visible;

    coordinateText.visible =
        visible;

    crosshair.visible =
        visible;
}


function setFPSVisible(visible) {

    fpsText.visible =
        visible;
}


// ----------------------------------
// UPDATE
// ----------------------------------

function updateDebug() {

    if (fpsText) {

        fpsText.text =
            `FPS: ${currentFPS}`;
    }
}


export {
    setupDebug,
    setGridVisible,
    setFPSVisible,
    updateDebug
};