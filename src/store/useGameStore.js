import { create } from 'zustand'

// Lightweight, infrequently-changing game state. Per-frame state (the
// player) lives in systems/playerState.js instead. Player progress
// (Cash, Fart Power, ...) is documented in PROGRESSION.md; the values below
// are what the HUD shows, but nothing earns or spends them yet.
export const useGameStore = create(() => ({
  avatarLoaded: false, // player character (incl. Bloxity accessories) finished loading

  cash: 0,
  fartPower: 1,
  rebirths: 0,

  // HUD display values whose rules are still TBD in PROGRESSION.md.
  fartLevel: 1, // badge at the end of the Fart Power bar
  fartProgress: 0, // 0..1 fill of the Fart Power bar
  rebirthProgress: 0, // 0..1 along the bottom bar toward the next Rebirth

  autoBreak: false,
  customSize: null, // null = default size, else 1..CUSTOM_SIZE_MAX
}))
