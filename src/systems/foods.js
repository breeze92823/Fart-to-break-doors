import { player } from './playerState.js'
import { useGameStore } from '../store/useGameStore.js'
import { equippedFartStats } from './farts.js'
import { spawnCashPopup } from './cashPopups.js'
import { BUY_PADS } from '../data/room.js'
import { FOODS, FOOD_BY_ID, TRAIN_INTERVAL } from '../data/foods.js'

// Training Foods: the shop window opens when the player walks up to the
// FOOD-PAD, and the equipped food adds its Fart Power every TRAIN_INTERVAL
// second while the player sits on a training table.
const PAD = BUY_PADS.find((p) => p.id === 'food')
const OPEN_RADIUS = PAD.radius + 0.6

let wasNear = false
let trainTimer = 0

export function buyFood(id) {
  const food = FOOD_BY_ID[id]
  const { cash, ownedFoods } = useGameStore.getState()
  if (!food || ownedFoods.includes(id) || cash < food.price) return
  useGameStore.setState({ cash: cash - food.price, ownedFoods: [...ownedFoods, id], equippedFood: id })
}

export function equipFood(id) {
  if (useGameStore.getState().ownedFoods.includes(id)) useGameStore.setState({ equippedFood: id })
}

// The cheapest food not owned yet, for the pad's "NEXT FOOD" price (null when all are owned).
export function nextFood(ownedFoods) {
  return FOODS.find((f) => !ownedFoods.includes(f.id)) ?? null
}

export function step(dt) {
  const { x, z } = player.position
  // Edge-triggered so closing the window with X keeps it shut until the player leaves and returns.
  const near = Math.hypot(x - PAD.x, z - PAD.z) <= OPEN_RADIUS
  if (near !== wasNear) {
    wasNear = near
    useGameStore.setState({ foodShopOpen: near })
  }

  if (useGameStore.getState().seated !== player.seated) useGameStore.setState({ seated: player.seated })
  if (!player.seated) {
    trainTimer = 0
    return
  }
  trainTimer += dt
  if (trainTimer < TRAIN_INTERVAL) return
  trainTimer -= TRAIN_INTERVAL
  const food = FOOD_BY_ID[useGameStore.getState().equippedFood]
  const gain = food?.gain ?? 0
  if (gain > 0) {
    useGameStore.setState((s) => ({ fartPower: s.fartPower + gain }))
    spawnCashPopup(gain, equippedFartStats().icon)
  }
}
