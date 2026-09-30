import { CanvasTexture } from 'three'

// One puff texture per fart type (data/farts.js `gas`): a soft radial glow
// with a shape drawn over it, in the type's colour fading to its edge colour.
export function makePuffTexture({ shape, color, edge }) {
  const size = 128
  const h = size / 2
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const glow = (r, a) => {
    const g = ctx.createRadialGradient(h, h, 0, h, h, r)
    g.addColorStop(0, color)
    g.addColorStop(0.5, edge)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.globalAlpha = a
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    ctx.globalAlpha = 1
  }
  const fill = (path) => {
    ctx.fillStyle = color
    ctx.strokeStyle = edge
    ctx.lineWidth = 6
    ctx.lineJoin = 'round'
    ctx.beginPath()
    path()
    ctx.fill()
    ctx.stroke()
  }
  if (shape === 'swirl') {
    glow(h, 0.5)
    ctx.strokeStyle = color
    ctx.lineCap = 'round'
    ctx.lineWidth = 12
    ctx.beginPath()
    for (let t = 0; t < 4.5 * Math.PI; t += 0.15) {
      const r = 4 + t * 4.2
      ctx.lineTo(h + Math.cos(t) * r, h + Math.sin(t) * r)
    }
    ctx.stroke()
  } else if (shape === 'cloud') {
    glow(h, 0.4)
    for (const [x, y, r] of [[64, 66, 26], [42, 74, 18], [86, 74, 18], [50, 50, 18], [78, 50, 18]]) {
      fill(() => ctx.arc(x, y, r, 0, Math.PI * 2))
    }
  } else if (shape === 'bolt') {
    glow(h, 0.55)
    fill(() => {
      ctx.moveTo(74, 8)
      ctx.lineTo(34, 70)
      ctx.lineTo(58, 70)
      ctx.lineTo(46, 120)
      ctx.lineTo(96, 52)
      ctx.lineTo(70, 52)
      ctx.closePath()
    })
  } else if (shape === 'wind') {
    glow(h, 0.3)
    ctx.strokeStyle = color
    ctx.lineCap = 'round'
    ctx.lineWidth = 9
    for (const [y, r] of [[38, 12], [64, 16], [90, 12]]) {
      ctx.beginPath()
      ctx.moveTo(14, y)
      ctx.lineTo(96, y)
      ctx.arc(96, y - r, r, Math.PI / 2, -Math.PI * 0.9, true)
      ctx.stroke()
    }
  } else if (shape === 'drop') {
    glow(h, 0.5)
    fill(() => {
      ctx.moveTo(h, 10)
      ctx.bezierCurveTo(h + 14, 40, h + 38, 56, h + 38, 80)
      ctx.arc(h, 80, 38, 0, Math.PI, false)
      ctx.bezierCurveTo(h - 38, 56, h - 14, 40, h, 10)
    })
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.beginPath()
    ctx.ellipse(h - 14, 84, 6, 12, 0.3, 0, Math.PI * 2)
    ctx.fill()
  } else if (shape === 'flame') {
    glow(h, 0.5)
    fill(() => {
      ctx.moveTo(h, 6)
      ctx.bezierCurveTo(h + 8, 36, h + 40, 46, h + 36, 86)
      ctx.arc(h, 86, 36, 0, Math.PI, false)
      ctx.bezierCurveTo(h - 40, 56, h - 14, 44, h, 6)
    })
    ctx.fillStyle = '#fff3a0'
    ctx.beginPath()
    ctx.ellipse(h, 92, 14, 20, 0, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // 'puff': the plain soft cloud.
    glow(h, 1)
    glow(h * 0.6, 0.6)
  }
  return new CanvasTexture(c)
}
