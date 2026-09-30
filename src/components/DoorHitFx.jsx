import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CanvasTexture, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Sprite, SpriteMaterial } from 'three'
import { doorHits } from '../systems/doors.js'
import { DOORS, CORRIDOR, GROUND_Y } from '../data/world.js'
import { formatShort } from '../utils/format.js'

const POOL = 4
const BURST_LIFE = 0.35 // s the central flash lasts
const RING_LIFE = 0.75 // s a shockwave ring takes to expand and fade
const RING_DELAY = 0.12 // s between the two rings
const TEXT_LIFE = 1.1 // s
const CRACK_LIFE = 3 // s the floor cracks last
const HIT_HEIGHT = 2.2 // m above the floor, mid-door
const HIT_OFFSET = 0.9 // m south of the door face, in front of leaves and health tag

const canvasTexture = (w, h, draw) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  return new CanvasTexture(c)
}

// Big white flash: a solid glowing core with a fringe of sharp radial spikes.
function makeBurstTexture() {
  return canvasTexture(512, 512, (ctx, size) => {
    const mid = size / 2
    ctx.translate(mid, mid)
    const spike = (count, inner, minLen, maxLen, wMin, wMax, alpha) => {
      ctx.fillStyle = `rgba(255,255,255,${alpha})`
      for (let i = 0; i < count; i += 1) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.15
        const len = mid * (minLen + Math.random() * (maxLen - minLen))
        const w = wMin + Math.random() * (wMax - wMin)
        ctx.beginPath()
        ctx.moveTo(Math.cos(a - w) * mid * inner, Math.sin(a - w) * mid * inner)
        ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len)
        ctx.lineTo(Math.cos(a + w) * mid * inner, Math.sin(a + w) * mid * inner)
        ctx.fill()
      }
    }
    spike(46, 0.3, 0.55, 1, 0.025, 0.07, 0.55) // dim outer streaks
    spike(30, 0.3, 0.5, 0.85, 0.04, 0.1, 0.9) // bright short spikes
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, mid * 0.62)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.75, 'rgba(255,255,255,1)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, mid * 0.62, 0, Math.PI * 2)
    ctx.fill()
  })
}

