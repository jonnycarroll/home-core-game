const assert = require('node:assert/strict');
const IsoMath = require('../iso-math');
const IsoMaterials = require('../materials');
const IsoObjectLayout = require('../object-layout');
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

assert.deepEqual(
    IsoObjectLayout.sortSceneItems([
        { kind: 'glyph', x: 1, y: 0 },
        { kind: 'object', x: 0, y: 0 },
        { kind: 'glyph', x: -1, y: 0 },
        { kind: 'object', x: 1, y: 0 }
    ]).map((item) => `${item.kind}:${item.x},${item.y}`),
    [
        'glyph:-1,0',
        'object:0,0',
        'glyph:1,0',
        'object:1,0'
    ]
);

assert.equal(
    IsoObjectLayout.isPointInCuboid(
        { type: 'cuboid', x: 0, y: 0, height: 12, levels: 4 },
        { x: 50, y: 50 },
        { x: 50, y: 5 },
        60,
        30
    ),
    true
);

assert.equal(
    IsoObjectLayout.isPointInCuboid(
        { type: 'cuboid', x: 0, y: 0, height: 12, levels: 4 },
        { x: 50, y: 50 },
        { x: 10, y: 5 },
        60,
        30
    ),
    false
);
