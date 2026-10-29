import { Graphics, Sprite, Texture } from "pixi.js";
import { Box2D, METER, world } from "./world.js";
import { particleSystem } from "./fluids.js";


// Array donde guardamos todos los bloques de terreno creados.
// Cada bloque tiene un cuerpo físico (Box2D) y uno visual (PixiJS).

const terrainBlocks = [];

function createTerrainBlock(
    app,
    x,
    y,
    blockWidth,
    blockHeight
) {
    // 1. CREAR EL CUERPO EN BOX2D
    // b2BodyDef define las propiedades iniciales de un cuerpo físico.
    // Por ejemplo: posición, tipo de cuerpo, velocidad, etc.
    const bodyDef = new Box2D.b2BodyDef();

     // Box2D trabaja con metros, mientras que PixiJS utiliza píxeles.
    // Por eso dividimos las coordenadas por METER (100 píxeles = 1 metro).
    // La posición representa el CENTRO del bloque.

    bodyDef.position = new Box2D.b2Vec2(
        x / METER,
        y / METER
    );


    // Creamos el cuerpo físico dentro del mundo de Box2D.
    // Al no especificar otro tipo, el cuerpo es estático.
    // Esto significa que no se mueve por efecto de la gravedad.

    const body = world.CreateBody(bodyDef);

    // 2. DEFINIR LA FORMA FÍSICA
    // Creamos una forma rectangular para las colisiones.
    const shape = new Box2D.b2PolygonShape();

    // SetAsBox recibe la MITAD del ancho y de la altura.
    // También convertimos estas medidas de píxeles a metros.
    shape.SetAsBox(
        (blockWidth / 2) / METER,
        (blockHeight / 2) / METER
    );

    // Asociamos la forma al cuerpo mediante una fixture.
    // La fixture permite que el bloque tenga colisiones.
    // El segundo parámetro (0) indica densidad cero.

    body.CreateFixture(shape, 0);
    // 3. REPRESENTACIÓN VISUAL EN PIXIJS

    // Box2D solamente calcula la física, no dibuja objetos.
    // Por eso necesitamos crear un gráfico con PixiJS.
    const graphic = new Graphics();

    // Dibujamos un rectángulo del mismo tamaño que el cuerpo físico.
    // Usamos coordenadas negativas para centrarlo en su origen.

    graphic
        .rect(
            -blockWidth / 2,
            -blockHeight / 2,
            blockWidth,
            blockHeight
        )
        .fill("#8b5a2b");

    // Posicionamos el gráfico en píxeles.
    // A diferencia de Box2D, PixiJS no necesita convertir a metros.
    graphic.x = x;
    graphic.y = y;

    // Agregamos el gráfico al escenario para que sea visible.
    app.stage.addChild(graphic);
    // 4. GUARDAR EL BLOQUE

    const terrainBlock = {
        body,
        graphic
    };

    terrainBlocks.push(terrainBlock);

    // Marca el bloque en la grilla para que la tierra se apoye encima
    markBlockCells(x - blockWidth / 2, y - blockHeight / 2, blockWidth, blockHeight);

    return terrainBlock;
}
// TERRENO POR VÓXELES
// El mundo es una grilla de celdas (vóxeles). Cada celda guarda un material.
// La grilla se divide en chunks y solo se simulan los que tienen movimiento.

const CELL_SIZE = 5;    // píxeles por vóxel
const CHUNK_SIZE = 16;  // vóxeles por lado de cada chunk
const EMPTY = 0;

// Materiales: falls = le afecta la gravedad, solid = choca con los fluidos
const terrainMaterials = {
    dirt:  { id: 1, colors: ["#8b5a2b", "#7d5026", "#96633a"], falls: true,  destructible: true,  solid: true },
    stone: { id: 2, colors: ["#7a7a7a", "#6c6c6c", "#858585"], falls: false, destructible: true,  solid: true },
    block: { id: 3, colors: null, falls: false, destructible: false, solid: false } // paredes/piso de createTerrainBlock
};

