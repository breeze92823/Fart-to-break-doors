import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PCFSoftShadowMap, SRGBColorSpace } from 'three'
import { notifyFirstFrame } from './systems/bloxity.js'
import { settings } from './systems/settingsState.js'
import { useSettings } from './systems/bloxityHooks.js'
import GameLoop from './components/GameLoop.jsx'
import Ground from './components/Ground.jsx'
import Room from './components/Room.jsx'
import Lighting from './components/Lighting.jsx'
import Player from './components/Player.jsx'

// Indoors: the hall is fully enclosed, so the clear colour only shows
// through gaps; match it to the walls.
const BACKGROUND = '#aabde2'

// Rendered as the last child inside the Suspense boundary below, so it only
// mounts once every suspending resource in the scene has resolved — the
// right moment to tell the SDK loading is done and gameplay has started.
function LoadingGate() {
  useEffect(() => {
    notifyFirstFrame()
  }, [])
  return null
}

const GRAPHICS_PRESETS = {
  Low: { shadows: false, antialias: false, dpr: [1, 1] },
  Medium: { shadows: true, antialias: false, dpr: [1, 1.5] },
  High: { shadows: true, antialias: true, dpr: [1, 2] },
  Ultra: { shadows: true, antialias: true, dpr: [1, 2] },
}

export default function App() {
  useSettings()
  const preset = GRAPHICS_PRESETS[settings.graphics_quality] ?? GRAPHICS_PRESETS.High

  return (
    <Canvas
      shadows={preset.shadows && { type: PCFSoftShadowMap }}
      dpr={preset.dpr}
      gl={{ antialias: preset.antialias, powerPreference: 'high-performance', outputColorSpace: SRGBColorSpace }}
      camera={{ fov: 60, near: 0.1, far: 600, position: [0, 8, 16] }}
    >
      <color attach="background" args={[BACKGROUND]} />
      <Lighting />

      <GameLoop />
      <Suspense fallback={null}>
        <Ground />
        <Room />
        <LoadingGate />
      </Suspense>
      <Player />
    </Canvas>
  )
}
