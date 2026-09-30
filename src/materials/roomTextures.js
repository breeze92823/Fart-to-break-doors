import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { seededRandom } from '../utils/random.js'

// Canvas-painted textures for the cafeteria hall. Each painter runs once;
// results are cached by key so every mesh shares the same texture.
const cache = new Map()

function make(key, w, h, paint, { repeatX = 1, repeatY = 1 } = {}) {
  const cacheKey = `${key}:${repeatX}:${repeatY}`
  const hit = cache.get(cacheKey)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  paint(canvas.getContext('2d'), w, h)
  const t = new CanvasTexture(canvas)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 8
  if (repeatX !== 1 || repeatY !== 1) {
    t.wrapS = t.wrapT = RepeatWrapping
    t.repeat.set(repeatX, repeatY)
  }
  cache.set(cacheKey, t)
  return t
}

// One grey locker door; repeat X for a bank.
export function lockerTexture(count) {
  return make(
    'locker',
    128,
    320,
    (ctx, w, h) => {
      ctx.fillStyle = '#9aa3b3'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#b3bccb'
      ctx.fillRect(6, 6, w - 12, h - 12)
      // Vent slits near the top and bottom.
      ctx.fillStyle = '#5f6878'
      for (const y0 of [22, h - 70]) {
        for (let i = 0; i < 5; i++) ctx.fillRect(34, y0 + i * 9, w - 68, 4)
      }
      // Handle.
      ctx.fillStyle = '#4c5363'
      ctx.fillRect(w - 30, h / 2 - 22, 8, 44)
      // Gap between doors.
      ctx.fillStyle = '#3d4350'
      ctx.fillRect(0, 0, 3, h)
      ctx.fillRect(w - 3, 0, 3, h)
    },
    { repeatX: count },
  )
}

export function crateTexture() {
  return make('crate', 256, 256, (ctx, w, h) => {
    const rand = seededRandom(11)
    ctx.fillStyle = '#a8764a'
    ctx.fillRect(0, 0, w, h)
    // Planks.
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i % 2 ? '#b07e50' : '#9c6b40'
      ctx.fillRect(0, i * 64 + 2, w, 60)
    }
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(60,30,10,0.12)' : 'rgba(255,220,170,0.08)'
      ctx.fillRect(rand() * w, rand() * h, 10 + rand() * 30, 1.5)
    }
    // Frame + diagonal brace.
    ctx.strokeStyle = '#6e4526'
    ctx.lineWidth = 26
    ctx.strokeRect(13, 13, w - 26, h - 26)
    ctx.lineWidth = 22
    ctx.beginPath()
    ctx.moveTo(20, h - 20)
    ctx.lineTo(w - 20, 20)
    ctx.stroke()
  })
}

// Vertical planks with a band of slats up top: the face of one door leaf.
export function doorPlankTexture() {
  return make('doorPlanks', 256, 320, (ctx, w, h) => {
    const rand = seededRandom(5)
    ctx.fillStyle = '#5a321b'
    ctx.fillRect(0, 0, w, h)
    const planks = 7
    const pw = w / planks
    for (let i = 0; i < planks; i++) {
      const shade = 150 + Math.floor(rand() * 25)
      ctx.fillStyle = `rgb(${shade}, ${Math.floor(shade * 0.58)}, ${Math.floor(shade * 0.33)})`
      ctx.fillRect(i * pw + 2, 0, pw - 4, h)
    }
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(50,25,8,0.14)' : 'rgba(255,215,160,0.08)'
      ctx.fillRect(rand() * w, rand() * h, 1.5, 8 + rand() * 30)
    }
    // Slatted window band near the top.
    ctx.fillStyle = '#2c1a0e'
    for (let i = 0; i < 14; i++) ctx.fillRect(8 + i * 17.5, 22, 8, 36)
  })
}

// Yellow/black diagonal hazard stripes; repeat X along the threshold.
export function hazardTexture(repeatX) {
  return make(
    'hazard',
    128,
    32,
    (ctx, w, h) => {
      ctx.fillStyle = '#1d1d1d'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#ffd21f'
      for (let x = -h; x < w + h; x += 32) {
        ctx.beginPath()
        ctx.moveTo(x, h)
        ctx.lineTo(x + 16, h)
        ctx.lineTo(x + 16 + h, 0)
        ctx.lineTo(x + h, 0)
        ctx.fill()
      }
    },
    { repeatX },
  )
}

