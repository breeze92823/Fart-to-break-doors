import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { player } from '../systems/playerState.js'

// Overhead key light offset from its target; the shadow frustum only covers
// SHADOW_EXTENT around the player, so the light rig follows them rather than
// trying to shadow the whole hall at once. The ceiling and roof steel don't
// cast shadows, so this reads as the fluorescent panels lighting the floor.
const SUN_OFFSET = [8, 40, 12]
const SHADOW_EXTENT = 40

// Bright, cool indoor light: a strong hemisphere fill (so walls read evenly)
// plus one shadow-casting overhead key.
export default function Lighting() {
  const sun = useRef()

  useFrame(() => {
    const light = sun.current
    if (!light) return
    const { x, z } = player.position
    light.position.set(x + SUN_OFFSET[0], SUN_OFFSET[1], z + SUN_OFFSET[2])
    light.target.position.set(x, 0, z)
    light.target.updateMatrixWorld()
  })

  return (
    <>
      <hemisphereLight args={['#f4f8ff', '#8f9ec0', 1.25]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        ref={sun}
        color="#ffffff"
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-SHADOW_EXTENT}
        shadow-camera-right={SHADOW_EXTENT}
        shadow-camera-top={SHADOW_EXTENT}
        shadow-camera-bottom={-SHADOW_EXTENT}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
      />
    </>
  )
}
