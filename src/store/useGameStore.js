import { create } from 'zustand'
import { DOOR_TAGS } from '../data/room.js'
import { TUTORIAL_DONE_STEP } from '../data/tutorial.js'

// Lightweight, infrequently-changing game state. Per-frame state (the
// player) lives in systems/playerState.js instead. Player progress
// (Cash, Fart Power, ...) is documented in PROGRESSION.md; the values below
// are what the HUD shows, but nothing earns or spends them yet.
export const useGameStore = create((set) => ({
  avatarLoaded: false, // player character (incl. Bloxity accessories) finished loading

  cash: Number(import.meta.env.VITE_START_CASH) || 0, // .env.example
  fartPower: Number(import.meta.env.VITE_START_FART_POWER) || 20, // .env.example
  rebirths: 0, // Cash and training multiplier is rebirths + 1 (data/rebirth.js)
  rebirthOpen: false, // the Rebirth window (left menu button)
  crowns: 0, // Crowns collected from the pedestal past the last door (systems/crown.js); the HUD crown count
  crownTaken: false, // the crown is hidden until the doors reset

  // HUD display values whose rules are still TBD in PROGRESSION.md.
  // (The Fart Power level and bar fill are derived from fartPower: data/hud.js.)
  rebirthProgress: 0, // 0..1 along the bottom bar toward the next Rebirth

  ownedFoods: ['apple'], // Training Food ids bought (data/foods.js)
  equippedFood: 'apple', // the food that trains Fart Power in the pit
  seated: false, // mirrors player.seated so the HUD can show the STOP button
  foodShopOpen: false, // the Training Food window (opens beside the FOOD-PAD)

  ownedFarts: ['fart'], // Fart type ids bought (data/farts.js)
  equippedFart: 'fart', // the fart type used on doors (power and cash multipliers)
  fartShopOpen: false, // the Fart Powers window (opens beside the FART-PAD)

  doorHp: DOOR_TAGS.map((t) => t.hp), // remaining health per door, in DOORS order; 0 = broken

  tutorialStep: 0, // 0 break door 1, 1 collect cash, 2 go back, 3 buy food, 4 train with food, 5 break doors again, 6 collect cash 450, 7 go back, 8 buy a fart, 9 done (data/tutorial.js)
  // Whether we know if this player already has a save (systems/net.js): true
  // once the server's `progress`/`noProgress` reply arrives, or once there is
  // nothing to wait for (guest, no server, timeout). The tutorial stays hidden
  // until then, so a returning player never sees it flash at step 0.
  progressKnown: false,
  setProgressKnown: () => set((s) => (s.progressKnown ? s : { progressKnown: true })),
  // True when the loaded save had already finished the tutorial, so its
  // COMPLETE banner isn't replayed on every visit.
  tutorialResumedDone: false,
  // Applies the saved doc from the server (net.js `progress`). Only the
  // tutorial step is durable so far; it only ever moves forward.
  hydrate: (d) =>
    set((s) => {
      const saved = typeof d?.tutorialStep === 'number' && Number.isFinite(d.tutorialStep) ? d.tutorialStep : 0
      const tutorialStep = Math.max(s.tutorialStep, Math.min(TUTORIAL_DONE_STEP, Math.max(0, Math.floor(saved))))
      return {
        tutorialStep,
        tutorialResumedDone: s.tutorialResumedDone || (tutorialStep >= TUTORIAL_DONE_STEP && s.tutorialStep < TUTORIAL_DONE_STEP),
        progressKnown: true,
      }
    }),

  autoBreak: false,
  nearDoor: false, // within fart reach of the first intact door (tutorial "Click to Fart")
  inDoorArea: false, // player is past the hazard stripe (shows the Back button)
  bellySize: 1, // belly/waist multiplier (systems/belly.js BELLY_SIZE), synced to other players
  customSize: null, // null = default size, else 1..CUSTOM_SIZE_MAX
}))
