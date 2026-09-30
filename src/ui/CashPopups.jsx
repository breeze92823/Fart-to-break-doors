import { useEffect, useRef } from 'react'
import { CASH_POPUP as C, cashPopupPool } from '../systems/cashPopups.js'
import { formatShort } from '../utils/format.js'
import { CashIcon } from './icons.jsx'

const FADE_IN_T = C.fadeIn / C.lifetime

// easeOutBack: scale springs past 1, then settles.
function easeOutBack(p) {
  const c3 = C.popOvershoot + 1
  const q = p - 1
  return 1 + c3 * q * q * q + C.popOvershoot * q * q
}

function easeInCubic(p) {
  return p * p * p
}

// Screen centre of the HUD's Cash icon (top-left), where popups fly to.
function cashTarget() {
  const el = document.querySelector('.stat--cash .stat__icon')
  if (!el) return { x: 60, y: 60 }
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

// One DOM node per pool slot, recycled. A self-owned rAF loop reads the pool
// and writes transform/opacity straight onto the nodes.
export default function CashPopups() {
  const nodesRef = useRef([])

  useEffect(() => {
    let raf = 0
    const drawnSeq = new Array(C.poolSize).fill(-1)

    const frame = () => {
      for (let i = 0; i < C.poolSize; i++) {
        const slot = cashPopupPool[i]
        const node = nodesRef.current[i]
        if (!node) continue

        if (!slot.alive) {
          if (node.style.display !== 'none') {
            node.style.display = 'none'
            drawnSeq[i] = -1
          }
          continue
        }

        if (drawnSeq[i] !== slot.seq) {
          drawnSeq[i] = slot.seq
          node.lastElementChild.textContent = `+${formatShort(slot.amount)}`
          node.style.display = ''
        }

        const t = slot.age / C.lifetime
        const pop = t < C.popT ? t / C.popT : 1
        // Ease-in flight: lingers near the spawn point, then accelerates into the icon.
        const te = t <= C.popT ? 0 : easeInCubic((t - C.popT) / (1 - C.popT))

        const scale = (C.popScaleFrom + (1 - C.popScaleFrom) * easeOutBack(pop)) * (1 - 0.5 * te)
        const hop = Math.sin(pop * Math.PI) * C.hop
        const vw = window.innerWidth
        const vh = window.innerHeight
        const startX = (slot.ndcX * 0.5 + 0.5) * vw
        const startY = (-(slot.ndcY + hop) * 0.5 + 0.5) * vh
        const target = cashTarget()
        const x = startX + (target.x - startX) * te
        const y = startY + (target.y - startY) * te

        let opacity
        if (t < FADE_IN_T) opacity = t / FADE_IN_T
        else if (t < C.fadeOutStart) opacity = 1
        else opacity = 1 - (t - C.fadeOutStart) / (1 - C.fadeOutStart)

        node.style.left = `${x}px`
        node.style.top = `${y}px`
        node.style.opacity = String(Math.max(0, opacity))
        node.lastElementChild.style.opacity = String(Math.max(0, 1 - te * 2.5))
        node.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(3)})`
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  return Array.from({ length: C.poolSize }, (_, i) => (
    <div
      key={i}
      ref={(el) => {
        nodesRef.current[i] = el
      }}
      className="cash-popup"
      style={{ display: 'none', transform: 'translate(-50%, -50%) scale(0)' }}
    >
      <span className="cash-popup__icon">
        <CashIcon />
      </span>
      <span className="cash-popup__text stroke" />
    </div>
  ))
}
