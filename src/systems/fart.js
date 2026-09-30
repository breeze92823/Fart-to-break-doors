import { inputState } from './input.js'
import { player } from './playerState.js'
import { playOwnFart } from './fartSound.js'
import { useGameStore } from '../store/useGameStore.js'

// The fart action: a screen click makes the player hunch forward (`pose`,
// eased 0..1, read by avatarAnim) while a burst of gas puffs is emitted from
// behind (components/FartGas.jsx reads `emitting`/`burst`). Framework-free.
export const FART = {
  holdTime: 0.7, // s the fart lasts after a click (turn, hunch, release)
  poseStart: 0.08, // s for the 180 turn to get under way before the hunch
  emitStart: 0.16, // s after the click before gas starts (back is turned by then)
  emitEnd: 0.5,
  retrigger: 0.4, // s before another click restarts the fart
  poseInHz: 24,
  poseOutHz: 12,
}

// One fart's timeline: the local player's (below) and one per remote player
// (components/RemotePlayers.jsx), all advanced by stepFartState().
export function makeFartState() {
  return {
    time: Infinity, // s since the fart started
    pose: 0, // eased hunch amount, 0..1
    emitting: false,
  }
}

export function stepFartState(f, dt, seated) {
  f.time += dt
  const active = f.time < FART.holdTime && !seated
  const posing = active && f.time >= FART.poseStart
  const hz = posing ? FART.poseInHz : FART.poseOutHz
  f.pose += ((posing ? 1 : 0) - f.pose) * (1 - Math.exp(-hz * dt))
  if (f.pose < 0.001) f.pose = 0
  f.emitting = active && f.time >= FART.emitStart && f.time < FART.emitEnd
}

export const fart = {
  ...makeFartState(),
  seq: 0, // bumped per fart; systems/net.js sends one `fart` per bump
  aligned: true, // model has finished turning to player.facing (set by Player)
  turned: false, // facing is currently spun 180 for the fart
}

// Everything that emits gas (components/FartGas.jsx): { fart, pos, facing,
// carry }. `pos` is the feet position, `facing` the yaw the model faces
// (gas leaves from behind it), `type` a fart id (missing = the plain fart). Remote players add and remove their own.
export const fartSources = new Set([
  {
    fart,
    pos: player.position,
    get facing() {
      return player.facing
    },
    carry: 0,
    // The equipped fart type picks the gas look (data/farts.js).
    get type() {
      return useGameStore.getState().equippedFart
    },
  },
])

export function step(dt) {
  if (inputState.fart) {
    inputState.fart = false
    if (!player.seated && !fart.turned && fart.aligned && fart.time > FART.retrigger) {
      fart.time = 0
      fart.seq += 1
      playOwnFart()
      // Spin round so the back points where the player was looking; Player
      // eases the model round to this over a few frames.
      player.facing += Math.PI
      fart.turned = true
      fart.aligned = false
    }
  }
  stepFartState(fart, dt, player.seated)
  // Done: turn back the way the player was facing.
  if (fart.turned && fart.time >= FART.holdTime) {
    player.facing -= Math.PI
    fart.turned = false
  }
}
