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

// Left-hand menu grid, in reading order (two columns).
export const MENU_BUTTONS = [
  { id: 'pets', icon: '🐾', label: 'Pets' },
  { id: 'shop', icon: '🧺', label: 'Shop' },
  { id: 'boosts', icon: '🍀', label: 'Boosts' },
  { id: 'foods', icon: '🍔', label: 'Training Foods' },
  { id: 'rebirth', icon: '🔁', label: 'Rebirth' },
  { id: 'rewards', icon: '⭐', label: 'Rewards' },
]

// Rebirth progress bar colour bands, as [colour, end fraction].
export const REBIRTH_BANDS = [
  ['#ffd21f', 0.18],
  ['#12e0b0', 0.4],
  ['#0f7bff', 0.62],
  ['#ff1fd6', 0.78],
  ['#ff2323', 1],
]
