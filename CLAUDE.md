# Fart to Break Doors

Vite + React 18 + @react-three/fiber 8 + three 0.171 + zustand. Plain JS/JSX. Started from the Stone-Skipping base. The world is one enclosed prison-cafeteria hall with a corridor north to a wooden door; Bloxity SDK; a DOM HUD overlay.

## Commands
- `npm run dev` / `npm run build` (`dist/` is generated; never edit it)
- `.env.example` documents `VITE_DEV_MODE` (skips the Bloxity SDK/CDN) and the starting skill/rebirth values

## Layout (`src/`)
- `App.jsx` — Canvas, lighting, ground, room, player
- `components/` — R3F scene pieces (Ground, Room, Lighting, Player, GameLoop). `Room.jsx` is static scenery; the door group is named `door`. `Sky.jsx` is unused since the world went indoors
- `systems/` — framework-free logic, no React imports: `playerMovement`, `cameraOrbit`, `input`, `bloxity` (SDK facade, never throws), `avatarLoader`/`defaultCharacter`/`avatarAnim` (character + walk cycle), `fart` (fart timeline + gas sources), `net` (Colyseus presence)
- `data/` — `world.js` (hall/corridor/door dimensions, bounds, spawn), `room.js` (prop layout + the box colliders built from it), `bloxity.js` (SDK settings, rig constants)
- `ui/` — `Hud.jsx` + `hud.css` (DOM overlay mounted beside `<App />` in `main.jsx`; sizes are `N * var(--u)` where N is px in a 1920x990 layout), `icons.jsx`
- `data/hud.js` — offer prices, menu buttons, rebirth-bar colours (placeholders until SKUs exist)
- `store/useGameStore.js` — slow game state: `avatarLoaded`, plus the values the HUD shows (cash, fartPower, rebirths, ...)
- `materials/` — `groundMaterial.js` (procedural tiled floor), `roomTextures.js` (canvas textures for lockers, crates, door, signs, decals)

`LANDMARKS.md` names every area and fixture in the hall (`DOOR`, `FART-PAD`, `TRAINING-PIT`, ...) with coordinates; keep it in step with `data/room.js` and `data/world.js`.

## Rules
- The HUD root is `pointer-events: none`; only its controls opt back in, so camera drag reaches the canvas. `input.js` ignores keys typed into text fields.
- One tick: `GameLoop.jsx`. Per-frame state (player) is a mutated singleton in `systems/playerState.js`, not zustand.
- All Bloxity SDK calls go through `systems/bloxity.js`.
- World units are metres. +X east, +Z south, Y up.
- Move or add a solid prop in `data/room.js`, not just in `Room.jsx`, so its collider stays in sync.
- `GAME_SLUG` in `data/bloxity.js` must match the slug registered on bloxity.io.

## Multiplayer
All Colyseus traffic goes through `systems/net.js` (server: `../Fart-to-break-doors-backend`, `LobbyRoom`); it never blocks gameplay when the server is absent. `VITE_SERVER_URL_DEV` / `VITE_SERVER_URL_MAIN` pick the URL. `move` relays position, yaw, gait blend, `grounded`, `seated`; `fart` bumps `PlayerState.fartSeq`, and `components/RemotePlayers.jsx` replays the hunch pose and gas (each remote registers a source in `fartSources`, drawn by `FartGas.jsx`). Remote characters are built like the local one, so the belly/waist and accessories match. `bellySize` (store, 0.5–3) rides the `stats` message and eases the belly/waist on every character (`systems/belly.js`); nothing writes it yet. Not synced yet: door HP/hits. Only `tutorialStep` is saved so far (`saveProgress`, hydrated from the server's `progress`): the tutorial waits on the store's `progressKnown` and stays hidden once `tutorialResumedDone`, so it shows for new players only (guests see it each visit).

## Key E interaction
`INTERACTION.md` documents the hold-E prompt (2 s ring, zone registry, result popup) and tap-E system from Stone-Skipping. It is a reference for porting and is not implemented here yet. Read it only when adding interactions.

## Player progress
Cash, Fart Power, Rebirth, Training Foods, Farts and Wins are documented in `PROGRESSION.md`. The store holds display values the HUD reads, but nothing earns or spends them yet and HUD buttons are placeholders. Read it only when working on progression.
