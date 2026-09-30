import { player } from './playerState.js'
import { inputState } from './input.js'
import { registerInteractZone } from './interact.js'
import { BENCH, TABLE, TABLES } from '../data/room.js'

// Sitting on the training-area picnic tables. Hold E beside a bench to sit on
// it; any move key or jump stands you back up. Zones live in TABLES
// (data/room.js), so moving a table moves its seats.

const REACH = 1.5 // m from the seat point at which the prompt appears
const SEAT_INSET = 0.5 // keeps the seat off the table's end
const STAND_OUT = BENCH.width / 2 + 0.4 + 0.05 // bench centre -> clear floor beside it

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)

// The seat on the bench nearest (px, pz), or null if none is within REACH.
// A seat sits on one of the table's two benches, at the point along it
// closest to the player. `out` is the unit vector pointing away from the
// table, used to stand back up.
export function nearestSeat(px, pz) {
  let best = null
  let bestD = REACH
  for (const t of TABLES) {
    const turned = t.rot !== 0
    const along = turned ? pz - t.z : px - t.x
    const across = turned ? px - t.x : pz - t.z
    const side = across < 0 ? -1 : 1
    const seatAlong = clamp(along, -(TABLE.length / 2 - SEAT_INSET), TABLE.length / 2 - SEAT_INSET)
    const seatAcross = side * BENCH.offset
    const d = Math.hypot(along - seatAlong, across - seatAcross)
    if (d >= bestD) continue
    bestD = d
    best = {
      x: turned ? t.x + seatAcross : t.x + seatAlong,
      z: turned ? t.z + seatAlong : t.z + seatAcross,
      outX: turned ? side : 0,
      outZ: turned ? 0 : side,
    }
  }
  return best
}

function sit(seat) {
  player.seated = true
  player.seat = seat
  player.position.x = seat.x
  player.position.y = BENCH.height
  player.position.z = seat.z
  player.velocity.x = 0
  player.velocity.y = 0
  player.velocity.z = 0
  player.grounded = true
  player.facing = Math.atan2(-seat.outX, -seat.outZ) // toward the table
}

export function standUp() {
  const seat = player.seat
  player.seated = false
  player.seat = null
  if (!seat) return
  player.position.x = seat.x + seat.outX * STAND_OUT
  player.position.y = 0
  player.position.z = seat.z + seat.outZ * STAND_OUT
  player.grounded = true
}

// Called each frame by playerMovement while seated.
export function stepSeated() {
  const mv = inputState.move
  if (mv.x !== 0 || mv.z !== 0 || inputState.jump) {
    inputState.jump = false
    standUp()
    return false
  }
  return true
}

registerInteractZone({
  id: 'sit',
  label: () => (!player.seated && player.grounded && nearestSeat(player.position.x, player.position.z) ? 'Sit' : null),
  isNear: () => !player.seated,
  onConfirm: () => {
    const seat = nearestSeat(player.position.x, player.position.z)
    if (seat) sit(seat)
  },
})
