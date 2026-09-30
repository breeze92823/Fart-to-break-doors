# Fart to Break Doors

Vite + React 18 + @react-three/fiber 8 + three 0.171 + zustand. Plain JS/JSX. Started from the Stone-Skipping base. The world is one enclosed prison-cafeteria hall with a corridor north to a wooden door; Bloxity SDK; a DOM HUD overlay.

## Commands
- `npm run dev` / `npm run build` (`dist/` is generated; never edit it)
- `.env.example` documents `VITE_DEV_MODE` (skips the Bloxity SDK/CDN) and the starting skill/rebirth values

## Layout (`src/`)
- `App.jsx` — Canvas, lighting, ground, room, player
- `components/` — R3F scene pieces (Ground, Room, Lighting, Player, GameLoop). `Room.jsx` is static scenery; the door group is named `door`. `Sky.jsx` is unused since the world went indoors
- `systems/` — framework-free logic, no React imports: `playerMovement`, `cameraOrbit`, `input`, `bloxity` (SDK facade, never throws), `avatarLoader`/`defaultCharacter`/`avatarAnim` (character + walk cycle)
- `data/` — `world.js` (hall/corridor/door dimensions, bounds, spawn), `room.js` (prop layout + the box colliders built from it), `bloxity.js` (SDK settings, rig constants)
- `ui/` — `Hud.jsx` + `hud.css` (DOM overlay mounted beside `<App />` in `main.jsx`; sizes are `N * var(--u)` where N is px in a 1920x990 layout), `icons.jsx`
- `data/hud.js` — offer prices, menu buttons, rebirth-bar colours (placeholders until SKUs exist)
- `store/useGameStore.js` — slow game state: `avatarLoaded`, plus the values the HUD shows (cash, fartPower, rebirths, ...)
- `materials/` — `groundMaterial.js` (procedural tiled floor), `roomTextures.js` (canvas textures for lockers, crates, door, signs, decals)

## Rules
- The HUD root is `pointer-events: none`; only its controls opt back in, so camera drag reaches the canvas. `input.js` ignores keys typed into text fields.
- One tick: `GameLoop.jsx`. Per-frame state (player) is a mutated singleton in `systems/playerState.js`, not zustand.
- All Bloxity SDK calls go through `systems/bloxity.js`.
- World units are metres. +X east, +Z south, Y up.
- Move or add a solid prop in `data/room.js`, not just in `Room.jsx`, so its collider stays in sync.
- `GAME_SLUG` in `data/bloxity.js` must match the slug registered on bloxity.io.

## Player progress
Cash, Fart Power, Rebirth, Training Foods, Farts and Wins are documented in `PROGRESSION.md`. The store holds display values the HUD reads, but nothing earns or spends them yet and HUD buttons are placeholders. Read it only when working on progression.
