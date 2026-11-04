const discoveredElements = new Set();

let isShowingDiscovery = false;

const discoveryQueue = [];

const elementData = {
    water: {
        name: "Water",
        type: "fluid",
        icon: "./assets/water3.png"
    },

    lava: {
        name: "Lava",
        type: "fluid",
        icon: "./assets/lava.png"
    },

    steam: {
        name: "Steam",
        type: "fluid",
        icon: "./assets/steam.png"
    },

    dirt: {
        name: "Dirt",
        type: "terrain",
        icon: "./assets/dirt.png"
    },

    stone: {
        name: "Stone",
        type: "terrain",
        icon: "./assets/stone.png"
    }
}


function discoverElement(elementId) {

    if (discoveredElements.has(elementId)) {
        return;
    }

    const element = elementData[elementId];

    if (!element) {
        return;
    }

    discoveredElements.add(elementId);

    // Agregamos el elemento a la cola
    discoveryQueue.push(element);

    // Mostramos el siguiente si no hay otro visible
    showNextDiscovery();

    unlockInventoryElement(elementId);

    unlockTerrainButton(elementId);
}


function showDiscoveryPopup(element) {

    const popup = document.getElementById("discovery-popup");

    const icon = document.getElementById("discoveryIcon");
    const name = document.getElementById("discoveryName");
    const type = document.getElementById("discoveryType");

    icon.src = element.icon;
    icon.alt = element.name;

    name.textContent = element.name;

    if (element.type === "fluid") {
        type.textContent = "New Fluid";
    } else {
        type.textContent = "New Terrain";
    }

    popup.classList.remove("hidden");

    setTimeout(() => {

        popup.classList.add("hidden");

        // El popup actual terminó
        isShowingDiscovery = false;

        // Mostrar el siguiente descubrimiento
        showNextDiscovery();

    }, 3000);
}


function showNextDiscovery(){
     if (isShowingDiscovery) {
        return;
    }

 
    if (discoveryQueue.length === 0) {
        return;
    }

    isShowingDiscovery = true;

    const element = discoveryQueue.shift();

    showDiscoveryPopup(element);



}


function unlockInventoryElement(elementId){

    const inventoryItem =   document.getElementById(`inventory-${elementId}`);

    if(!inventoryItem){
        return;
    }

    const element = elementData[elementId];

    const name = inventoryItem.querySelector("span")

    inventoryItem.classList.remove("locked");

    inventoryItem.classList.add("unlocked");

    name.textContent = element.name;



}

function unlockTerrainButton(elementId) {

    if (elementId !== "stone") {
        return;
    }

    const stoneButton = document.getElementById("stoneButton");

    if (!stoneButton) {
        return;
    }

    const questionMark = stoneButton.querySelector(".unknown-element");
    const stoneImage = stoneButton.querySelector("img");

    // Ocultar el signo de pregunta
    questionMark.hidden = true;

    // Mostrar la imagen real
    stoneImage.hidden = false;

    // Habilitar el botón
    stoneButton.disabled = false;
    stoneButton.classList.remove("locked");
}


export{
    discoverElement
}