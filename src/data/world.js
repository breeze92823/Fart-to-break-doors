// World layout, in metres. +X east, +Z south, Y up; the default camera sits
// on +Z looking north. The whole world is one flat ground slab for now.
export const GROUND_Y = 0

// Walkable rectangle; the player is clamped inside it.
export const BOUNDS = { minX: -60, maxX: 60, minZ: -60, maxZ: 60 }

export const SPAWN = { x: 0, y: GROUND_Y, z: 0 }
export const SPAWN_FACING = Math.PI // face north

export const PLAYER_MOVE_SPEED = 7

// Ground texture tile size (metres per tile).
export const TILE = 2
