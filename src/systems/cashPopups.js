// Cash-gain popups (ported from Stone-Skipping's skill-gain popups): a small
// mutable pool, stepped once per frame from GameLoop. doors.js calls
// spawnCashPopup(amount) when a door breaks; step() projects the player to the
// screen and ages the live popups. ui/CashPopups.jsx draws the pool and flies
// each one into the Cash icon in the HUD's top-left.
import * as THREE from 'three'
import { player } from './playerState.js'

export const CASH_POPUP = {
  poolSize: 8,
  lifetime: 1.1, // s, spawn to gone
  fadeIn: 0.09, // s
  popT: 0.24, // fraction of lifetime spent on the spring-in
  popScaleFrom: 0.25,
  popOvershoot: 2.4,
  hop: 0.05, // NDC
  fadeOutStart: 0.9, // fraction of lifetime the icon starts fading, near the HUD icon
  anchorHeight: 1.3, // m above the player's feet
  spreadX: 0.16, // NDC scatter at spawn
  spreadY: 0.12,
}

export const cashPopupPool = Array.from({ length: CASH_POPUP.poolSize }, () => ({
  alive: false,
  age: 0,
  amount: 0,
  emoji: null,
  ndcX: 0,
  ndcY: 0,
  seq: 0,
}))

let nextSlot = 0
let spawnSeq = 0
const playerNdc = { x: 0, y: 0 }
const anchor = new THREE.Vector3()

// `emoji` swaps the Cash icon for that glyph and sends the popup to the Fart
// Power bar instead (used by food training).
export function spawnCashPopup(amount, emoji = null) {
  if (!(amount > 0)) return
  const slot = cashPopupPool[nextSlot]
  nextSlot = (nextSlot + 1) % CASH_POPUP.poolSize
  slot.alive = true
  slot.age = 0
  slot.amount = amount
  slot.emoji = emoji
  slot.ndcX = playerNdc.x + (Math.random() * 2 - 1) * CASH_POPUP.spreadX
  slot.ndcY = playerNdc.y + (Math.random() * 2 - 1) * CASH_POPUP.spreadY
  slot.seq = ++spawnSeq
}

export function step(dt, camera) {
  if (camera) {
    anchor.set(player.position.x, player.position.y + CASH_POPUP.anchorHeight, player.position.z)
    anchor.project(camera)
    // anchor.z > 1 = behind the camera; fall back to screen centre.
    playerNdc.x = anchor.z <= 1 ? anchor.x : 0
    playerNdc.y = anchor.z <= 1 ? anchor.y : 0
  }
  for (const slot of cashPopupPool) {
    if (!slot.alive) continue
    slot.age += dt
    if (slot.age >= CASH_POPUP.lifetime) slot.alive = false
  }
}
