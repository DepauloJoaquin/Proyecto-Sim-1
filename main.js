import {
    Application,
    Graphics,
    Text,
    Container,
    RenderTexture,
    Sprite,
    Filter,
    GlProgram,
    BlurFilter
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
    createFluidBrush,
    syncParticleGraphics,
    updateFluidBehaviour,
    cleanupParticles,
    eraseFluidAt,
    setBrushSize,
    setBrushAmount
} from "./fluids.js";

import {
    createTerrainBlock,
    setupTerrain,
    generateTerrain,
    updateTerrain,
    paintTerrainAt,
    eraseTerrainAt,
    setTerrainBrushSize
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


import{
    loadMetaballShader,
    metaballVertexShader
} from "./metaballs.js";


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

// Container used only for fluid particle graphics

const particleLayer = new Container();


// Texture where the fluid particles will be rendered

const fluidRenderTexture = RenderTexture.create({
    width: app.screen.width,
    height: app.screen.height
});


// Sprite that displays the rendered fluid texture

const fluidSprite = new Sprite(fluidRenderTexture);

const metaballShaderCode = await loadMetaballShader();


const metaballFilter = 
    new Filter({
        glProgram: new GlProgram({
            vertex: metaballVertexShader,
            fragment: metaballShaderCode
        }),


    resources:{
        metaballUniforms:{
            uThreshold:{
                value: 0.45,
                type: "f32"
            }
        }
    }
    });


// Softens particle edges before applying the metaball effect

const fluidBlur = new BlurFilter({
    strength: 6,
    quality:3
});

fluidSprite.filters = [
    fluidBlur,
    metaballFilter
];

fluidSprite.x = 0


app.stage.addChild(fluidSprite);








const canvasContainer =
    document.getElementById("canvas-container");

canvasContainer.appendChild(app.canvas);


console.log(
    "Metaball shader:",
    metaballShaderCode
);


// ----------------------------------
// TERRAIN TEST
// ----------------------------------

// Crea la grilla de vóxeles y su sprite.
// Va antes de los bloques para que estos queden marcados en la grilla.
setupTerrain(app);

createTerrainBlock(
    app,
    400,
    550,
    800,
    100
);

const canvasWidth = app.screen.width;
const canvasHeight = app.screen.height;

const wallThickness = 20;

// Floor

createTerrainBlock(
    app,
    canvasWidth / 2,
    canvasHeight - wallThickness / 2,
    canvasWidth,
    wallThickness
);

// Left wall

createTerrainBlock(
    app,
    wallThickness / 2,
    canvasHeight / 2,
    wallThickness,
    canvasHeight
);

// Right wall

createTerrainBlock(
    app,
    canvasWidth - wallThickness / 2,
    canvasHeight / 2,
    wallThickness,
    canvasHeight
);

// Genera colinas de tierra, piedra y cuevas con ruido procedural.
generateTerrain();


// ----------------------------------
// WATER GRAPHICS
// ----------------------------------

createParticleGraphics(particleLayer);

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
            particleLayer,
            value
        );
    },

    onWaterAmountChange: (value) => {

        changeWaterAmount(
            particleLayer,
            value
        );
    },

    onFPSChange: (visible) => {

    setFPSVisible(visible);
},

    onGridChange: (visible) => {

        setGridVisible(visible);
    },
    onBrushSizeChange: (value) => {
        setBrushSize(value);

        // El mismo slider controla el pincel de terreno.
        setTerrainBrushSize(value);
    },

    onBrushAmountChange: (value) => {
        setBrushAmount(value);
    },
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
        createFluidBrush(
        pointerX,
        pointerY,
        getCurrentFluid()
    );

        syncParticleGraphics(particleLayer);
        lastParticleSpawn = now;
    }

    if(ispointerDown && getCurrentTool() === "eraseFluid"){
         eraseFluidAt(
        pointerX,
        pointerY,
        particleLayer
        );
    }

    // Terrain tool: click izquierdo pinta, click derecho borra
    if(ispointerDown && getCurrentTool() === "terrain"){

        if(pointerButton === 2){
            eraseTerrainAt(
                pointerX,
                pointerY
            );
        } else {
            paintTerrainAt(
                pointerX,
                pointerY,
                getCurrentTerrain()
            );
        }
    }

    // Erase Terrain tool: borra tierra y piedra mientras se mantiene el click
    if(ispointerDown && getCurrentTool() === "eraseTerrain"){
        eraseTerrainAt(
            pointerX,
            pointerY
        );
    }

    // Simula, actualiza colisiones y dibuja el terreno de vóxeles
    updateTerrain();

    updateFluidBehaviour();
    cleanupParticles(particleLayer);
    updateParticleGraphics();

    

    app.renderer.render({
        container:particleLayer,
        target: fluidRenderTexture,
        clear: true
    })

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

// Botón del mouse presionado (0 = izquierdo, 2 = derecho)
let pointerButton = 0;

// Evita que el click derecho abra el menú del navegador sobre el canvas
app.canvas.addEventListener("contextmenu",(event) =>{
    event.preventDefault();
})

app.stage.on("pointerdown",(event) =>{
    ispointerDown = true;

    const x = event.global.x;
    const y = event.global.y;

    // Guardamos qué botón se presionó y dónde,
    // así el terreno se pinta aunque el mouse no se mueva
    pointerButton = event.button;
    pointerX = x;
    pointerY = y;

    // Aplicamos el pincel de terreno en el mismo click,
    // así un click rápido también pinta o borra
    if(getCurrentTool() === "terrain"){

        if(pointerButton === 2){
            eraseTerrainAt(x, y);
        } else {
            paintTerrainAt(x, y, getCurrentTerrain());
        }
    }

    // Lo mismo para Erase Terrain: un click rápido también borra
    if(getCurrentTool() === "eraseTerrain"){
        eraseTerrainAt(x, y);
    }

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