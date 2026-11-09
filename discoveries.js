const discoveredElements = new Set();

let isShowingDiscovery = false;

const discoveryQueue = [];

const elementData = {
    water: {
        name: "Water",
        type: "fluid",
        icon: "./assets/water3.png",
        unlockedByDefault: true
    },

    lava: {
        name: "Lava",
        type: "fluid",
        icon: "./assets/lava.png",
        unlockedByDefault: true

    
    },

    steam: {
        name: "Steam",
        type: "fluid",
        icon: "./assets/steam.png",
        unlockedByDefault: false
    },

    dirt: {
        name: "Dirt",
        type: "terrain",
        icon: "./assets/dirt.png",
        unlockedByDefault: true
    },

    stone: {
        name: "Stone",
        type: "terrain",
        icon: "./assets/stone.png",
        unlockedByDefault: false
    },

    mud:{
        name: "Mud",
        type: "terrain",
        icon: "./assets/mud.png",
        unlockedByDefault: false
    },

    oil:{
        name:"Oil",
        type:"fluid",
        icon: "./assets/oil.png",
        unlockedByDefault: false
    },
    
    acid: {
    name: "Acid",
    type: "fluid",
    icon: "./assets/acid.png",
    unlockedByDefault: false
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

    unlockElementButton(elementId);
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




function unlockElementButton(elementId) {

    const element = elementData[elementId];

    if (!element) {
        return;
    }

    const button = document.getElementById(`${elementId}Button`);

    if (!button) {
        return;
    }

    const questionMark = button.querySelector(".unknown-element");
    const image = button.querySelector("img");

    // Hide the question mark
    if (questionMark) {
        questionMark.hidden = true;
    }

    // Show the discovered element image
    if (image) {
        image.hidden = false;
    }

    // Enable the button
    button.disabled = false;

    // Update the visual state
    button.classList.remove("locked");
    button.classList.add("unlocked");
}



function createElementButtons() {

    const fluidContainer =
        document.getElementById("fluid-buttons");

    const terrainContainer =
        document.getElementById("terrain-buttons");

    if (!fluidContainer || !terrainContainer) {
        console.error("Element containers not found");
        return;
    }

    for (const [elementId, element] of Object.entries(elementData)) {

        const button = document.createElement("button");

        button.type = "button";

        button.dataset.elementId = elementId;

        // Each button needs a unique ID
        button.id = `${elementId}Button`;

        // Apply the CSS classes used by index.html
        button.classList.add(`${element.type}-button`);

        const image = document.createElement("img");

        image.src = element.icon;
        image.alt = element.name;

        button.appendChild(image);

        if (!element.unlockedByDefault) {

            button.disabled = true;
            button.classList.add("locked");

            image.hidden = true;

            const questionMark = document.createElement("span");

            questionMark.textContent = "?";
            questionMark.classList.add("unknown-element");

            button.appendChild(questionMark);

        } else {

            button.classList.add("unlocked");
        }

        if (element.type === "fluid") {

            fluidContainer.appendChild(button);

        } else if (element.type === "terrain") {

            terrainContainer.appendChild(button);
        }
    }
}



function createInventory(){

    const inventoryContainter = document.getElementById("inventory-elements");


    for(const [elementId,element] of Object.entries(elementData)){
        const item = document.createElement("div");

        item.id = `inventory-${elementId}`;

        item.classList.add("inventory-item");

        const image = document.createElement("img");

        image.src = element.icon;

        image.alt = element.name;

        const name = document.createElement("span");

        if(element.unlockedByDefault){
            name.textContent = element.name;

            discoveredElements.add(elementId);
        }
        else{
            item.classList.add("locked");
            name.textContent = "???";
        }
        item.appendChild(image);
        item.appendChild(name);
        inventoryContainter.appendChild(item);
    }

}


function setupDiscoveries(){
    createElementButtons();
    createInventory();
}

export{
    discoverElement,
    setupDiscoveries
}

