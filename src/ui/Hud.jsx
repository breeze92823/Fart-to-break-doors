import { useEffect, useState } from 'react'
import { useGameStore } from '../store/useGameStore.js'
import { showMenu } from '../systems/bloxity.js'
import { formatClock, formatShort } from '../utils/format.js'
import { CUSTOM_SIZE_MAX, MENU_BUTTONS, OFFERS, REBIRTH_BANDS, STARTER_PACK_SECONDS } from '../data/hud.js'
import { ArrowIcon, CashIcon, GemIcon } from './icons.jsx'
import './hud.css'

// The 2D overlay above the canvas. Reads slow game state from the zustand
// store; shop and menu buttons are placeholders until those features exist.
// The root ignores pointer events so camera drag still reaches the canvas —
// only the interactive pieces opt back in.

function Badge({ children }) {
  return <span className="badge stroke">{children}</span>
}

function RoundButton({ className = '', label, onClick, children }) {
  return (
    <button type="button" className={`round-btn ${className}`} aria-label={label} title={label} onClick={onClick}>
      {children}
    </button>
  )
}

function FartPowerBar() {
  const fartPower = useGameStore((s) => s.fartPower)
  const progress = useGameStore((s) => s.fartProgress)
  const level = useGameStore((s) => s.fartLevel)
  return (
    <div className="fart-bar">
      <div className="fart-bar__arrow">
        <ArrowIcon />
      </div>
      <div className="fart-bar__track">
        <div className="fart-bar__fill" style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }} />
        <span className="fart-bar__text stroke">Fart Power {formatShort(fartPower)}</span>
      </div>
      <div className="fart-bar__level stroke">{level}</div>
    </div>
  )
}

function BoostOffer({ offer, icon, label, className }) {
  return (
    <div className={`boost ${className}`}>
      <RoundButton className="round-btn--bare" label={label}>
        <span className="boost__icon">{icon}</span>
        <span className="boost__mult stroke">{offer.label}</span>
      </RoundButton>
      <div className="price stroke">
        <span className="price__gem">
          <GemIcon />
        </span>
        {offer.price}
      </div>
    </div>
  )
}

function TopRow() {
  return (
    <div className="top-row">
      <BoostOffer className="top-row__cash" offer={OFFERS.cashBoost} label="Double Cash" icon={<CashIcon />} />
      <RoundButton className="top-row__gift" label="Gifts">
        <span className="emoji">🎁</span>
        <Badge>1</Badge>
      </RoundButton>
      <RoundButton className="top-row__daily" label="Daily Rewards">
        <span className="emoji">📅</span>
        <Badge>!</Badge>
      </RoundButton>
      <RoundButton className="top-row__worlds" label="Worlds">
        <span className="emoji">🌍</span>
      </RoundButton>
      <BoostOffer className="top-row__fart" offer={OFFERS.fartBoost} label="Double Fart Power" icon={<span className="emoji">💥</span>} />
    </div>
  )
}

function useStarterPackTimer() {
  const [end] = useState(() => Date.now() + STARTER_PACK_SECONDS * 1000)
  const [left, setLeft] = useState(STARTER_PACK_SECONDS)
  useEffect(() => {
    const id = setInterval(() => setLeft((end - Date.now()) / 1000), 1000)
    return () => clearInterval(id)
  }, [end])
  return left
}