// Shockwave ring: a bright thin band with a soft glow either side.
function makeRingTexture() {
  return canvasTexture(512, 512, (ctx, size) => {
    const mid = size / 2
    const g = ctx.createRadialGradient(mid, mid, mid * 0.6, mid, mid, mid)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.55, 'rgba(255,240,200,0.35)')
    g.addColorStop(0.82, 'rgba(255,255,255,1)')
    g.addColorStop(0.9, 'rgba(255,255,255,0.6)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  })
}

// Jagged dark cracks radiating from the centre of the impact.
function makeCracksTexture() {
  return canvasTexture(512, 512, (ctx, size) => {
    const mid = size / 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1a0d08'
    const branch = (x, y, a, len, width, depth) => {
      ctx.lineWidth = width
      ctx.beginPath()
      ctx.moveTo(x, y)
      let px = x
      let py = y
      const steps = 6
      for (let i = 0; i < steps; i += 1) {
        a += (Math.random() - 0.5) * 0.7
        px += Math.cos(a) * (len / steps)
        py += Math.sin(a) * (len / steps)
        ctx.lineTo(px, py)
        if (depth > 0 && Math.random() < 0.3) branch(px, py, a + (Math.random() < 0.5 ? 0.8 : -0.8), len * 0.4, width * 0.6, depth - 1)
      }
      ctx.stroke()
    }
    for (let i = 0; i < 9; i += 1) branch(mid, mid, (i / 9) * Math.PI * 2 + Math.random() * 0.4, mid * (0.6 + Math.random() * 0.35), 7, 2)
  })
}

function drawDamage(canvas, damage) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = '900 96px "Arial Black", Impact, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 16
  ctx.strokeStyle = '#3a1830'
  const text = `-${formatShort(damage)}`
  // Squeeze long values ("-1.08Qa") into the canvas, clear of the outline.
  const maxWidth = canvas.width - 32
  ctx.strokeText(text, canvas.width / 2, canvas.height / 2, maxWidth)
  ctx.fillStyle = '#ff4f8b'
  ctx.fillText(text, canvas.width / 2, canvas.height / 2, maxWidth)
}

const sprite = (map, order, additive = false) => {
  const s = new Sprite(
    new SpriteMaterial({ map, transparent: true, depthTest: true, depthWrite: false, blending: additive ? AdditiveBlending : undefined })
  )
  s.renderOrder = order
  s.visible = false
  return s
}

// Door hit effect: when a fart lands on a door (systems/doors.js queues it in
// `doorHits`), a white flash and expanding shockwave rings burst over the door, the damage floats up and cracks stay on the floor.
export default function DoorHitFx() {
  const { root, fx, textures } = useMemo(() => {
    const textures = {
      burst: makeBurstTexture(),
      ring: makeRingTexture(),
      cracks: makeCracksTexture(),
    }
    const crackGeo = new PlaneGeometry(1, 1)
    crackGeo.rotateX(-Math.PI / 2)
    const root = new Group()
    const fx = []
    for (let i = 0; i < POOL; i += 1) {
      const canvas = document.createElement('canvas')
      canvas.width = 384
      canvas.height = 160
      const textTexture = new CanvasTexture(canvas)
      const cracks = new Mesh(
        crackGeo,
        new MeshBasicMaterial({ map: textures.cracks, transparent: true, depthWrite: false, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })
      )
      cracks.visible = false
      const floorRing = new Mesh(
        crackGeo,
        new MeshBasicMaterial({ map: textures.ring, transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide })
      )
      floorRing.visible = false
      const f = {
        burst: sprite(textures.burst, 20),
        flare: sprite(textures.ring, 19, true),
        flare2: sprite(textures.ring, 19, true),
        floorRing: floorRing,
        text: sprite(textTexture, 23),
        cracks,
        crackGeo,
        canvas,
        textTexture,
        age: Infinity,
        x: 0,
        y: 0,
        z: 0,
      }
      root.add(f.burst, f.flare, f.flare2, f.floorRing, f.text, cracks)
      fx.push(f)
    }
    return { root, fx, textures }
  }, [])

  useEffect(
    () => () => {
      for (const f of fx) {
        for (const s of [f.burst, f.flare, f.flare2, f.text]) s.material.dispose()
        f.floorRing.material.dispose()
        f.cracks.material.dispose()
        f.textTexture.dispose()
      }
      fx[0]?.crackGeo.dispose()
      Object.values(textures).forEach((t) => t.dispose())
    },
    [fx, textures]
  )

  useFrame((_s, delta) => {
    const dt = Math.min(delta, 0.1)
    while (doorHits.length) {
      const hit = doorHits.shift()
      // Reuse a finished slot, else the oldest one.
      const f = fx.reduce((a, b) => (b.age > a.age ? b : a))
      const door = DOORS[hit.door]
      f.age = 0
      f.x = (Math.random() - 0.5) * CORRIDOR.halfWidth * 0.3
      f.y = HIT_HEIGHT
      f.z = door.z + HIT_OFFSET
      f.burst.material.rotation = Math.random() * Math.PI * 2
      f.floorRing.position.set(f.x, GROUND_Y + 0.05, f.z + 1.2)
      f.cracks.rotation.y = Math.random() * Math.PI * 2
      f.cracks.position.set(f.x, GROUND_Y + 0.03, f.z + 1.2)
      f.cracks.scale.set(5, 1, 5)
      drawDamage(f.canvas, hit.damage)
      f.textTexture.needsUpdate = true
    }

    for (const f of fx) {
      if (f.age > CRACK_LIFE) {
        for (const o of [f.burst, f.flare, f.flare2, f.floorRing, f.text, f.cracks]) o.visible = false
        continue
      }
      f.age += dt

      // Central flash: a short white pop.
      const bt = f.age / BURST_LIFE
      f.burst.visible = bt < 1
      if (bt < 1) {
        const s = 3 + 3 * (1 - (1 - bt) * (1 - bt))
        f.burst.scale.set(s, s, 1)
        f.burst.position.set(f.x, f.y, f.z)
        f.burst.material.opacity = 1 - bt * bt
        f.burst.material.rotation += dt * 0.6
      }

      // Shockwave: two glowing rings race outward over the door, and one flat
      // on the floor, each fast at first and slowing as it fades.
      ;[f.flare, f.flare2].forEach((ring, k) => {
        const rt = (f.age - k * RING_DELAY) / RING_LIFE
        ring.visible = rt > 0 && rt < 1
        if (!ring.visible) return
        const e = 1 - (1 - rt) * (1 - rt) * (1 - rt)
        const s = 1 + 11 * e
        ring.scale.set(s, s, 1)
        ring.position.set(f.x, f.y, f.z)
        ring.material.opacity = (1 - rt) * (1 - rt)
      })
      const ft = f.age / RING_LIFE
      f.floorRing.visible = ft < 1
      if (ft < 1) {
        const e = 1 - (1 - ft) * (1 - ft) * (1 - ft)
        const s = 1 + 9 * e
        f.floorRing.scale.set(s, 1, s)
        f.floorRing.material.opacity = (1 - ft) * (1 - ft)
      }

      const tt = Math.min(f.age / TEXT_LIFE, 1)
      f.text.visible = f.age < TEXT_LIFE
      const pop = Math.min(f.age * 10, 1)
      const s = 1.6 * (0.6 + 0.4 * pop)
      f.text.scale.set(s * 2.4, s, 1)
      f.text.position.set(f.x + 1.4, f.y + 0.5 + tt * 1.2, f.z + 0.1)
      f.text.material.opacity = tt < 0.6 ? 1 : 1 - (tt - 0.6) / 0.4

      // Cracks stay put, then fade out.
      const ct = f.age / CRACK_LIFE
      f.cracks.visible = true
      f.cracks.material.opacity = ct < 0.6 ? 1 : 1 - (ct - 0.6) / 0.4
    }
  })

  return <primitive object={root} />
}
