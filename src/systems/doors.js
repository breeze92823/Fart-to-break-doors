import { fart, FART } from './fart.js'
import { inputState } from './input.js'
import { player } from './playerState.js'
import { useGameStore } from '../store/useGameStore.js'
import { CORRIDOR, DOOR, DOORS, WIN_ROOM } from '../data/world.js'
import { DOOR_TAGS } from '../data/room.js'
import { spawnCashPopup } from './cashPopups.js'
import { equippedFartStats } from './farts.js'
import { currentMult } from './rebirth.js'
import { playDoorBreak, preloadDoorSound } from './doorSound.js'

// Door health and break animation. Each fart that lands while the player is
// within DOOR_REACH of the first intact door takes Fart Power off its health;
// at zero the leaves swing open and the player can walk on to the next door.
// Health lives in the store (the tags show it); the animation is per-frame.
export const DOOR_REACH = 3.5 // m south of a door's face a fart still hits it
export const DOOR_OPEN_ANGLE = 1.75 // rad each leaf swings when broken
const OPEN_SPEED = 2.2 // 1/s
const SHAKE_DECAY = 5 // 1/s
const FLASH_DECAY = 3 // 1/s

export const doorAnim = DOORS.map(() => ({ open: 0, shake: 0, flash: 0 }))
// Hits waiting for components/DoorHitFx.jsx to show a burst: { door, damage }.
export const doorHits = []
preloadDoorSound()
let wasEmitting = false
let wasTouching = false
// The hazard stripe on the floor at the threshold (Room.jsx); stepping back
// south over it restores every door.
const HAZARD_Z = DOOR.z + 0.45
let wasInCorridor = false

function resetDoors() {
  const { doorHp } = useGameStore.getState()
  if (doorHp.every((hp, i) => hp === DOOR_TAGS[i].hp)) return
  useGameStore.setState({ doorHp: DOOR_TAGS.map((t) => t.hp) })
  doorAnim.forEach((a) => {
    a.open = 0
    a.shake = 0
    a.flash = 0
  })
}

export function firstIntactDoor() {
  return useGameStore.getState().doorHp.findIndex((hp) => hp > 0)
}

// Z the player can't cross: the face of the first unbroken door, else the crown room's back wall.
export function barrierZ() {
  const i = firstIntactDoor()
  return i < 0 ? WIN_ROOM.minZ : DOORS[i].z
}

function hitDoor() {
  const i = firstIntactDoor()
  if (i < 0) return
  const dz = player.position.z - DOORS[i].z
  if (dz < 0 || dz > DOOR_REACH || Math.abs(player.position.x) > CORRIDOR.halfWidth) return
  const { fartPower, doorHp } = useGameStore.getState()
  const fart = equippedFartStats()
  const mult = currentMult() // Rebirth multiplier on Cash
  // Power left over after a door breaks carries on to the next door, and so on.
  const hp = [...doorHp]
  let cash = 0
  let left = fartPower * fart.power
  const broken = []
  for (let j = i; j < hp.length && left > 0; j += 1) {
    if (hp[j] <= 0) continue
    const damage = Math.min(left, hp[j])
    hp[j] -= damage
    left -= damage
    doorAnim[j].shake = 1
    doorAnim[j].flash = 1
    doorHits.push({ door: j, damage })
    if (hp[j] === 0) {
      cash += Math.round(DOOR_TAGS[j].cash * fart.cash * mult)
      broken.push(j)
    }
  }
  useGameStore.setState((s) => ({ doorHp: hp, cash: s.cash + cash }))
  broken.forEach((j) => spawnCashPopup(Math.round(DOOR_TAGS[j].cash * fart.cash * mult)))
  if (broken.length) playDoorBreak()
}

// Bumping into an intact door makes the player fart once; they must back off
// and bump again for another.
function autoFartOnContact() {
  const i = firstIntactDoor()
  const dz = i < 0 ? Infinity : player.position.z - DOORS[i].z
  const touching = dz >= 0 && dz <= player.dims.radius + 0.05 && Math.abs(player.position.x) <= CORRIDOR.halfWidth
  if (!touching) {
    wasTouching = false
    return
  }
  if (wasTouching || player.seated || fart.time <= FART.retrigger) return
  inputState.fart = true
  wasTouching = true
}

// Auto Break: walk to the first intact door and keep farting at it. Returns
// the world-space move direction for playerMovement (null when not walking),
// and switches itself off once no intact door is left.
export function autoBreakWish() {
  const { autoBreak } = useGameStore.getState()
  if (!autoBreak || player.seated) return null
  const i = firstIntactDoor()
  if (i < 0) {
    useGameStore.setState({ autoBreak: false })
    return null
  }
  const dx = -player.position.x
  const dz = DOORS[i].z + player.dims.radius + 0.02 - player.position.z
  const dist = Math.hypot(dx, dz)
  if (dist < 0.08) return null
  return { x: dx / dist, z: dz / dist }
}

function autoBreakFart() {
  if (!useGameStore.getState().autoBreak || player.seated) return
  const i = firstIntactDoor()
  if (i < 0) return
  const dz = player.position.z - DOORS[i].z
  if (dz >= 0 && dz <= player.dims.radius + 0.1 && Math.abs(player.position.x) <= CORRIDOR.halfWidth) {
    inputState.fart = true
  }
}

export function step(dt) {
  const inCorridor = player.position.z < HAZARD_Z
  if (wasInCorridor && !inCorridor) resetDoors()
  wasInCorridor = inCorridor
  if (useGameStore.getState().inDoorArea !== inCorridor) useGameStore.setState({ inDoorArea: inCorridor })
  const i = firstIntactDoor()
  const dz = i < 0 ? Infinity : player.position.z - DOORS[i].z
  const near = dz >= 0 && dz <= DOOR_REACH && Math.abs(player.position.x) <= CORRIDOR.halfWidth
  if (useGameStore.getState().nearDoor !== near) useGameStore.setState({ nearDoor: near })

  autoFartOnContact()
  autoBreakFart()
  // One hit per fart, as the gas starts.
  if (fart.emitting && !wasEmitting) hitDoor()
  wasEmitting = fart.emitting

  const { doorHp } = useGameStore.getState()
  doorAnim.forEach((a, i) => {
    if (doorHp[i] <= 0) a.open = Math.min(1, a.open + OPEN_SPEED * dt)
    a.shake = Math.max(0, a.shake - SHAKE_DECAY * dt)
    a.flash = Math.max(0, a.flash - FLASH_DECAY * dt)
  })
}
