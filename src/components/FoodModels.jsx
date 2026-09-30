import {
  BoxGeometry,
  CapsuleGeometry,
  CylinderGeometry,
  DoubleSide,
  LatheGeometry,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector2,
} from 'three'

// Detailed procedural models for the Training Foods, shown floating over the
// FOOD-PAD. Each fits roughly a 2 m wide, 2 m tall box centred on the origin,
// so any of them can swap into the same spot. Keep ids in step with data/foods.js.
const SPHERE = new SphereGeometry(1, 24, 16)
const CYL = new CylinderGeometry(1, 1, 1, 28)
const BOX = new BoxGeometry(1, 1, 1)
const CAPSULE = new CapsuleGeometry(1, 1, 8, 20)
const TORUS = new TorusGeometry(1, 0.4, 20, 44)
const DOME = new SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4)
const WEDGE = new CylinderGeometry(1, 1, 0.74, 3)
const CARTON = new CylinderGeometry(0.85, 0.6, 1, 4, 1)
const GLASS = new CylinderGeometry(0.6, 0.42, 1.7, 28, 1, true)
const SHAKE = new CylinderGeometry(0.56, 0.4, 1.35, 28)
const CORE = new LatheGeometry(
  [
    [0, -0.78], [0.2, -0.74], [0.3, -0.55], [0.22, -0.25], [0.19, 0], [0.23, 0.25], [0.31, 0.55], [0.2, 0.74], [0, 0.78],
  ].map(([x, y]) => new Vector2(x, y)),
  20,
)

const cache = new Map()
function mat(color, extra = {}) {
  const key = color + JSON.stringify(extra)
  if (!cache.has(key)) cache.set(key, new MeshStandardMaterial({ color, roughness: 0.55, ...extra }))
  return cache.get(key)
}
const glassMat = () => mat('#dff4ff', { transparent: true, opacity: 0.3, roughness: 0.1, side: DoubleSide, depthWrite: false })

function Apple() {
  return (
    <group scale={1.1}>
      <mesh geometry={CORE} material={mat('#f6efd2')} castShadow />
      {/* eaten flesh ring, then the two red caps of skin */}
      {[1, -1].map((s) => (
        <group key={s}>
          <mesh geometry={CYL} material={mat('#fff4c8')} position={[0, 0.31 * s, 0]} scale={[0.8, 0.03, 0.8]} />
          <mesh geometry={DOME} material={mat('#d81f26', { roughness: 0.3 })} position={[0, 0.08 * s, 0]} rotation={[s < 0 ? Math.PI : 0, 0, 0]} scale={[0.86, 0.72, 0.86]} castShadow />
        </group>
      ))}
      {[0.07, -0.07].map((x, i) => (
        <mesh key={i} geometry={SPHERE} material={mat('#3a1f0e')} position={[x, 0.1 * (i ? -1 : 1), 0.2]} scale={[0.05, 0.09, 0.03]} />
      ))}
      <mesh geometry={CYL} material={mat('#5a3a1a')} position={[0.03, 0.9, 0]} rotation={[0, 0, 0.2]} scale={[0.04, 0.3, 0.04]} />
      <mesh geometry={SPHERE} material={mat('#3fae3a')} position={[0.28, 0.92, 0]} rotation={[0, 0, 0.5]} scale={[0.3, 0.06, 0.15]} />
    </group>
  )
}

function Cheese() {
  const holes = [[0.15, 0.36, 0.25, 0.13], [-0.3, 0.36, -0.15, 0.1], [0.3, 0.36, -0.2, 0.08], [-0.05, 0.36, -0.4, 0.07]]
  return (
    <group rotation={[0.15, 0.4, 0]} scale={1.1}>
      <mesh geometry={WEDGE} material={mat('#ffc927', { roughness: 0.4 })} scale={[1.25, 1, 1.3]} castShadow />
      {holes.map(([x, y, z, r], i) => (
        <mesh key={i} geometry={SPHERE} material={mat('#d99500')} position={[x, y, z]} scale={[r, 0.03, r]} />
      ))}
      {/* holes along the flat back face */}
      {[[-0.4, 0.05, 0.11], [0.35, -0.15, 0.08], [0.05, 0.2, 0.09]].map(([x, y, r], i) => (
        <mesh key={i} geometry={SPHERE} material={mat('#d99500')} position={[x, y, -0.65]} scale={[r, r, 0.03]} />
      ))}
      <mesh geometry={BOX} material={mat('#f0a800')} position={[0, 0, -0.65]} scale={[2.2, 0.74, 0.02]} />
    </group>
  )
}

