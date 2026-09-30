import { player } from './playerState.js'

// Chewing loop for training. One instance per eater (the local player and each
// seated remote player); they share the browser-cached file. Created lazily; a
// blocked or failed play() (autoplay policy, missing file) is ignored.
const URL = `${import.meta.env.BASE_URL}audio/eating.mp3`

export const OWN_VOLUME = 0.6
const OTHER_VOLUME = 0.4 // at point-blank range
const HEARD_RANGE = 12 // m at which another player's chewing fades to silence

// Volume for someone eating at (x, z), by distance from the local player.
export function volumeAt(x, z) {
  const d = Math.hypot(x - player.position.x, z - player.position.z)
  return OTHER_VOLUME * Math.max(0, 1 - d / HEARD_RANGE) ** 2
}

export function makeEatingLoop() {
  let audio = null
  return {
    set(on, volume = OWN_VOLUME) {
      if (!audio) {
        if (!on || volume <= 0) return
        audio = new Audio(URL)
        audio.loop = true
      }
      if (on && volume > 0) {
        audio.volume = Math.min(1, volume)
        if (audio.paused) audio.play().catch(() => {})
      } else if (!audio.paused) {
        audio.pause()
        audio.currentTime = 0
      }
    },
    dispose() {
      if (!audio) return
      audio.pause()
      audio = null
    },
  }
}
