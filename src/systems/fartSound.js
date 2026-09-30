import { volumeAt } from './eatingSound.js'

// One-shot fart sound. A small pool of Audio elements shares the browser-cached
// file so quick repeats (and nearby players) can overlap. A blocked or failed
// play() (autoplay policy, missing file) is ignored.
const URL = `${import.meta.env.BASE_URL}audio/fart.mp3`
const POOL_SIZE = 4
const OWN_VOLUME = 0.7
const OTHER_VOLUME = 0.5 / 0.4 // scales eatingSound's 0.4 point-blank falloff up to 0.5
const DELAY_MS = 120 // lines the sound up with the gas starting (FART.emitStart)

const pool = []
let next = 0

function playAt(volume) {
  if (volume <= 0.005) return
  let audio = pool[next]
  if (!audio) {
    audio = new Audio(URL)
    audio.preload = 'auto'
    pool[next] = audio
  }
  next = (next + 1) % POOL_SIZE
  audio.volume = Math.min(1, volume)
  audio.currentTime = 0
  audio.play().catch(() => {})
}

export function playOwnFart() {
  setTimeout(() => playAt(OWN_VOLUME), DELAY_MS)
}

// Another player's fart at (x, z), quieter with distance.
export function playFartAt(x, z) {
  const v = volumeAt(x, z) * OTHER_VOLUME
  setTimeout(() => playAt(v), DELAY_MS)
}
