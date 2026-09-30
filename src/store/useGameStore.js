import { create } from 'zustand'
import { DOOR_TAGS } from '../data/room.js'

// Lightweight, infrequently-changing game state. Per-frame state (the
// player) lives in systems/playerState.js instead. Player progress
// (Cash, Fart Power, ...) is documented in PROGRESSION.md; the values below
// are what the HUD shows, but nothing earns or spends them yet.
export const useGameStore = create(() => ({
  avatarLoaded: false, // player character (incl. Bloxity accessories) finished loading

  cash: Number(import.meta.env.VITE_START_CASH) || 0, // .env.example
  fartPower: Number(import.meta.env.VITE_START_FART_POWER) || 20, // .env.example
  rebirths: 0,

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

  autoBreak: false,
  nearDoor: false, // within fart reach of the first intact door (tutorial "Click to Fart")
  inDoorArea: false, // player is past the hazard stripe (shows the Back button)
  bellySize: 1, // belly/waist multiplier (systems/belly.js BELLY_SIZE), synced to other players
  customSize: null, // null = default size, else 1..CUSTOM_SIZE_MAX
}))
