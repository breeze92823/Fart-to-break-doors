// HUD content that isn't player state: shop-offer prices, menu buttons and
// the offer timer. Prices are in the platform's premium currency and are
// placeholders until real SKUs exist (purchases go through systems/bloxity.js).

export const OFFERS = {
  cashBoost: { label: 'x2', price: 6 }, // double Cash
  fartBoost: { label: 'x2', price: 6 }, // double Fart Power
  opPet: { xp: 39, price: 6 },
}

// How long the starter pack stays on sale, counted from the session start.
export const STARTER_PACK_SECONDS = 24 * 60 * 60

// Custom Size input range.
export const CUSTOM_SIZE_MAX = 6

// Pets, Shop and Rewards only show when VITE_SHOW_ADDON=true (.env.example).
export const SHOW_ADDON = import.meta.env.VITE_SHOW_ADDON === 'true'

// Left-hand menu grid, in reading order (two columns). `img` is a file in public/ui; without it the emoji shows.
export const MENU_BUTTONS = [
  { id: 'pets', icon: '🐾', label: 'Pets', addon: true },
  { id: 'shop', icon: '🧺', label: 'Shop', img: 'shop.png', addon: true },
  { id: 'boosts', icon: '🍀', label: 'Fart', img: 'fart.png' },
  { id: 'foods', icon: '🍔', label: 'Training Foods' },
  { id: 'rebirth', icon: '🔁', label: 'Rebirth', img: 'rebirth.png' },
  { id: 'rewards', icon: '⭐', label: 'Rewards', img: 'xp_cup.png', addon: true },
].filter((b) => SHOW_ADDON || !b.addon)

// Rebirth progress bar colour bands, as [colour, end fraction].
export const REBIRTH_BANDS = [
  ['#ffd21f', 0.18],
  ['#12e0b0', 0.4],
  ['#0f7bff', 0.62],
  ['#ff1fd6', 0.78],
  ['#ff2323', 1],
]

// Fart Power level: level N tops out at 50 * 2^(N-1) (1: 50, 2: 100, 3: 200, ...).
export const levelMaxPower = (level) => 50 * 2 ** (level - 1)

// { level, progress } for a Fart Power total; progress is 0..1 within the level.
export function fartLevelInfo(power) {
  let level = 1
  while (power > levelMaxPower(level)) level++
  const from = level === 1 ? 0 : levelMaxPower(level - 1)
  return { level, progress: (power - from) / (levelMaxPower(level) - from) }
}
