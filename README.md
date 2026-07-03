# Isometric Grid Explorer

A small browser-based isometric grid explorer and early layout-engine prototype built with plain HTML, CSS, and JavaScript.

## Features

- Full-screen isometric grid rendered with HTML5 Canvas
- Drag panning with mouse or touch
- Hover highlight for the tile under the pointer
- Stacked blue cuboid at global center grid coordinate `(0, 0)`
- Blue viewport-edge marker that points toward the global center when it is offscreen
- Animated `Return to Center` button
- Device-pixel-ratio aware canvas rendering for sharper high-DPI displays
- Small scene/material/rendering modules for tile and object layout

## Run

Open `index.html` in a modern browser. There is no build step and no runtime dependency install required for the current app.

Run the math regression test with:

```bash
npm test
```

## Files

```text
index.html    Browser entrypoint
styles.css    Full-screen canvas and button styles
iso-math.js   Isometric projection, inverse projection, and tile hit testing
materials.js  Render material palette for isometric objects
object-layout.js Object sorting and viewport culling helpers
scene.js      Scene object container and default scene data
tile-renderer.js Canvas renderer for isometric tile surfaces
object-renderer.js Canvas renderer for cuboids and stacked cuboids
grid.js       App coordinator for viewport, input, animation, and render passes
main.js       Placeholder for future app-level logic
points.js     Prototype points module, not currently loaded
tests/        Small Node-based regression tests
```

## Controls

- Drag the canvas to pan around the grid.
- Hover over tiles to highlight them.
- Use `Return to Center` to animate back to the global center tile.

## Current Scope

The active project is currently a grid explorer growing into a base isometric layout engine. `points.js` is an early game-layer prototype and is not wired into the page yet.