// Busca materiales por id y pasa los colores a [r, g, b]
const materialsById = [];

for (const name in terrainMaterials) {
    const material = terrainMaterials[name];
    material.rgb = material.colors && material.colors.map((hex) => {
        const value = parseInt(hex.slice(1), 16);
        return [value >> 16, (value >> 8) & 255, value & 255];
    });
    materialsById[material.id] = material;
}

let gridWidth, gridHeight;
let cells, cellShade, lastUpdate;   // material, tono y último frame movido de cada vóxel
let frameId = 1;

let chunksX, chunksY;
let activeChunks, nextActiveChunks, physicsDirtyChunks;
let chunkBodies = [];

let terrainContext, terrainImageData, terrainTexture;
let renderDirty = true;
let terrainBrushSize = 30;

// Objetos de Box2D reutilizados para no reservar memoria en cada chunk
const chunkBodyDef = new Box2D.b2BodyDef();
const chunkShape = new Box2D.b2PolygonShape();
const chunkCenter = new Box2D.b2Vec2(0, 0);


function setTerrainBrushSize(value) {
    terrainBrushSize = Number(value);
}
// SETUP
// Crea la grilla, los chunks y el sprite donde se dibujan los vóxeles
function setupTerrain(app) {
    gridWidth = Math.ceil(app.screen.width / CELL_SIZE);
    gridHeight = Math.ceil(app.screen.height / CELL_SIZE);

    cells = new Uint8Array(gridWidth * gridHeight);
    cellShade = new Uint8Array(gridWidth * gridHeight);
    lastUpdate = new Uint8Array(gridWidth * gridHeight);

    chunksX = Math.ceil(gridWidth / CHUNK_SIZE);
    chunksY = Math.ceil(gridHeight / CHUNK_SIZE);

    activeChunks = new Uint8Array(chunksX * chunksY);
    nextActiveChunks = new Uint8Array(chunksX * chunksY);
    physicsDirtyChunks = new Uint8Array(chunksX * chunksY);
    chunkBodies = new Array(chunksX * chunksY).fill(null);

    // Canvas chico donde 1 píxel = 1 vóxel, después se agranda con el sprite
    const canvas = document.createElement("canvas");
    canvas.width = gridWidth;
    canvas.height = gridHeight;

    terrainContext = canvas.getContext("2d");
    terrainImageData = terrainContext.createImageData(gridWidth, gridHeight);

    terrainTexture = Texture.from(canvas);
    terrainTexture.source.scaleMode = "nearest"; // vóxeles nítidos, sin suavizado

    const sprite = new Sprite(terrainTexture);
    sprite.scale.set(CELL_SIZE);
    sprite.eventMode = "none";

    app.stage.addChild(sprite);
}

// Marca como "block" los vóxeles que tapa un bloque de Box2D
function markBlockCells(x, y, blockWidth, blockHeight) {
    if (!cells) return;

    const startX = Math.max(0, Math.floor(x / CELL_SIZE));
    const startY = Math.max(0, Math.floor(y / CELL_SIZE));
    const endX = Math.min(gridWidth, Math.ceil((x + blockWidth) / CELL_SIZE));
    const endY = Math.min(gridHeight, Math.ceil((y + blockHeight) / CELL_SIZE));

    for (let cellY = startY; cellY < endY; cellY++) {
        for (let cellX = startX; cellX < endX; cellX++) {
            setCell(cellX, cellY, terrainMaterials.block.id, 0);
        }
    }
}
// GRILLA Y CHUNKS
function getIndex(cellX, cellY) {
    return cellY * gridWidth + cellX;
}

function isInside(cellX, cellY) {
    return cellX >= 0 && cellY >= 0 && cellX < gridWidth && cellY < gridHeight;
}

// Fuera de la grilla cuenta como bloque, así nada se escapa
function getCell(cellX, cellY) {
    return isInside(cellX, cellY) ? cells[getIndex(cellX, cellY)] : terrainMaterials.block.id;
}

