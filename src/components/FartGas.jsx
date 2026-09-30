import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Group, Sprite, SpriteMaterial } from 'three'
import { fartSources } from '../systems/fart.js'

const POOL = 90
const EMIT_PER_SEC = 200
const BUTT_HEIGHT = 0.85 // m above the feet
const BUTT_BACK = 0.55 // m behind the player's centre (the belly sticks out the front)

// Soft yellow puff: a radial gradient with a noisy edge.
function makePuffTexture() {
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,214,40,1)')
  g.addColorStop(0.45, 'rgba(255,190,20,0.75)')
  g.addColorStop(1, 'rgba(255,170,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new CanvasTexture(c)
}

// The fart cloud: a pool of billboard puffs shot out of each farter's back
// while systems/fart.js says a fart source (the local player or a remote one) is emitting. Each puff drifts back,
// slows, swells and fades.
export default function FartGas() {
  const { root, puffs, texture } = useMemo(() => {
    const texture = makePuffTexture()
    const root = new Group()
    const puffs = []
    for (let i = 0; i < POOL; i += 1) {
      const sprite = new Sprite(new SpriteMaterial({ map: texture, transparent: true, depthWrite: false, opacity: 0 }))
      sprite.visible = false
      sprite.renderOrder = 10
      root.add(sprite)
      puffs.push({ sprite, vx: 0, vy: 0, vz: 0, age: 0, life: 1, size: 1, grow: 1, alive: false })
    }
    return { root, puffs, texture }
  }, [])

  useEffect(
    () => () => {
      for (const p of puffs) p.sprite.material.dispose()
      texture.dispose()
    },
    [puffs, texture]
  )

  useFrame((_s, delta) => {
    const dt = Math.min(delta, 0.1)

    for (const src of fartSources) {
      if (!src.fart.emitting) {
        src.carry = 0
        continue
      }
      src.carry += EMIT_PER_SEC * dt
      const bx = -Math.sin(src.facing)
      const bz = -Math.cos(src.facing)
      while (src.carry >= 1) {
        src.carry -= 1
        const p = puffs.find((q) => !q.alive)
        if (!p) break
        const speed = 4 + Math.random() * 4
        p.alive = true
        p.age = 0
        p.life = 0.45 + Math.random() * 0.4
        p.size = 0.35 + Math.random() * 0.3
        p.grow = 1.2 + Math.random() * 1
        p.vx = bx * speed + (Math.random() - 0.5) * 0.8
        p.vz = bz * speed + (Math.random() - 0.5) * 0.8
        p.vy = (Math.random() - 0.3) * 0.6
        p.sprite.position.set(
          src.pos.x + bx * BUTT_BACK + (Math.random() - 0.5) * 0.2,
          src.pos.y + BUTT_HEIGHT + (Math.random() - 0.5) * 0.2,
          src.pos.z + bz * BUTT_BACK + (Math.random() - 0.5) * 0.2
        )
        p.sprite.material.rotation = Math.random() * Math.PI * 2
        p.sprite.visible = true
      }
    }

    const drag = Math.exp(-1.5 * dt)
    for (const p of puffs) {
      if (!p.alive) continue
      p.age += dt
      if (p.age >= p.life) {
        p.alive = false
        p.sprite.visible = false
        continue
      }
      const t = p.age / p.life
      p.vx *= drag
      p.vz *= drag
      p.vy = p.vy * drag + 0.25 * dt // gas drifts up as it thins
      p.sprite.position.x += p.vx * dt
      p.sprite.position.y += p.vy * dt
      p.sprite.position.z += p.vz * dt
      const s = p.size * (1 + p.grow * t)
      p.sprite.scale.set(s, s, 1)
      // Quick fade-in, long fade-out.
      p.sprite.material.opacity = Math.min(t * 12, 1) * (1 - t) * (1 - t) * 0.95
    }
  })

  return <primitive object={root} />
}
