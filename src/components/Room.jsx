import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  AdditiveBlending,
  BoxGeometry,
  CylinderGeometry,
  DoubleSide,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  SpriteMaterial,
} from 'three'
import { CORRIDOR, DOOR, HALL } from '../data/world.js'
import {
  BENCH,
  BUY_PADS,
  DOOR_TAG,
  CRATES,
  EGG_MAT,
  EGG_PEDESTAL,
  EGGS,
  GIRDER_Z,
  LEADERBOARD,
  LEADERBOARDS,
  LOCKER,
  LOCKER_BANKS,
  OFFLINE_SIGN,
  PORTAL,
  PILASTER_X,
  ROUND_TABLE,
  ROUND_TABLES,
  SINK,
  SPIN_PAD,
  TABLE,
  TABLES,
  TRAINING_AREA,
  TRAINING_PIT,
  TRAINING_SIGNS,
} from '../data/room.js'
import {
  chevronTexture,
  crateTexture,
  doorPlankTexture,
  doorTagTexture,
  eggTexture,
  glowCurtainTexture,
  hazardTexture,
  leaderboardTexture,
  lightPanelTexture,
  lockerTexture,
  offlineSignTexture,
  padLabelTexture,
  portalReqTexture,
  portalTitleTexture,
  portalFloorGlowTexture,
  portalGlowTexture,
  priceTagTexture,
  signTexture,
  spinTagTexture,
  trainingFloorTexture,
  trainingPitTexture,
} from '../materials/roomTextures.js'

// The prison-cafeteria hall: steel-blue walls and roof trusses, fluorescent
// panels, air ducts, lockers, cafeteria tables in the training area, and a
// corridor north to the wooden door. Static scenery only — placement comes
// from data/room.js, which also feeds collision.

// Every plain box shares one unit cube, sized via `scale`.
const UNIT = new BoxGeometry(1, 1, 1)
const PIPE = new CylinderGeometry(1, 1, 1, 12)
const PLANE = new PlaneGeometry(1, 1)
const SPHERE = new SphereGeometry(1, 32, 24)
const CAP = new SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)
const DISC = new CylinderGeometry(1, 1, 1, 32)

const W = HALL.maxX - HALL.minX
const D = HALL.maxZ - HALL.minZ
const H = HALL.height
const T = 1 // wall thickness
const HW = CORRIDOR.halfWidth
const CH = CORRIDOR.height

let mats = null
function materials() {
  if (mats) return mats
  const std = (color, extra = {}) => new MeshStandardMaterial({ color, roughness: 0.82, metalness: 0, ...extra })
  const decal = (map, extra = {}) =>
    new MeshBasicMaterial({ map, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, ...extra })
  mats = {
    wall: std('#aabde2'),
    wallLow: std('#8596bd'),
    rail: std('#6e88c2'),
    pilaster: std('#5c7ed0', { roughness: 0.6, metalness: 0.2 }),
    ceiling: std('#8fa6d6'),
    girder: std('#4c6fc6', { roughness: 0.55, metalness: 0.25 }),
    duct: std('#bcd0f0', { roughness: 0.5, metalness: 0.3 }),
    frame: std('#b5cbf0'),
    curb: std('#9cc4f5', { roughness: 0.6 }),
    eggMat: std('#586590', { roughness: 0.9 }),
    pedestalRim: std('#2b3a66', { roughness: 0.4, metalness: 0.3 }),
    pedestalTop: std('#f4f7ff', { roughness: 0.3 }),
    pedestalBand: std('#5fb8ff', { roughness: 0.3, emissive: '#2f7fc8', emissiveIntensity: 0.4 }),
    nestCap: std('#4a3a2a', { roughness: 0.9 }),
    padSnow: std('#f1f6ff', { roughness: 0.35 }),
    roundTable: std('#eef3ff', { roughness: 0.35, metalness: 0.15 }),
    offlineSign: new MeshBasicMaterial({ map: offlineSignTexture(), toneMapped: false }),
    spinFill: new MeshBasicMaterial({ color: '#1f8f1f', transparent: true, opacity: 0.35, toneMapped: false }),
    spinRing: new MeshBasicMaterial({ color: '#3dff3d', toneMapped: false }),
    bread: std('#e88a2c', { roughness: 0.55 }),
    breadCut: std('#ffe3a0', { roughness: 0.5 }),
    gas: new MeshStandardMaterial({ color: '#c39a3c', emissive: '#7a5512', emissiveIntensity: 0.35, roughness: 0.9, transparent: true, opacity: 0.6, depthWrite: false }),
    portalFrame: std('#3b3f5c', { roughness: 0.85 }),
    portalTrim: new MeshBasicMaterial({ color: '#ff5df0', toneMapped: false }),
    portalGlow: new MeshBasicMaterial({ map: portalGlowTexture(), toneMapped: false }),
    portalFloor: new MeshBasicMaterial({ map: portalFloorGlowTexture(), transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false }),
    tableSpot: std('#ffffff', { roughness: 0.4 }),
    picnicTop: std('#98a4dc', { roughness: 0.55, metalness: 0.2 }),
    picnicLeg: std('#6470b0', { roughness: 0.55, metalness: 0.2 }),
    lampHousing: std('#dfe7f4'),
    light: new MeshBasicMaterial({ map: lightPanelTexture(), toneMapped: false }),
    pipe: std('#93b2e6', { roughness: 0.45, metalness: 0.35 }),
    tableTop: std('#c3cfe3', { roughness: 0.45, metalness: 0.35 }),
    tableLeg: std('#6c7c9c', { roughness: 0.5, metalness: 0.4 }),
    crate: std('#ffffff', { map: crateTexture() }),
    doorPlanks: std('#ffffff', { map: doorPlankTexture() }),
    doorWood: std('#6b3d20'),
    doorFrame: std('#4a2a17'),
    sink: std('#f3f6fb', { roughness: 0.3 }),
    chrome: std('#cfd6e2', { roughness: 0.2, metalness: 0.9 }),
    stone: std('#3b465e', { roughness: 0.9 }),
    stoneCap: std('#56627c', { roughness: 0.9 }),
    trainingFloor: decal(trainingFloorTexture(), { transparent: false }),
    trainingPit: decal(trainingPitTexture(), { transparent: false, polygonOffsetFactor: -4, toneMapped: false }),
    glowCurtain: new MeshBasicMaterial({
      map: glowCurtainTexture(),
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      side: DoubleSide,
      toneMapped: false,
    }),
    hazard: decal(hazardTexture(16), { transparent: false }),
    chevrons: decal(chevronTexture(), { toneMapped: false }),
  }
  return mats
}

