import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { player } from '../systems/playerState.js'
import { useGameStore } from '../store/useGameStore.js'
import { BENCH, TABLE } from '../data/room.js'
import FoodModel from './FoodModels.jsx'

// The equipped Training Food, resting on the table in front of the seated
// player while they train.
export const SCALE = 0.221 // food models fit a ~2 m box; this makes them ~0.45 m
export const FROM_SEAT = BENCH.offset - TABLE.width * 0.3 // seat point -> food, toward the table centre

// Also used for remote players (components/RemotePlayers.jsx).
export const FOOD_HEIGHT = TABLE.height + SCALE * 1.1

export default function SeatedFood() {
  const ref = useRef()
  const foodId = useGameStore((s) => s.equippedFood)
  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const seat = player.seated ? player.seat : null
    g.visible = !!seat
    if (!seat) return
    g.position.set(seat.x - seat.outX * FROM_SEAT, FOOD_HEIGHT, seat.z - seat.outZ * FROM_SEAT)
    g.rotation.y = clock.elapsedTime * 0.5
  })
  if (!foodId) return null
  return (
    <group ref={ref} visible={false} scale={SCALE}>
      <FoodModel id={foodId} />
    </group>
  )
}
