const assert = require('node:assert/strict');
const IsoMath = require('../iso-math');

const isoMath = new IsoMath(60, 30);
const offsetX = 400;
const offsetY = 300;

const center = isoMath.getTileScreenPosition(0, 0, offsetX, offsetY);
assert.deepEqual(center, { x: 400, y: 300 });

const east = isoMath.getTileScreenPosition(1, 0, offsetX, offsetY);
assert.deepEqual(east, { x: 430, y: 315 });

const south = isoMath.getTileScreenPosition(0, 1, offsetX, offsetY);
assert.deepEqual(south, { x: 370, y: 315 });

const centerCoords = isoMath.getGridCoordsFromScreen(center.x, center.y, offsetX, offsetY);
assert.equal(centerCoords.x, 0);
assert.equal(centerCoords.y, 0);

const eastCoords = isoMath.getGridCoordsFromScreen(east.x, east.y, offsetX, offsetY);
assert.equal(eastCoords.x, 1);
assert.equal(eastCoords.y, 0);

assert.equal(isoMath.isPointInDiamond(400, 300, 0, 0, offsetX, offsetY), true);
assert.equal(isoMath.isPointInDiamond(431, 300, 0, 0, offsetX, offsetY), false);
