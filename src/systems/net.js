// Multiplayer presence. Framework-free (no React import) — the ONLY module
// that talks to the Colyseus server (../Fart-to-break-doors-backend's
// LobbyRoom). Like systems/bloxity.js, every path through here is built so a
// slow, asleep or absent server leaves the game fully playable solo: nothing
// blocks gameplay and the scene never waits on a socket.
//
// Relays: position/yaw/gait/pose (`move`), each fart (`fart`), the avatar
// (`setAvatar`) and live stats; exposes the remote roster that
// components/RemotePlayers.jsx renders. Durable save/load is not wired yet
// (nothing earns progress — see PROGRESSION.md).
import {
  authState,
  subscribeAuth,
  getStableUserId,
  getDisplayName,
  getEquippedAvatar,
  getProportions,
  onAvatarChanged,
  onProportionsChanged,
} from './bloxity.js'
import { DEV_MODE } from '../data/bloxity.js'
import { useGameStore } from '../store/useGameStore.js'
import { player } from './playerState.js'
import { fart } from './fart.js'
import {
  SERVER_URL,
  ROOM_NAME,
  JOIN_TIMEOUT_MS,
  RETRY_BACKOFF_MS,
  STATS_RESEND_DEBOUNCE_MS,
  MOVE_SEND_INTERVAL_MS,
  USERNAME_WAIT_MS,
} from '../data/net.js'

// --- Public state -----------------------------------------------------------
//   'idle'       — not started / torn down / no server configured
//   'connecting' — a join attempt is in flight
//   'solo'       — between retry attempts; playing single-player right now
//   'online'     — attached to a room
export const netState = { status: 'idle', playerCount: 0, error: null }

const listeners = new Set()

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function emit() {
  for (const fn of listeners) {
    try {
      fn(netState)
    } catch {
      // A broken subscriber must not wedge the netcode.
    }
  }
}

function setStatus(status) {
  netState.status = status
  emit()
}

// --- Remote players ---------------------------------------------------------
// sessionId -> the OTHER player's live PlayerState schema instance. Colyseus
// patches its fields in place, so a consumer reads e.g. `p.x` every frame with
// no callback; only add/remove needs one (a component must mount/unmount).
const remotePlayers = new Map()
const rosterListeners = new Set()

function notifyRoster(kind, sessionId, p) {
  for (const l of rosterListeners) {
    try {
      l[kind](sessionId, p)
    } catch {
      // A broken subscriber must not wedge the netcode.
    }
  }
}

// Replays the current roster immediately, so a component mounting after we're
// already online doesn't miss whoever is already here.
export function subscribeRoster(onAdd, onRemove) {
  const entry = { onAdd, onRemove }
  rosterListeners.add(entry)
  for (const [sessionId, p] of remotePlayers) onAdd(sessionId, p)
  return () => rosterListeners.delete(entry)
}

// --- Leaderboards -----------------------------------------------------------
// Server push: { rebirths|fartPower|...: [{ id, name, value }] }, best first.
// `id` equals our sessionId on our own row, so a board can highlight it.
let lastLeaderboard = null
const leaderboardListeners = new Set()

function emitLeaderboard() {
  for (const fn of leaderboardListeners) {
    try {
      fn(lastLeaderboard || {}, selfId)
    } catch {
      // A broken subscriber must not wedge the netcode.
    }
  }
}

// Replays the latest payload immediately if one has already arrived.
export function subscribeLeaderboard(fn) {
  leaderboardListeners.add(fn)
  if (lastLeaderboard) fn(lastLeaderboard, selfId)
  return () => leaderboardListeners.delete(fn)
}

// --- Connection state -------------------------------------------------------
let sdkModule = null
let client = null
let room = null
let selfId = ''
let started = false
let stopped = true
let connecting = false
let attempt = 0
let retryTimer = 0

async function loadSdk() {
  if (!sdkModule) sdkModule = await import('@colyseus/sdk')
  return sdkModule
}

function send(type, payload) {
  if (!room) return
  try {
    room.send(type, payload)
  } catch {
    // Socket mid-close — the next attach re-seeds everything anyway.
  }
}

// --- Stats ------------------------------------------------------------------
function sendStatsNow() {
  const s = useGameStore.getState()
  send('stats', { fartPower: s.fartPower, rebirths: s.rebirths, bellySize: s.bellySize })
}

let statsTimer = 0
let lastSnap = ''

