export interface ShareReportData {
  channelTitle: string
  channelUsername: string
  subscriberCount: number | null
  growth7d: number | null
  published: number
  healthScore: number | null
}

const W = 720
const H = 1280
const FONT = 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function fmtNum(n: number | null): string {
  if (n === null) return '—'
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function fmtGrowth(n: number | null): string {
  if (n === null) return '—'
  return (n >= 0 ? '+' : '') + fmtNum(n)
}

function getInitials(title: string): string {
  return title.split(/\s+/).map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2) || '?'
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export function generateReportCanvas(data: ShareReportData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ─── ФОНОВЫЙ ГРАДИЕНТ — синий как на примере ────────────────
  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H)
  bg.addColorStop(0, '#1A3ADB')
  bg.addColorStop(0.4, '#2E4FE8')
  bg.addColorStop(0.75, '#3B6CF5')
  bg.addColorStop(1, '#4DBCFF')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Лёгкий оверлей для глубины
  const ov = ctx.createRadialGradient(W * 0.8, H * 0.15, 0, W * 0.8, H * 0.15, 600)
  ov.addColorStop(0, 'rgba(120,160,255,0.35)')
  ov.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = ov
  ctx.fillRect(0, 0, W, H)

  const ov2 = ctx.createRadialGradient(0, H, 0, 0, H, 500)
  ov2.addColorStop(0, 'rgba(30,100,220,0.5)')
  ov2.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = ov2
  ctx.fillRect(0, 0, W, H)

  // ─── ДАТА ВВЕРХУ ────────────────────────────────────────────
  const month = new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  const monthCap = month.charAt(0).toUpperCase() + month.slice(1)
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.70)'
  ctx.font = `500 30px ${FONT}`
  ctx.fillText(monthCap, W / 2, 88)

  // ─── ЗАГОЛОВОК ──────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold 72px ${FONT}`
  ctx.fillText('Отчёт за месяц', W / 2, 196)

  // ─── РАЗДЕЛИТЕЛЬ ────────────────────────────────────────────
  const div1 = ctx.createLinearGradient(80, 0, W - 80, 0)
  div1.addColorStop(0, 'rgba(255,255,255,0)')
  div1.addColorStop(0.5, 'rgba(255,255,255,0.40)')
  div1.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = div1
  ctx.fillRect(80, 226, W - 160, 1.5)

  // ─── БЛОК: ПОДПИСЧИКИ ───────────────────────────────────────
  const isGrowthPos = data.growth7d === null || data.growth7d >= 0
  const subsValue = fmtNum(data.subscriberCount)

  // Иконка-человечек (svg-path руками)
  ctx.save()
  ctx.translate(W / 2 + 20 + ctx.measureText(subsValue).width / 2 + 10, 336)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.beginPath(); ctx.arc(18, 0, 18, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath()
  ctx.arc(18, 0, 18, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.textAlign = 'center'
  ctx.font = `bold 130px ${FONT}`
  ctx.fillStyle = '#FFFFFF'
  ctx.shadowColor = 'rgba(0,0,100,0.25)'
  ctx.shadowBlur = 20
  ctx.fillText(subsValue, W / 2, 380)
  ctx.shadowBlur = 0

  ctx.font = `700 38px ${FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText('Подписчиков', W / 2, 436)

  // ─── РАЗДЕЛИТЕЛЬ ────────────────────────────────────────────
  const div2 = ctx.createLinearGradient(80, 0, W - 80, 0)
  div2.addColorStop(0, 'rgba(255,255,255,0)')
  div2.addColorStop(0.5, 'rgba(255,255,255,0.35)')
  div2.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = div2
  ctx.fillRect(80, 468, W - 160, 1.5)

  // ─── БЛОК: ПОСТЫ ────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.font = `bold 130px ${FONT}`

  // Голубой/циановый цвет как на скриншоте
  const postsGrad = ctx.createLinearGradient(0, 480, 0, 620)
  postsGrad.addColorStop(0, '#5CF0FF')
  postsGrad.addColorStop(1, '#00D4F5')
  ctx.fillStyle = postsGrad
  ctx.shadowColor = 'rgba(0,220,255,0.4)'
  ctx.shadowBlur = 30
  ctx.fillText(String(data.published), W / 2, 620)
  ctx.shadowBlur = 0

  ctx.font = `700 38px ${FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.fillText('Постов опубликовано', W / 2, 676)

  // ─── РАЗДЕЛИТЕЛЬ ────────────────────────────────────────────
  const div3 = ctx.createLinearGradient(80, 0, W - 80, 0)
  div3.addColorStop(0, 'rgba(255,255,255,0)')
  div3.addColorStop(0.5, 'rgba(255,255,255,0.35)')
  div3.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = div3
  ctx.fillRect(80, 710, W - 160, 1.5)

  // ─── БЕЙДЖ РОСТА ────────────────────────────────────────────
  const growthTxt = fmtGrowth(data.growth7d) + ' за 7 дней'
  ctx.font = `600 30px ${FONT}`
  const bw = ctx.measureText(growthTxt).width + 64
  const bx = (W - bw) / 2

  roundRect(ctx, bx, 740, bw, 62, 31)
  ctx.fillStyle = isGrowthPos
    ? 'rgba(100,255,200,0.18)'
    : 'rgba(255,100,100,0.18)'
  ctx.fill()
  ctx.strokeStyle = isGrowthPos ? 'rgba(100,255,200,0.60)' : 'rgba(255,120,120,0.60)'
  ctx.lineWidth = 1.5
  roundRect(ctx, bx, 740, bw, 62, 31)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.fillStyle = isGrowthPos ? '#7FFFD4' : '#FF8FA3'
  ctx.font = `600 30px ${FONT}`
  ctx.fillText(growthTxt, W / 2, 781)

  // ─── HEALTH SCORE (если есть) ────────────────────────────────
  if (data.healthScore !== null) {
    const hs = data.healthScore
    const hc = hs >= 70 ? '#7FFFD4' : hs >= 40 ? '#FFD97D' : '#FF8FA3'
    ctx.font = `500 28px ${FONT}`
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.textAlign = 'center'
    ctx.fillText('Здоровье канала', W / 2, 858)

    // Прогресс-бар
    const barX = 80; const barY = 878; const barW = W - 160; const barH = 16
    roundRect(ctx, barX, barY, barW, barH, 8)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    ctx.fill()

    const fill = Math.round((hs / 100) * barW)
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + fill, 0)
    fillGrad.addColorStop(0, hc)
    fillGrad.addColorStop(1, hc + 'AA')
    roundRect(ctx, barX, barY, fill, barH, 8)
    ctx.fillStyle = fillGrad
    ctx.shadowColor = hc
    ctx.shadowBlur = 12
    ctx.fill()
    ctx.shadowBlur = 0

    ctx.font = `bold 36px ${FONT}`
    ctx.fillStyle = hc
    ctx.fillText(String(hs) + ' / 100', W / 2, 946)
  }

  // ─── КОНФЕТТИ ───────────────────────────────────────────────
  const confettiColors = ['#FFD700','#FF6B6B','#7FFFD4','#FF9FF3','#54A0FF','#5CF0FF','#FFEAA7','#A29BFE']
  const confettiShapes = ['rect','circle','rect','ribbon'] as const
  const rng = (min: number, max: number) => min + Math.random() * (max - min)

  for (let i = 0; i < 62; i++) {
    const cx = rng(30, W - 30)
    const cy = rng(30, H - 80)
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)]
    const shape = confettiShapes[Math.floor(Math.random() * confettiShapes.length)]
    const angle = rng(-Math.PI, Math.PI)
    const size = rng(7, 18)
    const alpha = rng(0.45, 0.92)

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.globalAlpha = alpha
    ctx.fillStyle = color

    if (shape === 'circle') {
      ctx.beginPath()
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
      ctx.fill()
    } else if (shape === 'ribbon') {
      // Тонкая длинная полоска-змейка
      ctx.beginPath()
      ctx.moveTo(-size * 1.8, 0)
      for (let s = -size * 1.8; s <= size * 1.8; s += 3) {
        ctx.lineTo(s, Math.sin(s * 0.5) * size * 0.5)
      }
      ctx.lineWidth = 3.5
      ctx.strokeStyle = color
      ctx.globalAlpha = alpha
      ctx.stroke()
    } else {
      ctx.fillRect(-size / 2, -size / 4, size, size / 2)
    }

    ctx.restore()
    ctx.globalAlpha = 1
  }

  // ─── ЗМЕЙКИ / ВОЛНИСТЫЕ ЛИНИИ ───────────────────────────────
  const snakeColors = ['rgba(255,255,255,0.22)', 'rgba(92,240,255,0.28)', 'rgba(255,215,0,0.20)']
  const snakes = [
    { x: 30, y: 520, amp: 18, freq: 0.08, len: 180, col: snakeColors[0] },
    { x: W - 210, y: 310, amp: 14, freq: 0.10, len: 160, col: snakeColors[1] },
    { x: 20, y: 860, amp: 20, freq: 0.07, len: 200, col: snakeColors[2] },
    { x: W - 180, y: 680, amp: 12, freq: 0.12, len: 140, col: snakeColors[0] },
  ]

  snakes.forEach(s => {
    ctx.beginPath()
    ctx.moveTo(s.x, s.y)
    for (let t = 0; t <= s.len; t += 2) {
      ctx.lineTo(s.x + t, s.y + Math.sin(t * s.freq) * s.amp)
    }
    ctx.strokeStyle = s.col
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.stroke()
  })

  // ─── СТРЕЛКИ ─────────────────────────────────────────────────
  const drawArrow = (x: number, y: number, angle: number, size: number, color: string, alpha: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.globalAlpha = alpha
    ctx.strokeStyle = color
    ctx.lineWidth = 3.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(-size, 0)
    ctx.lineTo(size, 0)
    ctx.moveTo(size * 0.45, -size * 0.45)
    ctx.lineTo(size, 0)
    ctx.lineTo(size * 0.45, size * 0.45)
    ctx.stroke()
    ctx.restore()
    ctx.globalAlpha = 1
  }

  drawArrow(55,  200, -0.3,  22, 'rgba(255,255,255,0.50)', 0.7)
  drawArrow(W - 55, 220,  0.25, 22, 'rgba(92,240,255,0.65)', 0.8)
  drawArrow(42,  700, -0.5,  18, 'rgba(255,215,0,0.55)', 0.65)
  drawArrow(W - 48, 720,  0.4,  18, 'rgba(255,255,255,0.45)', 0.7)
  drawArrow(W / 2 - 180, 470, -0.1, 16, 'rgba(255,180,255,0.50)', 0.6)
  drawArrow(W / 2 + 180, 460,  0.15, 16, 'rgba(92,240,255,0.55)', 0.65)

  // ─── НАЗВАНИЕ КАНАЛА ─────────────────────────────────────────
  const nameY = data.healthScore !== null ? 1050 : 900

  ctx.textAlign = 'center'
  ctx.font = `bold 58px ${FONT}`
  ctx.fillStyle = '#FFFFFF'
  ctx.shadowColor = 'rgba(0,0,80,0.3)'
  ctx.shadowBlur = 12
  let title = data.channelTitle
  while (ctx.measureText(title).width > W - 100 && title.length > 3) title = title.slice(0, -1)
  if (title !== data.channelTitle) title += '…'
  ctx.fillText(title, W / 2, nameY)
  ctx.shadowBlur = 0

  ctx.font = `500 28px ${FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText(data.channelUsername, W / 2, nameY + 52)

  // ─── НИЖНИЙ БРЕНДИНГ ────────────────────────────────────────
  ctx.font = `400 24px ${FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.fillText('neopost.app', W / 2, H - 44)

  return canvas
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
