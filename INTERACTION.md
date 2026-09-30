# Key E interaction (reference, from Stone-Skipping)

Source: `C:\ThreeJS\Stone-Skipping\src`. Not ported into this project yet. To use it, ask for "port hold-E" and name the zone (e.g. `DOOR`, `FART-PAD`).

Two independent systems use E:

| System | Trigger | Files |
|---|---|---|
| **Hold E** (proximity prompt) | hold 2 s near a zone | `input.js`, `interact.js`, `interactHold.js`, `InteractPrompt.jsx`, `ActionResult.jsx`, `actionResult.js` |
| **Tap E** (egg hatch) | tap while at an egg (E=1, R=3, T=auto) | `eggHatch.js`, `eggPanel.js`, `EggPanel.jsx` |

Hold E is generic and portable. Tap E is game-specific (pets and eggs) and is only worth porting if this game gets a similar mechanic.

---

## Hold E

### Data flow (per frame, from `GameLoop`)

```
keydown/keyup  -> input.js held Set
GameLoop:  interact.step()
             zone  = first registered zone whose isNear() is true
             label = zone.label (string | fn -> string|null)
             interactState.label = label
             confirmed = interactHold.step(zoneId | null, isInteractKeyDown())
             if confirmed -> zone.onConfirm()
HUD (100 ms setInterval): InteractPrompt reads interactState + interactHoldState
                          and writes DOM directly (no React re-render per frame)
onConfirm -> showActionResult(text, success) -> ActionResult popup
```

### API

**`systems/input.js`** (additions to the existing key handler)
- `INTERACT_KEY = 'KeyE'`
- `isInteractKeyDown()` returns `true` while E is physically held.
- `consumeKeyPress(code)` returns `true` once per physical press (edge-triggered).
- `keydown` ignores `e.repeat`. `blur` clears `held`, so E can't stick.
- This repo's `input.js` already ignores keys typed into text fields.

**`systems/interact.js`**
```js
import { registerInteractZone } from './interact.js'

const unregister = registerInteractZone({
  id: 'door',                       // unique; re-registering the same id replaces it (HMR-safe)
  label: 'Break Door',              // string, or () => string | null (null hides the prompt)
  isNear: () => /* true while in range */,
  onConfirm: () => { /* runs once when the 2 s hold completes */ },
})
```
- The first registered zone that is near wins. Only one prompt shows at a time.
- The prompt reads "Press E to <label>".
- `interactState.label` holds the current label, or `null`.
- Call `step()` once per frame from `GameLoop`.

**`systems/interactHold.js`**
- `HOLD_MS = 2000`. Change this to change the hold time for every zone.
- `interactHoldState = { active, progress }`, with progress from 0 to 1.
- `step(zoneKey, keyDown)` returns `true` on the frame a continuous hold on the same zone reaches `HOLD_MS`, then resets.
- Releasing E, leaving the zone, or the zone changing resets the timer to 0.

**`systems/actionResult.js`**
```js
import { showActionResult } from './actionResult.js'
showActionResult('Door Broken!', true)   // green
showActionResult('Need 50 Power', false) // red
```
- It only bumps `actionResultState.id`, `text` and `success`. The HUD poll shows the popup.
- The HUD must watch `actionResultState.id` at about 10 Hz and call `actionResultRef.current.show(text, success)`.

### Range check pattern (from `skillStoneZones.js`)
```js
const RANGE = 1.7 // m per axis
isNear: () => Math.abs(player.position.x - s.x) <= RANGE &&
              Math.abs(player.position.z - s.z) <= RANGE
```
Use `player` from `systems/playerState.js`. Coordinates come from `data/world.js` or `data/room.js`. See `LANDMARKS.md`.

### UI: `InteractPrompt.jsx`
- Mount it once inside the HUD.
- DOM structure:
  - `.interact-prompt` is the card.
  - `.interact-key` is a 36 px circle containing an SVG with `.interact-ring-bg` and `.interact-ring` (r=14).
  - `.interact-cap` is the "E" keycap.
  - `.interact-text` reads "Press E to <label>".
- Ring: `strokeDasharray = 2*PI*14`, and `strokeDashoffset = C * (1 - progress)`. It's rotated -90° so it fills from the top.
- `.held` is toggled when `progress > 0`. The card collapses into an enlarged ring and keycap.
- `display: none` when there is no label.

### CSS (from Stone-Skipping `index.css`)
This project's HUD sizes are `N * var(--u)` (see `ui/hud.css`). Convert the px below if the prompt should scale with the HUD.