// useGameStore.subscribe fires on ANY change, so filter to the fields we send.
function onStoreChange(s) {
  const snap = `${s.fartPower}|${s.rebirths}|${s.bellySize}`
  if (snap === lastSnap) return
  lastSnap = snap
  if (statsTimer) return
  statsTimer = setTimeout(() => {
    statsTimer = 0
    sendStatsNow()
  }, STATS_RESEND_DEBOUNCE_MS)
}

// --- Avatar + position + fart relay -----------------------------------------
// Same recipe components/Player.jsx renders the LOCAL player from: the game's
// base character (big belly included) dressed with the signed-in player's
// equipped Bloxity hat/back accessory and SDK proportions. Sent as an opaque
// JSON string (the server never parses it), so components/RemotePlayers.jsx
// can rebuild an identical-looking character for every other session.
function avatarPayload() {
  return {
    equipped: authState.user && !DEV_MODE ? getEquippedAvatar() : null,
    proportions: getProportions(),
  }
}

let lastSentAvatar = ''

function sendAvatarNow() {
  if (!room) return
  const payload = JSON.stringify(avatarPayload())
  if (payload === lastSentAvatar) return
  lastSentAvatar = payload
  send('setAvatar', { avatar: payload })
}

// Local position/facing/gait/pose, throttled out over `move`, plus one `fart`
// per local fart. Called every frame from components/GameLoop.jsx. A no-op
// while offline.
let moveAccumMs = 0
let lastSentMove = null
let sentFartSeq = 0
const MOVE_EPS = 0.01

export function reportLocal(delta) {
  if (!room) return
  // Not throttled: the fart is a discrete event.
  if (fart.seq !== sentFartSeq) {
    sentFartSeq = fart.seq
    send('fart', {})
    // Flush the move carrying the 180 turn along with it, so the remote's gas
    // doesn't leave from the wrong side while the next throttled send waits.
    moveAccumMs = MOVE_SEND_INTERVAL_MS
  }

  moveAccumMs += delta * 1000
  if (moveAccumMs < MOVE_SEND_INTERVAL_MS) return
  moveAccumMs = 0

  const moveBlend = Math.min(1, Math.hypot(player.velocity.x, player.velocity.z) / player.moveSpeed)
  const next = {
    x: player.position.x,
    y: player.position.y,
    z: player.position.z,
    yaw: player.facing,
    moveBlend,
    grounded: player.grounded,
    seated: player.seated,
  }
  const last = lastSentMove
  if (
    last &&
    Math.abs(next.x - last.x) < MOVE_EPS &&
    Math.abs(next.y - last.y) < MOVE_EPS &&
    Math.abs(next.z - last.z) < MOVE_EPS &&
    Math.abs(next.yaw - last.yaw) < MOVE_EPS &&
    Math.abs(next.moveBlend - last.moveBlend) < MOVE_EPS &&
    next.grounded === last.grounded &&
    next.seated === last.seated
  ) {
    return
  }
  lastSentMove = next
  send('move', next)
}

// --- Identity sync (login/logout mid-session) -------------------------------
// Join options only carry what was true the instant the socket opened; Bloxity
// auth routinely settles later or changes without a reload.
let lastIdentity = { userId: '', username: '' }

function sendIdentityNow() {
  if (!room) return
  const userId = getStableUserId()
  const username = getDisplayName()
  if (userId === lastIdentity.userId && username === lastIdentity.username) return
  lastIdentity = { userId, username }
  send('identify', { userId, username })
  // Signing in/out flips avatarPayload()'s equipped gate.
  sendAvatarNow()
}

function waitForAuth(ms) {
  if (authState.ready) return Promise.resolve()
  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      clearTimeout(t)
      off()
      resolve()
    }
    const off = subscribeAuth((s) => {
      if (s.ready) finish()
    })
    const t = setTimeout(finish, ms)
  })
}

