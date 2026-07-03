const assert = require('node:assert/strict');
const IsoMath = require('../iso-math');
const IsoMaterials = require('../materials');
const IsoObjectRenderer = require('../object-renderer');

const ctx = {
    save() {},
    restore() {},
    beginPath() {},
    moveTo() {},
    lineTo() {},
    closePath() {},
    fill() {},
    stroke() {}
};

const renderer = new IsoObjectRenderer(ctx, new IsoMath(60, 30), IsoMaterials, 60, 30);

assert.equal(
    renderer.isObjectNearViewport(
        { type: 'cuboid', x: 0, y: 0, height: 10, levels: 1, material: 'blueBlock' },
        { offsetX: 50, offsetY: 50, width: 100, height: 100 }
    ),
    true
);
