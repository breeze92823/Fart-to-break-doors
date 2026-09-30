// The character's big belly and waist: two flattened low-poly spheres (upper
// belly over the ribs, a wider lower belly/waist ring over the hips) parented
// to the Spine1 bone so they lean and bob with the walk cycle. Works on both
// the bundled player.glb rig and the procedural fallback, since both expose
// Spine1 in `root.nodes`. Sizes are rig units (RIG_HEIGHT-tall space): Spine1
// is the hip pivot, the shoulder pivot is 2.4 above it, arms hang at x = ±2.
//
// The belly is coloured from the character's own torso: syncBellyColor()
// averages the torso's patch of the skin texture, so it follows whatever skin
// the player has equipped instead of a fixed colour.
import { Color, Mesh, MeshStandardMaterial, SphereGeometry } from 'three'
import { MATERIAL_PBR } from '../data/materials.js'

// Used until a skin colour can be sampled (procedural character, no texture).
const FALLBACK_COLOR = '#cfe4ff'

// [name, [rx, ry, rz], [x, y, z]] in Spine1 space. Z is forward (+Z, matching
// the arm pivots sitting 0.4 in front of the spine). Centres sit close to the
// spine and radii are large in Z, so the belly wraps the back as well as the
// front instead of leaving the torso showing behind it.
const BELLY_PARTS = [
  ['BellyUpper', [1.75, 1.35, 1.7], [0, 1.3, 0.4]],
  ['BellyLower', [2.05, 1.1, 2.0], [0, 0.1, 0.45]],
]

let geo = null

// Idempotent: a root that already has the belly is left alone. Each character
// gets its own material so one player's skin colour never leaks to another.
export function attachBelly(root) {
  const spine = root?.nodes?.Spine1
  if (!spine || root.nodes.BellyUpper) return root
  geo ||= new SphereGeometry(1, 14, 10)
  const mat = new MeshStandardMaterial({ ...MATERIAL_PBR.PLAYER, color: FALLBACK_COLOR, flatShading: true })
  for (const [name, [rx, ry, rz], [x, y, z]] of BELLY_PARTS) {
    const m = new Mesh(geo, mat)
    m.name = name
    m.scale.set(rx, ry, rz)
    m.position.set(x, y, z)
    m.castShadow = true
    m.receiveShadow = true
    spine.add(m)
    root.nodes[name] = m
  }
  return root
}

// Average colour of the texture region the torso's UVs cover, or null when
// there is no readable texture (procedural rig, tainted or not-yet-loaded image).
function sampleTorsoColor(torso) {
  const map = torso?.material?.map
  const image = map?.image
  const uv = torso?.geometry?.getAttribute('uv')
  if (!image || !uv) return null
  const w = image.width
  const h = image.height
  if (!w || !h) return null

  let u0 = 1
  let v0 = 1
  let u1 = 0
  let v1 = 0
  for (let i = 0; i < uv.count; i += 1) {
    const u = uv.getX(i)
    const v = uv.getY(i)
    if (u < u0) u0 = u
    if (u > u1) u1 = u
    if (v < v0) v0 = v
    if (v > v1) v1 = v
  }
  // glTF UVs have v down from the top of the image, same as canvas y.
  const x = Math.max(0, Math.floor(u0 * w))
  const y = Math.max(0, Math.floor(v0 * h))
  const sw = Math.max(1, Math.min(w - x, Math.ceil((u1 - u0) * w)))
  const sh = Math.max(1, Math.min(h - y, Math.ceil((v1 - v0) * h)))

  try {
    const canvas = document.createElement('canvas')
    canvas.width = sw
    canvas.height = sh
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(image, x, y, sw, sh, 0, 0, sw, sh)
    const data = ctx.getImageData(0, 0, sw, sh).data
    let r = 0
    let g = 0
    let b = 0
    let n = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
      n += 1
    }
    if (!n) return null
    // Pixels are sRGB; Color.setRGB with the sRGB space converts to the
    // renderer's linear working space.
    return new Color().setRGB(r / n / 255, g / n / 255, b / n / 255, 'srgb')
  } catch {
    return null // cross-origin skin without CORS headers
  }
}

// Call after the skin/parts are applied. Leaves the fallback colour when the
// torso colour can't be read.
export function syncBellyColor(root) {
  const belly = root?.nodes?.BellyUpper
  if (!belly) return
  const color = sampleTorsoColor(root.nodes.default_torso)
  if (color) belly.material.color.copy(color)
}
