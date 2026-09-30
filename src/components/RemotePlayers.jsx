import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Quaternion, Vector3 } from 'three'
import { subscribeRoster } from '../systems/net.js'
import { applyProportions, attachEquippedAccessories } from '../systems/avatarLoader.js'
import { loadBaseCharacter } from '../systems/defaultCharacter.js'
import { easeBellySize } from '../systems/belly.js'
import { makeGait, updateGait, disposeGait } from '../systems/avatarAnim.js'
import { FART, fartSources, makeFartState, stepFartState } from '../systems/fart.js'
import { makeEatingLoop, volumeAt } from '../systems/eatingSound.js'
import { playFartAt } from '../systems/fartSound.js'
import Nametag from './Nametag.jsx'
import FoodModel from './FoodModels.jsx'
import { SCALE as FOOD_SCALE, FROM_SEAT, FOOD_HEIGHT } from './SeatedFood.jsx'

const _up = new Vector3(0, 1, 0)
const _targetQuat = new Quaternion()
const _targetPos = new Vector3()
// Same easing shape as components/Player.jsx's TURN_RATE, applied to position
// too: systems/net.js only relays a sample every MOVE_SEND_INTERVAL_MS, so this
// smooths the gap instead of a remote character snapping on every packet.
const LERP_RATE = 0.0008
const FART_TURN_RATE = 0.00001 // same snappy spin as Player.jsx's fart turn
const SIT_DROP = 0.6 // same as Player.jsx

function parseAvatar(raw) {
  if (typeof raw !== 'string' || !raw) return null
  try {
    const v = JSON.parse(raw)
    return v && typeof v === 'object' ? v : null
  } catch {
    return null
  }
}

// One other connected session. Rebuilds the same character components/Player.jsx
// builds for the local player — base rig with its big belly and waist, plus the
// sender's equipped Bloxity accessories and proportions — whenever their
// `avatar` payload changes. Position/yaw/gait/pose are read straight off `p`
// each frame (the synced schema instance is patched in place), and each bump of
// `p.fartSeq` replays the hunch pose and gas cloud from systems/fart.js.
function RemotePlayer({ p }) {
  const ref = useRef()
  const gaitRef = useRef(null)
  const foodRef = useRef()
  const [foodId, setFoodId] = useState(p.equippedFood)
  const posRef = useRef(null)
  const [avatar, setAvatar] = useState(null)
  const [avatarRaw, setAvatarRaw] = useState(p.avatar)

  // This player's own fart timeline and gas emitter. `pos` is the smoothed
  // feet position and `facing` the yaw the server reports; both are mutated in
  // place because FartGas reads them by reference.
  const fartRef = useRef(null)
  if (!fartRef.current) {
    fartRef.current = {
      fart: makeFartState(),
      pos: { x: p.x, y: p.y, z: p.z },
      facing: p.yaw,
      carry: 0,
      seenSeq: p.fartSeq, // a fart from before we mounted isn't replayed
    }
  }

  // Their chewing while seated, quieter the further they are from us.
  const eatingRef = useRef(null)
  if (!eatingRef.current) eatingRef.current = makeEatingLoop()
  useEffect(() => {
    const eating = eatingRef.current
    return () => eating.dispose()
  }, [])

  useEffect(() => {
    const src = fartRef.current
    fartSources.add(src)
    return () => {
      fartSources.delete(src)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function build() {
      const parsed = parseAvatar(avatarRaw) || {}
      const group = await loadBaseCharacter()
      await attachEquippedAccessories(group, parsed.equipped || null, { signal: controller.signal })
      if (cancelled) return
      applyProportions(group, parsed.proportions || null)
      setAvatar(group)
    }
    build()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [avatarRaw])

  // Rebuilt per loaded avatar — the gait's cached bind-pose quaternions belong
  // to one specific rig instance.
  useEffect(() => {
    gaitRef.current = null
    if (!avatar) return
    gaitRef.current = makeGait({ root: avatar, nodes: avatar.nodes || {}, clips: avatar.animations || [] })
    return () => {
      disposeGait(gaitRef.current)
      gaitRef.current = null
    }
  }, [avatar])

  useFrame((_state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1)
    // A human-speed change (new equip) only needs a per-frame compare.
    if (p.avatar !== avatarRaw) setAvatarRaw(p.avatar)
    if (p.equippedFood !== foodId) setFoodId(p.equippedFood)

    const g = ref.current
    if (!g) return
    const src = fartRef.current
    const f = src.fart

    if (p.fartSeq !== src.seenSeq) {
      if (p.fartSeq > src.seenSeq && !p.seated) {
        f.time = 0
        playFartAt(p.x, p.z)
      }
      src.seenSeq = p.fartSeq
    }
    stepFartState(f, delta, p.seated)

    if (!posRef.current) posRef.current = new Vector3(p.x, p.y, p.z)
    const k = 1 - Math.pow(LERP_RATE, delta)
    posRef.current.lerp(_targetPos.set(p.x, p.y, p.z), k)
    src.pos.x = posRef.current.x
    src.pos.y = posRef.current.y
    src.pos.z = posRef.current.z
    src.facing = p.yaw
    g.position.set(posRef.current.x, posRef.current.y - (p.seated ? SIT_DROP : 0), posRef.current.z)

    _targetQuat.setFromAxisAngle(_up, p.yaw)
    const fastTurn = f.time < FART.holdTime + 0.5 // the spin and its turn back
    g.quaternion.slerp(_targetQuat, 1 - Math.pow(fastTurn ? FART_TURN_RATE : LERP_RATE, delta))

    easeBellySize(avatar, p.bellySize, delta)
    // Their food turns on the table while they train. They face the table, so
    // it sits FROM_SEAT ahead of the seat point (mirrors SeatedFood.jsx).
    const food = foodRef.current
    if (food) {
      food.visible = p.seated
      if (p.seated) {
        food.position.set(p.x + Math.sin(p.yaw) * FROM_SEAT, FOOD_HEIGHT, p.z + Math.cos(p.yaw) * FROM_SEAT)
        food.rotation.y = _state.clock.elapsedTime * 0.5
      }
    }
    eatingRef.current.set(p.seated, volumeAt(src.pos.x, src.pos.z))

    const gait = gaitRef.current
    if (gait) updateGait(gait, delta, p.moveBlend, p.grounded, p.seated, f.pose)
  })

  return (
    <>
      <group ref={ref}>
        {avatar && <primitive object={avatar} />}
        <Nametag getName={() => p.username} />
      </group>
      {foodId && (
        <group ref={foodRef} visible={false} scale={FOOD_SCALE}>
          <FoodModel id={foodId} />
        </group>
      )}
    </>
  )
}

// Mounts one RemotePlayer per other connected session (systems/net.js's
// subscribeRoster()) — everyone in the shared room except ourselves.
export default function RemotePlayers() {
  const [ids, setIds] = useState(() => [])
  const playersRef = useRef(new Map())

  useEffect(() => {
    return subscribeRoster(
      (sessionId, p) => {
        playersRef.current.set(sessionId, p)
        setIds(Array.from(playersRef.current.keys()))
      },
      (sessionId) => {
        playersRef.current.delete(sessionId)
        setIds(Array.from(playersRef.current.keys()))
      },
    )
  }, [])

  return (
    <>
      {ids.map((id) => {
        const p = playersRef.current.get(id)
        return p ? <RemotePlayer key={id} p={p} /> : null
      })}
    </>
  )
}
