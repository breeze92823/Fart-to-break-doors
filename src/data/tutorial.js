import { DOOR, DOORS, SPAWN } from './world.js'
import { BUY_PADS, TABLES } from './room.js'

// New-player tutorial (ui/TutorialBanner.jsx, components/GuideArrows.jsx).
// Steps: 0 fart to break the first door, 1 collect cash, 2 go back to the hall, 3 buy a food, 4 train Fart Power (food), 5 break doors again, 6 collect more cash, 7 go back, 8 buy a fart, 9 done.
export const TUTORIAL_CASH = 40 // Cash to collect in step 1
export const TUTORIAL_CASH_2 = 450 // Cash to collect in step 6
export const TUTORIAL_POWER = 750 // Fart Power to reach in step 4
export const TUTORIAL_DONE_STEP = 9

// Where the red arrows lead in each step; `y` is the height of the bobbing
// arrow above the target.
const FOOD_PAD = BUY_PADS.find((p) => p.id === 'food')
const FART_PAD = BUY_PADS.find((p) => p.id === 'fart')

export const TUTORIAL_TARGETS = [
  { x: 0, z: DOOR.z + 1.2, y: DOOR.height + 1.6 }, // step 0: the first door
  { x: 0, z: DOORS[9].z + 1.2, y: DOOR.height + 1.6 }, // step 1 (collect cash): the 10th door
  { x: SPAWN.x, z: SPAWN.z, y: 2.4 }, // step 2 (go back): the hall, at the spawn
  { x: FOOD_PAD.x, z: FOOD_PAD.z, y: 3.4 }, // step 3: the FOOD-PAD
  { x: TABLES[3].x, z: TABLES[3].z, y: 2.6 }, // step 4: the west table beside the training pit
  { x: 0, z: DOOR.z + 1.2, y: DOOR.height + 1.6 }, // step 5: the first door again
  { x: 0, z: DOORS[9].z + 1.2, y: DOOR.height + 1.6 }, // step 6 (collect cash): the 10th door
  { x: SPAWN.x, z: SPAWN.z, y: 2.4 }, // step 7 (go back): the hall, at the spawn
  { x: FART_PAD.x, z: FART_PAD.z, y: 3.4 }, // step 8: the FART-PAD
]
