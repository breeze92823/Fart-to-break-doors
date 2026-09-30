import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { seededRandom } from '../utils/random.js'
import { formatShort } from '../utils/format.js'

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

// Plain vertical planks: the solid lower panel of one door leaf.
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
  })
}

// Marbled grey stone with darker horizontal bands: the gate leaves of the later doors.
export function doorStoneTexture() {
  return make('doorStone', 256, 320, (ctx, w, h) => {
    const rand = seededRandom(9)
    ctx.fillStyle = '#7d8190'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 900; i++) {
      const v = 70 + Math.floor(rand() * 110)
      ctx.fillStyle = `rgba(${v}, ${v}, ${v + 12}, 0.25)`
      ctx.beginPath()
      ctx.ellipse(rand() * w, rand() * h, 3 + rand() * 16, 2 + rand() * 9, rand() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    // Dark horizontal slabs across the leaf.
    ctx.fillStyle = 'rgba(40, 42, 54, 0.45)'
    for (const y of [0.16, 0.5, 0.84]) ctx.fillRect(0, h * y - 22, w, 44)
    ctx.fillStyle = 'rgba(20, 20, 28, 0.6)'
    for (const y of [0.33, 0.67]) ctx.fillRect(0, h * y - 1.5, w, 3)
  })
}

// Rusty riveted steel: blue-grey metal under orange corrosion, with bolted
// horizontal plates. The gate leaves of doors 11-15.
export function doorRustTexture() {
  return make('doorRust', 256, 320, (ctx, w, h) => {
    const rand = seededRandom(21)
    ctx.fillStyle = '#8a93a8'
    ctx.fillRect(0, 0, w, h)
    const blot = (n, colors, rMin, rMax) => {
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = colors[Math.floor(rand() * colors.length)]
        ctx.beginPath()
        ctx.ellipse(rand() * w, rand() * h, rMin + rand() * rMax, rMin + rand() * rMax * 0.8, rand() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    blot(260, ['rgba(120,135,165,0.35)', 'rgba(200,210,230,0.25)'], 4, 18)
    // Darker recessed plates with bolts.
    for (const y of [0.3, 0.72]) {
      ctx.fillStyle = 'rgba(60,70,95,0.4)'
      ctx.fillRect(10, h * y - 26, w - 20, 52)
      ctx.fillStyle = 'rgba(230,235,245,0.75)'
      for (const x of [0.15, 0.4, 0.65, 0.88]) {
        ctx.beginPath()
        ctx.arc(w * x, h * y, 7, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // Rust over the top.
    blot(420, ['rgba(196,108,52,0.45)', 'rgba(170,82,36,0.4)', 'rgba(225,140,80,0.35)'], 3, 14)
    blot(500, ['rgba(214,122,62,0.5)', 'rgba(150,70,30,0.35)'], 1, 5)
    ctx.strokeStyle = 'rgba(40,30,30,0.55)'
    ctx.lineWidth = 3
    ctx.strokeRect(1.5, 1.5, w - 3, h - 3)
  })
}

// Navy marble gate leaf: white marble skirt, a hazard stripe, then a barred
// glass window in a marble frame. The gate leaves of doors 16-20.
export function doorGlassTexture() {
  return make('doorGlass', 256, 320, (ctx, w, h) => {
    const rand = seededRandom(33)
    const marble = (x, y, mw, mh, base, n) => {
      ctx.fillStyle = base
      ctx.fillRect(x, y, mw, mh)
      for (let i = 0; i < n; i++) {
        const v = Math.floor(rand() * 90)
        ctx.fillStyle = rand() < 0.5 ? `rgba(${40 + v}, ${60 + v}, ${95 + v}, 0.35)` : 'rgba(10,18,40,0.3)'
        ctx.beginPath()
        ctx.ellipse(x + rand() * mw, y + rand() * mh, 3 + rand() * 12, 2 + rand() * 7, rand() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // Top frame block (the texture's y=0 is the top of the leaf).
    marble(0, 0, w, h, '#33405e', 500)
    // Barred glass window.
    const gx = 14, gy = 30, gw = w - 28, gh = 130
    ctx.fillStyle = '#9fe6ff'
    ctx.fillRect(gx, gy, gw, gh)
    const grad = ctx.createLinearGradient(0, gy, 0, gy + gh)
    grad.addColorStop(0, 'rgba(255,255,255,0.45)')
    grad.addColorStop(1, 'rgba(60,170,220,0.2)')
    ctx.fillStyle = grad
    ctx.fillRect(gx, gy, gw, gh)
    ctx.fillStyle = '#4a4f78'
    for (let i = 0; i <= 6; i++) ctx.fillRect(gx + (i * (gw - 8)) / 6, gy, 8, gh)
    ctx.fillRect(gx, gy, gw, 8)
    ctx.fillRect(gx, gy + gh - 8, gw, 8)
    // Hazard stripe.
    const hy = 176, hh = 50
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, hy, w, hh)
    ctx.clip()
    ctx.fillStyle = '#1d1d1d'
    ctx.fillRect(0, hy, w, hh)
    ctx.fillStyle = '#ffd21f'
    for (let x = -hh; x < w + hh; x += 48) {
      ctx.beginPath()
      ctx.moveTo(x, hy + hh)
      ctx.lineTo(x + 24, hy + hh)
      ctx.lineTo(x + 24 + hh, hy)
      ctx.lineTo(x + hh, hy)
      ctx.fill()
    }
    ctx.restore()
    // White marble skirt.
    marble(6, hy + hh + 4, w - 12, h - hy - hh - 10, '#e4eaec', 120)
    ctx.strokeStyle = 'rgba(20,28,50,0.7)'
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, w - 4, h - 4)
  })
}

// Blue-grey steel plates studded with rivets (4 rows of 6). The gate leaves of doors 21-25.
export function doorSteelTexture() {
  return make('doorSteel', 256, 320, (ctx, w, h) => {
    const rand = seededRandom(47)
    ctx.fillStyle = '#6b7ba0'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 300; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(150,165,205,0.12)' : 'rgba(40,50,85,0.1)'
      ctx.fillRect(rand() * w, rand() * h, 6 + rand() * 30, 6 + rand() * 20)
    }
    // Plate seams: one across the middle, a lighter one along the outer edge.
    ctx.fillStyle = 'rgba(30,38,70,0.55)'
    ctx.fillRect(0, h / 2 - 2, w, 4)
    ctx.fillStyle = 'rgba(170,185,225,0.35)'
    ctx.fillRect(0, h / 2 + 2, w, 2)
    ctx.fillStyle = 'rgba(30,38,70,0.4)'
    ctx.fillRect(0, 0, w, 5)
    ctx.fillRect(0, h - 5, w, 5)
    for (const fy of [0.14, 0.38, 0.62, 0.86]) {
      for (let i = 0; i < 6; i++) {
        const x = 22 + i * ((w - 44) / 5)
        ctx.fillStyle = 'rgba(25,32,60,0.35)'
        ctx.beginPath()
        ctx.arc(x + 1.5, h * fy + 2, 8, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#d6e0f5'
        ctx.beginPath()
        ctx.arc(x, h * fy, 7, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  })
}

// Teal diamond-plate steel with a rivet row across the middle. The gate leaves of doors 26-30.
export function doorDiamondTexture() {
  return make('doorDiamond', 256, 320, (ctx, w, h) => {
    const rand = seededRandom(61)
    ctx.fillStyle = '#58b8c0'
    ctx.fillRect(0, 0, w, h)
    // Tread-plate lugs: short diagonal dashes in alternating directions.
    ctx.lineCap = 'round'
    ctx.lineWidth = 3
    const step = 16
    for (let y = 0; y < h + step; y += step) {
      for (let x = 0; x < w + step; x += step) {
        const flip = ((x / step + y / step) & 1) === 0
        const dx = flip ? 5 : -5
        ctx.strokeStyle = 'rgba(20,80,90,0.45)'
        ctx.beginPath()
        ctx.moveTo(x - dx, y - 5 + 1.5)
        ctx.lineTo(x + dx, y + 5 + 1.5)
        ctx.stroke()
        ctx.strokeStyle = 'rgba(200,250,255,0.6)'
        ctx.beginPath()
        ctx.moveTo(x - dx, y - 5)
        ctx.lineTo(x + dx, y + 5)
        ctx.stroke()
      }
    }
    for (let i = 0; i < 160; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(10,50,60,0.06)'
      ctx.fillRect(rand() * w, rand() * h, 10 + rand() * 30, 8 + rand() * 20)
    }
    // Rivet row across the middle.
    ctx.fillStyle = '#d8f8fc'
    for (let x = 12; x < w; x += 22) {
      ctx.beginPath()
      ctx.arc(x, h / 2, 4.5, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

// Lavender steel plate: rivet rows top and bottom around a darker riveted band. Doors 31-35.
export function doorPurpleTexture() {
  return make('doorPurple', 256, 320, (ctx, w, h) => {
    const rand = seededRandom(73)
    ctx.fillStyle = '#8b8bd6'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(200,200,255,0.08)' : 'rgba(50,50,120,0.08)'
      ctx.fillRect(rand() * w, rand() * h, 8 + rand() * 30, 6 + rand() * 20)
    }
    ctx.fillStyle = 'rgba(60,60,130,0.6)'
    ctx.fillRect(0, h * 0.44, w, h * 0.12)
    const rivets = (y) => {
      for (let i = 0; i < 4; i++) {
        const x = 34 + i * ((w - 68) / 3)
        ctx.fillStyle = 'rgba(30,30,80,0.4)'
        ctx.beginPath()
        ctx.ellipse(x + 1, y + 1.5, 7, 6, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#3d3d86'
        ctx.beginPath()
        ctx.ellipse(x, y, 7, 6, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    rivets(h * 0.06)
    rivets(h * 0.5)
    rivets(h * 0.94)
  })
}

// Yellow/black diagonal stripes on a tall post.
export function doorPostTexture() {
  return make('doorPost', 64, 256, (ctx, w, h) => {
    ctx.fillStyle = '#1d1d1d'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ffd21f'
    for (let y = -w; y < h + w; y += 64) {
      ctx.beginPath()
      ctx.moveTo(0, y + 32)
      ctx.lineTo(0, y)
      ctx.lineTo(w, y - w)
      ctx.lineTo(w, y - w + 32)
      ctx.fill()
    }
  })
}

// Black scuffed steel with a dark-red X brace and a pale-blue ringed emblem. Doors 36-40.
export function doorBlackTexture() {
  return make('doorBlack', 256, 320, (ctx, w, h) => {
    const rand = seededRandom(83)
    ctx.fillStyle = '#26272c'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 500; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(150,150,165,0.07)' : 'rgba(0,0,0,0.18)'
      ctx.fillRect(rand() * w, rand() * h, 2 + rand() * 24, 1 + rand() * 6)
    }
    // Inset panel border.
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'
    ctx.lineWidth = 8
    ctx.strokeRect(14, 14, w - 28, h - 28)
    // Dark-red X brace.
    ctx.strokeStyle = '#4a1d1d'
    ctx.lineWidth = 26
    ctx.beginPath()
    ctx.moveTo(22, 22)
    ctx.lineTo(w - 22, h - 22)
    ctx.moveTo(w - 22, 22)
    ctx.lineTo(22, h - 22)
    ctx.stroke()
    // Emblem: broken outer ring, inner ring, three inward arrows.
    const cx = w / 2, cy = h / 2, R = 62
    ctx.strokeStyle = 'rgba(200,225,245,0.9)'
    ctx.fillStyle = 'rgba(200,225,245,0.9)'
    ctx.lineWidth = 9
    for (let k = 0; k < 3; k++) {
      const a0 = k * ((Math.PI * 2) / 3) + 0.25
      ctx.beginPath()
      ctx.arc(cx, cy, R, a0, a0 + 1.7)
      ctx.stroke()
    }
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(cx, cy, R * 0.62, 0, Math.PI * 2)
    ctx.stroke()
    for (let k = 0; k < 3; k++) {
      const a = -Math.PI / 2 + k * ((Math.PI * 2) / 3)
      ctx.save()
      ctx.translate(cx + Math.cos(a) * R * 0.3, cy + Math.sin(a) * R * 0.3)
      ctx.rotate(a + Math.PI / 2)
      ctx.beginPath()
      ctx.moveTo(0, 10)
      ctx.lineTo(-10, -8)
      ctx.lineTo(10, -8)
      ctx.fill()
      ctx.restore()
    }
  })
}

// Vault leaf: rivet rows, an inset panel and a spoked wheel, in the given palette.
function vaultTexture(key, c) {
  return make(key, 256, 320, (ctx, w, h) => {
    ctx.fillStyle = c.base
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = c.panel
    ctx.fillRect(10, 10, w - 20, h - 20)
    ctx.strokeStyle = c.dark
    ctx.lineWidth = 6
    ctx.strokeRect(10, 10, w - 20, h - 20)
    // Rivet rows top and bottom.
    for (const y of [32, h - 32]) {
      for (let x = 26; x < w - 16; x += 26) {
        ctx.fillStyle = c.dark
        ctx.beginPath()
        ctx.ellipse(x + 1, y + 2, 7, 5, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = c.light
        ctx.beginPath()
        ctx.ellipse(x, y, 7, 5, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // Wheel.
    const cx = w / 2, cy = h / 2, R = 78
    ctx.lineWidth = 12
    ctx.strokeStyle = c.ring
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = 5
    ctx.strokeStyle = c.light
    ctx.beginPath()
    ctx.arc(cx, cy, R + 6, 0, Math.PI * 2)
    ctx.stroke()
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4
      ctx.lineWidth = 10
      ctx.strokeStyle = c.spoke
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(a) * (R + 16), cy + Math.sin(a) * (R + 16))
      ctx.stroke()
      ctx.fillStyle = c.knob
      ctx.beginPath()
      ctx.arc(cx + Math.cos(a) * (R + 16), cy + Math.sin(a) * (R + 16), 8, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = c.hub
    ctx.beginPath()
    ctx.arc(cx, cy, 24, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = c.knob
    ctx.lineWidth = 5
    ctx.stroke()
  })
}

// Gold vault leaf. Doors 41-45.
export const doorGoldTexture = () =>
  vaultTexture('doorGold', { base: '#f2c814', panel: '#ffe24a', dark: '#c99a0c', light: '#fff07a', ring: '#d9a511', spoke: '#e0ac12', knob: '#b8830a', hub: '#ffd21f' })

// Ice-blue vault leaf. Doors 46-50.
export const doorIceTexture = () =>
  vaultTexture('doorIce', { base: '#9fbce8', panel: '#dbe8fb', dark: '#6f8bc0', light: '#f4f8ff', ring: '#8aa6d8', spoke: '#a9c0ea', knob: '#5f7cb4', hub: '#c8daf6' })

// Speckled grey-blue concrete floor, tiled.
export function speckleFloorTexture(repeat) {
  return make(
    'speckleFloor',
    256,
    256,
    (ctx, w, h) => {
      const rand = seededRandom(97)
      ctx.fillStyle = '#6f7a92'
      ctx.fillRect(0, 0, w, h)
      for (let i = 0; i < 6000; i++) {
        const v = 70 + Math.floor(rand() * 110)
        ctx.fillStyle = `rgba(${v}, ${v + 6}, ${v + 22}, 0.55)`
        ctx.fillRect(rand() * w, rand() * h, 1 + rand() * 3, 1 + rand() * 3)
      }
    },
    { repeatX: repeat, repeatY: repeat },
  )
}

// Small cell window: a steel frame round bright sky-blue glass behind vertical bars.
export function barredWindowTexture() {
  return make('barredWindow', 128, 96, (ctx, w, h) => {
    ctx.fillStyle = '#4b5a80'
    ctx.fillRect(0, 0, w, h)
    const g = ctx.createLinearGradient(0, 8, 0, h - 8)
    g.addColorStop(0, '#ffffff')
    g.addColorStop(1, '#bfe6ff')
    ctx.fillStyle = g
    ctx.fillRect(9, 9, w - 18, h - 18)
    ctx.fillStyle = '#56648c'
    for (let i = 1; i < 6; i++) ctx.fillRect(9 + (i * (w - 18)) / 6 - 3, 9, 6, h - 18)
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

// Fluorescent fitting: bright white diffuser, thin grey rim and a few dark
// cross-bars, like the tube strips on the reference ceiling.
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

// Training-zone ring floor: slate lavender-blue with fine speckle, a soft
// yellow glow inside the outer rim and a thin pale line on the very edge.
export function trainingFloorTexture() {
  return make('trainingFloor', 512, 512, (ctx, w, h) => {
    const rand = seededRandom(3)
    ctx.fillStyle = '#8c9bd2'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 3500; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(20,30,90,0.07)' : 'rgba(255,255,255,0.06)'
      ctx.fillRect(rand() * w, rand() * h, 2, 2)
    }
    edgeGlow(ctx, w, h, 30, 'rgba(255, 244, 150, 0.8)')
    ctx.strokeStyle = '#fffbd0'
    ctx.lineWidth = 5
    ctx.strokeRect(2.5, 2.5, w - 5, h - 5)
  })
}

// Bright white pit floor with a strong yellow glow creeping in from every edge.
export function trainingPitTexture() {
  return make('trainingPit', 256, 512, (ctx, w, h) => {
    ctx.fillStyle = '#fbfdff'
    ctx.fillRect(0, 0, w, h)
    edgeGlow(ctx, w, h, 40, 'rgba(255, 236, 90, 0.95)')
    ctx.strokeStyle = '#fff6a0'
    ctx.lineWidth = 6
    ctx.strokeRect(3, 3, w - 6, h - 6)
  })
}

// Vertical light curtain: opaque yellow at the floor fading to nothing.
export function glowCurtainTexture() {
  return make('glowCurtain', 4, 64, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, h, 0, 0)
    g.addColorStop(0, 'rgba(255, 240, 110, 0.85)')
    g.addColorStop(0.5, 'rgba(255, 240, 110, 0.25)')
    g.addColorStop(1, 'rgba(255, 240, 110, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

// Gradient of `color` fading to transparent inward from all four edges.
function edgeGlow(ctx, w, h, size, color) {
  const clear = color.replace(/[\d.]+\)$/, '0)')
  const sides = [
    [0, 0, w, size, 0, 0, 0, size],
    [0, h - size, w, size, 0, h, 0, h - size],
    [0, 0, size, h, 0, 0, size, 0],
    [w - size, 0, size, h, w, 0, w - size, 0],
  ]
  for (const [x, y, sw, sh, gx0, gy0, gx1, gy1] of sides) {
    const g = ctx.createLinearGradient(gx0, gy0, gx1, gy1)
    g.addColorStop(0, color)
    g.addColorStop(1, clear)
    ctx.fillStyle = g
    ctx.fillRect(x, y, sw, sh)
  }
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

// Leaderboard screen: header plus eight rank rows. Uncached and repainted in
// place: `update(rows, selfId)` takes [{ id, name, value }] best-first.
export function createLeaderboardBoard(header) {
  const w = 512
  const h = 400
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 8

  function update(rows = [], selfId = '') {
    ctx.fillStyle = '#1f2c4a'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#2f4675'
    ctx.fillRect(0, 0, w, 44)
    ctx.fillStyle = '#e8f0ff'
    ctx.font = 'bold 24px "Arial Black", Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(header, w / 2, 23)
    ctx.font = 'bold 20px Arial, sans-serif'
    for (let i = 0; i < 8; i++) {
      const y = 54 + i * 43
      const row = rows[i]
      const me = row && row.id === selfId
      ctx.fillStyle = me ? '#3d5a20' : i % 2 ? '#26365a' : '#2b3d66'
      ctx.fillRect(10, y, w - 20, 38)
      ctx.textAlign = 'left'
      ctx.fillStyle = i < 3 ? ['#ffd24a', '#d9e2f0', '#e0975a'][i] : '#9fb2d6'
      ctx.fillText(`#${i + 1}`, 20, y + 20)
      ctx.fillStyle = row ? '#5f78ad' : '#44587f'
      ctx.beginPath()
      ctx.arc(80, y + 19, 13, 0, Math.PI * 2)
      ctx.fill()
      if (!row) {
        ctx.fillStyle = '#6b7fa6'
        ctx.fillText('- - -', 104, y + 20)
        continue
      }
      ctx.fillStyle = me ? '#d9ff9a' : '#e8f0ff'
      let name = String(row.name || 'Player')
      while (name.length > 1 && ctx.measureText(name).width > 220) name = name.slice(0, -1)
      ctx.fillText(name, 104, y + 20)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffe27a'
      ctx.fillText(formatShort(row.value), w - 22, y + 20)
    }
    texture.needsUpdate = true
  }

  update()
  return { texture, update }
}

// Egg skins for the shop, painted on an equirectangular canvas.
export function eggTexture(kind) {
  return make(`egg:${kind}`, 256, 256, (ctx, w, h) => {
    const rand = seededRandom(kind.length * 17 + 5)
    const base = {
      plain: ['#fbf8f2', '#e9e2d4'],
      gold: ['#fff1c0', '#e8c66a'],
      nest: ['#a89476', '#7c6a52'],
      galaxy: ['#6a4bd8', '#160d52'],
    }[kind]
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, base[0])
    g.addColorStop(1, base[1])
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    if (kind === 'plain') {
      ctx.fillStyle = 'rgba(150,90,60,0.55)'
      for (let i = 0; i < 6; i++) ctx.fillRect(rand() * w, h * 0.35 + rand() * h * 0.4, 5, 4)
    } else if (kind === 'nest') {
      ctx.fillStyle = 'rgba(50,35,20,0.5)'
      for (let i = 0; i < 40; i++) {
        ctx.beginPath()
        ctx.arc(rand() * w, rand() * h, 3 + rand() * 6, 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (kind === 'gold') {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      for (let i = 0; i < 25; i++) ctx.fillRect(rand() * w, rand() * h, 3, 3)
    } else {
      for (let i = 0; i < 220; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + rand() * 0.7})`
        const r = rand() < 0.1 ? 3 : 1.5
        ctx.fillRect(rand() * w, rand() * h, r, r)
      }
      for (let i = 0; i < 4; i++) {
        const cx = rand() * w
        const cy = rand() * h
        const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90)
        g2.addColorStop(0, 'rgba(180,90,255,0.35)')
        g2.addColorStop(1, 'rgba(180,90,255,0)')
        ctx.fillStyle = g2
        ctx.fillRect(0, 0, w, h)
      }
      // Crescent moon.
      ctx.fillStyle = '#f5f1ff'
      ctx.beginPath()
      ctx.arc(w * 0.3, h * 0.42, 34, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#2a1a78'
      ctx.beginPath()
      ctx.arc(w * 0.3 + 14, h * 0.42 - 5, 32, 0, Math.PI * 2)
      ctx.fill()
    }
  })
}

// Floating price label: currency icon plus outlined text, drawn on a
// transparent canvas for a sprite. `gems` swaps the Cash stack for the
// white hexagon and white text.
export function priceTagTexture(text, gems = false) {
  return make(`price:${text}:${gems}`, 512, 160, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const iconX = 60
    const cy = h / 2
    ctx.lineJoin = 'round'
    if (gems) {
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#111'
      ctx.lineWidth = 8
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i + Math.PI / 6
        ctx.lineTo(iconX + Math.cos(a) * 50, cy + Math.sin(a) * 50)
      }
      ctx.closePath()
      ctx.stroke()
      ctx.fill()
      ctx.fillStyle = '#111'
      ctx.fillRect(iconX - 15, cy - 15, 30, 30)
    } else {
      ctx.strokeStyle = '#0b2a12'
      ctx.lineWidth = 7
      const face = (pts, fill) => {
        ctx.beginPath()
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
        ctx.closePath()
        ctx.fillStyle = fill
        ctx.stroke()
        ctx.fill()
      }
      face([[iconX, cy - 44], [iconX + 46, cy - 22], [iconX, cy], [iconX - 46, cy - 22]], '#7fe07a')
      face([[iconX - 46, cy - 22], [iconX, cy], [iconX, cy + 46], [iconX - 46, cy + 24]], '#2fa545')
      face([[iconX + 46, cy - 22], [iconX, cy], [iconX, cy + 46], [iconX + 46, cy + 24]], '#1e7d34')
    }
    ctx.font = '900 96px "Arial Black", "Segoe UI Black", Impact, sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 16
    ctx.strokeStyle = '#111'
    ctx.strokeText(text, 130, cy + 4)
    ctx.fillStyle = gems ? '#ffffff' : '#41ff5a'
    ctx.fillText(text, 130, cy + 4)
  })
}

// Floating requirement label: "REBIRTH REQUIRED" over the rebirth count, both
// outlined, on a transparent canvas for a sprite.
export function rebirthTagTexture(n) {
  return make(`rebirthTag:${n}`, 512, 160, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.lineJoin = 'round'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const line = (text, size, y, fill) => {
      ctx.font = `900 ${size}px "Arial Black", "Segoe UI Black", Impact, sans-serif`
      ctx.lineWidth = size * 0.17
      ctx.strokeStyle = '#111'
      ctx.strokeText(text, w / 2, y)
      ctx.fillStyle = fill
      ctx.fillText(text, w / 2, y)
    }
    line('REBIRTH REQUIRED', 34, 52, '#ffffff')
    line(String(n), 50, 100, '#ffd23f')
  })
}

// Wooden signpost plank: "You earn Cash offline!" on brown boards with a
// little Cash stack at each end.
export function offlineSignTexture() {
  return make('offlineSign', 512, 256, (ctx, w, h) => {
    const rand = seededRandom(9)
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#b45f31')
    g.addColorStop(1, '#8a3f1e')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(40,15,5,0.35)'
    for (let y = 0; y <= h; y += h / 2) ctx.fillRect(0, y - 2, w, 4)
    for (let i = 0; i < 260; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(60,25,8,0.18)' : 'rgba(255,210,150,0.10)'
      ctx.fillRect(rand() * w, rand() * h, 20 + rand() * 60, 2)
    }
    ctx.strokeStyle = '#5a2a12'
    ctx.lineWidth = 12
    ctx.strokeRect(6, 6, w - 12, h - 12)
    const cash = (x, y) => {
      ctx.fillStyle = '#39c957'
      ctx.strokeStyle = '#0b3d1a'
      ctx.lineWidth = 4
      ctx.fillRect(x, y, 46, 30)
      ctx.strokeRect(x, y, 46, 30)
      ctx.fillStyle = '#c9ffd2'
      ctx.beginPath()
      ctx.arc(x + 23, y + 15, 8, 0, Math.PI * 2)
      ctx.fill()
    }
    cash(28, 40)
    cash(w - 74, 40)
    ctx.font = '800 62px "Arial Rounded MT Bold", "Arial Black", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 12
    ctx.strokeStyle = '#3a1808'
    ctx.fillStyle = '#ffffff'
    for (const [t, y] of [['You earn Cash', 88], ['offline!', 176]]) {
      ctx.strokeText(t, w / 2, y)
      ctx.fillText(t, w / 2, y)
    }
  })
}

// Two-line pad label: small heading, then a Cash icon and the price.
export function padLabelTexture(title, price) {
  return make(`padLabel:${title}:${price}`, 512, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.lineJoin = 'round'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    ctx.font = '900 66px "Arial Black", Impact, sans-serif'
    ctx.lineWidth = 18
    ctx.strokeStyle = '#0b2a12'
    ctx.strokeText(title, w / 2, 62)
    ctx.fillStyle = '#5bff4a'
    ctx.fillText(title, w / 2, 62)
    // Cash stack
    const ix = 90
    const cy = 170
    ctx.lineWidth = 7
    ctx.strokeStyle = '#0b2a12'
    const face = (pts, fill) => {
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
      ctx.closePath()
      ctx.fillStyle = fill
      ctx.stroke()
      ctx.fill()
    }
    face([[ix, cy - 44], [ix + 46, cy - 22], [ix, cy], [ix - 46, cy - 22]], '#7fe07a')
    face([[ix - 46, cy - 22], [ix, cy], [ix, cy + 46], [ix - 46, cy + 24]], '#2fa545')
    face([[ix + 46, cy - 22], [ix, cy], [ix, cy + 46], [ix + 46, cy + 24]], '#1e7d34')
    ctx.textAlign = 'left'
    ctx.font = '900 120px "Arial Black", Impact, sans-serif'
    ctx.lineWidth = 20
    ctx.strokeText(price, 170, cy + 6)
    ctx.fillStyle = '#5bff4a'
    ctx.fillText(price, 170, cy + 6)
  })
}

// Spin pad marker: "FREE!" over a rainbow wheel with its "x3" reward.
export function spinTagTexture(reward) {
  return make(`spinTag:${reward}`, 256, 384, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.lineJoin = 'round'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '900 72px "Arial Black", Impact, sans-serif'
    ctx.lineWidth = 16
    ctx.strokeStyle = '#06323a'
    ctx.strokeText('FREE!', w / 2, 52)
    ctx.fillStyle = '#39f0e0'
    ctx.fillText('FREE!', w / 2, 52)
    const cx = w / 2
    const cy = 215
    const r = 92
    const grad = ctx.createConicGradient(0, cx, cy)
    ;['#ff2a2a', '#ff8a00', '#ffe600', '#2fd12f', '#16c3ff', '#3d5bff', '#b02bff', '#ff2ab4', '#ff2a2a'].forEach((c, i, a) => grad.addColorStop(i / (a.length - 1), c))
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.lineWidth = 8
    ctx.strokeStyle = '#fff'
    ctx.stroke()
    ctx.font = '900 92px "Arial Black", Impact, sans-serif'
    ctx.lineWidth = 18
    ctx.strokeStyle = '#111'
    ctx.strokeText(reward, cx + 30, cy + 78)
    ctx.fillStyle = '#fff'
    ctx.fillText(reward, cx + 30, cy + 78)
  })
}

// Door health tag: "Level: N" over a green bar reading "hp/max".
export function doorTagTexture(level, hp, max) {
  return make(`doorTag:${level}:${hp}:${max}`, 512, 160, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.font = '800 62px "Arial Rounded MT Bold", "Arial Black", sans-serif'
    ctx.lineWidth = 12
    ctx.strokeStyle = '#111'
    ctx.strokeText(`Level: ${level}`, w / 2, 40)
    ctx.fillStyle = '#fff'
    ctx.fillText(`Level: ${level}`, w / 2, 40)
    const bx = 30
    const by = 84
    const bw = w - 60
    const bh = 56
    const r = bh / 2
    const pill = (x, y, ww, hh) => {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + ww, y, x + ww, y + hh, r)
      ctx.arcTo(x + ww, y + hh, x, y + hh, r)
      ctx.arcTo(x, y + hh, x, y, r)
      ctx.arcTo(x, y, x + ww, y, r)
      ctx.closePath()
    }
    pill(bx, by, bw, bh)
    ctx.fillStyle = '#12351d'
    ctx.fill()
    const frac = Math.max(0.06, Math.min(1, hp / max))
    pill(bx, by, bw * frac, bh)
    const g = ctx.createLinearGradient(0, by, 0, by + bh)
    g.addColorStop(0, '#5dff8a')
    g.addColorStop(1, '#14c85a')
    ctx.fillStyle = g
    ctx.fill()
    pill(bx, by, bw, bh)
    ctx.lineWidth = 6
    ctx.strokeStyle = '#111'
    ctx.stroke()
    ctx.font = '800 40px "Arial Rounded MT Bold", "Arial Black", sans-serif'
    ctx.lineWidth = 8
    ctx.strokeText(`${formatShort(hp)}/${formatShort(max)}`, w / 2, by + bh / 2 + 2)
    ctx.fillStyle = '#fff'
    ctx.fillText(`${formatShort(hp)}/${formatShort(max)}`, w / 2, by + bh / 2 + 2)
  })
}

// Glowing portal interior: pink-white core fading to violet at the edges.
export function portalGlowTexture() {
  return make('portalGlow', 128, 256, (ctx, w, h) => {
    const rand = seededRandom(21)
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#ff8cf2')
    g.addColorStop(0.55, '#e83fe6')
    g.addColorStop(1, '#a01ad8')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    const core = ctx.createRadialGradient(w / 2, h * 0.5, 4, w / 2, h * 0.5, h * 0.55)
    core.addColorStop(0, 'rgba(255,235,255,0.9)')
    core.addColorStop(1, 'rgba(255,235,255,0)')
    ctx.fillStyle = core
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.05 + rand() * 0.1})`
      ctx.fillRect(rand() * w, 0, 2 + rand() * 4, h)
    }
  })
}

// Pink pool of light spilling onto the floor in front of the portal.
export function portalFloorGlowTexture() {
  return make('portalFloor', 128, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2)
    g.addColorStop(0, 'rgba(255, 90, 240, 0.85)')
    g.addColorStop(1, 'rgba(255, 90, 240, 0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

// "PORTAL" title in glowing magenta lettering.
export function portalTitleTexture() {
  return signTexture('PORTAL', { fill: '#ff86f6', fill2: '#d21ce0', stroke: '#2c0a44', width: 512, height: 160 })
}

// Requirement rows: a crown and a ball icon, each with its number.
export function portalReqTexture(rebirths, power) {
  return make(`portalReq:${rebirths}:${power}`, 256, 192, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    ctx.lineJoin = 'round'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'left'
    const number = (n, y) => {
      ctx.font = '900 74px "Arial Black", Impact, sans-serif'
      ctx.lineWidth = 14
      ctx.strokeStyle = '#111'
      ctx.strokeText(String(n), 130, y)
      ctx.fillStyle = '#fff'
      ctx.fillText(String(n), 130, y)
    }
    // crown
    const cy = 50
    ctx.beginPath()
    ctx.moveTo(30, cy + 26)
    ctx.lineTo(22, cy - 24)
    ctx.lineTo(46, cy - 4)
    ctx.lineTo(64, cy - 32)
    ctx.lineTo(82, cy - 4)
    ctx.lineTo(106, cy - 24)
    ctx.lineTo(98, cy + 26)
    ctx.closePath()
    ctx.fillStyle = '#ffcf2a'
    ctx.strokeStyle = '#5a3a00'
    ctx.lineWidth = 7
    ctx.stroke()
    ctx.fill()
    number(rebirths, cy)
    // ball
    const by = 146
    ctx.lineWidth = 7
    ctx.strokeStyle = '#111'
    ctx.beginPath()
    ctx.arc(64, by, 34, Math.PI, 0)
    ctx.closePath()
    ctx.fillStyle = '#ee2a3a'
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(64, by, 34, 0, Math.PI)
    ctx.closePath()
    ctx.fillStyle = '#f4f4f4'
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(64, by, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.stroke()
    number(power, by)
  })
}

// Three transparent crack layers for a door leaf; each stage of damage shows one more.
let doorCracks
export function doorCrackTextures() {
  if (doorCracks) return doorCracks
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  doorCracks = [0, 1, 2].map((layer) => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 384
    const ctx = c.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const branch = (x, y, a, len, w, depth) => {
      ctx.lineWidth = w
      ctx.beginPath()
      ctx.moveTo(x, y)
      const steps = 7
      for (let i = 0; i < steps; i += 1) {
        a += (rnd() - 0.5) * 0.9
        x += Math.cos(a) * (len / steps)
        y += Math.sin(a) * (len / steps)
        ctx.lineTo(x, y)
        if (depth > 0 && rnd() < 0.35) branch(x, y, a + (rnd() < 0.5 ? 0.9 : -0.9), len * 0.45, w * 0.65, depth - 1)
      }
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(12,6,3,0.92)'
    const n = 3 + layer * 2
    for (let i = 0; i < n; i += 1) {
      const edge = rnd() * Math.PI * 2
      const ox = 128 + Math.cos(edge) * 40 * rnd()
      const oy = 192 + Math.sin(edge) * 70 * rnd()
      branch(ox, oy, rnd() * Math.PI * 2, 90 + rnd() * 90, 4 + layer, 2)
    }
    const t = new CanvasTexture(c)
    t.colorSpace = SRGBColorSpace
    return t
  })
  return doorCracks
}
