// One-shot sound for a door breaking. A single Audio element is loaded up front
// (so the first break isn't delayed) and restarted per break. A blocked or
// failed play() (autoplay policy, missing file) is ignored.
const URL = `${import.meta.env.BASE_URL}audio/door-got-kicked.mp3`
const VOLUME = 0.8

let audio = null

export function preloadDoorSound() {
  if (audio) return
  audio = new Audio(URL)
  audio.preload = 'auto'
  audio.volume = VOLUME
}

export function playDoorBreak() {
  preloadDoorSound()
  audio.currentTime = 0
  audio.play().catch(() => {})
}