function Box({ p, s, r, m, cast = false }) {
  return <mesh geometry={UNIT} material={m} position={p} scale={s} rotation={r} castShadow={cast} receiveShadow />
}

// A beam running between two points in the XY plane at depth z.
function Strut({ from, to, z, thick, deep, m }) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  return (
    <Box
      p={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, z]}
      s={[Math.hypot(dx, dy), thick, deep]}
      r={[0, 0, Math.atan2(dy, dx)]}
      m={m}
    />
  )
}

// Flat textured plane lying on the floor.
function FloorDecal({ x, z, w, d, m, y = 0.01 }) {
  return <mesh geometry={PLANE} material={m} position={[x, y, z]} scale={[w, d, 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow />
}

function Walls() {
  const m = materials()
  const cx = (HALL.minX + HALL.maxX) / 2
  const cz = (HALL.minZ + HALL.maxZ) / 2
  const northLeftW = -HW - (HALL.minX - T)
  const northRightW = HALL.maxX + T - HW
  const band = 1.3
  const railY = 7

  return (
    <group>
      {/* Main shell */}
      <Box p={[HALL.minX - T / 2, H / 2, cz]} s={[T, H, D + 2 * T]} m={m.wall} />
      <Box p={[HALL.maxX + T / 2, H / 2, cz]} s={[T, H, D + 2 * T]} m={m.wall} />
      <Box p={[cx, H / 2, HALL.maxZ + T / 2]} s={[W + 2 * T, H, T]} m={m.wall} />
      <Box p={[HALL.minX - T + northLeftW / 2, H / 2, HALL.minZ - T / 2]} s={[northLeftW, H, T]} m={m.wall} />
      <Box p={[HW + northRightW / 2, H / 2, HALL.minZ - T / 2]} s={[northRightW, H, T]} m={m.wall} />
      <Box p={[0, (H + CH) / 2, HALL.minZ - T / 2]} s={[2 * HW, H - CH, T]} m={m.wall} />
      <Box p={[cx, H + 0.25, cz]} s={[W + 2 * T, 0.5, D + 2 * T]} m={m.ceiling} />

      {/* Darker skirting band and a steel rail running round the walls */}
      {[
        { y: band / 2, h: band, mat: m.wallLow },
        { y: railY, h: 0.3, mat: m.rail },
      ].map(({ y, h, mat }) => (
        <group key={y}>
          <Box p={[HALL.minX + 0.06, y, cz]} s={[0.12, h, D]} m={mat} />
          <Box p={[HALL.maxX - 0.06, y, cz]} s={[0.12, h, D]} m={mat} />
          <Box p={[cx, y, HALL.maxZ - 0.06]} s={[W, h, 0.12]} m={mat} />
          <Box p={[(HALL.minX - HW) / 2, y, HALL.minZ + 0.06]} s={[-HW - HALL.minX, h, 0.12]} m={mat} />
          <Box p={[(HALL.maxX + HW) / 2, y, HALL.minZ + 0.06]} s={[HALL.maxX - HW, h, 0.12]} m={mat} />
        </group>
      ))}

      {/* Steel pilasters: under every girder on the long walls, spaced along the short ones */}
      {GIRDER_Z.map((z) => (
        <group key={`pz${z}`}>
          <Box p={[HALL.minX + 0.3, H / 2, z]} s={[0.6, H, 0.9]} m={m.pilaster} />
          <Box p={[HALL.maxX - 0.3, H / 2, z]} s={[0.6, H, 0.9]} m={m.pilaster} />
        </group>
      ))}
      {PILASTER_X.map((x) => (
        <group key={`px${x}`}>
          <Box p={[x, H / 2, HALL.minZ + 0.3]} s={[0.9, H, 0.6]} m={m.pilaster} />
          <Box p={[x, H / 2, HALL.maxZ - 0.3]} s={[0.9, H, 0.6]} m={m.pilaster} />
        </group>
      ))}
    </group>
  )
}

function Roof() {
  const m = materials()
  const cx = (HALL.minX + HALL.maxX) / 2
  const braceRun = 4.5
  const braceLow = H - 4.2
  const lightX = [-19.5, -6.5, 6.5, 19.5]
  // Two rows of strips in every bay between girders.
  const lightZ = GIRDER_Z.flatMap((z) => [z + 2.5, z + 5.5]).filter((z) => z < HALL.maxZ - 1)
  const ductX = [-12.8, 12.8]
  const ductY = H - 2.2

  return (
    <group>
      {/* Girders spanning the hall, with diagonal knee braces down to the pilasters */}
      {GIRDER_Z.map((z) => (
        <group key={z}>
          <Box p={[cx, H - 0.45, z]} s={[W, 0.9, 0.35]} m={m.girder} />
          <Box p={[cx, H - 0.95, z]} s={[W, 0.14, 0.75]} m={m.girder} />
          <Strut from={[HALL.minX + 0.3, braceLow]} to={[HALL.minX + braceRun, H - 0.9]} z={z} thick={0.45} deep={0.4} m={m.girder} />
          <Strut from={[HALL.maxX - 0.3, braceLow]} to={[HALL.maxX - braceRun, H - 0.9]} z={z} thick={0.45} deep={0.4} m={m.girder} />
        </group>
      ))}
      {/* Purlins running north-south between the girders */}
      {[-22, -13, 0, 13, 22].map((x) => (
        <Box key={x} p={[x, H - 0.2, (HALL.minZ + HALL.maxZ) / 2]} s={[0.3, 0.4, D]} m={m.girder} />
      ))}

      {/* Hanging fluorescent tube strips */}
      {lightX.flatMap((x) =>
        lightZ.map((z) => (
          <group key={`${x}:${z}`} position={[x, H - 1.3, z]}>
            <Box p={[0, 0.1, 0]} s={[9, 0.16, 0.7]} m={m.lampHousing} />
            <mesh geometry={PLANE} material={m.light} position={[0, 0.01, 0]} scale={[8.8, 0.55, 1]} rotation={[Math.PI / 2, 0, 0]} />
            <Box p={[-3.6, 0.7, 0]} s={[0.04, 1, 0.04]} m={m.tableLeg} />
            <Box p={[3.6, 0.7, 0]} s={[0.04, 1, 0.04]} m={m.tableLeg} />
          </group>
        )),
      )}

      {/* Air ducts along the hall, joined by a cross duct over the corridor mouth */}
      {ductX.map((x) => (
        <group key={x}>
          <Box p={[x, ductY, (HALL.minZ + 2 + HALL.maxZ) / 2]} s={[2, 1.4, D - 2]} m={m.duct} />
          {Array.from({ length: Math.floor((D - 2) / 4) + 1 }, (_, i) => (
            <Box key={i} p={[x, ductY, HALL.minZ + 2 + i * 4]} s={[2.2, 1.6, 0.18]} m={m.duct} />
          ))}
        </group>
      ))}
      <Box p={[0, ductY, HALL.minZ + 2]} s={[ductX[1] - ductX[0], 1.4, 2]} m={m.duct} />
      {Array.from({ length: 7 }, (_, i) => (
        <Box key={i} p={[ductX[0] + 1 + i * 3.8, ductY, HALL.minZ + 2]} s={[0.18, 1.6, 2.2]} m={m.duct} />
      ))}
    </group>
  )
}

function WallFixtures() {
  const m = materials()
  // [x, z, yaw] for each wall-mounted flood lamp; yaw turns the lamp face into the room.
  const lamps = [
    ...[-6, 6, 22].map((z) => [HALL.minX + 0.3, z, Math.PI / 2]),
    ...[-6, 6, 22].map((z) => [HALL.maxX - 0.3, z, -Math.PI / 2]),
    ...[-13.5, 13.5].map((x) => [x, HALL.maxZ - 0.3, Math.PI]),
    ...[-13.5, 13.5].map((x) => [x, HALL.minZ + 0.3, 0]),
  ]
  const pipes = [
    [HALL.minX + 0.35, -3.2],
    [HALL.maxX - 0.35, -3.2],
    [-5.6, HALL.minZ + 0.35],
    [5.6, HALL.minZ + 0.35],
  ]
  return (
    <group>
      {lamps.map(([x, z, yaw], i) => (
        <group key={i} position={[x, 8.6, z]} rotation={[0, yaw, 0]}>
          <Box p={[0, 0, 0.15]} s={[2.6, 1.1, 0.35]} m={m.lampHousing} />
          <mesh geometry={PLANE} material={m.light} position={[0, 0, 0.34]} scale={[2.3, 0.85, 1]} />
        </group>
      ))}
      {pipes.map(([x, z], i) => (
        <mesh key={i} geometry={PIPE} material={m.pipe} position={[x, H / 2, z]} scale={[0.14, H, 0.14]} />
      ))}
      {/* Horizontal pipe runs high on the long walls */}
      {[HALL.minX + 0.35, HALL.maxX - 0.35].map((x) => (
        <mesh key={x} geometry={PIPE} material={m.pipe} position={[x, 10.2, 0]} scale={[0.16, D, 0.16]} rotation={[Math.PI / 2, 0, 0]} />
      ))}
    </group>
  )
}

function Corridor() {
  const m = materials()
  const len = HALL.minZ - CORRIDOR.endZ
  const midZ = (HALL.minZ + CORRIDOR.endZ) / 2
  const frameZ = []
  for (let z = HALL.minZ - 2.5; z > DOOR.z + 2; z -= 3.5) frameZ.push(z)
  for (let z = DOOR.z - 3.5; z > CORRIDOR.endZ + 1; z -= 3.5) frameZ.push(z)
  const lightZ = frameZ.map((z) => z - 1.75).filter((z) => Math.abs(z - DOOR.z) > 1)

  return (
    <group>
      <Box p={[-HW - T / 2, CH / 2, midZ]} s={[T, CH, len]} m={m.wall} />
      <Box p={[HW + T / 2, CH / 2, midZ]} s={[T, CH, len]} m={m.wall} />
      <Box p={[0, CH + 0.25, midZ]} s={[2 * HW + 2 * T, 0.5, len]} m={m.ceiling} />
      <Box p={[0, CH / 2, CORRIDOR.endZ - T / 2]} s={[2 * HW + 2 * T, CH, T]} m={m.wall} />
      <Box p={[-HW + 0.06, 0.65, midZ]} s={[0.12, 1.3, len]} m={m.wallLow} />
      <Box p={[HW - 0.06, 0.65, midZ]} s={[0.12, 1.3, len]} m={m.wallLow} />

      {/* Chunky portal round the corridor mouth */}
      <Box p={[-HW - 0.7, (CH + 1) / 2, HALL.minZ + 0.7]} s={[1.4, CH + 1, 1.4]} m={m.frame} cast />
      <Box p={[HW + 0.7, (CH + 1) / 2, HALL.minZ + 0.7]} s={[1.4, CH + 1, 1.4]} m={m.frame} cast />
      <Box p={[0, CH + 0.4, HALL.minZ + 0.7]} s={[2 * HW + 2.8, 1.2, 1.4]} m={m.frame} />

      {/* Repeating frames receding down the corridor */}
      {frameZ.map((z) => (
        <group key={z}>
          <Box p={[-HW + 0.3, CH / 2, z]} s={[0.6, CH, 1.1]} m={m.frame} />
          <Box p={[HW - 0.3, CH / 2, z]} s={[0.6, CH, 1.1]} m={m.frame} />
          <Box p={[0, CH - 0.5, z]} s={[2 * HW, 1, 1.1]} m={m.frame} />
        </group>
      ))}
      {lightZ.map((z) => (
        <mesh key={z} geometry={PLANE} material={m.light} position={[0, CH - 0.02, z]} scale={[3, 1, 1]} rotation={[Math.PI / 2, 0, 0]} />
      ))}

      {/* Hazard stripe at the threshold and glowing chevrons leading up to the door */}
      <FloorDecal x={0} z={DOOR.z + 0.45} w={2 * HW} d={0.5} m={m.hazard} y={0.012} />
      <FloorDecal x={0} z={DOOR.z + 4.2} w={5.2} d={6.4} m={m.chevrons} y={0.015} />
    </group>
  )
}

// The breakable door: two plank leaves in a heavy frame, each with rails and
// an X brace. Named so gameplay can find it later.
function Door() {
  const m = materials()
  const h = DOOR.height
  const t = DOOR.thickness
  const leafW = HW - 0.4
  const front = t / 2 + 0.06
  const braceTop = h * 0.66
  const braceBottom = 0.3
  const braceW = leafW - 0.5
  const braceLen = Math.hypot(braceW, braceTop - braceBottom)
  const braceAngle = Math.atan2(braceTop - braceBottom, braceW)

  return (
    <group name="door" position={[0, 0, DOOR.z - t / 2]}>
      <Box p={[-HW + 0.2, (h + 0.4) / 2, 0]} s={[0.4, h + 0.4, t + 0.3]} m={m.doorFrame} cast />
      <Box p={[HW - 0.2, (h + 0.4) / 2, 0]} s={[0.4, h + 0.4, t + 0.3]} m={m.doorFrame} cast />
      <Box p={[0, h + 0.2, 0]} s={[2 * HW, 0.4, t + 0.3]} m={m.doorFrame} cast />
      {[-1, 1].map((side) => (
        <group key={side} name={side < 0 ? 'door-left' : 'door-right'} position={[side * (leafW / 2), 0, 0]}>
          <Box p={[0, h / 2, 0]} s={[leafW - 0.04, h, t]} m={m.doorPlanks} cast />
          {[
            [0.16, 0.32],
            [braceTop, 0.28],
            [h - 0.16, 0.32],
          ].map(([y, rh]) => (
            <Box key={y} p={[0, y, front]} s={[leafW - 0.04, rh, 0.12]} m={m.doorWood} cast />
          ))}
          <Box p={[-leafW / 2 + 0.16, h / 2, front]} s={[0.28, h, 0.12]} m={m.doorWood} />
          <Box p={[leafW / 2 - 0.16, h / 2, front]} s={[0.28, h, 0.12]} m={m.doorWood} />
          <Box p={[0, (braceTop + braceBottom) / 2, front + 0.02]} s={[braceLen, 0.26, 0.1]} r={[0, 0, braceAngle]} m={m.doorWood} />
          <Box p={[0, (braceTop + braceBottom) / 2, front + 0.02]} s={[braceLen, 0.26, 0.1]} r={[0, 0, -braceAngle]} m={m.doorWood} />
        </group>
      ))}
    </group>
  )
}

// A picnic-style bench (the Strut helper, but in the ZY plane).
function ZStrut({ from, to, x, thick, deep, m }) {
  const dz = to[0] - from[0]
  const dy = to[1] - from[1]
  return (
    <Box
      p={[x, (from[1] + to[1]) / 2, (from[0] + to[0]) / 2]}
      s={[deep, thick, Math.hypot(dz, dy)]}
      r={[-Math.atan2(dy, dz), 0, 0]}
      m={m}
      cast
    />
  )
}

// Picnic tables: top and both benches carried by a pair of crossed A-frame
// legs at each end, tied together by a crossbar at bench height.
const eggMats = new Map()
function eggMaterial(kind) {
  if (!eggMats.has(kind)) {
    const glow = { gold: ['#ffe9a0', 0.25], galaxy: ['#4a35b8', 0.55] }[kind]
    const map = eggTexture(kind)
    eggMats.set(
      kind,
      new MeshStandardMaterial({
        map,
        roughness: kind === 'nest' ? 0.85 : 0.35,
        metalness: 0,
        emissive: glow?.[0] ?? '#000000',
        emissiveMap: glow ? map : null,
        emissiveIntensity: glow?.[1] ?? 0,
      }),
    )
  }
  return eggMats.get(kind)
}

const tagMats = new Map()
function tagMaterial(text, gems) {
  const key = `${text}:${gems}`
  if (!tagMats.has(key)) tagMats.set(key, new SpriteMaterial({ map: priceTagTexture(text, gems), transparent: true, toneMapped: false }))
  return tagMats.get(key)
}

// Egg shop: a dark mat with a lit pedestal per tier, an egg on each, and a
// price sprite that always faces the camera. Static for now.
function Eggs() {
  const m = materials()
  const { radius, height } = EGG_PEDESTAL
  return (
    <group>
      <Box
        p={[(EGG_MAT.minX + EGG_MAT.maxX) / 2, 0.012, (EGG_MAT.minZ + EGG_MAT.maxZ) / 2]}
        s={[EGG_MAT.maxX - EGG_MAT.minX, 0.024, EGG_MAT.maxZ - EGG_MAT.minZ]}
        m={m.eggMat}
      />
      {EGGS.map((e) => {
        const big = e.size > 1
        const pr = radius * (big ? 1.35 : 1)
        const er = 0.5 * e.size // egg half-width
        const eh = er * 1.28 // egg half-height
        const eggY = height + 0.04 + eh
        const tagW = big ? 3.4 : 2.6
        return (
          <group key={e.z} position={[e.x, 0, e.z]}>
            <mesh geometry={DISC} material={m.pedestalRim} position={[0, height * 0.3, 0]} scale={[pr, height * 0.6, pr]} castShadow receiveShadow />
            <mesh geometry={DISC} material={m.pedestalBand} position={[0, height * 0.62, 0]} scale={[pr * 0.98, height * 0.1, pr * 0.98]} />
            <mesh geometry={DISC} material={m.pedestalTop} position={[0, height * 0.85, 0]} scale={[pr * 0.92, height * 0.3, pr * 0.92]} receiveShadow />
            <mesh geometry={SPHERE} material={eggMaterial(e.kind)} position={[0, eggY, 0]} scale={[er, eh, er]} castShadow />
            {e.kind === 'nest' && <mesh geometry={CAP} material={m.nestCap} position={[0, eggY + eh * 0.55, 0]} scale={[er * 1.08, eh * 0.55, er * 1.08]} castShadow />}
            <sprite material={tagMaterial(e.price, !!e.gems)} position={[0, eggY + eh + 0.75, 0]} scale={[tagW, tagW * (160 / 512), 1]} />
          </group>
        )
      })}
    </group>
  )
}

const spriteMats = new Map()
function spriteMaterial(key, texture) {
  if (!spriteMats.has(key)) spriteMats.set(key, new SpriteMaterial({ map: texture, transparent: true, toneMapped: false }))
  return spriteMats.get(key)
}

// The thing a BUY pad sells, hovering over it: a bread loaf for food, a
// brown gas puff for farts. Bobs and turns slowly.
function FloatingItem({ item, y }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = clock.elapsedTime
    g.position.y = y + Math.sin(t * 1.6) * 0.1
    g.rotation.y = t * 0.5
  })
  const m = materials()
  return (
    <group ref={ref} position={[0, y, 0]}>
      {item === 'food' ? (
        <group>
          <mesh geometry={SPHERE} material={m.bread} scale={[1.5, 0.62, 0.8]} castShadow />
          {[-0.7, 0, 0.7].map((x) => (
            <mesh key={x} geometry={SPHERE} material={m.breadCut} position={[x, 0.5, 0]} scale={[0.32, 0.07, 0.1]} rotation={[0, 0, x * -0.4]} />
          ))}
        </group>
      ) : (
        <group>
          {[
            [0, 0, 0, 0.75],
            [0.6, -0.1, 0.2, 0.55],
            [-0.6, -0.05, -0.1, 0.6],
            [0.15, 0.4, -0.2, 0.5],
            [-0.2, 0.35, 0.3, 0.45],
          ].map(([x, yy, z, r], i) => (
            <mesh key={i} geometry={SPHERE} material={m.gas} position={[x, yy, z]} scale={r} />
          ))}
        </group>
      )}
    </group>
  )
}

