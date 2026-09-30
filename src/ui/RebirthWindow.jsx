import { useGameStore } from '../store/useGameStore.js'
import { rebirthCost, rebirthMult } from '../data/rebirth.js'
import { canRebirth, doRebirth } from '../systems/rebirth.js'
import { formatShort } from '../utils/format.js'

// The Rebirth window, opened from the left menu. Shows Fart Power progress
// toward the next Rebirth and the multiplier it unlocks.
export default function RebirthWindow() {
  const open = useGameStore((s) => s.rebirthOpen)
  const fartPower = useGameStore((s) => s.fartPower)
  const rebirths = useGameStore((s) => s.rebirths)
  const bellySize = useGameStore((s) => s.bellySize)
  if (!open) return null
  const cost = rebirthCost(rebirths)
  const ready = canRebirth()
  const fill = Math.min(fartPower / cost, 1) * 100
  return (
    <div className="rebirth-win">
      <div className="rebirth-win__title stroke">REBIRTH</div>
      <button
        type="button"
        className="food-shop__close"
        aria-label="Close"
        onClick={() => useGameStore.setState({ rebirthOpen: false })}
      >
        ✕
      </button>
      <div className="rebirth-win__panel">
        <div className="rebirth-win__preview">
          <span className="emoji rebirth-win__face">🙂</span>
          <span className="rebirth-win__belly" style={{ transform: `scale(${0.8 + bellySize * 0.25})` }} />
        </div>
        <div className="rebirth-win__side">
          <div className="rebirth-win__label stroke">Fart Power:</div>
          <div className="rebirth-win__bar">
            <span className="rebirth-win__gas emoji">💨</span>
            <div className="rebirth-win__track">
              <div className="rebirth-win__fill" style={{ width: `${fill}%` }} />
              <span className="rebirth-win__text stroke">
                {formatShort(fartPower)}/{formatShort(cost)}
              </span>
            </div>
          </div>
          <div className="rebirth-win__card">
            <div className="rebirth-win__levels">
              <div className="rebirth-win__lv stroke">
                Lv. {rebirths + 1}
                <small>Train {rebirthMult(rebirths)}x</small>
              </div>
              <span className="rebirth-win__arrow">▶</span>
              <div className="rebirth-win__lv stroke">
                Lv. {rebirths + 2}
                <small>Train {rebirthMult(rebirths + 1)}x</small>
              </div>
            </div>
            <div className="rebirth-win__buttons">
              <button type="button" className="rebirth-win__btn rebirth-win__btn--skip stroke" title="Skip (coming soon)">
                SKIP
              </button>
              <button
                type="button"
                className={`rebirth-win__btn rebirth-win__btn--go stroke ${ready ? '' : 'rebirth-win__btn--locked'}`}
                onClick={doRebirth}
              >
                REBIRTH
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
