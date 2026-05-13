const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

const SIZE = 512
const canvas = createCanvas(SIZE, SIZE)
const ctx = canvas.getContext('2d')

const cx = SIZE / 2
const cy = SIZE / 2
const r = SIZE / 2

// clip to circle
ctx.beginPath()
ctx.arc(cx, cy, r, 0, Math.PI * 2)
ctx.clip()

// dark background
ctx.fillStyle = '#0a0a1a'
ctx.fillRect(0, 0, SIZE, SIZE)

// gradient overlay
const grad = ctx.createLinearGradient(0, 0, SIZE, SIZE)
grad.addColorStop(0, '#FF6B35')
grad.addColorStop(0.5, '#B388FF')
grad.addColorStop(1, '#4FC3F7')
ctx.fillStyle = grad
ctx.globalAlpha = 0.15
ctx.fillRect(0, 0, SIZE, SIZE)
ctx.globalAlpha = 1

// subtle ring
ctx.beginPath()
ctx.arc(cx, cy, r - 4, 0, Math.PI * 2)
ctx.strokeStyle = 'rgba(255,255,255,0.12)'
ctx.lineWidth = 2
ctx.stroke()

// decorative hex outline
ctx.save()
ctx.translate(cx, cy)
ctx.beginPath()
const hR = r * 0.48
for (let i = 0; i < 6; i++) {
  const angle = (i * 60 - 60) * Math.PI / 180
  const x = hR * Math.cos(angle)
  const y = hR * Math.sin(angle)
  i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
}
ctx.closePath()
ctx.strokeStyle = 'rgba(255,255,255,0.2)'
ctx.lineWidth = 1.5
ctx.stroke()

// inner hex
ctx.beginPath()
const hR2 = r * 0.3
for (let i = 0; i < 6; i++) {
  const angle = (i * 60 - 60) * Math.PI / 180
  const x = hR2 * Math.cos(angle)
  const y = hR2 * Math.sin(angle)
  i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
}
ctx.closePath()
ctx.strokeStyle = 'rgba(255,255,255,0.1)'
ctx.lineWidth = 1
ctx.stroke()
ctx.restore()

// silhouette - dark figure
ctx.beginPath()
ctx.arc(cx, cy - 15, 55, 0, Math.PI * 2)
ctx.fillStyle = 'rgba(255,255,255,0.04)'
ctx.fill()

// shoulders
ctx.beginPath()
ctx.ellipse(cx, cy + 80, 90, 40, 0, 0, Math.PI)
ctx.fill()

// neck
ctx.fillRect(cx - 12, cy + 5, 24, 45)

// head
ctx.beginPath()
ctx.arc(cx, cy - 10, 48, 0, Math.PI * 2)
ctx.fill()

// subtle highlight on face (left side)
ctx.beginPath()
ctx.arc(cx - 18, cy - 18, 30, 0, Math.PI * 2)
ctx.fillStyle = 'rgba(255,255,255,0.03)'
ctx.fill()

// accent glow dot
const dotGrad = ctx.createRadialGradient(cx + 15, cy - 30, 0, cx + 15, cy - 30, 20)
dotGrad.addColorStop(0, 'rgba(255,107,53,0.4)')
dotGrad.addColorStop(1, 'rgba(255,107,53,0)')
ctx.fillStyle = dotGrad
ctx.beginPath()
ctx.arc(cx + 15, cy - 30, 20, 0, Math.PI * 2)
ctx.fill()

// blue accent dot
const dotGrad2 = ctx.createRadialGradient(cx - 20, cy - 5, 0, cx - 20, cy - 5, 15)
dotGrad2.addColorStop(0, 'rgba(79,195,247,0.25)')
dotGrad2.addColorStop(1, 'rgba(79,195,247,0)')
ctx.fillStyle = dotGrad2
ctx.beginPath()
ctx.arc(cx - 20, cy - 5, 15, 0, Math.PI * 2)
ctx.fill()

// outer glow ring
ctx.beginPath()
ctx.arc(cx, cy, r - 2, 0, Math.PI * 2)
ctx.strokeStyle = 'rgba(255,107,53,0.08)'
ctx.lineWidth = 3
ctx.stroke()

const outDir = path.join(__dirname, '..', 'public')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

const buffer = canvas.toBuffer('image/png')
fs.writeFileSync(path.join(outDir, 'avatar.png'), buffer)
console.log('Generated public/avatar.png')
