import Box2DFactory from "liquidfun-wasm";

const Box2D = await Box2DFactory();

// Conversion from pixels to meters
const METER = 100;

// Gravity
const gravity = new Box2D.b2Vec2(0, 10);

// Physical world
const world = new Box2D.b2World(gravity);

export {
    Box2D,
    METER,
    world
};

