import { BOUNDS, GROUND_Y, TILE, WIN_ROOM } from '../data/world.js'
import { groundMaterial } from '../materials/groundMaterial.js'

const MARGIN = 40 // ground extends past the walkable bounds so the edge is never seen
const THICKNESS = 4

// The floor: one big pale-tiled slab, top face at GROUND_Y. The texture covers 2x2
// tiles, so it repeats once per 2 * TILE metres.
export default function Ground() {
  const width = BOUNDS.maxX - BOUNDS.minX + MARGIN * 2
  const minZ = Math.min(BOUNDS.minZ - MARGIN, WIN_ROOM.minZ - 5) // floor runs under the corridor and crown room
  const maxZ = BOUNDS.maxZ + MARGIN
  const depth = maxZ - minZ
  const material = groundMaterial({ a: '#eef3fb', b: '#ebf0f9', grout: '#dde5f1', repeat: Math.max(width, depth) / (TILE * 2) })

  return (
    <mesh
      position={[(BOUNDS.minX + BOUNDS.maxX) / 2, GROUND_Y - THICKNESS / 2, (minZ + maxZ) / 2]}
      material={material}
      receiveShadow
    >
      <boxGeometry args={[width, THICKNESS, depth]} />
    </mesh>
  )
}
