# EMD Sim Gym

A small browser-based idle/exploration builder built with plain HTML, CSS, and JavaScript.

## Features

- Full-screen isometric grid rendered with HTML5 Canvas
- Drag panning with mouse or touch
- Hover highlight and click selection for the tile under the pointer
- Home Core at grid coordinate `(0, 0)` with passive Energy production
- Connected tile claiming with Energy costs that scale by distance
- Deterministic Energy and Research resource nodes across the map
- Base XP from production, Home Core level-ups, and expanding reveal radius
- Three-branch Research skill tree for Expansion, Production, and Surveying
- HUD for resources, rates, Base XP, selected tile details, and skill purchases
- Tokenized light/dark appearance that follows system preferences or a saved choice
- Blue viewport-edge marker and Home button that point back to the Home Core
- Device-pixel-ratio aware canvas rendering for sharper high-DPI displays
- Small scene/material/rendering modules for tile and object layout

## Run

Open `index.html` in a modern browser. There is no build step and no runtime dependency install required for the current app.

Or serve the project locally from the repo root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

Run the math regression test with:

```bash
npm test
```

## Files

```text
index.html    Browser entrypoint
styles.css    Full-screen canvas, HUD, and panel styles
appearance.js Theme preference, UI tokens, and canvas color tokens
game-state.js Idle builder rules, state, production, reveal, and skills
iso-math.js   Isometric projection, inverse projection, and tile hit testing
materials.js  Render material palette for isometric objects
object-layout.js Object sorting and viewport culling helpers
scene.js      Scene object container and default scene data
tile-renderer.js Canvas renderer for isometric tile surfaces
object-renderer.js Canvas renderer for cuboids and stacked cuboids
grid.js       App coordinator for viewport, input, animation, HUD, and render passes
main.js       App-level entry placeholder
tests/        Small Node-based regression tests
```

## Controls

- Drag the canvas to pan around the grid.
- Hover over tiles to highlight them.
- Hover tiles to inspect claim costs, connection state, and resource benefits.
- Click a revealed adjacent tile to claim it when affordable.
- Click the Home Core or selected-tile button to level up when Base XP is full.
- Use `Home` to animate back to the Home Core.

## Current Scope

The active project is a first playable idle/exploration builder. Refreshing the page resets the run; there is no save/load system yet.
