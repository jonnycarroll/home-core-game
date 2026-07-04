# Blue Core

A small browser-based idle/exploration builder built with plain HTML, CSS, and JavaScript.

## Features

- Full-screen isometric grid rendered with HTML5 Canvas
- Drag panning with mouse or touch
- Hover highlight and click selection for the tile under the pointer
- Blue Core at grid coordinate `(0, 0)` with passive Energy production
- Connected tile claiming with Energy costs that scale by distance
- Deterministic Energy and Research resource nodes across the map
- Base XP from production, Blue Core level-ups, and expanding reveal radius
- Level-up tech tree with Energy and Research multiplier upgrades
- Welcome start state that delays HUD display and production until the run begins
- Bottom dock for resources, Base XP, and Blue Core return
- Top-corner panels for selected tile details and appearance controls
- Tokenized light/dark appearance that follows system preferences or a saved choice
- Blue viewport-edge marker and Blue Core button that point back to the Blue Core
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
canvas-tokens.js Shared canvas theme/material tokens
game-state.js Idle builder rules, state, production, reveal, and tech upgrades
iso-math.js   Isometric projection, inverse projection, and tile hit testing
materials.js  Render material palette for isometric objects
object-layout.js Object sorting and viewport culling helpers
scene.js      Scene object container and default scene data
tile-renderer.js Canvas renderer for isometric tile surfaces
object-renderer.js Canvas renderer for cuboids and stacked cuboids
map-glyphs.js Canvas glyph assets for resource markers
grid.js       App coordinator for viewport, input, animation, HUD, and render passes
main.js       App-level entry placeholder
tests/        Small Node-based regression tests
```

## Controls

- Place the Blue Core on the central tile or press the placement button to begin the run.
- Drag the canvas to pan around the grid.
- Hover over tiles to highlight them.
- Hover tiles to inspect claim costs, connection state, and resource benefits.
- Click a revealed adjacent tile to claim it when affordable.
- Click the Blue Core or selected-tile button to level up when Base XP is full.
- Spend Research in the tech tree shown after each Blue Core level-up.
- Use the Blue Core control in the bottom dock to return to the Blue Core.
- Use the theme control to cycle between system, light, and dark appearance.

## Current Scope

The active project is a first playable idle/exploration builder. Refreshing the page resets the run; there is no save/load system yet.