function setCell(cellX, cellY, materialId, shade) {
    const index = getIndex(cellX, cellY);
    cells[index] = materialId;
    cellShade[index] = shade;
    wakeCell(cellX, cellY);
}

// Mueve un vóxel a una celda vacía
function moveCell(fromX, fromY, toX, toY) {
    const from = getIndex(fromX, fromY);
    const to = getIndex(toX, toY);

    cells[to] = cells[from];
    cellShade[to] = cellShade[from];
    cells[from] = EMPTY;
    lastUpdate[to] = frameId; // evita moverlo dos veces en el mismo frame

    wakeCell(fromX, fromY);
    wakeCell(toX, toY);
}

// Despierta el chunk del vóxel y los vecinos (por si está en un borde)
function wakeCell(cellX, cellY) {
    for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
        if (isInside(cellX + dx, cellY + dy)) {
            nextActiveChunks[getChunkIndex(cellX + dx, cellY + dy)] = 1;
        }
    }

    physicsDirtyChunks[getChunkIndex(cellX, cellY)] = 1;
    renderDirty = true;
}

function getChunkIndex(cellX, cellY) {
    return Math.floor(cellY / CHUNK_SIZE) * chunksX + Math.floor(cellX / CHUNK_SIZE);
}

// GENERACIÓN PROCEDURAL
// Ruido suave: valores al azar cada "step" vóxeles, interpolados entre sí (0 a 1)
function createNoise(width, height, step) {
    const pointsX = Math.ceil(width / step) + 2;
    const values = Array.from({ length: pointsX * (Math.ceil(height / step) + 2) }, Math.random);

    const smooth = (t) => t * t * (3 - 2 * t);
    const lerp = (a, b, t) => a + (b - a) * t;
    const value = (i, j) => values[j * pointsX + i];

    return (x, y = 0) => {
        const i = Math.floor(x / step);
        const j = Math.floor(y / step);
        const tx = smooth(x / step - i);
        const ty = smooth(y / step - j);

        return lerp(
            lerp(value(i, j), value(i + 1, j), tx),
            lerp(value(i, j + 1), value(i + 1, j + 1), tx),
            ty
        );
    };
}

// Colinas de tierra, piedra abajo y cuevas dentro de la piedra
function generateTerrain() {
    const hills = createNoise(gridWidth, 1, 40);
    const details = createNoise(gridWidth, 1, 8);
    const dirtDepth = createNoise(gridWidth, 1, 20);
    const caves = createNoise(gridWidth, gridHeight, 9);

    for (let cellX = 0; cellX < gridWidth; cellX++) {
        const surfaceY = Math.floor(gridHeight * 0.68 + (hills(cellX) - 0.5) * 28 + (details(cellX) - 0.5) * 6);
        const stoneY = surfaceY + 6 + Math.floor(dirtDepth(cellX) * 6);

        for (let cellY = Math.max(0, surfaceY); cellY < gridHeight; cellY++) {
            if (getCell(cellX, cellY) !== EMPTY) continue; // no pisar bloques

            const shade = Math.floor(Math.random() * 3);

            if (cellY < stoneY) {
                setCell(cellX, cellY, terrainMaterials.dirt.id, shade);
            } else if (cellY < stoneY + 3 || caves(cellX, cellY) < 0.7) {
                setCell(cellX, cellY, terrainMaterials.stone.id, shade);
            }
        }
    }
}
// PINCEL (PINTAR / BORRAR)
// Recorre los vóxeles dentro del círculo del pincel
function forEachCellInBrush(x, y, action) {
    const radius = terrainBrushSize / 2 / CELL_SIZE;
    const centerX = Math.floor(x / CELL_SIZE);
    const centerY = Math.floor(y / CELL_SIZE);
    const range = Math.ceil(radius);

    for (let dy = -range; dy <= range; dy++) {
        for (let dx = -range; dx <= range; dx++) {
            if (dx * dx + dy * dy <= radius * radius && isInside(centerX + dx, centerY + dy)) {
                action(centerX + dx, centerY + dy);
            }
        }
    }
}

