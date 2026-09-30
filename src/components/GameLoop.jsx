import { useThree, useFrame } from '@react-three/fiber'
import { step as stepPlayer } from '../systems/playerMovement.js'
import { step as stepInteract } from '../systems/interact.js'
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
    updateCamera(camera, dt)
  })

  return null
}
