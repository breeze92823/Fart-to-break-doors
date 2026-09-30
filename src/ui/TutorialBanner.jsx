import { useEffect, useState } from 'react'
import { useGameStore } from '../store/useGameStore.js'
import { TUTORIAL_CASH, TUTORIAL_CASH_2, TUTORIAL_DONE_STEP, TUTORIAL_POWER } from '../data/tutorial.js'
import { formatShort } from '../utils/format.js'

// Top-of-screen tutorial banner. Advances the step from game state (it only
// ever moves forward) and, once complete, lingers 6 s, pops out and unmounts.
export default function TutorialBanner() {
  const step = useGameStore((s) => s.tutorialStep)
  const fartPower = useGameStore((s) => s.fartPower)
  const nearDoor = useGameStore((s) => s.nearDoor)
  const seated = useGameStore((s) => s.seated)
  const inDoorArea = useGameStore((s) => s.inDoorArea)
  const cash = useGameStore((s) => s.cash)
  const boughtFart = useGameStore((s) => s.ownedFarts.length > 1)
  const boughtFood = useGameStore((s) => s.ownedFoods.length > 1)
  const firstDoorBroken = useGameStore((s) => s.doorHp[0] <= 0)
  const [phase, setPhase] = useState('show') // 'show' | 'leaving' | 'gone'

  useEffect(() => {
    if (step === 0 && firstDoorBroken) useGameStore.setState({ tutorialStep: 1 })
    else if (step === 1 && cash >= TUTORIAL_CASH) useGameStore.setState({ tutorialStep: 2 })
    else if (step === 2 && !inDoorArea) useGameStore.setState({ tutorialStep: 3 })
    else if (step === 3 && boughtFood) useGameStore.setState({ tutorialStep: 4 })
    else if (step === 4 && fartPower >= TUTORIAL_POWER) useGameStore.setState({ tutorialStep: 5 })
    else if (step === 5 && firstDoorBroken) useGameStore.setState({ tutorialStep: 6 })
    else if (step === 6 && cash >= TUTORIAL_CASH_2) useGameStore.setState({ tutorialStep: 7 })
    else if (step === 7 && !inDoorArea) useGameStore.setState({ tutorialStep: 8 })
    else if (step === 8 && boughtFart) useGameStore.setState({ tutorialStep: TUTORIAL_DONE_STEP })
  }, [step, fartPower, cash, firstDoorBroken, inDoorArea, boughtFood, boughtFart])

  const done = step >= TUTORIAL_DONE_STEP
  useEffect(() => {
    if (!done) return undefined
    const leave = setTimeout(() => setPhase('leaving'), 6000)
    const gone = setTimeout(() => setPhase('gone'), 6500)
    return () => {
      clearTimeout(leave)
      clearTimeout(gone)
    }
  }, [done])

  if (phase === 'gone') return null
  return (
    <>
      <div className={`tutorial${phase === 'leaving' ? ' tutorial--leaving' : ''}`}>
        <div className="tutorial__tag stroke">{done ? 'COMPLETE' : 'TUTORIAL'}</div>
        <div className="tutorial__text stroke">
          {step === 0 && 'FART TO BREAK THE DOOR'}
          {step === 1 && `COLLECT CASH ${formatShort(Math.min(cash, TUTORIAL_CASH))}/${TUTORIAL_CASH}`}
          {step === 2 && 'GO BACK'}
          {step === 3 && 'BUY FOOD FROM THE SHOP!'}
          {step === 4 && (
            <>
              FOOD WILL HELP YOU TRAIN FASTER!
              <br />
              {formatShort(Math.min(fartPower, TUTORIAL_POWER))}/{TUTORIAL_POWER}
            </>
          )}
          {step === 5 && 'FART TO BREAK DOORS AGAIN!'}
          {step === 6 && `COLLECT CASH ${formatShort(Math.min(cash, TUTORIAL_CASH_2))}/${TUTORIAL_CASH_2}`}
          {step === 7 && 'GO BACK'}
          {step === 8 && 'BUY A FART FROM THE SHOP!'}
          {done && 'TUTORIAL COMPLETE'}
        </div>
      </div>
      {/* Over the Back button (go back) or the STOP button (seated at the table). */}
      {(step === 2 || step === 7 || (step === 5 && seated)) && (
        <svg className="tutorial__arrow" viewBox="0 0 100 120" aria-hidden="true">
          <path d="M30 4h40v52h24L50 116 6 56h24z" />
        </svg>
      )}
      {(step === 0 || step === 5) && nearDoor && <div className="tutorial__back stroke">CLICK TO FART!</div>}
    </>
  )
}
