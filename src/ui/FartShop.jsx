import { useGameStore } from '../store/useGameStore.js'
import { buyFart, equipFart, nextFart } from '../systems/farts.js'
import { FARTS, FART_BY_ID } from '../data/farts.js'
import { formatShort } from '../utils/format.js'
import { CashIcon } from './icons.jsx'

// The Fart Powers window, shown while the player stands at the FART-PAD. Each
// fart type multiplies door damage (x power) and the Cash doors pay (x cash).
// Unowned ones are bought with Cash, owned ones equipped. The right-hand card
// shows the equipped fart.
function Mults({ fart }) {
  return (
    <span className="fart-mults stroke">
      <span className="fart-mults__row">
        <span className="fart-mults__icon emoji">💥</span>x{fart.power}
      </span>
      <span className="fart-mults__row">
        <span className="fart-mults__icon">
          <CashIcon />
        </span>
        x{fart.cash}
      </span>
    </span>
  )
}

function FartRow({ fart, owned, equipped, cash, next, guide }) {
  return (
    <div className={`fart-row ${equipped ? 'fart-row--equipped' : ''} ${next ? 'fart-row--next' : ''}`}>
      <span className="fart-row__icon emoji">{fart.icon}</span>
      <span className="fart-row__name stroke">{fart.name}</span>
      <Mults fart={fart} />
      {owned ? (
        <button type="button" className="food-btn stroke" disabled={equipped} onClick={() => equipFart(fart.id)}>
          {equipped ? 'Equipped' : 'Equip'}
        </button>
      ) : (
        <button
          type="button"
          className={`food-btn food-btn--buy stroke ${cash < fart.price ? 'food-btn--locked' : ''}`}
          onClick={() => buyFart(fart.id)}
        >
          <span className="food-btn__cash">
            <CashIcon />
          </span>
          {formatShort(fart.price)}
          {guide && (
            <svg className="food-btn__guide" viewBox="0 0 100 120" aria-hidden="true">
              <path d="M30 4h40v52h24L50 116 6 56h24z" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}

export default function FartShop() {
  const open = useGameStore((s) => s.fartShopOpen)
  const owned = useGameStore((s) => s.ownedFarts)
  const equippedId = useGameStore((s) => s.equippedFart)
  const cash = useGameStore((s) => s.cash)
  const tutorialBuy = useGameStore((s) => s.tutorialStep === 8) // tutorial: point at the Buy button
  if (!open) return null
  const upcoming = nextFart(owned)
  const equipped = FART_BY_ID[equippedId]
  return (
    <div className="fart-shop">
      <div className="fart-shop__title stroke">Fart Powers</div>
      <button
        type="button"
        className="food-shop__close"
        aria-label="Close"
        onClick={() => useGameStore.setState({ fartShopOpen: false })}
      >
        ✕
      </button>
      <div className="fart-shop__panel">
        <div className="fart-shop__list">
          {FARTS.map((f) => (
            <FartRow key={f.id} fart={f} owned={owned.includes(f.id)} equipped={equippedId === f.id} cash={cash} next={upcoming?.id === f.id} guide={tutorialBuy && upcoming?.id === f.id} />
          ))}
        </div>
        <div className="fart-shop__card">
          <div className="fart-shop__card-name stroke">{equipped.name}</div>
          <div className="fart-shop__card-icon emoji">{equipped.icon}</div>
          <Mults fart={equipped} />
          <div className="fart-shop__card-state stroke">EQUIPPED</div>
        </div>
      </div>
      <div className="food-shop__hint">Left: door damage · Right: Cash per door</div>
    </div>
  )
}
