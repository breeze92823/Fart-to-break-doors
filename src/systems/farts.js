import { player } from './playerState.js'
import { useGameStore } from '../store/useGameStore.js'
import { BUY_PADS } from '../data/room.js'
import { FARTS, FART_BY_ID } from '../data/farts.js'

// Fart types: the shop window opens when the player walks up to the FART-PAD.
const PAD = BUY_PADS.find((p) => p.id === 'fart')
const OPEN_RADIUS = PAD.radius + 0.6

let wasNear = false

export function buyFart(id) {
  const fart = FART_BY_ID[id]
  const { cash, ownedFarts } = useGameStore.getState()
  if (!fart || ownedFarts.includes(id) || cash < fart.price) return
  useGameStore.setState({ cash: cash - fart.price, ownedFarts: [...ownedFarts, id], equippedFart: id })
}

export function equipFart(id) {
  if (useGameStore.getState().ownedFarts.includes(id)) useGameStore.setState({ equippedFart: id })
}

// The equipped fart's multipliers (used when a fart hits a door).
export function equippedFartStats() {
  return FART_BY_ID[useGameStore.getState().equippedFart] ?? FARTS[0]
}

// The cheapest fart not owned yet, for the pad's "NEXT FART" price (null when all are owned).
export function nextFart(ownedFarts) {
  return FARTS.find((f) => !ownedFarts.includes(f.id)) ?? null
}

export function step() {
  const { x, z } = player.position
  // Edge-triggered so closing the window with X keeps it shut until the player leaves and returns.
  const near = Math.hypot(x - PAD.x, z - PAD.z) <= OPEN_RADIUS
  if (near !== wasNear) {
    wasNear = near
    useGameStore.setState({ fartShopOpen: near })
  }
}
