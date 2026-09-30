import { CORRIDOR, DOOR, HALL } from './world.js'

// Layout of the prison-cafeteria hall: every prop's placement lives here so
// components/Room.jsx (drawing) and systems/playerMovement.js (collision)
// read the same numbers. Positions are centres on the floor unless noted.

// Cafeteria table + its two benches. Tables run along X.
export const TABLE = { length: 7, width: 1.5, height: 0.82 }
export const BENCH = { width: 0.5, height: 0.46, offset: 1.2 } // offset = bench centre from table centre (Z)

// The training area: a darker floor zone with a glowing yellow rim, filled
// with cafeteria tables. The hall's south half.
export const TRAINING_AREA = { minX: -16, maxX: 16, minZ: 4, maxZ: 30 }

// The bright open pit in the middle of the zone, edged with yellow light.
// Tables sit on the ring around it, so it stays clear of them.
export const TRAINING_PIT = { minX: -10.5, maxX: 10.5, minZ: 8.5, maxZ: 24.5 }

// Tables ring the pit: three across the south side (long axis along X) and
// two down each side (`rot` = quarter turn, long axis along Z). The north
// side is left open.
export const TABLES = [
  ...[-7.6, 0, 7.6].map((x) => ({ x, z: 27.2, rot: 0 })),
  ...[-1, 1].flatMap((side) => [12.5, 20].map((z) => ({ x: side * 13.3, z, rot: Math.PI / 2 }))),
]

// Locker banks: `count` units side by side, their back against a wall.
// `facing` is the yaw the fronts face (0 = +Z / south). Each bank fits in
// the gap between two wall pilasters.
export const LOCKER = { width: 0.9, depth: 0.6, height: 2.5 }
export const LOCKER_BANKS = [
  { x: 13.5, z: HALL.minZ + LOCKER.depth / 2, count: 8, facing: 0 },
  { x: -13.5, z: HALL.minZ + LOCKER.depth / 2, count: 8, facing: 0 },
  { x: HALL.minX + LOCKER.depth / 2, z: -6, count: 5, facing: Math.PI / 2 },
  { x: HALL.maxX - LOCKER.depth / 2, z: -5.5, count: 7, facing: -Math.PI / 2 },
]

// Wooden crates, `level` stacks them (0 = on the floor).
export const CRATES = [
  { x: -24.6, z: 32.4, size: 1.6, level: 0, rot: 0 },
  { x: -22.9, z: 32.4, size: 1.6, level: 0, rot: 0.1 },
  { x: -24.6, z: 30.7, size: 1.6, level: 0, rot: -0.05 },
  { x: -23.8, z: 32.3, size: 1.6, level: 1, rot: 0.3 },
  { x: 24.6, z: 32.4, size: 1.6, level: 0, rot: 0 },
  { x: 24.5, z: 30.7, size: 1.6, level: 0, rot: 0.08 },
  { x: 24.6, z: 32.3, size: 1.6, level: 1, rot: -0.2 },
  { x: 24.6, z: 4.2, size: 1.3, level: 0, rot: 0.15 },
  { x: 24.6, z: 5.6, size: 1.3, level: 0, rot: 0 },
  { x: 24.6, z: 4.9, size: 1.3, level: 1, rot: -0.1 },
  { x: -24.6, z: 28.9, size: 1.3, level: 0, rot: 0.2 },
  { x: -23.2, z: 28.9, size: 1.3, level: 0, rot: 0 },
]

// Egg shop along the west wall: a dark mat with one pedestal per egg tier,
// cheapest at the door end. `size` scales the egg; `gems` prices it in the
// premium currency instead of Cash. Prices are display-only for now.
export const EGG_MAT = { minX: HALL.minX + 0.7, maxX: HALL.minX + 5.6, minZ: 6.5, maxZ: 27.5 }
export const EGGS = [
  { kind: 'plain', x: HALL.minX + 3.2, z: 9.5, price: '2.5K', size: 1 },
  { kind: 'gold', x: HALL.minX + 3.2, z: 14.5, price: '15K', size: 1 },
  { kind: 'nest', x: HALL.minX + 3.2, z: 19.5, price: '3M', size: 1 },
  { kind: 'galaxy', x: HALL.minX + 3.4, z: 24.6, price: '115', size: 1.7, gems: true },
]
export const EGG_PEDESTAL = { radius: 0.95, height: 0.4 }

// East-side shop corner between the door and the training area: the BUY
// pad for the next Fart, the free daily spin pad, and the offline-cash sign.
// Prices are display-only for now. `facing` is the yaw the fronts face.
export const BUY_PADS = [
  { id: 'food', item: 'food', x: -14, z: -4.4, radius: 2.1, label: 'NEXT FOOD:', price: '$3.5K' },
  { id: 'fart', item: 'fart', x: 14, z: -4.4, radius: 2.1, label: 'NEXT FART:', price: '$10K' },
]

// Health tag floating in front of each door, in DOORS order (display only for now).
// `cash` is paid to the player when that door breaks.
export const DOOR_TAGS = [
  [20, 5],
  [50, 8],
  [100, 12],
  [200, 19],
  [400, 25],
].map(([hp, cash], i) => ({ level: i + 1, hp, max: hp, cash, y: 1.6 }))
export const SPIN_PAD = { x: 19.8, z: -4.6, radius: 2, reward: 'x3' }
export const OFFLINE_SIGN = { x: 23.2, z: -0.4, facing: -Math.PI / 2 }