// Pinta el material solo donde hay aire
function paintTerrainAt(x, y, terrainType) {
    const material = terrainMaterials[terrainType];
    if (!material) return;

    forEachCellInBrush(x, y, (cellX, cellY) => {
        if (getCell(cellX, cellY) === EMPTY) {
            setCell(cellX, cellY, material.id, Math.floor(Math.random() * 3));
        }
    });
}

// Borra tierra y piedra (los bloques no son destructibles)
function eraseTerrainAt(x, y) {
    forEachCellInBrush(x, y, (cellX, cellY) => {
        const material = materialsById[getCell(cellX, cellY)];

        if (material && material.destructible) {
            setCell(cellX, cellY, EMPTY, 0);
        }
    });
}
// AUTÓMATA CELULAR
// La tierra cae recto; si no puede, se desliza en diagonal hacia un lado al azar
function updateFallingCell(cellX, cellY) {
    if (getCell(cellX, cellY + 1) === EMPTY) {
        moveCell(cellX, cellY, cellX, cellY + 1);
        return;
    }

    const side = Math.random() < 0.5 ? -1 : 1;

    for (const dx of [side, -side]) {
        if (getCell(cellX + dx, cellY) === EMPTY && getCell(cellX + dx, cellY + 1) === EMPTY) {
            moveCell(cellX, cellY, cellX + dx, cellY + 1);
            return;
        }
    }
}

// Simula solo los chunks activos, de abajo hacia arriba.
// La dirección horizontal se alterna cada frame para no favorecer un lado.
function simulateTerrain() {
    frameId = (frameId % 255) + 1;

    [activeChunks, nextActiveChunks] = [nextActiveChunks, activeChunks];
    nextActiveChunks.fill(0);

    const leftToRight = frameId % 2 === 0;

    for (let chunkY = chunksY - 1; chunkY >= 0; chunkY--) {
        for (let n = 0; n < chunksX; n++) {
            const chunkX = leftToRight ? n : chunksX - 1 - n;
            if (!activeChunks[chunkY * chunksX + chunkX]) continue; // chunk dormido

            const startX = chunkX * CHUNK_SIZE;
            const endX = Math.min(startX + CHUNK_SIZE, gridWidth);
            const startY = chunkY * CHUNK_SIZE;
            const endY = Math.min(startY + CHUNK_SIZE, gridHeight);

            for (let cellY = endY - 1; cellY >= startY; cellY--) {
                for (let i = 0; i < endX - startX; i++) {
                    const cellX = leftToRight ? startX + i : endX - 1 - i;
                    const index = getIndex(cellX, cellY);
                    const material = materialsById[cells[index]];

                    if (material && material.falls && lastUpdate[index] !== frameId) {
                        updateFallingCell(cellX, cellY);
                    }
                }
            }
        }
    }
}
// FÍSICA Y FLUIDOS
// Rehace el cuerpo de Box2D de un chunk.
// Los vóxeles sólidos seguidos de cada fila se juntan en un solo rectángulo.
function rebuildChunkPhysics(chunkIndex) {
    if (chunkBodies[chunkIndex]) {
        world.DestroyBody(chunkBodies[chunkIndex]);
        chunkBodies[chunkIndex] = null;
    }

    const startX = (chunkIndex % chunksX) * CHUNK_SIZE;
    const startY = Math.floor(chunkIndex / chunksX) * CHUNK_SIZE;
    const endX = Math.min(startX + CHUNK_SIZE, gridWidth);
    const endY = Math.min(startY + CHUNK_SIZE, gridHeight);

    for (let cellY = startY; cellY < endY; cellY++) {
        let runStart = -1;

        for (let cellX = startX; cellX <= endX; cellX++) {
            const solid = cellX < endX && materialsById[cells[getIndex(cellX, cellY)]]?.solid;

            if (solid && runStart === -1) runStart = cellX;
            if (solid || runStart === -1) continue;

            // Se terminó un tramo sólido: lo agregamos como rectángulo (en metros)
            const length = cellX - runStart;

            chunkBodies[chunkIndex] ??= world.CreateBody(chunkBodyDef);
            chunkCenter.Set((runStart + length / 2) * CELL_SIZE / METER, (cellY + 0.5) * CELL_SIZE / METER);
            chunkShape.SetAsBox(length * CELL_SIZE / 2 / METER, CELL_SIZE / 2 / METER, chunkCenter, 0);
            chunkBodies[chunkIndex].CreateFixture(chunkShape, 0);

            runStart = -1;
        }
    }
}

