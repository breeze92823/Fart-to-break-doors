import { useEffect, useRef } from 'react'
import { interactState } from '../systems/interact.js'
import { interactHoldState } from '../systems/interactHold.js'

const R = 14
const C = 2 * Math.PI * R

// "Press E to <label>" card with a ring that fills over the hold. Reads the
// interact singletons every animation frame and writes the DOM directly, so
// nothing re-renders per frame.
export default function InteractPrompt() {
  const card = useRef(null)
  const text = useRef(null)
  const ring = useRef(null)

  useEffect(() => {
    let raf = 0
    let shown = null
    const tick = () => {
      const label = interactState.label
      if (label !== shown) {
        shown = label
        card.current.style.display = label ? 'flex' : 'none'
        if (label) text.current.textContent = `Press E to ${label}`
      }
      const p = interactHoldState.progress
      ring.current.style.strokeDashoffset = String(C * (1 - p))
      card.current.classList.toggle('held', p > 0)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div ref={card} className="interact-prompt" style={{ display: 'none' }}>
      <div className="interact-key">
        <svg viewBox="0 0 36 36">
          <circle className="interact-ring-bg" cx="18" cy="18" r={R} />
          <circle ref={ring} className="interact-ring" cx="18" cy="18" r={R} strokeDasharray={C} strokeDashoffset={C} />
        </svg>
        <span className="interact-cap">E</span>
      </div>
      <span ref={text} className="interact-text" />
    </div>
  )
}