// Glowing fire-coloured chevrons painted on the floor, pointing "up" the
// texture (toward the door once laid down).
export function chevronTexture() {
  return make('chevrons', 256, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const rows = 4
    for (let i = 0; i < rows; i++) {
      const y = 70 + i * 115
      const grad = ctx.createLinearGradient(0, y - 30, 0, y + 30)
      grad.addColorStop(0, '#fff6a8')
      grad.addColorStop(0.5, '#ffb42a')
      grad.addColorStop(1, '#ff5a1a')
      ctx.strokeStyle = grad
      ctx.lineWidth = 12
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = '#ff6a00'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(14, y + 34)
      ctx.lineTo(w / 2, y)
      ctx.lineTo(w - 14, y + 34)
      ctx.stroke()
    }
  })
}

// Fluorescent panel: white diffuser with dark slots.
export function lightPanelTexture() {
  return make('lightPanel', 256, 96, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#c9d3e3'
    ctx.fillRect(0, 0, w, 8)
    ctx.fillRect(0, h - 8, w, 8)
    ctx.fillStyle = '#8d99b0'
    for (let i = 0; i < 4; i++) ctx.fillRect(58 + i * 40, 18, 10, h - 36)
  })
}

// The olive training-zone floor with a soft yellow glow inside its rim.
export function trainingFloorTexture() {
  return make('trainingFloor', 512, 512, (ctx, w, h) => {
    const rand = seededRandom(3)
    ctx.fillStyle = '#7d8471'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'
      ctx.fillRect(rand() * w, rand() * h, 2, 2)
    }
    const glow = 46
    const sides = [
      [0, 0, w, glow, 0, 0, 0, glow],
      [0, h - glow, w, glow, 0, h, 0, h - glow],
      [0, 0, glow, h, 0, 0, glow, 0],
      [w - glow, 0, glow, h, w, 0, w - glow, 0],
    ]
    for (const [x, y, sw, sh, gx0, gy0, gx1, gy1] of sides) {
      const g = ctx.createLinearGradient(gx0, gy0, gx1, gy1)
      g.addColorStop(0, 'rgba(255, 238, 120, 0.85)')
      g.addColorStop(1, 'rgba(255, 238, 120, 0)')
      ctx.fillStyle = g
      ctx.fillRect(x, y, sw, sh)
    }
    ctx.strokeStyle = '#fff3a0'
    ctx.lineWidth = 6
    ctx.strokeRect(3, 3, w - 6, h - 6)
  })
}

// Chunky outlined cartoon lettering on a transparent background.
export function signTexture(text, { fill = '#ffd21f', fill2 = '#ffb300', stroke = '#3a2a00', width = 1024, height = 160 } = {}) {
  return make(`sign:${text}:${fill}`, width, height, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    let size = h * 0.72
    ctx.font = `900 ${size}px "Arial Black", "Segoe UI Black", Impact, sans-serif`
    const measured = ctx.measureText(text).width
    if (measured > w * 0.94) {
      size *= (w * 0.94) / measured
      ctx.font = `900 ${size}px "Arial Black", "Segoe UI Black", Impact, sans-serif`
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = size * 0.16
    ctx.strokeStyle = stroke
    ctx.strokeText(text, w / 2, h / 2)
    const g = ctx.createLinearGradient(0, h / 2 - size / 2, 0, h / 2 + size / 2)
    g.addColorStop(0, fill)
    g.addColorStop(1, fill2)
    ctx.fillStyle = g
    ctx.fillText(text, w / 2, h / 2)
  })
}

// Leaderboard screen: header plus eight empty rank rows.
export function leaderboardTexture(header) {
  return make(`board:${header}`, 512, 400, (ctx, w, h) => {
    ctx.fillStyle = '#1f2c4a'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2f4675'
    ctx.fillRect(0, 0, w, 44)
    ctx.fillStyle = '#e8f0ff'
    ctx.font = 'bold 24px "Arial Black", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(header, w / 2, 23)
    ctx.textAlign = 'left'
    ctx.font = 'bold 20px Arial, sans-serif'
    for (let i = 0; i < 8; i++) {
      const y = 54 + i * 43
      ctx.fillStyle = i % 2 ? '#26365a' : '#2b3d66'
      ctx.fillRect(10, y, w - 20, 38)
      ctx.fillStyle = i < 3 ? ['#ffd24a', '#d9e2f0', '#e0975a'][i] : '#9fb2d6'
      ctx.fillText(`#${i + 1}`, 20, y + 20)
      ctx.fillStyle = '#44587f'
      ctx.beginPath()
      ctx.arc(80, y + 19, 13, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#6b7fa6'
      ctx.fillText('- - -', 104, y + 20)
    }
  })
}
