# Landmarks

Names for every area and fixture in the prison-cafeteria hall, so a request can say "put it at `FART-PAD`" instead of describing a spot. Coordinates are read from `src/data/world.js` and `src/data/room.js`; if they disagree with this file, the code wins, so update this file.

## Coordinates and compass

World units are metres. **+X east, +Z south, Y up.** Positions are `(x, z)` floor centres unless a height is given.

| Direction | Axis | In the hall |
| --- | --- | --- |
| North | −Z | Door end: corridor, door, lockers, sink |
| South | +Z | Training end: training area, leaderboards, crates |
| East | +X | Right-hand wall as you face the door |
| West | −X | Left-hand wall as you face the door |

The player spawns at `SPAWN` (0, −3), facing north at the door. "Left" and "right" below mean as seen from spawn facing the door.

## Map

```
                      N  (−Z)
        ┌──────────── CORRIDOR (x ±4, z −45.5 … −9.5) ────────────┐
        │   DOOR  z −11   ·  chevrons  ·  hazard strip          │
        └───────────────────────────┬─────────────────────────────┘
 x −26 ┌── HALL ───── z −9.5 ───────┴──────────────────────┐ x +26
       │ W-LOCKERS  N-LOCKERS-W   ·  SINK  ·  N-LOCKERS-E   │ E-LOCKERS
       │      FOOD-PAD (−14,−4.4)      FART-PAD (14,−4.4)   │
       │                                                    │
  W    │ ┌ EGG-SHOP ┐   ┌──────── TRAINING-AREA ────────┐    │  E
       │ │ eggs z   │   │  ring: tables (W)  PIT  (E)   │ LEADERBOARDS
       │ │ 9.5–24.6 │   │        tables (S)             │ ROUND-TABLES
       │ └──────────┘   └───────────────────────────────┘    │
       │ CRATES-SW               PORTAL (x 0)       CRATES-SE│
       └──────────────────── z +34 ─────────────────────────┘
                      S  (+Z)
```

## Landmark index

Name is what to call it. Source is the constant that places it (`room.js` unless noted).

### Door end (north)

| Name | Where | What it is | Source |
| --- | --- | --- | --- |
| `SPAWN` | (0, −3), faces north | Where the player starts and respawns | `world.js` `SPAWN` |
| `HALL` | x ±26, z −9.5 … 34, ceiling 12 | The whole cafeteria room | `world.js` `HALL` |
| `CORRIDOR` | x ±4, z −45.5 … −9.5, ceiling 6 | Passage north from the hall's middle, ends at the door | `world.js` `CORRIDOR` |
| `CORRIDOR-MOUTH` | z −9.5, x ±4 | Chunky portal frame where the corridor meets the hall | `Room.jsx` `Corridor` |
| `DOOR` | z −11 (south face), 4.4 m tall, 0.35 m thick | The breakable wooden double gate: solid planked lower panel with an X brace, open above it. Scene groups: `door`, `door-left`, `door-right` | `world.js` `DOOR` |
| `DOOR-2` … `DOOR-50` | z −16.5, −22, …, −280.5 (doors 1–5 wood, 6–10 grey stone, 11–15 rusty metal, 16–20 navy glass gate, 21–25 riveted blue steel, 26–30 teal diamond-plate, 31–35 purple plate with hazard posts, 36–40 black emblem gate, 41–45 gold vault, 46–50 ice-blue vault) (5.5 m apart, behind `DOOR`) | Same gate design, seen through the open space above the door in front. Not reachable yet: the player stops at `DOOR` | `world.js` `DOORS` |
| `DOOR-TAG` | 1.4 m south of each door, y 1.6 | Floating "Level: N" and health bar (20 → 34.5M over 50 doors) | `DOOR_TAGS` |
| `CROWN-ROOM` | x −14…14, z −293…−319, 9 m high | Room the corridor opens into after `DOOR-50`: barred windows, back-wall lamps, two columns by the entrance, a locker and crate pile at the back | `world.js` `WIN_ROOM` |
| `CROWN` | x 0, z −308 | Gold crown spinning over a tiered pedestal in the middle of `CROWN-ROOM` (display only) | `room.js` `CROWN` |
| `HAZARD-STRIP` | z ≈ −10.55, across the corridor | Yellow/black stripe at the door threshold | `Room.jsx` `Corridor` |
| `CHEVRONS` | z ≈ −6.8, x ±2.6 | Glowing orange arrows on the floor pointing at the door | `Room.jsx` `Corridor` |
| `FOOD-PAD` | (−14, −4.4), radius 2.1 | BUY pad, floating bread, price of the next unowned food; walking up opens the Training Food window (`ui/FoodShop.jsx`) | `BUY_PADS` (id `food`) |
| `FART-PAD` | (14, −4.4), radius 2.1 | BUY pad, floating gas puff, "NEXT FART: $10K" | `BUY_PADS` (id `fart`) |
| `SINK` | (7, −9.05) | Hand-wash sink on the north wall | `SINK` |

### Lockers

