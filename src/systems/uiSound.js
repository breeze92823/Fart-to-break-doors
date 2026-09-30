// UI sounds synthesised with WebAudio (no audio files): button hover, button
// click, and the hold-E interaction (rising tone while held, chime on confirm).
// The context is created lazily and resumed on the first user gesture; anything
// blocked or unsupported is ignored.
let ctx = null
let master = null

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    try {
      ctx = new AC()
      master = ctx.createGain()
      master.gain.value = 0.5
      master.connect(ctx.destination)
    } catch {
      ctx = null
      return null
    }
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

// One enveloped oscillator note. `to` slides the pitch over the note.
function tone({ freq, to = freq, dur, vol, type = 'sine', delay = 0 }) {
  const c = audio()
  if (!c) return
  const t = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

let lastHover = 0

export function playHover() {
  const now = performance.now()
  if (now - lastHover < 60) return
  lastHover = now
  tone({ freq: 620, to: 780, dur: 0.06, vol: 0.09, type: 'triangle' })
}

export function playClick() {
  tone({ freq: 340, to: 200, dur: 0.09, vol: 0.28, type: 'square' })
  tone({ freq: 760, to: 520, dur: 0.07, vol: 0.12, type: 'triangle' })
}

// Rising tone that follows the hold ring (progress 0..1). 0 stops it.
let hold = null

export function setHoldProgress(p) {
  if (p <= 0) {
    if (hold) {
      const { osc, g } = hold
      const t = ctx.currentTime
      g.gain.cancelScheduledValues(t)
      g.gain.setTargetAtTime(0.0001, t, 0.02)
      osc.stop(t + 0.12)
      hold = null
    }
    return
  }
  const c = audio()
  if (!c) return
  if (!hold) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'triangle'
    g.gain.value = 0.0001
    osc.connect(g).connect(master)
    osc.start()
    hold = { osc, g }
    tone({ freq: 420, to: 560, dur: 0.07, vol: 0.14, type: 'square' }) // press blip
  }
  const t = c.currentTime
  hold.osc.frequency.setTargetAtTime(280 + 620 * p * p, t, 0.03)
  hold.g.gain.setTargetAtTime(0.05 + 0.06 * p, t, 0.03)
}

export function playConfirm() {
  setHoldProgress(0)
  tone({ freq: 523, dur: 0.16, vol: 0.2, type: 'triangle' })
  tone({ freq: 659, dur: 0.16, vol: 0.2, type: 'triangle', delay: 0.08 })
  tone({ freq: 784, dur: 0.32, vol: 0.22, type: 'triangle', delay: 0.16 })
}

// Hover/click sounds for every button in the DOM, via delegated listeners.
// Returns a cleanup function.
export function installButtonSounds() {
  const target = (e) => (e.target instanceof Element ? e.target.closest('button, [role="button"]') : null)
  const over = (e) => {
    const b = target(e)
    if (b && !b.disabled && !b.contains(e.relatedTarget)) playHover()
  }
  const click = (e) => {
    const b = target(e)
    if (b && !b.disabled) playClick()
  }
  document.addEventListener('pointerover', over)
  document.addEventListener('click', click)
  return () => {
    document.removeEventListener('pointerover', over)
    document.removeEventListener('click', click)
  }
}

// Level-up chime: a fast rising C-major arpeggio with a detuned octave shimmer.
export function playLevelUp() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const delay = i * 0.055
    tone({ freq, dur: 0.3, vol: 0.2, type: 'triangle', delay })
    tone({ freq: freq * 2.01, dur: 0.22, vol: 0.05, type: 'sine', delay })
  })
}
