// Training Foods sold at the FOOD-PAD. `gain` is the Fart Power the equipped
// food adds every TRAIN_INTERVAL seconds while the player sits on a training
// table (hold E beside a bench). `price` is in Cash (0 = owned from the start). Placeholders
// until the balance is settled (see PROGRESSION.md).
export const TRAIN_INTERVAL = 1// seconds between Fart Power gains

export const FOODS = [
  { id: 'apple', name: 'Apple Core', icon: '🍎', gain: 10, price: 0 },
  { id: 'cheese', name: 'Cheese', icon: '🧀', gain: 50, price: 40 },
  { id: 'bread', name: 'Bread', icon: '🍞', gain: 250, price: 400 },
  { id: 'fries', name: 'Fries', icon: '🍟', gain: 650, price: 4000 },
  { id: 'cookies', name: 'Cookies', icon: '🍪', gain: 1000, price: 45000 },
  { id: 'milkshake', name: 'MilkShake', icon: '🥤', gain: 2650, price: 480000 },
  { id: 'donuts', name: 'Donuts', icon: '🍩', gain: 3600, price: 5000000 },
  { id: 'hotdog', name: 'Hot Dog', icon: '🌭', gain: 5500, price: 52000000 },
]

export const FOOD_BY_ID = Object.fromEntries(FOODS.map((f) => [f.id, f]))
