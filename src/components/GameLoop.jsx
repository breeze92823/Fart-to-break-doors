import { useThree, useFrame } from '@react-three/fiber'
import { step as stepPlayer } from '../systems/playerMovement.js'
import { step as stepInteract } from '../systems/interact.js'
import { step as stepFart } from '../systems/fart.js'
import { step as stepDoors } from '../systems/doors.js'
import { step as stepFoods } from '../systems/foods.js'
import { step as stepFarts } from '../systems/farts.js'
import { step as stepCashPopups } from '../systems/cashPopups.js'
import { reportLocal } from '../systems/net.js'
import { update as updateCamera } from '../systems/cameraOrbit.js'

// The single simulation tick. Rendered before the view components so its
// useFrame subscribes first and runs first each frame.
export default function GameLoop() {
  const camera = useThree((s) => s.camera)
  const scene = useThree((s) => s.scene)
  const gl = useThree((s) => s.gl)
  if (import.meta.env.DEV) {
    window.__scene = scene
    window.__gl = gl
  }

  useFrame((_state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1) // clamp huge frames (tab switch, breakpoint)
    stepPlayer(dt)
    stepInteract(dt)
    stepFart(dt)
    stepDoors(dt)
    stepFoods(dt)
    stepFarts()
    stepCashPopups(dt, camera)
    reportLocal(dt)
    updateCamera(camera, dt)
  })

  return null
}
