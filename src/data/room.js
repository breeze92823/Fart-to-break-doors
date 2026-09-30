import { CORRIDOR, DOOR, HALL } from './world.js'

// Layout of the prison-cafeteria hall: every prop's placement lives here so
// components/Room.jsx (drawing) and systems/playerMovement.js (collision)
// read the same numbers. Positions are centres on the floor unless noted.

// Cafeteria table + its two benches. Tables run along X.
export const TABLE = { length: 7, width: 1.5, height: 0.82 }
export const BENCH = { width: 0.5, height: 0.46, offset: 1.2 } // offset = bench centre from table centre (Z)

// The training area: a darker floor zone with a glowing yellow rim, filled
// with cafeteria tables. The hall's south half.
export const TRAINING_AREA = { minX: -20, maxX: 20, minZ: 4, maxZ: 30 }

export const TABLES = [-9, 9].flatMap((x) => [9, 15, 21, 26.5].map((z) => ({ x, z })))

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
  { x: -24.8, z: -2, size: 1.3, level: 0, rot: 0.2 },
  { x: -23.4, z: -2.2, size: 1.3, level: 0, rot: 0 },
]

// Hand-wash sink beside the east locker bank on the north wall.
export const SINK = { x: 7, z: HALL.minZ + 0.45 }

// Leaderboard stands against the south wall, facing north.
export const LEADERBOARDS = [
  { x: 7, z: HALL.maxZ - 1.6, title: 'REBIRTHS', header: 'REBIRTH LEADERBOARD' },
  { x: -7, z: HALL.maxZ - 1.6, title: 'FART POWER', header: 'FART POWER LEADERBOARD' },
]
export const LEADERBOARD = { width: 5.2, pillar: 1, height: 5.2 }

// Big floating sign over the training area's north edge.
export const TRAINING_SIGN = { x: 0, y: 7.5, z: TRAINING_AREA.minZ, width: 14, height: 2.2 }

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
    out.push(box(t.x, t.z, TABLE.length, TABLE.width, TABLE.height))
    out.push(box(t.x, t.z - BENCH.offset, TABLE.length, BENCH.width, BENCH.height))
    out.push(box(t.x, t.z + BENCH.offset, TABLE.length, BENCH.width, BENCH.height))
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
  for (const l of LEADERBOARDS) out.push(box(l.x, l.z, LEADERBOARD.width + LEADERBOARD.pillar * 2, 1, LEADERBOARD.height))
  return out
}

export const COLLIDERS = buildColliders()
