# Isometric Grid Explorer

## Overview

This repository currently hosts a minimal browser-based isometric grid explorer. The active app displays an infinite-feeling isometric tile grid on a full-screen canvas, supports drag panning, highlights the global center tile, and shows an edge marker when the global center is outside the viewport.

The codebase also contains an early point module for a possible game layer, but it is not currently loaded by `index.html`.

## Active File Structure

```
/
├── index.html      # Browser entrypoint with canvas and center button
├── grid.js         # Active isometric grid, rendering, panning, hover, and marker logic
├── main.js         # Placeholder; active behavior is currently in grid.js
├── styles.css      # Full-screen canvas and button styling
├── points.js       # Dormant point-counter prototype; not loaded by index.html
├── package.json    # Project metadata; no build step is required
└── README.md       # User-facing project notes
```

## Active Components

### Grid System (`grid.js`)

- Uses HTML5 Canvas to render diamond-shaped isometric tiles.
- Uses 60px by 30px tiles in CSS pixels.
- Keeps the canvas backing buffer device-pixel-ratio aware for sharper high-DPI rendering.
- Tracks viewport dimensions separately from physical canvas dimensions.
- Computes visible tile ranges from screen corners and only renders tiles in or near view.
- Supports mouse and touch drag panning.
- Supports hover highlighting with short fade animations.
- Provides animated return-to-center behavior.
- Draws the global center tile at grid coordinate `(0, 0)` in blue.
- Draws a blue edge marker when the global center tile is outside the viewport.

### Entry Point (`index.html`)

- Loads `styles.css`, `grid.js`, and `main.js`.
- Provides the full-screen canvas element with ID `game-canvas`.
- Provides the `Return to Center` button with ID `center-button`.

### Dormant Prototype Module

- `points.js` defines a simple global point counter.
- It is not currently included by `index.html`, and the required DOM node for its UI is not present.

## Interaction Model

1. Click and drag, or touch and drag, to pan around the grid.
2. Hover over a tile to show a temporary highlight.
3. Click `Return to Center` to animate back to the global center tile.
4. When the global center is offscreen, use the blue edge marker to see its direction.

## Implementation Notes

- Canvas drawing coordinates are in CSS pixels. `resizeCanvas()` scales the backing buffer with `window.devicePixelRatio` and applies a matching canvas transform.
- The global center tile is grid coordinate `(0, 0)`, whose screen position is controlled by `offsetX` and `offsetY`.
- Keep changes small and consistent with the current plain HTML/CSS/JavaScript structure. There is no bundler, framework, or test runner in active use.
- If reviving the game-layer modules, update `index.html`, `styles.css`, and this document so the active UI and loaded scripts stay in sync.