function withTimeout(promise, ms, label) {
  let t
  const timeout = new Promise((_, reject) => {
    t = setTimeout(() => reject(new Error(label)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t))
}

// --- Connect / attach / retry ---------------------------------------------
async function connect() {
  if (stopped || connecting || room) return
  connecting = true
  clearTimeout(retryTimer)
  retryTimer = 0
  setStatus('connecting')

  try {
    const mod = await loadSdk()
    if (stopped) return
    if (!client) client = new mod.Client(SERVER_URL)

    const joined = await withTimeout(
      client.joinOrCreate(ROOM_NAME, {
        username: getDisplayName(),
        userId: getStableUserId(), // '' for a guest
        // Seeds the server's PlayerState.avatar so others render us correctly
        // from the very first frame.
        avatar: JSON.stringify(avatarPayload()),
      }),
      JOIN_TIMEOUT_MS,
      'join timed out',
    )

    if (stopped) {
      try {
        joined.leave()
      } catch {
        /* nothing to clean up */
      }
      return
    }
    attachRoom(joined)
  } catch (err) {
    connecting = false
    attempt += 1
    netState.error = String((err && err.message) || err)
    if (!stopped) scheduleRetry()
  }
}

function scheduleRetry() {
  if (stopped || room || retryTimer) return
  setStatus('solo')
  const i = Math.min(Math.max(attempt - 1, 0), RETRY_BACKOFF_MS.length - 1)
  retryTimer = setTimeout(() => {
    retryTimer = 0
    connect()
  }, RETRY_BACKOFF_MS[i])
}

function recount() {
  const n = room && room.state && room.state.players ? room.state.players.size : 0
  if (n !== netState.playerCount) {
    netState.playerCount = n
    emit()
  }
}

function attachRoom(joined) {
  room = joined
  connecting = false
  attempt = 0
  selfId = joined.sessionId
  netState.error = null

  room.onLeave(() => handleLeave())
  room.onError((code, message) => {
    netState.error = message || `error ${code}`
  })
  // Server pushes we don't consume yet; registering silences the SDK warning.
  room.onMessage('progress', () => {})
  room.onMessage('noProgress', () => {})
  room.onMessage('leaderboard', (data) => {
    lastLeaderboard = data || {}
    emitLeaderboard()
  })

  // Called unconditionally: room.state can still be an empty shell right
  // after joinOrCreate() resolves, and getStateCallbacks() defers registration
  // until the `players` map arrives.
  const $ = sdkModule.getStateCallbacks(room)
  $(room.state).players.onAdd((p, sessionId) => {
    recount()
    if (sessionId === selfId) return
    remotePlayers.set(sessionId, p)
    notifyRoster('onAdd', sessionId, p)
  })
  $(room.state).players.onRemove((_p, sessionId) => {
    recount()
    if (sessionId === selfId) return
    remotePlayers.delete(sessionId)
    notifyRoster('onRemove', sessionId)
  })

  // A fresh session starts every server field at its default, so re-state ours
  // right away instead of waiting for the next change.
  sendStatsNow()
  lastSentAvatar = ''
  sendAvatarNow()
  lastSentMove = null
  moveAccumMs = MOVE_SEND_INTERVAL_MS // send on the very next reportLocal()
  sentFartSeq = fart.seq // a fart from before we were online isn't replayed
  lastIdentity = { userId: getStableUserId(), username: getDisplayName() }

  recount()
  setStatus('online')
}

function clearRemotePlayers() {
  for (const sessionId of remotePlayers.keys()) notifyRoster('onRemove', sessionId)
  remotePlayers.clear()
}

function handleLeave() {
  room = null
  selfId = ''
  connecting = false
  netState.playerCount = 0
  // Those characters belonged to the room we just lost.
  clearRemotePlayers()

  if (stopped) return
  attempt = 0
  scheduleRetry()
}

// --- Lifecycle --------------------------------------------------------------
let offStore = null
let offIdentity = null
let offAvatarChanged = null
let offProportionsChanged = null

export function init() {
  if (started) return
  started = true
  stopped = false
  // No server configured for this build: stay 'idle' forever. Every export
  // below already no-ops without a room.
  if (!SERVER_URL) return

  offStore ||= useGameStore.subscribe(onStoreChange)
  // subscribeAuth also fires on friends/balance loads; sendIdentityNow()'s own
  // diff check filters those out.
  offIdentity ||= subscribeAuth(() => sendIdentityNow())
  // Anything that changes avatarPayload() -> the room, so others see the
  // equip/unequip or proportions edit right away.
  offAvatarChanged ||= onAvatarChanged(() => sendAvatarNow())
  offProportionsChanged ||= onProportionsChanged(() => sendAvatarNow())
  waitForAuth(USERNAME_WAIT_MS).then(() => {
    if (!stopped) connect()
  })
}

export function teardown() {
  stopped = true
  started = false
  clearTimeout(retryTimer)
  clearTimeout(statsTimer)
  retryTimer = statsTimer = 0
  for (const off of [offStore, offIdentity, offAvatarChanged, offProportionsChanged]) off?.()
  offStore = offIdentity = offAvatarChanged = offProportionsChanged = null
  clearRemotePlayers()
  if (room) {
    try {
      // Don't let the SDK reconnect a socket we are deliberately closing.
      if (room.reconnection) room.reconnection.enabled = false
      room.leave()
    } catch {
      /* page is going away */
    }
  }
  room = null
  connecting = false
  netState.playerCount = 0
  setStatus('idle')
}