function DoorTag() {
  const t = DOOR_TAG
  return (
    <sprite
      material={spriteMaterial(`doorTag:${t.level}:${t.hp}:${t.max}`, doorTagTexture(t.level, t.hp, t.max))}
      position={[0, t.y, DOOR.z + 1.4]}
      scale={[3.2, 1, 1]}
    />
  )
}

// East-side shop corner: BUY pad with the next Fart's price, the FREE spin
// pad, and the offline-cash signpost. Display only for now.
function ShopCorner() {
  const m = materials()
  const spin = SPIN_PAD
  const sign = OFFLINE_SIGN
  return (
    <group>
      {/* BUY pads: low white platform, the item floating above, price on top */}
      {BUY_PADS.map((pad) => (
        <group key={pad.id} position={[pad.x, 0, pad.z]}>
          <mesh geometry={DISC} material={m.padSnow} position={[0, 0.07, 0]} scale={[pad.radius, 0.14, pad.radius]} receiveShadow />
          <mesh geometry={DISC} material={m.pedestalBand} position={[0, 0.03, 0]} scale={[pad.radius * 1.04, 0.06, pad.radius * 1.04]} />
          <FloatingItem item={pad.item} y={2.3} />
          <sprite material={spriteMaterial('buy', signTexture('BUY', { fill: '#8dff45', fill2: '#25b800', stroke: '#0b3d00', width: 512, height: 256 }))} position={[0, 0.95, 0]} scale={[2.6, 1.3, 1]} />
          <sprite material={spriteMaterial(`pad:${pad.label}:${pad.price}`, padLabelTexture(pad.label, pad.price))} position={[0, 3.9, 0]} scale={[2.9, 1.45, 1]} />
        </group>
      ))}

      {/* Spin pad: glowing green ring with the floating wheel above */}
      <group position={[spin.x, 0, spin.z]}>
        <mesh geometry={DISC} material={m.spinFill} position={[0, 0.02, 0]} scale={[spin.radius, 0.04, spin.radius]} />
        <mesh material={m.spinRing} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[spin.radius * 0.82, spin.radius, 48]} />
        </mesh>
        <sprite material={spriteMaterial(`spin:${spin.reward}`, spinTagTexture(spin.reward))} position={[0, 2.5, 0]} scale={[2.4, 3.6, 1]} />
      </group>

      {/* Offline-cash signpost */}
      <group position={[sign.x, 0, sign.z]} rotation={[0, sign.facing, 0]}>
        <Box p={[0, 0.9, -0.05]} s={[0.22, 1.8, 0.22]} m={m.doorWood} cast />
        <Box p={[0, 1.7, 0]} s={[2.6, 1.3, 0.14]} r={[0, 0, -0.06]} m={m.doorWood} cast />
        <mesh geometry={PLANE} material={m.offlineSign} position={[0, 1.7, 0.08]} scale={[2.45, 1.2, 1]} rotation={[0, 0, -0.06]} />
      </group>
    </group>
  )
}

