import { BOUNDS, GROUND_Y, TILE } from '../data/world.js'
import { groundMaterial } from '../materials/groundMaterial.js'

const MARGIN = 40 // ground extends past the walkable bounds so the edge is never seen
const THICKNESS = 4

// The floor: one big tiled slab, top face at GROUND_Y. The texture covers 2x2
// tiles, so it repeats once per 2 * TILE metres.
export default function Ground() {
  const width = BOUNDS.maxX - BOUNDS.minX + MARGIN * 2
  const depth = BOUNDS.maxZ - BOUNDS.minZ + MARGIN * 2
  const material = groundMaterial({ repeat: Math.max(width, depth) / (TILE * 2) })

  return (
    <mesh
      position={[(BOUNDS.minX + BOUNDS.maxX) / 2, GROUND_Y - THICKNESS / 2, (BOUNDS.minZ + BOUNDS.maxZ) / 2]}
      material={material}
      receiveShadow
    >
      <boxGeometry args={[width, THICKNESS, depth]} />
    </mesh>
  )
}