```css
.interact-prompt {
  position: absolute; left: 50%; top: 70%; transform: translate(-50%, -50%);
  display: flex; align-items: center; gap: 12px; padding: 8px 16px;
  border-radius: 16px; background: rgba(0,0,0,.5); backdrop-filter: blur(4px);
  color: #fff; font-weight: 700; font-size: 16px; letter-spacing: .03em;
  pointer-events: none;
  transition: transform 300ms cubic-bezier(.34,1.56,.64,1), padding 300ms, background 300ms;
}
.interact-key { position: relative; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; width: 36px; height: 36px; border-radius: 50%; transition: background 300ms; }
.interact-key svg { position: absolute; inset: 0; width: 36px; height: 36px; transform: rotate(-90deg); }
.interact-ring-bg, .interact-ring { fill: none; stroke-width: 2.5; }
.interact-ring-bg { stroke: rgba(255,255,255,.25); }
.interact-ring { stroke: #fff; stroke-linecap: round; transition: stroke-dashoffset 120ms linear; }
.interact-cap { position: relative; display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 5px; border: 2px solid rgba(255,255,255,.7);
  background: rgba(255,255,255,.1); font-size: 12px; }
.interact-prompt.held { transform: translate(-50%,-50%) scale(1.5); padding: 0;
  background: transparent; backdrop-filter: none; }
.interact-prompt.held .interact-key { background: rgba(0,0,0,.5); backdrop-filter: blur(4px); }
.interact-prompt.held .interact-text { display: none; }
```

### Result popup: `ActionResult.jsx` + CSS
- `forwardRef` component exposing `show(text, success)`.
- To restart the animation mid-run, it sets `animation: none`, forces a reflow with `void bar.offsetHeight`, then clears the style.
- `onAnimationEnd` hides it.
- Text colour is `#4ade80` on success and `#f87171` on failure.

```css
.action-result { position: absolute; left: 50%; top: 64px; transform: translateX(-50%); z-index: 60; pointer-events: none; }
.action-result-bar { display: flex; align-items: center; justify-content: center; width: 32rem; max-width: 90vw; height: 3.5rem;
  background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%);
  animation: action-result-pop 2.4s cubic-bezier(.34,1.56,.64,1) forwards; }
.action-result-text { font-size: 1.875rem; font-weight: 900; -webkit-text-stroke: 1.5px black; paint-order: stroke fill; }
@keyframes action-result-pop {
  0% { opacity: 0; transform: scale(.4); }  8% { opacity: 1; transform: scale(1.12); }
  14% { opacity: 1; transform: scale(1); }  80% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(.5); }
}
```

### Example: skill-stone zone (`skillStoneZones.js`)
```js
registerInteractZone({
  id: `skillStone:${s.model}`,
  isNear: () => Math.abs(player.position.x - s.x) <= 1.7 && Math.abs(player.position.z - s.z) <= 1.7,
  label: () => owned.includes(s.model) ? (equipped === s.model ? null : 'Equip Stone') : 'Buy Stone',
  onConfirm: () => { /* equip, or buy if wins >= cost, else showActionResult(`Need ${s.wins} to Buy`, false) */ },
})
```

### Porting checklist for this repo
1. Add `isInteractKeyDown` and `consumeKeyPress` to `systems/input.js`. Check first whether they already exist.
2. Add `systems/interactHold.js`, `interact.js` and `actionResult.js`. They are framework-free, so copy them as-is.
3. Call `interact.step()` in `GameLoop.jsx`.
4. Add `InteractPrompt.jsx` and `ActionResult.jsx` under `ui/` and mount them in `Hud.jsx`. Add the CSS to `ui/hud.css` and rescale with `var(--u)` if wanted. The HUD root is `pointer-events: none`, which suits both.
5. Poll `actionResultState.id` in `Hud.jsx`.
6. Register zones from a `systems/*Zones.js` file that is imported once, using `data/world.js` coordinates. Add each landmark to `LANDMARKS.md`.

---

## Tap E (egg hatch) — for reference only

`eggHatch.js` runs `stepEggHatch()` each frame, after `stepEggPanel(camera)`:
- `consumeKeyPress('KeyE')` calls `hatch(kind, 1)`. R calls `hatch(kind, 3)`. T calls `toggleAuto()`.
- It only acts while `eggPanelState.kind` is set (the player is at an egg). Leaving the egg turns auto-hatch off.
- `hatch(kind, count)`:
  - Pool is the pets not yet owned.
  - `n = min(count, pool.length, floor(wins / cost))`.
  - Each roll is weighted by `chance` and removed from the pool.
  - Then `store.addPets(got, cost * n)` and `showActionResult`.
- Auto-hatch runs every 2500 ms and stops if a hatch fails.
- `EggPanel.jsx` is the odds card. A `requestAnimationFrame` loop applies `eggPanelState.screen` (x, y, side, scale, visible) as a DOM transform so it follows the egg. Its buttons E, R and T call `hatchOne`, `hatchMulti` and `toggleAuto`.
