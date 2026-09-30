// Rebirth rules. Rebirth count 0 is Lv.1 / 1x; each Rebirth adds +1x to both
// the Cash doors pay and the Fart Power training gives.
export const REBIRTH_BASE_COST = 5000 // Fart Power needed for the first Rebirth
export const rebirthMult = (rebirths) => rebirths + 1
export const rebirthCost = (rebirths) => REBIRTH_BASE_COST * 2 ** rebirths // 5K, 10K, 20K, ...