function Bread() {
  return (
    <group rotation={[0.2, 0, 0]} scale={0.95}>
      <mesh geometry={CAPSULE} material={mat('#c2762a', { roughness: 0.7 })} position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.55, 0.9, 0.7]} castShadow />
      {[-0.7, -0.35, 0, 0.3].map((x) => (
        <mesh key={x} geometry={SPHERE} material={mat('#e7b063')} position={[x, 0.5, 0]} rotation={[0, 0, -0.5]} scale={[0.07, 0.03, 0.4]} />
      ))}
      {/* two cut slices leaning against the end of the loaf */}
      {[0, 1].map((i) => (
        <group key={i} position={[0.78 + i * 0.3, -0.02, 0.05 * i]} rotation={[0, 0.15 * i, i ? -0.15 : 0]}>
          <mesh geometry={CYL} material={mat('#b3661f')} rotation={[0, 0, Math.PI / 2]} scale={[0.6, 0.11, 0.5]} castShadow />
          <mesh geometry={CYL} material={mat('#fbe6b0', { roughness: 0.9 })} position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.5, 0.06, 0.41]} />
        </group>
      ))}
    </group>
  )
}

const FRIES = [
  [-0.5, 0.25, 0.1, 0.1], [-0.3, 0.32, -0.15, -0.05], [-0.1, 0.4, 0.15, 0.08], [0.15, 0.3, -0.05, -0.1], [0.4, 0.28, 0.12, 0.12],
  [0.55, 0.2, -0.1, 0.02], [-0.6, 0.15, -0.2, -0.12], [0, 0.52, -0.1, 0.05], [0.25, 0.5, 0.08, -0.08], [-0.3, 0.55, 0.05, 0.1],
  [0.1, 0.25, 0.22, 0.15], [-0.15, 0.2, -0.28, -0.1],
]
function Fries() {
  return (
    <group scale={1.1}>
      {FRIES.map(([x, h, z, tilt], i) => (
        <mesh key={i} geometry={BOX} material={mat(i % 3 ? '#ffd23f' : '#f2b81f')} position={[x, -0.1 + h + 0.35, z]} rotation={[tilt, i, -tilt * 1.4]} scale={[0.13, 1.1 + (i % 4) * 0.15, 0.13]} castShadow />
      ))}
      <mesh geometry={CARTON} material={mat('#e2231a', { roughness: 0.5 })} position={[0, -0.55, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.95, 0.7]} castShadow />
      <mesh geometry={BOX} material={mat('#ffd23f')} position={[0, -0.6, 0.55]} scale={[0.75, 0.42, 0.03]} />
      <mesh geometry={BOX} material={mat('#e2231a')} position={[-0.18, -0.6, 0.575]} rotation={[0, 0, 0.2]} scale={[0.06, 0.32, 0.02]} />
      <mesh geometry={BOX} material={mat('#e2231a')} position={[0.18, -0.6, 0.575]} rotation={[0, 0, -0.2]} scale={[0.06, 0.32, 0.02]} />
    </group>
  )
}

function Cookies() {
  const chips = [[0.3, 0.1], [-0.35, 0.2], [0.1, -0.4], [-0.2, -0.25], [0.45, -0.25], [-0.05, 0.45], [0.05, 0.05]]
  return (
    <group scale={1.15}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[i === 1 ? 0.1 : 0, -0.4 + i * 0.32, i === 2 ? -0.05 : 0]} rotation={[0, i * 1.1, 0]}>
          <mesh geometry={CYL} material={mat('#d59b55', { roughness: 0.85 })} scale={[0.95 - i * 0.05, 0.28, 0.95 - i * 0.05]} castShadow />
          <mesh geometry={CYL} material={mat('#c07f3a', { roughness: 0.9 })} position={[0, 0.02, 0]} scale={[0.75, 0.29, 0.75]} />
          {chips.map(([x, z], j) => (
            <mesh key={j} geometry={SPHERE} material={mat('#3b1e0e')} position={[x * (0.9 - i * 0.05), 0.14, z * (0.9 - i * 0.05)]} rotation={[0, j, 0]} scale={[0.13, 0.07, 0.11]} />
          ))}
        </group>
      ))}
    </group>
  )
}

