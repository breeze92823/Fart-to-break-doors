import { BoxGeometry, CylinderGeometry, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry } from 'three'
import { CORRIDOR, DOOR, HALL } from '../data/world.js'
import {
  BENCH,
  CRATES,
  GIRDER_Z,
  LEADERBOARD,
  LEADERBOARDS,
  LOCKER,
  LOCKER_BANKS,
  PILASTER_X,
  SINK,
  TABLE,
  TABLES,
  TRAINING_AREA,
  TRAINING_SIGN,
} from '../data/room.js'
import {
  chevronTexture,
  crateTexture,
  doorPlankTexture,
  hazardTexture,
  leaderboardTexture,
  lightPanelTexture,
  lockerTexture,
  signTexture,
  trainingFloorTexture,
} from '../materials/roomTextures.js'

// The prison-cafeteria hall: steel-blue walls and roof trusses, fluorescent
// panels, air ducts, lockers, cafeteria tables in the training area, and a
// corridor north to the wooden door. Static scenery only — placement comes
// from data/room.js, which also feeds collision.

// Every plain box shares one unit cube, sized via `scale`.
const UNIT = new BoxGeometry(1, 1, 1)
const PIPE = new CylinderGeometry(1, 1, 1, 12)
const PLANE = new PlaneGeometry(1, 1)

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
  const lightX = [-19, -6.5, 6.5, 19]
  const lightZ = GIRDER_Z.map((z) => z + 4).filter((z) => z < HALL.maxZ - 1)
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

      {/* Hanging fluorescent panels */}
      {lightX.flatMap((x) =>
        lightZ.map((z) => (
          <group key={`${x}:${z}`} position={[x, H - 1.5, z]}>
            <Box p={[0, 0.12, 0]} s={[3.6, 0.2, 1.4]} m={m.lampHousing} />
            <mesh geometry={PLANE} material={m.light} position={[0, 0.01, 0]} scale={[3.4, 1.2, 1]} rotation={[Math.PI / 2, 0, 0]} />
            <Box p={[-1.4, 0.8, 0]} s={[0.04, 1.2, 0.04]} m={m.tableLeg} />
            <Box p={[1.4, 0.8, 0]} s={[0.04, 1.2, 0.04]} m={m.tableLeg} />
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
    ...[-26, -10, 6, 22].map((z) => [HALL.minX + 0.3, z, Math.PI / 2]),
    ...[-26, -10, 6, 22].map((z) => [HALL.maxX - 0.3, z, -Math.PI / 2]),
    ...[-13.5, 13.5].map((x) => [x, HALL.maxZ - 0.3, Math.PI]),
    ...[-13.5, 13.5].map((x) => [x, HALL.minZ + 0.3, 0]),
  ]
  const pipes = [
    [HALL.minX + 0.35, -31.5],
    [HALL.minX + 0.35, -3.2],
    [HALL.maxX - 0.35, -31.5],
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

function Tables() {
  const m = materials()
  const { length: L, width: tw, height: th } = TABLE
  return (
    <group>
      {TABLES.map(({ x, z }) => (
        <group key={`${x}:${z}`} position={[x, 0, z]}>
          <Box p={[0, th - 0.05, 0]} s={[L, 0.1, tw]} m={m.tableTop} cast />
          {[-1, 1].map((sx) => (
            <group key={sx}>
              <Box p={[sx * (L / 2 - 0.8), (th - 0.1) / 2, 0]} s={[0.12, th - 0.1, tw - 0.4]} m={m.tableLeg} cast />
              {[-1, 1].map((sz) => (
                <Box
                  key={sz}
                  p={[sx * (L / 2 - 0.6), (BENCH.height - 0.08) / 2, sz * BENCH.offset]}
                  s={[0.1, BENCH.height - 0.08, BENCH.width - 0.1]}
                  m={m.tableLeg}
                />
              ))}
            </group>
          ))}
          {[-1, 1].map((sz) => (
            <Box key={sz} p={[0, BENCH.height - 0.04, sz * BENCH.offset]} s={[L, 0.08, BENCH.width]} m={m.tableTop} cast />
          ))}
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
        <group key={l.title} position={[l.x, 0, l.z]} rotation={[0, Math.PI, 0]}>
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
            material={signMaterial(`title:${l.title}`, signTexture(l.title, { fill: '#e3ecff', fill2: '#9db4e6', stroke: '#1d2944' }))}
            position={[0, lh + 1, 0]}
            scale={[bw + 1.6, (bw + 1.6) * (160 / 1024), 1]}
          />
        </group>
      ))}
    </group>
  )
}

function TrainingArea() {
  const m = materials()
  const a = TRAINING_AREA
  const s = TRAINING_SIGN
  const signMat = signMaterial('training', signTexture('TRAINING AREA'))
  return (
    <group>
      <FloorDecal x={(a.minX + a.maxX) / 2} z={(a.minZ + a.maxZ) / 2} w={a.maxX - a.minX} d={a.maxZ - a.minZ} m={m.trainingFloor} />
      {/* Readable from both sides: one face north toward the door, one south */}
      <mesh geometry={PLANE} material={signMat} position={[s.x, s.y, s.z - 0.02]} scale={[s.width, s.height, 1]} rotation={[0, Math.PI, 0]} />
      <mesh geometry={PLANE} material={signMat} position={[s.x, s.y, s.z + 0.02]} scale={[s.width, s.height, 1]} />
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
      <Sink />
      <Leaderboards />
    </group>
  )
}
