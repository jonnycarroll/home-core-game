# Isometric Grid Explorer

A small browser-based isometric grid explorer built with plain HTML, CSS, and JavaScript.

## Features

- Full-screen isometric grid rendered with HTML5 Canvas
- Drag panning with mouse or touch
- Hover highlight for the tile under the pointer
- Blue global center tile at grid coordinate `(0, 0)`
- Blue viewport-edge marker that points toward the global center when it is offscreen
- Animated `Return to Center` button
- Device-pixel-ratio aware canvas rendering for sharper high-DPI displays

## Run

Open `index.html` in a modern browser. There is no build step and no runtime dependency install required for the current app.

The `package.json` file is metadata only at the moment; `npm start` just prints a reminder to open the HTML file.

## Files

```text
index.html    Browser entrypoint
styles.css    Full-screen canvas and button styles
grid.js       Active grid rendering and interaction logic
main.js       Placeholder for future app-level logic
points.js     Prototype points module, not currently loaded
```

## Controls

- Drag the canvas to pan around the grid.
- Hover over tiles to highlight them.
- Use `Return to Center` to animate back to the global center tile.

## Current Scope

The active project is currently the grid explorer. `points.js` is an early game-layer prototype and is not wired into the page yet.
