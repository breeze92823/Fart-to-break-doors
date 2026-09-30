import { inputState } from './input.js'
import { player } from './playerState.js'
import { getYaw } from './cameraOrbit.js'
import { BOUNDS, GROUND_Y, PLAYER_MOVE_SPEED } from '../data/world.js'
import { COLLIDERS } from '../data/room.js'

// Kinematic capsule, stepped once per frame: apply input -> gravity ->
// integrate -> push out of solid props -> clamp to the ground height under
// the player's feet (the floor, or the top of a prop they're standing on).

const ACCEL = 45 // m/s^2 approach toward target velocity
const GRAVITY = -22 // m/s^2
const JUMP_SPEED = 7.5 // m/s
const STEP_UP = 0.3 // m; feet this close below a prop's top count as on top of it

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v
}

// Pushes the player's circle (in XZ) out of every collider box they're
// beside, and returns the highest prop top they're standing over.
function resolveColliders(p, r) {
  let floor = GROUND_Y
  for (const c of COLLIDERS) {
    const cx = clamp(p.x, c.minX, c.maxX)
    const cz = clamp(p.z, c.minZ, c.maxZ)
    const dx = p.x - cx
    const dz = p.z - cz
    const d2 = dx * dx + dz * dz
    if (d2 >= r * r) continue
    if (p.y >= c.maxY - STEP_UP) {
      if (c.maxY > floor) floor = c.maxY
      continue
    }
    if (d2 > 1e-8) {
      const d = Math.sqrt(d2)
      p.x = cx + (dx / d) * r
      p.z = cz + (dz / d) * r
    } else {
      // Centre inside the box: leave by the nearest face.
      const exits = [p.x - c.minX, c.maxX - p.x, p.z - c.minZ, c.maxZ - p.z]
      const i = exits.indexOf(Math.min(...exits))
      if (i === 0) p.x = c.minX - r
      else if (i === 1) p.x = c.maxX + r
      else if (i === 2) p.z = c.minZ - r
      else p.z = c.maxZ + r
    }
  }
  return floor
}

// Clamps the (dx, dz) delta as one 2D vector so velocity curves straight
// toward the target instead of warping axis-by-axis.
function approach2D(v, targetX, targetZ, maxDelta) {
  const dx = targetX - v.x
  const dz = targetZ - v.z
  const dist = Math.hypot(dx, dz)
  if (dist <= maxDelta || dist === 0) {
    v.x = targetX
    v.z = targetZ
  } else {
    const scale = maxDelta / dist
    v.x += dx * scale
    v.z += dz * scale
  }
}

export function step(dt) {
  if (dt <= 0) return

  // Camera-relative ground basis.
  const yaw = getYaw()
  const fwdX = -Math.sin(yaw)
  const fwdZ = -Math.cos(yaw)
  const rightX = Math.cos(yaw)
  const rightZ = -Math.sin(yaw)

  const mv = inputState.move
  let wishX = fwdX * mv.z + rightX * mv.x
  let wishZ = fwdZ * mv.z + rightZ * mv.x
  // Diagonals must not be faster than straight lines.
  const wishLen = Math.hypot(wishX, wishZ)
  if (wishLen > 1) {
    wishX /= wishLen
    wishZ /= wishLen
  }

  approach2D(player.velocity, wishX * PLAYER_MOVE_SPEED, wishZ * PLAYER_MOVE_SPEED, ACCEL * dt)

  // Jump reads last frame's grounded flag, then we clear it for this frame.
  if (inputState.jump) {
    if (player.grounded) player.velocity.y = JUMP_SPEED
    inputState.jump = false
  }
  player.grounded = false

  const p = player.position
  player.velocity.y += GRAVITY * dt
  p.x += player.velocity.x * dt
  p.y += player.velocity.y * dt
  p.z += player.velocity.z * dt

  const r = player.dims.radius
  if (p.x < BOUNDS.minX + r) p.x = BOUNDS.minX + r
  if (p.x > BOUNDS.maxX - r) p.x = BOUNDS.maxX - r
  if (p.z < BOUNDS.minZ + r) p.z = BOUNDS.minZ + r
  if (p.z > BOUNDS.maxZ - r) p.z = BOUNDS.maxZ - r

  const floor = resolveColliders(p, r)
  if (p.y <= floor) {
    p.y = floor
    if (player.velocity.y < 0) player.velocity.y = 0
    player.grounded = true
  }

  // Face the direction of travel.
  if (Math.hypot(wishX, wishZ) > 0.01) {
    player.facing = Math.atan2(wishX, wishZ)
  }
}
