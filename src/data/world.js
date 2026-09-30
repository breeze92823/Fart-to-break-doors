// World layout, in metres. +X east, +Z south, Y up; the default camera sits
// on +Z looking north. The world is one prison-cafeteria hall with a
// corridor leading north out of it to the breakable door.
export const GROUND_Y = 0

// Main hall interior (inner wall faces) and ceiling height.
export const HALL = { minX: -26, maxX: 26, minZ: -9.5, maxZ: 34, height: 12 }

// Corridor running north from the middle of the hall's north wall.
export const CORRIDOR = { halfWidth: 4, height: 6, endZ: -293 }

// The crown room past the last door: a wide, dim cell block the corridor opens
// into at CORRIDOR.endZ, with the crown on a pedestal in the middle.
const WIN_DEPTH = 26
export const WIN_ROOM = { halfWidth: 14, height: 9, maxZ: CORRIDOR.endZ, minZ: CORRIDOR.endZ - WIN_DEPTH }

// The wooden door across the corridor. `z` is its south (hall-side) face.
export const DOOR = { z: -11, height: 4.4, thickness: 0.35 }

// Fifty doors in a row down the corridor, DOOR first. Only the first one blocks
// the player for now (BOUNDS stops at DOOR.z); the rest show through its open top.
export const DOOR_SPACING = 5.5
export const DOORS = Array.from({ length: 50 }, (_, i) => ({ ...DOOR, z: DOOR.z - i * DOOR_SPACING }))

// Walkable rectangle; the player is clamped inside it. North of the hall
// only the corridor is walkable — see the wall colliders in data/room.js.
export const BOUNDS = { minX: HALL.minX, maxX: HALL.maxX, minZ: DOOR.z, maxZ: HALL.maxZ }

export const SPAWN = { x: 0, y: GROUND_Y, z: -3 }
export const SPAWN_FACING = Math.PI // face north, toward the door

export const PLAYER_MOVE_SPEED = 7

// Ground texture tile size (metres per tile).
export const TILE = 3
