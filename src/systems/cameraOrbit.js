import { inputState } from './input.js'
import { player } from './playerState.js'
import { barrierZ } from './doors.js'
import { CORRIDOR, GROUND_Y, HALL, WIN_ROOM } from '../data/world.js'

// Third-person follow with right-drag orbit + wheel zoom. Position and
// look-at ease at different rates so the rig reads as a follow cam rather
// than a rigid mount.
const START_PITCH = 0.42 // radians above the horizon
const state = {
  yaw: 0, // radians; 0 puts the camera on +Z looking toward -Z
  pitch: START_PITCH,
  distance: 10,
}

const MIN_PITCH = -0.1
const MAX_PITCH = 1.2
const MIN_DIST = 3
const MAX_DIST = 40
const ORBIT_SENS = 0.005
const ZOOM_SENS = 0.01
const FLOOR_MARGIN = 0.3 // m the camera stays above the ground
const WALL_MARGIN = 0.5 // m the camera stays off walls
const ROOF_CLEARANCE = 1.8 // m below the hall ceiling, clear of the girders

// Keeps a camera position inside the hall, or inside the corridor while
// it's in line with the corridor mouth, or inside the crown room once the
// player is in it.
function clampToInterior(pos) {
  if (player.position.z < WIN_ROOM.maxZ) {
    pos.z = Math.max(pos.z, WIN_ROOM.minZ + WALL_MARGIN)
    const halfW = pos.z < WIN_ROOM.maxZ - WALL_MARGIN ? WIN_ROOM.halfWidth : CORRIDOR.halfWidth
    pos.x = Math.min(Math.max(pos.x, -halfW + WALL_MARGIN), halfW - WALL_MARGIN)
    const roof = (pos.z < WIN_ROOM.maxZ ? WIN_ROOM.height : CORRIDOR.height) - WALL_MARGIN
    if (pos.y > roof) pos.y = roof
    return
  }
  pos.x = Math.min(Math.max(pos.x, HALL.minX + WALL_MARGIN), HALL.maxX - WALL_MARGIN)
  const inCorridorLine = Math.abs(pos.x) < CORRIDOR.halfWidth - WALL_MARGIN
  const minZ = inCorridorLine ? barrierZ() + WALL_MARGIN : HALL.minZ + WALL_MARGIN
  pos.z = Math.min(Math.max(pos.z, minZ), HALL.maxZ - WALL_MARGIN)
  const roof = pos.z < HALL.minZ ? CORRIDOR.height - WALL_MARGIN : HALL.height - ROOF_CLEARANCE
  if (pos.y > roof) pos.y = roof
}
const _desired = { x: 0, y: 0, z: 0 }

// Driven by the Bloxity `camera_sensitivity` setting (0.1-5.0, default 1).
let sensitivity = 1
export function setCameraSensitivity(value) {
  sensitivity = value
}

const POSITION_SMOOTHING = 12
const LOOK_SMOOTHING = 20

// A same-frame jump in the player's position bigger than this is a teleport
// (a respawn) rather than real movement — snap instead of swooping.
const TELEPORT_DISTANCE = 15

const target = { x: 0, y: 0, z: 0 }
const lookAt = { x: 0, y: 0, z: 0 }
const lastPlayerPos = { x: 0, y: 0, z: 0 }
let initialised = false

export function getYaw() {
  return state.yaw
}

// Snaps the orbit to sit directly behind the player, e.g. right after spawn.
export function syncYawToPlayer() {
  state.yaw = player.facing + Math.PI
}

// Points the orbit directly (radians / metres); used by the dev console hook.
export function setView({ yaw = state.yaw, pitch = state.pitch, distance = state.distance }) {
  state.yaw = yaw
  state.pitch = pitch
  state.distance = distance
}

export function update(camera, dt) {
  state.yaw -= inputState.look.dx * ORBIT_SENS * sensitivity
  state.pitch += inputState.look.dy * ORBIT_SENS * sensitivity
  inputState.look.dx = 0
  inputState.look.dy = 0

  if (state.pitch < MIN_PITCH) state.pitch = MIN_PITCH
  if (state.pitch > MAX_PITCH) state.pitch = MAX_PITCH

  state.distance += inputState.zoom * ZOOM_SENS
  inputState.zoom = 0
  if (state.distance < MIN_DIST) state.distance = MIN_DIST
  if (state.distance > MAX_DIST) state.distance = MAX_DIST

  const jump = Math.hypot(
    player.position.x - lastPlayerPos.x,
    player.position.y - lastPlayerPos.y,
    player.position.z - lastPlayerPos.z,
  )
  const teleported = initialised && jump > TELEPORT_DISTANCE
  lastPlayerPos.x = player.position.x
  lastPlayerPos.y = player.position.y
  lastPlayerPos.z = player.position.z

  if (teleported) {
    state.yaw = player.facing + Math.PI
    state.pitch = START_PITCH
  }

  target.x = player.position.x
  target.y = player.position.y + player.dims.height * 0.6
  target.z = player.position.z

  const cp = Math.cos(state.pitch)
  const dirX = Math.sin(state.yaw) * cp
  const dirY = Math.sin(state.pitch)
  const dirZ = Math.cos(state.yaw) * cp

  // Shorten the boom if it would end up under the ground.
  let boom = state.distance
  if (dirY < 0) {
    const maxBoom = (target.y - (GROUND_Y + FLOOR_MARGIN)) / -dirY
    if (maxBoom < boom) boom = Math.max(maxBoom, 0.6)
  }
  _desired.x = target.x + dirX * boom
  _desired.y = target.y + dirY * boom
  _desired.z = target.z + dirZ * boom
  clampToInterior(_desired)
  const { x: desiredX, y: desiredY, z: desiredZ } = _desired

  if (!initialised || teleported) {
    camera.position.set(desiredX, desiredY, desiredZ)
    lookAt.x = target.x
    lookAt.y = target.y
    lookAt.z = target.z
    initialised = true
  } else {
    const tPos = dt > 0 ? 1 - Math.exp(-POSITION_SMOOTHING * dt) : 1
    camera.position.x += (desiredX - camera.position.x) * tPos
    camera.position.y += (desiredY - camera.position.y) * tPos
    camera.position.z += (desiredZ - camera.position.z) * tPos

    const tLook = dt > 0 ? 1 - Math.exp(-LOOK_SMOOTHING * dt) : 1
    lookAt.x += (target.x - lookAt.x) * tLook
    lookAt.y += (target.y - lookAt.y) * tLook
    lookAt.z += (target.z - lookAt.z) * tLook
  }

  camera.lookAt(lookAt.x, lookAt.y, lookAt.z)
}
