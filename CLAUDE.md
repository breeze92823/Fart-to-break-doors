# Fart to Break Doors

Vite + React 18 + @react-three/fiber 8 + three 0.171 + zustand. Plain JS/JSX. Started from the Stone-Skipping base: flat ground + player, Bloxity SDK, no HUD.

## Commands
- `npm run dev` / `npm run build` (`dist/` is generated; never edit it)
- `.env.example` documents `VITE_DEV_MODE` (skips the Bloxity SDK/CDN) and the starting skill/rebirth values

## Layout (`src/`)
- `App.jsx` — Canvas, sky, lighting, ground, player
- `components/` — R3F scene pieces (Ground, Lighting, Sky, Player, GameLoop)
- `systems/` — framework-free logic, no React imports: `playerMovement`, `cameraOrbit`, `input`, `bloxity` (SDK facade, never throws), `avatarLoader`/`defaultCharacter`/`avatarAnim` (character + walk cycle)
- `data/` — `world.js` (bounds, spawn), `bloxity.js` (SDK settings, rig constants)
- `store/useGameStore.js` — slow game state (only `avatarLoaded` for now)
- `materials/groundMaterial.js` — procedural tiled floor texture

## Rules
- One tick: `GameLoop.jsx`. Per-frame state (player) is a mutated singleton in `systems/playerState.js`, not zustand.
- All Bloxity SDK calls go through `systems/bloxity.js`.
- World units are metres. +X east, +Z south, Y up.
- `GAME_SLUG` in `data/bloxity.js` must match the slug registered on bloxity.io.

## Player progress
Cash, Fart Power, Rebirth, Training Foods, Farts and Wins are documented in `PROGRESSION.md` and are **not implemented yet**. Read it only when working on progression.