// White round cafe tables with a couple of stools each.
function RoundTables() {
  const m = materials()
  const { radius, height } = ROUND_TABLE
  return (
    <group>
      {ROUND_TABLES.map((t) => (
        <group key={t.z} position={[t.x, 0, t.z]}>
          <mesh geometry={DISC} material={m.roundTable} position={[0, 0.03, 0]} scale={[0.5, 0.06, 0.5]} castShadow />
          <mesh geometry={PIPE} material={m.roundTable} position={[0, height / 2, 0]} scale={[0.07, height, 0.07]} />
          <mesh geometry={DISC} material={m.roundTable} position={[0, height - 0.04, 0]} scale={[radius, 0.08, radius]} castShadow receiveShadow />
          {[-1, 1].map((s) => (
            <group key={s} position={[-1.35, 0, s * 0.9]}>
              <mesh geometry={PIPE} material={m.roundTable} position={[0, 0.25, 0]} scale={[0.05, 0.5, 0.05]} />
              <mesh geometry={DISC} material={m.roundTable} position={[0, 0.03, 0]} scale={[0.26, 0.05, 0.26]} />
              <mesh geometry={DISC} material={m.roundTable} position={[0, 0.5, 0]} scale={[0.3, 0.06, 0.3]} castShadow />
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}

// The portal (local +x is its front): a dark stone doorway on the south wall filled with a pink glow,
// a light pool on the floor, a magenta title and its two requirement rows.
function Portal() {
  const m = materials()
  const { x, z, facing, width: w, height: h, depth: d, post, requires } = PORTAL
  return (
    <group position={[x, 0, z]} rotation={[0, facing - Math.PI / 2, 0]}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Box p={[0, (h + 0.6) / 2, s * (w / 2 + post / 2)]} s={[d, h + 0.6, post]} m={m.portalFrame} cast />
          <Box p={[d * 0.1, h / 2, s * (w / 2 - 0.04)]} s={[0.1, h, 0.08]} m={m.portalTrim} />
        </group>
      ))}
      <Box p={[0, h + 0.3, 0]} s={[d, 0.6, w + 2 * post]} m={m.portalFrame} cast />
      <Box p={[d * 0.1, h - 0.04, 0]} s={[0.1, 0.08, w]} m={m.portalTrim} />
      <mesh geometry={PLANE} material={m.portalGlow} position={[-d / 2 + 0.06, h / 2, 0]} scale={[w, h, 1]} rotation={[0, Math.PI / 2, 0]} />
      <mesh geometry={PLANE} material={m.portalFloor} position={[1.7, 0.03, 0]} scale={[4.2, w + 2, 1]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} />
      <pointLight color="#ff4df0" intensity={14} distance={9} position={[1, 1.8, 0]} />
      <sprite material={spriteMaterial('portalTitle', portalTitleTexture())} position={[0.2, h + 1.5, 0]} scale={[3.6, 1.125, 1]} />
      <sprite material={spriteMaterial(`portalReq:${requires.rebirths}:${requires.power}`, portalReqTexture(requires.rebirths, requires.power))} position={[0.9, 1.5, 0]} scale={[1.6, 1.2, 1]} />
    </group>
  )
}

function Tables() {
  const m = materials()
  const { length: L, width: tw, height: th } = TABLE
  const reach = BENCH.offset + BENCH.width / 2 // how far the feet splay out
  return (
    <group>
      {TABLES.map(({ x, z, rot }) => (
        <group key={`${x}:${z}`} position={[x, 0, z]} rotation={[0, rot, 0]}>
          <Box p={[0, th - 0.05, 0]} s={[L, 0.1, tw]} m={m.picnicTop} cast />
          {[-1.6, 1.6].map((ox) => (
            <mesh key={ox} geometry={DISC} material={m.tableSpot} position={[ox, th + 0.006, 0]} scale={[0.38, 0.012, 0.27]} />
          ))}
          {[-1, 1].map((sz) => (
            <Box key={sz} p={[0, BENCH.height - 0.04, sz * BENCH.offset]} s={[L, 0.08, BENCH.width]} m={m.picnicTop} cast />
          ))}
          {[-1, 1].map((sx) => {
            const lx = sx * (L / 2 - 0.9)
            return (
              <group key={sx}>
                <ZStrut from={[-0.25, th - 0.1]} to={[reach, 0]} x={lx} thick={0.12} deep={0.14} m={m.picnicLeg} />
                <ZStrut from={[0.25, th - 0.1]} to={[-reach, 0]} x={lx} thick={0.12} deep={0.14} m={m.picnicLeg} />
                <Box p={[lx, BENCH.height - 0.14, 0]} s={[0.14, 0.1, 2 * reach]} m={m.picnicLeg} />
              </group>
            )
          })}
        </group>
      ))}
    </group>
  )
}

function Lockers() {
  return (
    <group>
      {LOCKER_BANKS.map((b, i) => {
        const w = b.count * LOCKER.width
        return (
          <group key={i} position={[b.x, 0, b.z]} rotation={[0, b.facing, 0]}>
            <mesh
              geometry={UNIT}
              material={lockerMaterial(b.count)}
              position={[0, LOCKER.height / 2, 0]}
              scale={[w, LOCKER.height, LOCKER.depth]}
              castShadow
              receiveShadow
            />
            <Box p={[0, LOCKER.height + 0.05, 0.02]} s={[w + 0.1, 0.1, LOCKER.depth + 0.08]} m={materials().tableLeg} />
            <Box p={[0, 0.06, 0.02]} s={[w, 0.12, LOCKER.depth + 0.04]} m={materials().tableLeg} />
          </group>
        )
      })}
    </group>
  )
}

const lockerMats = new Map()
function lockerMaterial(count) {
  if (!lockerMats.has(count)) {
    lockerMats.set(count, new MeshStandardMaterial({ map: lockerTexture(count), roughness: 0.5, metalness: 0.35 }))
  }
  return lockerMats.get(count)
}

function Crates() {
  const m = materials()
  return (
    <group>
      {CRATES.map((c, i) => (
        <Box key={i} p={[c.x, c.size / 2 + c.level * c.size, c.z]} s={[c.size, c.size, c.size]} r={[0, c.rot, 0]} m={m.crate} cast />
      ))}
    </group>
  )
}

function Sink() {
  const m = materials()
  return (
    <group position={[SINK.x, 0, SINK.z]}>
      <Box p={[-0.3, 0.4, 0]} s={[0.08, 0.8, 0.08]} m={m.chrome} />
      <Box p={[0.3, 0.4, 0]} s={[0.08, 0.8, 0.08]} m={m.chrome} />
      <Box p={[0, 0.88, 0.02]} s={[0.9, 0.18, 0.62]} m={m.sink} cast />
      <Box p={[0, 0.975, 0.04]} s={[0.66, 0.02, 0.42]} m={m.chrome} />
      <Box p={[0, 1.2, -0.26]} s={[0.9, 0.45, 0.08]} m={m.sink} />
      <mesh geometry={PIPE} material={m.chrome} position={[0, 1.12, -0.12]} scale={[0.03, 0.3, 0.03]} />
      <Box p={[0, 1.26, -0.04]} s={[0.05, 0.05, 0.2]} m={m.chrome} />
    </group>
  )
}

const signMats = new Map()
function signMaterial(key, texture) {
  if (!signMats.has(key)) {
    signMats.set(key, new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false }))
  }
  return signMats.get(key)
}

function Leaderboards() {
  const m = materials()
  const { width: bw, pillar: p, height: lh } = LEADERBOARD
  return (
    <group>
      {LEADERBOARDS.map((l) => (
        <group key={l.title} position={[l.x, 0, l.z]} rotation={[0, l.facing, 0]}>
          {[-1, 1].map((s) => (
            <group key={s}>
              <Box p={[s * (bw / 2 + p / 2), lh / 2, 0]} s={[p, lh, p]} m={m.stone} cast />
              <Box p={[s * (bw / 2 + p / 2), lh + 0.15, 0]} s={[p + 0.25, 0.3, p + 0.25]} m={m.stoneCap} cast />
              <Box p={[s * (bw / 2 + p / 2), 0.15, 0]} s={[p + 0.25, 0.3, p + 0.25]} m={m.stoneCap} />
            </group>
          ))}
          <Box p={[0, lh * 0.55, -0.05]} s={[bw, lh * 0.8, 0.3]} m={m.stone} />
          <mesh
            geometry={PLANE}
            material={signMaterial(`board:${l.header}`, leaderboardTexture(l.header))}
            position={[0, lh * 0.55, 0.11]}
            scale={[bw - 0.2, lh * 0.8 - 0.2, 1]}
          />
          <mesh
            geometry={PLANE}
            material={signMaterial(`title:${l.title}`, signTexture(l.title, { fill: '#8fd0ff', fill2: '#2f7fe0', stroke: '#0d2350' }))}
            position={[0, lh + 1.2, 0]}
            scale={[bw + 3, (bw + 3) * (160 / 1024), 1]}
          />
        </group>
      ))}
    </group>
  )
}

function TrainingArea() {
  const m = materials()
  const a = TRAINING_AREA
  const cx = (a.minX + a.maxX) / 2
  const cz = (a.minZ + a.maxZ) / 2
  const w = a.maxX - a.minX
  const d = a.maxZ - a.minZ
  const pit = TRAINING_PIT
  const curtainH = 1.3
  const strip = 0.45 // light-blue raised strip bordering the zone
  const stripH = 0.06
  const signMat = signMaterial('training', signTexture('TRAINING AREA'))
  return (
    <group>
      <FloorDecal x={cx} z={cz} w={w} d={d} m={m.trainingFloor} />
      <FloorDecal
        x={(pit.minX + pit.maxX) / 2}
        z={(pit.minZ + pit.maxZ) / 2}
        w={pit.maxX - pit.minX}
        d={pit.maxZ - pit.minZ}
        m={m.trainingPit}
        y={0.02}
      />
      {/* Light curtains rising from the pit edges */}
      {[pit.minZ, pit.maxZ].map((z) => (
        <mesh key={z} geometry={PLANE} material={m.glowCurtain} position={[(pit.minX + pit.maxX) / 2, curtainH / 2, z]} scale={[pit.maxX - pit.minX, curtainH, 1]} />
      ))}
      {[pit.minX, pit.maxX].map((x) => (
        <mesh key={x} geometry={PLANE} material={m.glowCurtain} position={[x, curtainH / 2, (pit.minZ + pit.maxZ) / 2]} scale={[pit.maxZ - pit.minZ, curtainH, 1]} rotation={[0, Math.PI / 2, 0]} />
      ))}
      <Box p={[cx, stripH / 2, a.minZ - strip / 2]} s={[w + 2 * strip, stripH, strip]} m={m.curb} />
      <Box p={[cx, stripH / 2, a.maxZ + strip / 2]} s={[w + 2 * strip, stripH, strip]} m={m.curb} />
      <Box p={[a.minX - strip / 2, stripH / 2, cz]} s={[strip, stripH, d]} m={m.curb} />
      <Box p={[a.maxX + strip / 2, stripH / 2, cz]} s={[strip, stripH, d]} m={m.curb} />
      {/* Readable from both sides: one face north toward the door, one south */}
      {TRAINING_SIGNS.map((sg) => (
        <group key={sg.x}>
          <mesh geometry={PLANE} material={signMat} position={[sg.x, sg.y, sg.z - 0.02]} scale={[sg.width, sg.height, 1]} rotation={[0, Math.PI, 0]} />
          <mesh geometry={PLANE} material={signMat} position={[sg.x, sg.y, sg.z + 0.02]} scale={[sg.width, sg.height, 1]} />
        </group>
      ))}
    </group>
  )
}

export default function Room() {
  return (
    <group name="room">
      <Walls />
      <Roof />
      <WallFixtures />
      <Corridor />
      <Door />
      <TrainingArea />
      <Tables />
      <Lockers />
      <Crates />
      <Eggs />
      <ShopCorner />
      <DoorTag />
      <Portal />
      <RoundTables />
      <Sink />
      <Leaderboards />
    </group>
  )
}