// Busca aire arriba del vóxel; si la columna está llena, busca a los costados
function findFreeCell(cellX, cellY) {
    for (let y = cellY - 1; y >= 0; y--) {
        if (getCell(cellX, y) === EMPTY) return [cellX, y];
    }

    for (let d = 1; d < gridWidth; d++) {
        if (getCell(cellX - d, cellY) === EMPTY) return [cellX - d, cellY];
        if (getCell(cellX + d, cellY) === EMPTY) return [cellX + d, cellY];
    }

    return null;
}

// Saca el agua que quedó dentro de la tierra y la sube al aire más cercano,
// así el fluido se corre en vez de quedar atrapado
function displaceFluids() {
    const heap = Box2D.HEAPF32;
    const positions = Box2D.getPointer(particleSystem.GetPositionBuffer()) >> 2;
    const velocities = Box2D.getPointer(particleSystem.GetVelocityBuffer()) >> 2;

    for (let i = 0; i < particleSystem.GetParticleCount(); i++) {
        const cellX = Math.floor(heap[positions + i * 2] * METER / CELL_SIZE);
        const cellY = Math.floor(heap[positions + i * 2 + 1] * METER / CELL_SIZE);

        if (!isInside(cellX, cellY) || !materialsById[cells[getIndex(cellX, cellY)]]?.solid) continue;

        const free = findFreeCell(cellX, cellY);
        if (!free) continue;

        heap[positions + i * 2] = (free[0] + 0.5) * CELL_SIZE / METER;
        heap[positions + i * 2 + 1] = (free[1] + 0.5) * CELL_SIZE / METER;
        heap[velocities + i * 2] = 0;
        heap[velocities + i * 2 + 1] = 0;
    }
}
// RENDER
// Pinta cada vóxel en el canvas; los de la superficie se aclaran un poco
function renderTerrain() {
    const pixels = terrainImageData.data;

    for (let i = 0; i < cells.length; i++) {
        const material = materialsById[cells[i]];

        if (!material || !material.rgb) {
            pixels[i * 4 + 3] = 0; // aire y bloques: transparente
            continue;
        }

        const color = material.rgb[cellShade[i]];
        const light = i >= gridWidth && cells[i - gridWidth] === EMPTY ? 1.2 : 1;

        pixels[i * 4] = Math.min(255, color[0] * light);
        pixels[i * 4 + 1] = Math.min(255, color[1] * light);
        pixels[i * 4 + 2] = Math.min(255, color[2] * light);
        pixels[i * 4 + 3] = 255;
    }

    terrainContext.putImageData(terrainImageData, 0, 0);
    terrainTexture.source.update();
}

// UPDATE
// Se llama cada frame: simular -> correr fluidos -> colisiones -> dibujar
function updateTerrain() {
    simulateTerrain();

    if (!renderDirty) return; // si nada cambió no hay más que hacer

    displaceFluids();

    for (let i = 0; i < physicsDirtyChunks.length; i++) {
        if (physicsDirtyChunks[i]) {
            rebuildChunkPhysics(i);
            physicsDirtyChunks[i] = 0;
        }
    }

    renderTerrain();
    renderDirty = false;
}


export {
    terrainBlocks,
    terrainMaterials,
    createTerrainBlock,
    setupTerrain,
    generateTerrain,
    updateTerrain,
    paintTerrainAt,
    eraseTerrainAt,
    setTerrainBrushSize
};