| Name | Where | Size | Source |
| --- | --- | --- | --- |
| `N-LOCKERS-W` | (−13.5, −9.2), north wall, faces south | 8 lockers | `LOCKER_BANKS[1]` |
| `N-LOCKERS-E` | (13.5, −9.2), north wall, faces south | 8 lockers | `LOCKER_BANKS[0]` |
| `W-LOCKERS` | (−25.7, −6), west wall, faces east | 5 lockers | `LOCKER_BANKS[2]` |
| `E-LOCKERS` | (25.7, −5.5), east wall, faces west | 7 lockers | `LOCKER_BANKS[3]` |

### West wall

| Name | Where | What it is | Source |
| --- | --- | --- | --- |
| `EGG-SHOP` | x −25.3 … −20.4, z 6.5 … 27.5 | Dark mat holding the four egg pedestals | `EGG_MAT` |
| `EGG-PLAIN` | (−22.8, 9.5) | White egg, needs Rebirth 4 | `EGGS[0]` |
| `EGG-GOLD` | (−22.8, 14.5) | Gold egg, needs Rebirth 5 | `EGGS[1]` |
| `EGG-NEST` | (−22.8, 19.5) | Nest egg, needs Rebirth 6 | `EGGS[2]` |
| `EGG-GALAXY` | (−22.6, 24.6), 1.7× size | Big galaxy egg, needs Rebirth 10 | `EGGS[3]` |

### Training end (south)

| Name | Where | What it is | Source |
| --- | --- | --- | --- |
| `TRAINING-AREA` | x ±16, z 4 … 30 | Lavender ring floor with yellow glowing rim and light-blue border strip | `TRAINING_AREA` |
| `TRAINING-PIT` | x ±10.5, z 8.5 … 24.5 | Bright white open floor in the middle, yellow light curtains at its edges | `TRAINING_PIT` |
| `TRAINING-SIGNS` | z 4, x ±8, y 5.2 | Two floating "TRAINING AREA" signs over the north edge (`-W`, `-E`) | `TRAINING_SIGNS` |
| `TABLES-S` | x −7.6, 0, 7.6 at z 27.2 | Three picnic tables across the south side of the ring | `TABLES` (rot 0) |
| `TABLES-W` | x −13.3 at z 12.5, 20 | Two picnic tables down the west side, long axis north–south | `TABLES` (rot 90°) |
| `TABLES-E` | x 13.3 at z 12.5, 20 | Two picnic tables down the east side | `TABLES` (rot 90°) |
| `LEADERBOARD-REBIRTHS` | (24.4, 9), faces west | "REBIRTHS" board on the east wall, nearer the door | `LEADERBOARDS[0]` |
| `LEADERBOARD-POWER` | (24.4, 17.5), faces west | "FART POWER" board on the east wall | `LEADERBOARDS[1]` |
| `ROUND-TABLES` | x 21.8 at z 7, 13.25, 21.5 | Three white cafe tables with two stools each, in front of the leaderboards | `ROUND_TABLES` |

### Crates

| Name | Where | Source |
| --- | --- | --- |
| `CRATES-SW` | x −24.6 … −22.9, z 30.7 … 32.4; one stacked | `CRATES[0..3]` |
| `CRATES-SE` | x 24.5 … 24.6, z 30.7 … 32.4; one stacked | `CRATES[4..6]` |
| `CRATES-E` | x 24.6, z 4.2 … 5.6; one stacked | `CRATES[7..9]` |
| `CRATES-W` | x −24.6 … −23.2, z 28.9 | `CRATES[10..11]` |

### South wall

| Name | Where | What it is | Source |
| --- | --- | --- | --- |
| `PORTAL` | (0, 33.45), opening x −1.5 … 1.5, faces north | Dark stone doorway with pink glow, "PORTAL" title, crown 5 / ball 5 requirement rows | `PORTAL` |

### Structure

| Name | Where | Source |
| --- | --- | --- |
| `GIRDERS` | Roof beams across the hall at z −6, 2, 10, 18, 26 | `GIRDER_Z` |
| `PILASTERS` | Blue steel columns under each girder on both long walls, plus x ±9, ±18 on the short walls | `GIRDER_Z`, `PILASTER_X` |
| `DUCTS` | Air ducts overhead at x ±12.8 running the hall's length | `Room.jsx` `Roof` |

## Status of each landmark

- **Solid** (blocks the player, who can stand on top up to about 0.3 m below its top): tables, benches, lockers, crates, sink, round tables, portal posts, egg pedestals, leaderboards. Everything else can be walked over or through.
- **Working**: `SPAWN`, `HALL`, `CORRIDOR`, and walking.
- **Display only** (draws correctly, does nothing yet): `DOOR` (it doesn't break), `DOOR-TAG`, `FOOD-PAD`, `FART-PAD`, `PORTAL`, all eggs, both leaderboards. Prices and requirement numbers are placeholders.
- **Not built**: the "Train" prompt at `TRAINING-PIT`, player and pet characters, the Group Rewards chest.

## Calling a landmark in a request

- Use the name: "move `FART-PAD` closer to `DOOR`", "add a crate stack at `CRATES-E`".
- For a new spot, give a landmark plus an offset and direction: "3 m east of `SINK`", "in the `TRAINING-PIT`, north end".
- To add or move a solid prop, `src/data/room.js` is the file to change; `Room.jsx` draws it and the collider follows from the same data.