function RightColumn() {
  const timeLeft = useStarterPackTimer()
  const autoBreak = useGameStore((s) => s.autoBreak)
  const customSize = useGameStore((s) => s.customSize)
  const [draft, setDraft] = useState('')

  function commitSize() {
    const n = Math.round(Number(draft))
    if (draft.trim() === '' || !Number.isFinite(n)) {
      setDraft('')
      useGameStore.setState({ customSize: null })
      return
    }
    const size = Math.min(Math.max(n, 1), CUSTOM_SIZE_MAX)
    setDraft(String(size))
    useGameStore.setState({ customSize: size })
  }

  return (
    <>
      <RoundButton className="spin" label="Spin the Wheel">
        <span className="spin__wheel" />
        <Badge>!</Badge>
      </RoundButton>

      <button type="button" className="starter" title="Starter Pack">
        <span className="starter__egg" />
        <span className="starter__title stroke">STARTER PACK</span>
        <span className="starter__timer stroke">{formatClock(timeLeft)}</span>
      </button>

      <button type="button" className="op-pet" title="OP Pet">
        <span className="op-pet__tag stroke">OP!</span>
        <span className="op-pet__pet">🐈‍⬛</span>
        <span className="op-pet__xp stroke">
          <small>XP</small>x{OFFERS.opPet.xp}
        </span>
        <span className="op-pet__price stroke">
          <span className="price__gem">
            <GemIcon />
          </span>
          {OFFERS.opPet.price}
        </span>
      </button>

      <div className="auto-break">
        <span className="auto-break__label stroke">Auto Break</span>
        <button
          type="button"
          className={`toggle stroke ${autoBreak ? 'toggle--on' : ''}`}
          aria-pressed={autoBreak}
          onClick={() => useGameStore.setState({ autoBreak: !autoBreak })}
        >
          {autoBreak ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="custom-size">
        <span className="custom-size__title stroke">Custom Size</span>
        <div className="custom-size__panel">
          <span className="custom-size__max stroke">MAX SIZE: {CUSTOM_SIZE_MAX}</span>
          <span className="custom-size__pencil">✏️</span>
          <input
            className="custom-size__input"
            inputMode="numeric"
            placeholder={customSize ? String(customSize) : 'Custom Size'}
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
            onBlur={commitSize}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
            }}
          />
        </div>
      </div>
    </>
  )
}

function LeftColumn() {
  const cash = useGameStore((s) => s.cash)
  const rebirths = useGameStore((s) => s.rebirths)
  return (
    <>
      <div className="stat stat--cash">
        <span className="stat__icon">
          <CashIcon />
        </span>
        <span className="stat__value stroke">{formatShort(cash)}</span>
      </div>
      <button type="button" className="plus" aria-label="Get more Cash" title="Get more Cash">
        +
      </button>
      <div className="stat stat--rebirth">
        <span className="stat__icon emoji">👑</span>
        <span className="stat__value stroke">{formatShort(rebirths)}</span>
      </div>
      <div className="menu-grid">
        {MENU_BUTTONS.map((b) => (
          <button key={b.id} type="button" className="menu-btn" aria-label={b.label} title={b.label}>
            <span className="emoji">{b.icon}</span>
          </button>
        ))}
      </div>
    </>
  )
}

function RebirthBar() {
  const progress = useGameStore((s) => s.rebirthProgress)
  let from = 0
  const stops = REBIRTH_BANDS.map(([color, to]) => {
    const s = `${color} ${from * 100}% ${to * 100}%`
    from = to
    return s
  }).join(', ')
  const at = Math.min(Math.max(progress, 0), 1) * 100
  return (
    <div className="rebirth-bar">
      <div className="rebirth-bar__track" style={{ background: `linear-gradient(90deg, ${stops})` }}>
        {[25, 50, 75].map((p) => (
          <span key={p} className="rebirth-bar__mark stroke" style={{ left: `${p}%` }}>
            {p}%
          </span>
        ))}
      </div>
      <div className="rebirth-bar__player" style={{ left: `${at}%` }}>
        <span className="rebirth-bar__avatar emoji">🙂</span>
        <span className="rebirth-bar__pointer" />
      </div>
      <div className="rebirth-bar__reward">
        <span className="emoji">👑</span>
        <span className="stroke">+1</span>
      </div>
    </div>
  )
}

export default function Hud() {
  return (
    <div className="hud">
      <FartPowerBar />
      <TopRow />
      <RightColumn />
      <LeftColumn />
      <RebirthBar />

      <button type="button" className="corner corner--settings" aria-label="Settings" title="Settings" onClick={showMenu}>
        <span className="emoji">⚙️</span>
      </button>
      <div className="corner corner--friends" title="Friend boost">
        <span className="emoji">👥</span>
        <span className="corner__caption stroke">+0%</span>
      </div>
      <button type="button" className="corner corner--quests" aria-label="Quests" title="Quests">
        <span className="emoji">📋</span>
      </button>
    </div>
  )
}
