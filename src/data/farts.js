// Fart types sold at the FART-PAD. The equipped one multiplies the damage each
// fart does to a door (`power`) and the Cash a broken door pays (`cash`).
// `price` is in Cash (0 = owned from the start). Prices are placeholders until
// the balance is settled (see PROGRESSION.md). `gas` is the puff the farter
// leaves behind (components/FartGas.jsx draws `shape` in `color` fading to `edge`).
export const FARTS = [
  { id: 'fart', name: 'Fart', icon: '💨', power: 1, cash: 1, price: 0, gas: { shape: 'puff', color: '#7dff3a', edge: '#2fa800' } },
  { id: 'yellow', name: 'Yellow Fart', icon: '🌀', power: 1.2, cash: 1.5, price: 450, gas: { shape: 'swirl', color: '#ffd628', edge: '#ffaa00' } },
  { id: 'brown', name: 'Brown Fart', icon: '💩', power: 1.8, cash: 2, price: 7000, gas: { shape: 'cloud', color: '#a5672c', edge: '#5b3410' } },
  { id: 'power', name: 'Power Fart', icon: '⚡', power: 2.5, cash: 4, price: 115000, gas: { shape: 'bolt', color: '#ffe84a', edge: '#ff8a00' } },
  { id: 'wind', name: 'Wind Fart', icon: '🌪️', power: 4, cash: 8, price: 1900000, gas: { shape: 'wind', color: '#e6fbff', edge: '#8fd8e8' } },
  { id: 'water', name: 'Water Fart', icon: '💧', power: 5, cash: 12, price: 30000000, gas: { shape: 'drop', color: '#5ad2ff', edge: '#0a6cff' } },
  { id: 'fire', name: 'Fire Fart', icon: '🔥', power: 8.5, cash: 15, price: 500800000, gas: { shape: 'flame', color: '#ffb02e', edge: '#ff2a00' } },
]

export const FART_BY_ID = Object.fromEntries(FARTS.map((f) => [f.id, f]))
