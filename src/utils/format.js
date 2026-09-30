const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi']

// Short game-style number: 1080 -> "1.08K", 3500000 -> "3.5M". Three
// significant digits once a suffix kicks in, trailing zeros trimmed.
export function formatShort(n) {
  if (!Number.isFinite(n)) return '0'
  const sign = n < 0 ? '-' : ''
  let v = Math.abs(n)
  if (v < 1000) return sign + String(Math.floor(v))
  let i = 0
  while (v >= 1000 && i < SUFFIXES.length - 1) {
    v /= 1000
    i++
  }
  const digits = v >= 100 ? 0 : v >= 10 ? 1 : 2
  const factor = 10 ** digits
  const fixed = (Math.floor(v * factor) / factor).toFixed(digits)
  const text = digits ? fixed.replace(/\.?0+$/, '') : fixed
  return sign + text + SUFFIXES[i]
}

// "21:42:19" from a number of seconds.
export function formatClock(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  const pad = (x) => String(x).padStart(2, '0')
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}
