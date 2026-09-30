# Player Progress

The six values that make up a player's progress in Fart to Break Doors. **None of these are implemented yet** — this file is the reference for when they are. Descriptions come from the stat names; anything marked *TBD* has not been decided.

| Stat | What it is | Kind |
| --- | --- | --- |
| Cash | Soft currency the player earns and spends | Currency, spendable |
| Fart Power | How strong the player's farts are; decides which doors they can break | Core stat, grows over time |
| Rebirth | Reset that trades progress for a permanent bonus | Prestige counter |
| Training Foods | Food items the player uses to train and raise Fart Power | Inventory / shop items |
| Farts | Count of farts the player has let out | Lifetime counter |
| Wins | Count of doors broken or rounds won | Lifetime counter |

## Cash
- Spendable currency, earned by breaking doors or winning.
- Spent on Training Foods (and any later shop items).
- Earning rate is *TBD*; a Rebirth may scale it.

## Fart Power
- Main strength stat. A door breaks when the fart is strong enough for it.
- Raised by eating Training Foods.
- Probably kept after a Rebirth only in part, or reset (*TBD*).

## Rebirth
- Integer count, starts at 0.
- Resetting gives a permanent multiplier, so later runs progress faster.
- What resets, what is kept, and the requirement to Rebirth are *TBD*.

## Training Foods
- Each food has a price in Cash and a Fart Power gain.
- Foods live in `data/foods.js` (placeholder prices/gains). Bought once with Cash, owned permanently, one equipped at a time; the equipped food adds its gain to Fart Power every 2 s while the player is in the TRAINING-PIT (`systems/foods.js`). Balance still *TBD*.

## Farts
- Lifetime count, only goes up. Useful for stats and leaderboards.
- Whether it resets on Rebirth is *TBD*.

## Wins
- Lifetime count of wins, only goes up.
- What counts as a win (a door broken, a round, a boss door) is *TBD*.

## Suggested shape (when built)
Slow-changing values belong in `store/useGameStore.js` (zustand), not in the per-frame `playerState.js`. A saved doc should be validated field by field when loaded:

```js
{ cash: 0, fartPower: 20, rebirths: 0, trainingFoods: {/* foodId: count */}, farts: 0, wins: 0 }
```

## Open questions
1. What does a Rebirth keep and reset?
2. How does Fart Power translate into breaking a door (threshold, or damage over time)?
3. Are Training Foods consumed when eaten, or owned permanently?
4. Are Farts and Wins saved between sessions, and where (Bloxity SDK or a backend)?
