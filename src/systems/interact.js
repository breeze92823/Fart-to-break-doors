import { isKeyDown } from './input.js'
import { interactHoldState, step as stepHold } from './interactHold.js'
import { playConfirm, setHoldProgress } from './uiSound.js'

// Registry of hold-E zones. The first registered zone that is near and has a
// label wins, so only one prompt shows at a time. See INTERACTION.md.
export const interactState = { label: null }

const zones = new Map()

// Re-registering an id replaces it (HMR-safe). Returns an unregister function.
export function registerInteractZone(zone) {
  zones.set(zone.id, zone)
  return () => {
    if (zones.get(zone.id) === zone) zones.delete(zone.id)
  }
}

// Once per frame from GameLoop.
export function step(dt) {
  let active = null
  let label = null
  for (const z of zones.values()) {
    if (!z.isNear()) continue
    label = typeof z.label === 'function' ? z.label() : z.label
    if (label) {
      active = z
      break
    }
  }
  interactState.label = active ? label : null
  if (stepHold(dt * 1000, active ? active.id : null, isKeyDown('KeyE'))) {
    playConfirm()
    active.onConfirm()
  } else {
    setHoldProgress(interactHoldState.progress)
  }
}
