let currentFluid = "water";
let currentTerrain = "dirt";
let currentTool = "fluid";

let fluidButtons;
let terrainButtons;

let fluidToolButton;
let terrainToolButton;
let eraseToolButton;
let eraseTerrainButton;

let selectedFluidText;
let selectedTerrainText;
let selectedToolText;

function setupUI(){

    fluidButtons =
        document.querySelectorAll(".fluid-button");

    terrainButtons =
        document.querySelectorAll(".terrain-button");


    fluidToolButton =
        document.getElementById("fluidToolButton");

    terrainToolButton =
        document.getElementById("terrainToolButton");

    eraseToolButton =
        document.getElementById("eraseToolButton");

    eraseTerrainButton =
        document.getElementById("eraseTerrainButton");


    selectedFluidText =
        document.getElementById("selectedFluidText");

    selectedTerrainText =
        document.getElementById("selectedTerrainText");

    selectedToolText =
        document.getElementById("selectedToolText");


    // Fluid buttons

    fluidButtons.forEach(button => {

        button.addEventListener("click", () => {

            const fluid =
                button.dataset.elementId;

            selectFluid(fluid);
        });
    });


    // Terrain buttons

    terrainButtons.forEach(button => {

        button.addEventListener("click", () => {

            const terrain =
                button.dataset.elementId;

            selectTerrain(terrain);
        });
    });


    // Tool buttons

    fluidToolButton.addEventListener("click", () => {
        selectTool("fluid");
    });

    terrainToolButton.addEventListener("click", () => {
        selectTool("terrain");
    });

    eraseToolButton.addEventListener("click", () => {
        selectTool("eraseFluid");
    });

    eraseTerrainButton.addEventListener("click", () => {
        selectTool("eraseTerrain");
    });


    // Default selections

    selectFluid("water");
    selectTerrain("dirt");
    selectTool("fluid");
}



function selectFluid(fluid){

    currentFluid = fluid;

    selectedFluidText.textContent =
        `Selected fluid: ${fluid}`;

    fluidButtons.forEach(button => {

        button.classList.remove("selected");
    });


    const selectedButton =
        document.getElementById(
            `${fluid}Button`
        );

    if(selectedButton){
        selectedButton.classList.add("selected");
    }
}


function selectTerrain(terrain){

    currentTerrain = terrain;

    selectedTerrainText.textContent =
        `Selected terrain: ${terrain}`;

    terrainButtons.forEach(button => {

        button.classList.remove("selected");
    });


    const selectedButton =
        document.getElementById(
            `${terrain}Button`
        );

    if(selectedButton){
        selectedButton.classList.add("selected");
    }
}


function selectTool(tool){

    currentTool = tool;

    selectedToolText.textContent =
        `Selected tool: ${tool}`;

    fluidToolButton.classList.remove("selected");
    terrainToolButton.classList.remove("selected");
    eraseToolButton.classList.remove("selected");
    eraseTerrainButton.classList.remove("selected");


    if(tool === "fluid"){
        fluidToolButton.classList.add("selected");
    }

    if(tool === "terrain"){
        terrainToolButton.classList.add("selected");
    }

    if(tool === "eraseFluid"){
        eraseToolButton.classList.add("selected");
    }

    if(tool === "eraseTerrain"){
        eraseTerrainButton.classList.add("selected");
    }
}


export function getCurrentFluid(){
    return currentFluid;
}

export function getCurrentTerrain(){
    return currentTerrain;
}

export function getCurrentTool(){
    return currentTool;
}

export {
    setupUI
};