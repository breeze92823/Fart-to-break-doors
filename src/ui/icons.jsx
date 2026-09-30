// Small inline SVG icons for the HUD, drawn to match the chunky outlined
// cartoon style. Sized by the parent via CSS (width/height 100%).

// Green isometric cash stack with a gold band.
export function CashIcon() {
  return (
    <svg viewBox="0 0 64 64" className="icon-svg" aria-hidden>
      <g stroke="#0b2a12" strokeWidth="3" strokeLinejoin="round">
        <polygon points="32,6 58,18 32,30 6,18" fill="#7fe07a" />
        <polygon points="6,18 32,30 32,58 6,46" fill="#2fa545" />
        <polygon points="58,18 32,30 32,58 58,46" fill="#1e7d34" />
      </g>
      <polygon points="18,12 44,24 44,30 18,18" fill="#ffd84a" opacity="0.95" />
      <polygon points="44,24 44,52 50,49 50,21" fill="#e6b92a" />
      <polygon points="44,24 50,21 24,9 18,12" fill="#fff09a" />
    </svg>
  )
}

// Premium-currency hexagon (the price tag on shop offers).
export function GemIcon() {
  return (
    <svg viewBox="0 0 64 64" className="icon-svg" aria-hidden>
      <polygon points="32,3 57,17.5 57,46.5 32,61 7,46.5 7,17.5" fill="#fff" stroke="#1a1a1a" strokeWidth="5" />
      <polygon points="32,17 45,24.5 45,39.5 32,47 19,39.5 19,24.5" fill="#1a1a1a" />
      <rect x="27" y="27" width="10" height="10" fill="#fff" />
    </svg>
  )
}

// White play-style arrow at the start of the Fart Power bar.
export function ArrowIcon() {
  return (
    <svg viewBox="0 0 64 64" className="icon-svg" aria-hidden>
      <polygon points="8,6 58,32 8,58 18,32" fill="#fff" stroke="#1a2440" strokeWidth="5" strokeLinejoin="round" />
    </svg>
  )
}
