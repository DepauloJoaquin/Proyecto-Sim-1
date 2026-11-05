import {
    Box2D,
    METER
} from "./world.js";

import {
    particleSystem,
    getParticleTypes
} from "./fluids.js";

import {
    wetDirtAt
} from "./terrain.js";

import {
    discoverElement
} from "./discoveries.js";


function detectWaterDirtInteractions() {

    const particleTypes =
        getParticleTypes();

    const positions =
        Box2D.HEAPF32;

    const particleCount =
        particleSystem.GetParticleCount();

    const positionOffset =
        Box2D.getPointer(
            particleSystem.GetPositionBuffer()
        ) >> 2;


    for (let i = 0; i < particleCount; i++) {

        if (particleTypes[i] !== "water") {
            continue;
        }

        const index =
            positionOffset + i * 2;

        const x =
            positions[index] * METER;

        const y =
            positions[index + 1] * METER;


        const mudCreated =
            wetDirtAt(x, y);

        if (mudCreated) {
            discoverElement("mud");
        }
    }
}


export {
    detectWaterDirtInteractions
};