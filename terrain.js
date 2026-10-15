import { Graphics } from "pixi.js";
import { Box2D, METER, world } from "./world.js";

const terrainBlocks = [];

function createTerrainBlock(
    app,
    x,
    y,
    blockWidth,
    blockHeight
) {
    // Body Box2D
    const bodyDef = new Box2D.b2BodyDef();

    bodyDef.position = new Box2D.b2Vec2(
        x / METER,
        y / METER
    );

    const body = world.CreateBody(bodyDef);

    // Shape
    const shape = new Box2D.b2PolygonShape();

    shape.SetAsBox(
        (blockWidth / 2) / METER,
        (blockHeight / 2) / METER
    );

    body.CreateFixture(shape, 0);

    // Pixi Graphic
    const graphic = new Graphics();

    graphic
        .rect(
            -blockWidth / 2,
            -blockHeight / 2,
            blockWidth,
            blockHeight
        )
        .fill("#8b5a2b");

    graphic.x = x;
    graphic.y = y;

    app.stage.addChild(graphic);

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
/*
“Terrain ya tiene una función que crea un body de Box2D y su Graphics correspondiente en Pixi
 y lo guarda en terrainBlocks.
  A partir de esto habría que agregar tipo de material
y lógica para destruir solamente los que tengan destructible = true.*/