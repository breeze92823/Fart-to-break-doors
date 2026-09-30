import { CanvasTexture, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from 'three'
import { seededRandom } from '../utils/random.js'

// Procedural tiled-floor material: a 2x2 checker of speckled tiles with dark
// grout lines. One canvas drives both the colour map and a bump map (grout
// and speckle read as relief). The texture covers 2x2 tiles, so callers set
// `repeat` to (worldSize / (2 * tileSize)). Cached so meshes share it.
const SIZE = 512
const cache = new Map()

function paint(colors) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  const bump = document.createElement('canvas')
  bump.width = bump.height = SIZE
  const bctx = bump.getContext('2d')
  bctx.fillStyle = '#ffffff'
  bctx.fillRect(0, 0, SIZE, SIZE)

  const rand = seededRandom(7)
  const half = SIZE / 2
  for (let ty = 0; ty < 2; ty++) {
    for (let tx = 0; tx < 2; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? colors.a : colors.b
      ctx.fillRect(tx * half, ty * half, half, half)
    }
  }
  // Speckle so large areas don't look flat.
  for (let i = 0; i < 2600; i++) {
    const x = rand() * SIZE
    const y = rand() * SIZE
    const r = 0.6 + rand() * 1.6
    const dark = rand() < 0.5
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.08)'
    ctx.fillRect(x, y, r, r)
    bctx.fillStyle = dark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)'
    bctx.fillRect(x, y, r, r)
  }
  // Grout lines on every tile edge (wrapping seamlessly).
  const grout = 6
  ctx.fillStyle = colors.grout
  bctx.fillStyle = '#000000'
  for (const p of [0, half]) {
    ctx.fillRect(p - grout / 2, 0, grout, SIZE)
    ctx.fillRect(0, p - grout / 2, SIZE, grout)
    bctx.fillRect(p - grout / 2, 0, grout, SIZE)
    bctx.fillRect(0, p - grout / 2, SIZE, grout)
  }
  ctx.fillRect(SIZE - grout / 2, 0, grout / 2, SIZE)
  ctx.fillRect(0, SIZE - grout / 2, SIZE, grout / 2)
  bctx.fillRect(SIZE - grout / 2, 0, grout / 2, SIZE)
  bctx.fillRect(0, SIZE - grout / 2, SIZE, grout / 2)

  return { canvas, bump }
}

function texture(canvas, repeat, srgb) {
  const t = new CanvasTexture(canvas)
  t.wrapS = t.wrapT = RepeatWrapping
  t.repeat.set(repeat, repeat)
  t.anisotropy = 8
  if (srgb) t.colorSpace = SRGBColorSpace
  return t
}

export function groundMaterial({ a = '#c9b79c', b = '#bba88b', grout = '#8c7c66', repeat = 30 } = {}) {
  const key = JSON.stringify({ a, b, grout, repeat })
  const cached = cache.get(key)
  if (cached) return cached
  const { canvas, bump } = paint({ a, b, grout })
  const material = new MeshStandardMaterial({
    map: texture(canvas, repeat, true),
    bumpMap: texture(bump, repeat, false),
    bumpScale: 1.2,
    roughness: 0.88,
    metalness: 0,
  })
  cache.set(key, material)
  return material
}
