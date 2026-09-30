// The fat body. Two things grow with the size multiplier:
//   - the torso itself, widened and (mostly) deepened into a barrel by scaling
//     the Spine1 bone, so it keeps the player's own shirt;
//   - a waist ring, a flattened low-poly sphere around the hips that the torso
//     sits in.
// Spine2 gets the inverse scale, so the arms, head and back item above it keep
// their own size, and the shoulders are pushed out to the torso's new sides.
// Works on both the bundled player.glb rig and the procedural fallback, since
// both hang the torso off Spine1. Sizes are rig units (RIG_HEIGHT-tall space):
// Spine1 is the hip pivot, the shoulder pivot is 2.4 above it.
import { Mesh, MeshStandardMaterial, SphereGeometry, Vector3 } from 'three'
import { RIG } from '../data/bloxity.js'
import { MATERIAL_PBR } from '../data/materials.js'

const WAIST_COLOR = '#8f93a8'
const TORSO_HALF_W = 1.4 // the rig torso's half width, where the arms start

// Size multiplier (store `bellySize`, synced to other players): 0.7 = the
// starting body, 2.4 = the fattest (data/hud.js bellyForPower).
export const BELLY_SIZE = { def: 1, min: 0.5, max: 3 }

// Jiggle: a damped spring (per character) driven by the spine's world
// acceleration, so the waist wobbles when walking, landing and stopping.
const SPRING_K = 140
const SPRING_C = 7
const JIGGLE_GAIN = 0.06 // rig units of offset per m/s^2
const JIGGLE_MAX = 0.6

let geo = null
const _p = new Vector3()
const _d = new Vector3()

function stepJiggle(root, dt) {
  const spine = root.nodes.Spine1
  const j = (root.jiggle ||= { y: 0, vy: 0, z: 0, vz: 0, prev: new Vector3(), vel: new Vector3(), ready: false })
  spine.getWorldPosition(_p)
  if (!j.ready) {
    j.prev.copy(_p)
    j.ready = true
    return j
  }
  if (dt <= 0) return j
  const vel = _d.copy(_p).sub(j.prev).divideScalar(dt)
  j.prev.copy(_p)
  // Ignore teleports (respawn, snapping to a seat).
  if (vel.lengthSq() > 900) {
    j.vel.set(0, 0, 0)
    return j
  }
  const ax = (vel.x - j.vel.x) / dt
  const ay = (vel.y - j.vel.y) / dt
  const az = (vel.z - j.vel.z) / dt
  j.vel.copy(vel)
  const fwd = root.getWorldDirection(_d)
  const accelFwd = ax * fwd.x + az * fwd.z
  // Inertia: the belly lags behind the body's acceleration.
  const fy = Math.max(-60, Math.min(60, -ay)) * JIGGLE_GAIN
  const fz = Math.max(-60, Math.min(60, -accelFwd)) * JIGGLE_GAIN
  const n = Math.max(1, Math.ceil(dt / 0.008))
  const h = Math.min(dt, 0.1) / n
  for (let i = 0; i < n; i += 1) {
    j.vy += (-SPRING_K * j.y - SPRING_C * j.vy) * h + fy * SPRING_K * h
    j.y += j.vy * h
    j.vz += (-SPRING_K * j.z - SPRING_C * j.vz) * h + fz * SPRING_K * h
    j.z += j.vz * h
  }
  j.y = Math.max(-JIGGLE_MAX, Math.min(JIGGLE_MAX, j.y))
  j.z = Math.max(-JIGGLE_MAX, Math.min(JIGGLE_MAX, j.z))
  return j
}

// Fatness 0..1 for a size multiplier: 0 at the starting size, 1 at the fattest.
const T_FROM = 0.7
const T_SPAN = 1.7
const lerp = (a, b, t) => a + (b - a) * t

// Every dimension for a fatness t. The ring is always wider and deeper than
// the torso's bottom corners, so the torso never pokes through it.
function fit(t) {
  return {
    torsoX: lerp(1, 1.65, t), // torso width scale
    torsoZ: lerp(1, 2.9, t), // torso depth scale: thin slab -> round barrel
    rx: lerp(1.9, 3.5, t), // ring radii
    ry: lerp(0.75, 1.65, t),
    rz: lerp(1.35, 3.5, t),
    cy: lerp(0.1, -0.15, t), // ring centre above the hip pivot
  }
}

// Ease the body toward `target` (at most a step per call), then apply the
// jiggle. The current size lives on root.bellyK so each character (local or
// remote) eases independently.
export function easeBellySize(root, target, dt) {
  const n = root?.nodes
  const m = n?.Waist
  if (!m) return
  const goal = Math.min(BELLY_SIZE.max, Math.max(BELLY_SIZE.min, Number.isFinite(target) ? target : 1))
  const cur = root.bellyK ?? goal
  const k = Math.abs(goal - cur) < 0.002 ? goal : cur + (goal - cur) * (1 - Math.exp(-8 * dt))
  root.bellyK = k
  const t = Math.min(1, Math.max(0, (k - T_FROM) / T_SPAN))
  const { torsoX, torsoZ, rx, ry, rz, cy } = fit(t)

  // Taller as well as fatter: up to +20%. heightBase is the rig's own scale
  // from applyProportions.
  if (root.heightBase) root.scale.y = root.heightBase * (1 + t * 0.2)

  // torsoK is the SDK's own torso width (applyProportions); it still applies
  // to everything above, as before. Only the fat part is undone on Spine2.
  n.Spine1.scale.set((root.torsoK ?? 1) * torsoX, 1, torsoZ)
  if (n.Spine2) n.Spine2.scale.set(1 / torsoX, 1, 1 / torsoZ)
  const armX = RIG.armOffsetX * (root.shoulderK ?? 1) + TORSO_HALF_W * (torsoX - 1)
  if (n.ArmL_Offset) n.ArmL_Offset.position.x = armX
  if (n.ArmR_Offset) n.ArmR_Offset.position.x = -armX

  // The ring is a child of Spine1, so the torso's fat scale is divided out.
  const j = stepJiggle(root, dt)
  const amp = 0.4 + 0.6 * t // a fatter waist wobbles more
  const dy = j.y * amp
  const dz = j.z * amp
  m.scale.set((rx * (1 - dy * 0.06)) / torsoX, ry * (1 + dy * 0.12), (rz * (1 + dz * 0.05)) / torsoZ)
  m.position.set(0, cy + dy, dz / torsoZ)
}

// Idempotent: a root that already has the waist ring is left alone.
export function attachBelly(root) {
  const spine = root?.nodes?.Spine1
  if (!spine || root.nodes.Waist) return root
  geo ||= new SphereGeometry(1, 14, 8)
  const m = new Mesh(geo, material())
  m.name = 'Waist'
  m.castShadow = true
  m.receiveShadow = true
  spine.add(m)
  root.nodes.Waist = m
  const { rx, ry, rz, cy } = fit(0)
  m.scale.set(rx, ry, rz)
  m.position.set(0, cy, 0)
  return root
}

// One shared material: every waist ring is the same flat-shaded grey.
let mat = null
function material() {
  return (mat ||= new MeshStandardMaterial({ ...MATERIAL_PBR.PLAYER, color: WAIST_COLOR, flatShading: true }))
}
