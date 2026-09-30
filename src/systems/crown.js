import { player } from './playerState.js'
import { useGameStore } from '../store/useGameStore.js'
import { CROWN } from '../data/room.js'

// Walking up to the crown on its pedestal (past the last door) collects it:
// the HUD crown count goes up by one. The pedestal is solid, so this is a
// horizontal reach a little wider than the pedestal. The crown comes back
// when the doors reset (systems/doors.js resetDoors clears `crownTaken`).
const REACH = CROWN.pedestalRadius + player.dims.radius + 0.9

export function step() {
  const { crownTaken } = useGameStore.getState()
  if (crownTaken) return
  if (Math.hypot(player.position.x - CROWN.x, player.position.z - CROWN.z) > REACH) return
  useGameStore.setState((s) => ({ crowns: s.crowns + 1, crownTaken: true }))
}
