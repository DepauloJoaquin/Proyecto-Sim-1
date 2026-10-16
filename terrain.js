import { Graphics } from "pixi.js";
import { Box2D, METER, world } from "./world.js";


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
    // -----------------------------
    // 1. CREAR EL CUERPO EN BOX2D
    // -----------------------------

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


    // -----------------------------
    // 2. DEFINIR LA FORMA FÍSICA
    // -----------------------------

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

    // -----------------------------
    // 3. REPRESENTACIÓN VISUAL EN PIXIJS
    // -----------------------------
    
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

     // -----------------------------
    // 4. GUARDAR EL BLOQUE
    // -----------------------------

    const terrainBlock = {
        body,
        graphic
    };

    terrainBlocks.push(terrainBlock);

    return terrainBlock;
}

export {
    terrainBlocks,
    createTerrainBlock
};

// TODO:
// Agregar un tipo de material a cada bloque (tierra, piedra, etc.).
// Incorporar una propiedad "destructible" para indicar
// si el bloque puede eliminarse o no.
//
// Para destruir un bloque correctamente:
// 1. Eliminar su cuerpo físico de Box2D.
// 2. Eliminar su gráfico de PixiJS.
// 3. Quitar el bloque del array terrainBlocks.