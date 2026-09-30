import { create } from 'zustand'
import { DOOR_TAGS } from '../data/room.js'

// Lightweight, infrequently-changing game state. Per-frame state (the
// player) lives in systems/playerState.js instead. Player progress
// (Cash, Fart Power, ...) is documented in PROGRESSION.md; the values below
// are what the HUD shows, but nothing earns or spends them yet.
export const useGameStore = create(() => ({
  avatarLoaded: false, // player character (incl. Bloxity accessories) finished loading

  cash: 0,
  fartPower: Number(import.meta.env.VITE_START_FART_POWER) || 20, // .env.example
  rebirths: 0,

  // HUD display values whose rules are still TBD in PROGRESSION.md.
  fartLevel: 1, // badge at the end of the Fart Power bar
  fartProgress: 0.5, // 0..1 fill of the Fart Power bar (half full at level 1)
  rebirthProgress: 0, // 0..1 along the bottom bar toward the next Rebirth

  doorHp: DOOR_TAGS.map((t) => t.hp), // remaining health per door, in DOORS order; 0 = broken

  autoBreak: false,
  inDoorArea: false, // player is past the hazard stripe (shows the Back button)
  bellySize: 1, // belly/waist multiplier (systems/belly.js BELLY_SIZE), synced to other players
  customSize: null, // null = default size, else 1..CUSTOM_SIZE_MAX
}))
