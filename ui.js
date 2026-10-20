let currentFluid = "water";
let currentTerrain = "dirt";
let currentTool = "fluid"

const waterButton = document.getElementById("waterButton");
const lavaButton = document.getElementById("lavaButton");
const steamButton = document.getElementById("steamButton");

const dirtButton = document.getElementById("dirtButton");
const stoneButton = document.getElementById("stoneButton");

const fluidToolButton = document.getElementById("fluidToolButton");
const terrainToolButton = document.getElementById("terrainToolButton");
const eraseToolButton = document.getElementById("eraseToolButton");


const selectedFluidText = document.getElementById("selectedFluidText");
const selectedTerrainText = document.getElementById("selectedTerrainText");
const selectedToolText = document.getElementById("selectedToolText");


function selectFluid(fluid){
    currentFluid = fluid;

    selectedFluidText.textContent = `Selected fluid: ${fluid}`;
    waterButton.classList.remove("selected");
    lavaButton.classList.remove("selected");
    steamButton.classList.remove("selected");

    if (fluid === "water") {
    waterButton.classList.add("selected");
    }

    if (fluid === "lava") {
        lavaButton.classList.add("selected");
    }

    if (fluid === "steam") {
        steamButton.classList.add("selected");
    }
    
 
}

waterButton.addEventListener("click",() =>{
    selectFluid("water")
})

lavaButton.addEventListener("click",() =>{
    selectFluid("lava")
})

steamButton.addEventListener("click",() =>{
    selectFluid("steam")
})

selectFluid("water")



function selectTerrain(terrain){
    currentTerrain = terrain;

    selectedTerrainText.textContent = `Selected terrain: ${terrain}`;

    dirtButton.classList.remove("selected");
    stoneButton.classList.remove("selected");


    if(terrain === "dirt"){
        dirtButton.classList.add("selected");
    }

    if(terrain === "stone"){
        stoneButton.classList.add("selected");
    }
}


dirtButton.addEventListener("click",() =>{
    selectTerrain("dirt")
})

stoneButton.addEventListener("click",() =>{
    selectTerrain("stone")
})

selectTerrain("dirt")

function selectTool(tool){
    currentTool = tool;
    selectedToolText.textContent = `Selected tool: ${tool}`;

    fluidToolButton.classList.remove("selected");
    
    terrainToolButton.classList.remove("selected");
    
    eraseToolButton.classList.remove("selected");

    if(tool === "fluid"){
        fluidToolButton.classList.add("selected")
    }

    if(tool === "terrain"){
        terrainToolButton.classList.add("selected")
    }

    if(tool === "eraseFluid"){
        eraseToolButton.classList.add("selected")
    }

}


fluidToolButton.addEventListener("click",()=>{
    selectTool("fluid")
})

terrainToolButton.addEventListener("click",()=>{
    selectTool("terrain")
})

eraseToolButton.addEventListener("click",()=>{
    selectTool("eraseFluid")
})

selectTool("fluid")


export function getCurrentFluid(){
    return currentFluid;
}

export function getCurrentTerrain(){
    return currentTerrain;
}

export function getCurrentTool(){
    return currentTool;
}