// Round white tables with stools, in front of the leaderboards.
export const ROUND_TABLE = { radius: 0.95, height: 0.82 }
export const ROUND_TABLES = [7, 13.25, 21.5].map((z) => ({ x: HALL.maxX - 4.2, z }))

// Portal on the middle of the south wall. `facing` is the yaw
// its front faces (π = north, into the hall); `requires` is shown on its
// label (display only).
export const PORTAL = {
  x: 0,
  z: HALL.maxZ - 0.55,
  facing: Math.PI,
  width: 3,
  height: 3.6,
  depth: 0.9,
  post: 0.55,
  requires: { rebirths: 5, power: 5 },
}

// Hand-wash sink beside the east locker bank on the north wall.
export const SINK = { x: 7, z: HALL.minZ + 0.45 }

// Leaderboard stands against the east wall beside the training area,
// facing west into the hall (`facing` is the yaw their fronts face).
export const LEADERBOARDS = [
  { x: HALL.maxX - 1.6, z: 9, facing: -Math.PI / 2, title: 'REBIRTHS', header: 'REBIRTH LEADERBOARD' },
  { x: HALL.maxX - 1.6, z: 17.5, facing: -Math.PI / 2, title: 'FART POWER', header: 'FART POWER LEADERBOARD' },
]
export const LEADERBOARD = { width: 5.2, pillar: 1, height: 5.2 }

// Floating "TRAINING AREA" signs over the zone's north edge, one per half.
export const TRAINING_SIGNS = [-8, 8].map((x) => ({ x, y: 5.2, z: TRAINING_AREA.minZ, width: 9, height: 1.4 }))

// Ceiling structure: girders span X at these Z stations; wall pilasters
// line up under them.
export const GIRDER_Z = [-6, 2, 10, 18, 26]
export const PILASTER_X = [-18, -9, 9, 18]

// Axis-aligned solid boxes the player can't walk through (but can stand on
// top of). Built from the layout above so collision matches the visuals.
function box(cx, cz, sx, sz, height) {
  return { minX: cx - sx / 2, maxX: cx + sx / 2, minZ: cz - sz / 2, maxZ: cz + sz / 2, maxY: height }
}

function span(minX, maxX, minZ, maxZ, maxY) {
  return { minX, maxX, minZ, maxZ, maxY }
}

function buildColliders() {
  const out = []
  // Solid wall mass either side of the corridor, north of the hall.
  const northMinZ = DOOR.z - 4
  out.push(span(HALL.minX - 2, -CORRIDOR.halfWidth, northMinZ, HALL.minZ, HALL.height))
  out.push(span(CORRIDOR.halfWidth, HALL.maxX + 2, northMinZ, HALL.minZ, HALL.height))

  for (const t of TABLES) {
    // A quarter-turned table swaps its X and Z extents.
    const turned = t.rot !== 0
    const add = (dx, dz, along, across, height) =>
      out.push(box(t.x + (turned ? dz : dx), t.z + (turned ? dx : dz), turned ? across : along, turned ? along : across, height))
    add(0, 0, TABLE.length, TABLE.width, TABLE.height)
    add(0, -BENCH.offset, TABLE.length, BENCH.width, BENCH.height)
    add(0, BENCH.offset, TABLE.length, BENCH.width, BENCH.height)
  }
  for (const b of LOCKER_BANKS) {
    const along = b.count * LOCKER.width
    const alongX = Math.abs(Math.sin(b.facing)) < 0.5
    out.push(box(b.x, b.z, alongX ? along : LOCKER.depth, alongX ? LOCKER.depth : along, LOCKER.height))
  }
  for (const c of CRATES) {
    if (c.level !== 0) continue
    // A crate with one stacked on it is a two-high column.
    const stacked = CRATES.some((o) => o.level === 1 && Math.hypot(o.x - c.x, o.z - c.z) < c.size * 0.6)
    out.push(box(c.x, c.z, c.size, c.size, c.size * (stacked ? 2 : 1)))
  }
  out.push(box(SINK.x, SINK.z, 0.9, 0.7, 1))
  for (const t of ROUND_TABLES) out.push(box(t.x, t.z, 2 * ROUND_TABLE.radius, 2 * ROUND_TABLE.radius, ROUND_TABLE.height))
  out.push(box(OFFLINE_SIGN.x, OFFLINE_SIGN.z, 0.5, 2.6, 2.2))
  const portalAlongX = Math.abs(Math.sin(PORTAL.facing)) < 0.5
  for (const side of [-1, 1]) {
    // Only the two stone posts are solid; the opening between them is walkable.
    const off = side * (PORTAL.width / 2 + PORTAL.post / 2)
    out.push(portalAlongX
      ? box(PORTAL.x + off, PORTAL.z, PORTAL.post, PORTAL.depth, PORTAL.height + 0.6)
      : box(PORTAL.x, PORTAL.z + off, PORTAL.depth, PORTAL.post, PORTAL.height + 0.6))
  }
  for (const e of EGGS) {
    const r = EGG_PEDESTAL.radius * (e.size > 1 ? 1.35 : 1)
    out.push(box(e.x, e.z, 2 * r, 2 * r, EGG_PEDESTAL.height))
  }
  for (const l of LEADERBOARDS) {
    const along = LEADERBOARD.width + LEADERBOARD.pillar * 2
    const alongX = Math.abs(Math.sin(l.facing)) < 0.5
    out.push(box(l.x, l.z, alongX ? along : 1, alongX ? 1 : along, LEADERBOARD.height))
  }
  return out
}

export const COLLIDERS = buildColliders()