function MilkShake() {
  return (
    <group scale={1.05}>
      <mesh geometry={SHAKE} material={mat('#ff8fc4', { roughness: 0.35 })} position={[0, -0.12, 0]} />
      <mesh geometry={GLASS} material={glassMat()} position={[0, 0, 0]} />
      <mesh geometry={CYL} material={mat('#e8f4ff', { roughness: 0.2 })} position={[0, -0.88, 0]} scale={[0.46, 0.06, 0.46]} />
      {/* whipped cream swirl */}
      {[0.62, 0.45, 0.3].map((r, i) => (
        <mesh key={i} geometry={SPHERE} material={mat('#fffaf0', { roughness: 0.8 })} position={[0, 0.6 + i * 0.18, 0]} scale={[r * 0.95, 0.16, r * 0.95]} castShadow />
      ))}
      <mesh geometry={SPHERE} material={mat('#c81429', { roughness: 0.2 })} position={[0, 1.15, 0]} scale={0.14} />
      {/* striped straw */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} geometry={CYL} material={mat(i % 2 ? '#ffffff' : '#e53535')} position={[0.22 + i * 0.05, 0.6 + i * 0.36, 0]} rotation={[0, 0, -0.16]} scale={[0.06, 0.36, 0.06]} />
      ))}
    </group>
  )
}

const SPRINKLES = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2
  const rr = 1 + Math.sin(i * 12.9) * 0.18
  return [Math.cos(a) * rr, Math.sin(a) * rr, i * 1.7, ['#ffffff', '#ffe14d', '#4dd2ff', '#7dff6a', '#ff5252'][i % 5]]
})
function Donuts() {
  return (
    <group rotation={[-1.1, 0.3, 0]} scale={0.95}>
      <mesh geometry={TORUS} material={mat('#dea04e', { roughness: 0.8 })} scale={[1, 1, 0.95]} castShadow />
      <mesh geometry={TORUS} material={mat('#ff6db3', { roughness: 0.25 })} position={[0, 0, 0.14]} scale={[1.02, 1.02, 0.62]} />
      {SPRINKLES.map(([x, y, rot, c], i) => (
        <mesh key={i} geometry={CAPSULE} material={mat(c, { roughness: 0.4 })} position={[x, y, 0.45]} rotation={[Math.PI / 2, 0, rot]} scale={[0.03, 0.05, 0.03]} />
      ))}
    </group>
  )
}

function HotDog() {
  const mustard = Array.from({ length: 11 }, (_, i) => [-0.9 + i * 0.18, 0.4 + (i % 2) * 0.03, (i % 2 ? 1 : -1) * 0.07])
  return (
    <group rotation={[0.35, 0.3, 0]} scale={0.95}>
      {/* two bun halves with a soft inside */}
      <mesh geometry={CAPSULE} material={mat('#e4a04a', { roughness: 0.75 })} position={[0, -0.05, -0.32]} rotation={[0, 0, Math.PI / 2]} scale={[0.45, 0.85, 0.5]} castShadow />
      <mesh geometry={CAPSULE} material={mat('#e4a04a', { roughness: 0.75 })} position={[0, -0.05, 0.32]} rotation={[0, 0, Math.PI / 2]} scale={[0.45, 0.85, 0.5]} castShadow />
      <mesh geometry={BOX} material={mat('#fbe0a2', { roughness: 0.9 })} position={[0, 0.02, 0]} scale={[1.9, 0.3, 0.5]} />
      {/* sausage sticks out both ends */}
      <mesh geometry={CAPSULE} material={mat('#b8391f', { roughness: 0.35 })} position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.3, 1.05, 0.3]} castShadow />
      {mustard.map(([x, y, z], i) => (
        <mesh key={i} geometry={SPHERE} material={mat('#ffd400', { roughness: 0.3 })} position={[x, y + 0.22, z]} scale={[0.1, 0.06, 0.07]} />
      ))}
    </group>
  )
}

const MODELS = { apple: Apple, cheese: Cheese, bread: Bread, fries: Fries, cookies: Cookies, milkshake: MilkShake, donuts: Donuts, hotdog: HotDog }

export default function FoodModel({ id }) {
  const Model = MODELS[id] ?? HotDog
  return <Model />
}
