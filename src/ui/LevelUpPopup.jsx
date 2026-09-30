import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/useGameStore.js'
import { fartLevelInfo } from '../data/hud.js'
import { playLevelUp } from '../systems/uiSound.js'

// Pop in, hold, float up and fade (ms).
const IN_MS = 420
const HOLD_MS = 900
const OUT_MS = 560
const TOTAL_MS = IN_MS + HOLD_MS + OUT_MS

const at = (y, scale) => `translateX(-50%) translateY(${y}) scale(${scale})`

// Top-centre "LEVEL UP!" banner. Never re-renders: a transient store
// subscription watches the Fart Power level and, on a rise, writes the subline
// and runs one Web-Animations pass. A fall (Rebirth resets power) stays silent.
export default function LevelUpPopup() {
  const rootRef = useRef(null)
  const subRef = useRef(null)

  useEffect(() => {
    let lastLevel = fartLevelInfo(useGameStore.getState().fartPower).level
    let lastPower = useGameStore.getState().fartPower
    let anim = null

    const play = (level) => {
      const root = rootRef.current
      if (!root) return
      if (subRef.current) subRef.current.textContent = `Level ${level}`
      if (anim) anim.cancel() // several levels can pass in quick succession
      root.style.display = ''
      anim = root.animate(
        [
          { opacity: 0, transform: at('14px', 0.4), offset: 0 },
          { opacity: 1, transform: at('0', 1.14), offset: (IN_MS * 0.62) / TOTAL_MS },
          { opacity: 1, transform: at('0', 1), offset: IN_MS / TOTAL_MS },
          { opacity: 1, transform: at('0', 1), offset: (IN_MS + HOLD_MS) / TOTAL_MS },
          { opacity: 0, transform: at('-46px', 1), offset: 1 },
        ],
        { duration: TOTAL_MS, easing: 'ease-out', fill: 'forwards' },
      )
      anim.onfinish = () => {
        if (rootRef.current) rootRef.current.style.display = 'none'
      }
    }

    const unsub = useGameStore.subscribe((state) => {
      if (state.fartPower === lastPower) return
      lastPower = state.fartPower
      const { level } = fartLevelInfo(state.fartPower)
      if (level > lastLevel) {
        play(level)
        playLevelUp()
      }
      lastLevel = level
    })

    return () => {
      unsub()
      if (anim) anim.cancel()
    }
  }, [])

  return (
    <div ref={rootRef} className="levelup" style={{ display: 'none' }}>
      <div className="levelup__title stroke">LEVEL UP!</div>
      <div ref={subRef} className="levelup__sub stroke">
        Level 1
      </div>
    </div>
  )
}
