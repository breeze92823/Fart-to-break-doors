import { useGameStore } from '../store/useGameStore.js'
import { buyFood, equipFood, nextFood } from '../systems/foods.js'
import { FOODS, TRAIN_INTERVAL } from '../data/foods.js'
import { formatShort } from '../utils/format.js'
import { CashIcon } from './icons.jsx'

// The Training Food window, shown while the player stands at the FOOD-PAD.
// +N is the Fart Power the equipped food adds every TRAIN_INTERVAL seconds of
// training in the pit. Unowned foods are bought with Cash, owned ones equipped.
function FoodRow({ food, owned, equipped, cash, next, guide }) {
  return (
    <div className={`food-row ${equipped ? 'food-row--equipped' : ''} ${next ? 'food-row--next' : ''}`}>
      <span className="food-row__icon emoji">{food.icon}</span>
      <span className="food-row__name stroke">{food.name}</span>
      <span className="food-row__gain stroke">+{formatShort(food.gain)}</span>
      {owned ? (
        <button type="button" className="food-btn stroke" disabled={equipped} onClick={() => equipFood(food.id)}>
          {equipped ? 'Equipped' : 'Equip'}
        </button>
      ) : (
        <button
          type="button"
          className={`food-btn food-btn--buy stroke ${cash < food.price ? 'food-btn--locked' : ''}`}
          onClick={() => buyFood(food.id)}
        >
          <span className="food-btn__cash">
            <CashIcon />
          </span>
          {formatShort(food.price)}
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

export default function FoodShop() {
  const open = useGameStore((s) => s.foodShopOpen)
  const owned = useGameStore((s) => s.ownedFoods)
  const equipped = useGameStore((s) => s.equippedFood)
  const cash = useGameStore((s) => s.cash)
  const tutorialBuy = useGameStore((s) => s.tutorialStep === 3) // tutorial: point at the Buy button
  if (!open) return null
  const upcoming = nextFood(owned)
  return (
    <div className="food-shop">
      {upcoming && <div className="food-shop__next stroke">NEXT FOOD: {upcoming.icon} {upcoming.name} ${formatShort(upcoming.price)}</div>}
      <div className="food-shop__title stroke">Training Food</div>
      <button
        type="button"
        className="food-shop__close"
        aria-label="Close"
        onClick={() => useGameStore.setState({ foodShopOpen: false })}
      >
        ✕
      </button>
      <div className="food-shop__panel">
        <div className="food-shop__list">
          {FOODS.map((f) => (
            <FoodRow key={f.id} food={f} owned={owned.includes(f.id)} equipped={equipped === f.id} cash={cash} next={upcoming?.id === f.id} guide={tutorialBuy && upcoming?.id === f.id} />
          ))}
        </div>
        <div className="food-shop__hint">Fart Power per {TRAIN_INTERVAL}s of training in the pit</div>
      </div>
    </div>
  )
}
