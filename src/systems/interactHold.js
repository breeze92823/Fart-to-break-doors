// Hold-E timer. step() returns true on the frame a continuous hold on the
// same zone reaches HOLD_MS, then resets. Releasing E, leaving the zone, or
// switching zones restarts it.
export const HOLD_MS = 2000

export const interactHoldState = { active: false, progress: 0 }

let zoneKey = null
let heldMs = 0

export function step(dtMs, key, keyDown) {
  if (key == null || !keyDown) {
    zoneKey = key
    heldMs = 0
    interactHoldState.active = false
    interactHoldState.progress = 0
    return false
  }
  if (key !== zoneKey) {
    zoneKey = key
    heldMs = 0
  }
  heldMs += dtMs
  interactHoldState.active = true
  if (heldMs >= HOLD_MS) {
    zoneKey = null
    heldMs = 0
    interactHoldState.active = false
    interactHoldState.progress = 0
    return true
  }
  interactHoldState.progress = heldMs / HOLD_MS
  return false
}
