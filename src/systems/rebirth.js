import { useGameStore } from '../store/useGameStore.js'
import { rebirthCost, rebirthMult } from '../data/rebirth.js'

// Rebirth: spend the Fart Power built up so far for a permanent +1x on Cash
// and training gain. Fart Power resets; Cash, foods and farts are kept.
const START_POWER = Number(import.meta.env.VITE_START_FART_POWER) || 20

export const currentMult = () => rebirthMult(useGameStore.getState().rebirths)

export function canRebirth() {
  const { fartPower, rebirths } = useGameStore.getState()
  return fartPower >= rebirthCost(rebirths)
}

export function doRebirth() {
  if (!canRebirth()) return
  useGameStore.setState((s) => ({ rebirths: s.rebirths + 1, fartPower: START_POWER }))
}
