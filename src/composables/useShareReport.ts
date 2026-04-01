export interface ShareReportData {
  channelTitle: string
  channelUsername: string
  subscriberCount: number | null
  growth7d: number | null
  published: number
  healthScore: number | null
}

const W = 800
const H = 420
const PAD = 44

// Цветовая палитра
const C = {
  bg: '#0f172a',
  bgCard: '#1e293b',
  bgCardHover: '#263348',
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  text: '#f1f5f9',
  textSec: '#94a3b8',
  textTert: '#475569',
  border: '#334155',
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

function fmtNum(n: number | null): string {
  if (n === null) return '—'
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

function fmtGrowth(n: number | null): string {
  if (n === null) return '—'
  return (n >= 0 ? '+' : '') + fmtNum(n)
}

function scoreColor(score: number): string {
  if (score >= 70) return C.success
  if (score >= 40) return C.warning
  return C.error
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'Отлично'
  if (score >= 40) return 'Хорошо'
  return 'Требует внимания'
}

export function generateReportCanvas(data: ShareReportData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // --- Фон ---
  const bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, '#0f172a')
  bgGrad.addColorStop(1, '#131f35')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // Тонкий узор — точки
  ctx.fillStyle = 'rgba(255,255,255,0.025)'
  for (let x = 0; x < W; x += 32) {
    for (let y = 0; y < H; y += 32) {
      ctx.fillRect(x, y, 1.5, 1.5)
    }
  }

  // Синяя акцентная полоса сверху
  const topGrad = ctx.createLinearGradient(0, 0, W, 0)
  topGrad.addColorStop(0, '#3b82f6')
  topGrad.addColorStop(1, '#6366f1')
  ctx.fillStyle = topGrad
  ctx.fillRect(0, 0, W, 5)

  // Слабое свечение от полосы
  const glowGrad = ctx.createLinearGradient(0, 5, 0, 80)
  glowGrad.addColorStop(0, 'rgba(59,130,246,0.12)')
  glowGrad.addColorStop(1, 'rgba(59,130,246,0)')
  ctx.fillStyle = glowGrad
  ctx.fillRect(0, 5, W, 75)

  // --- Брендинг (верх слева) ---
  ctx.fillStyle = C.primary
  ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillText('Neo', PAD, 50)
  ctx.fillStyle = C.text
  ctx.fillText('Post', PAD + ctx.measureText('Neo').width, 50)

  // Дата (верх справа)
  const dateStr = new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
  ctx.fillStyle = C.textTert
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(dateStr, W - PAD, 50)
  ctx.textAlign = 'left'

  // --- Название канала ---
  ctx.fillStyle = C.textSec
  ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillText('@' + data.channelUsername, PAD, 88)

  // Обрезаем длинное название
  ctx.fillStyle = C.text
  ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  let title = data.channelTitle
  while (ctx.measureText(title).width > W - PAD * 2 - 20 && title.length > 4) {
    title = title.slice(0, -1)
  }
  if (title !== data.channelTitle) title += '…'
  ctx.fillText(title, PAD, 132)

  // --- Разделитель ---
  ctx.strokeStyle = C.border
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, 152)
  ctx.lineTo(W - PAD, 152)
  ctx.stroke()

  // --- Карточки статистики ---
  const cardW = 210
  const cardH = 92
  const cardY = 168
  const cardGap = 22
  const cardStartX = PAD

  const statCards = [
    {
      value: fmtNum(data.subscriberCount),
      label: 'подписчиков',
      color: C.primary,
    },
    {
      value: fmtGrowth(data.growth7d),
      label: 'прирост за 7 дней',
      color: data.growth7d !== null && data.growth7d >= 0 ? C.success : C.error,
    },
    {
      value: String(data.published),
      label: 'опубликовано постов',
      color: C.textSec,
    },
  ]

  statCards.forEach((card, i) => {
    const x = cardStartX + i * (cardW + cardGap)

    // Фон карточки
    ctx.fillStyle = C.bgCard
    roundRect(ctx, x, cardY, cardW, cardH, 12)
    ctx.fill()

    // Тонкая рамка
    ctx.strokeStyle = C.border
    ctx.lineWidth = 1
    roundRect(ctx, x, cardY, cardW, cardH, 12)
    ctx.stroke()

    // Значение
    ctx.fillStyle = card.color
    ctx.font = `bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.fillText(card.value, x + 18, cardY + 48)

    // Подпись
    ctx.fillStyle = C.textSec
    ctx.font = `13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
    ctx.fillText(card.label, x + 18, cardY + 72)
  })

  // --- Health Score ---
  if (data.healthScore !== null) {
    const hs = data.healthScore
    const hsY = 290
    const hsColor = scoreColor(hs)

    // Лейбл
    ctx.fillStyle = C.textTert
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillText('ЗДОРОВЬЕ КАНАЛА', PAD, hsY)

    // Число
    ctx.fillStyle = hsColor
    ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillText(String(hs), PAD, hsY + 48)

    // Подпись к числу
    ctx.fillStyle = hsColor
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    ctx.fillText(scoreLabel(hs), PAD + 62, hsY + 44)

    // Полоса прогресса — фон
    const barX = PAD + 140
    const barY = hsY + 32
    const barW = 340
    const barH = 10
    ctx.fillStyle = C.bgCard
    roundRect(ctx, barX, barY, barW, barH, 5)
    ctx.fill()

    // Полоса прогресса — заполнение
    const fillW = Math.round((hs / 100) * barW)
    const fillGrad = ctx.createLinearGradient(barX, 0, barX + fillW, 0)
    fillGrad.addColorStop(0, hsColor)
    fillGrad.addColorStop(1, hsColor + 'aa')
    ctx.fillStyle = fillGrad
    roundRect(ctx, barX, barY, fillW, barH, 5)
    ctx.fill()
  }

  // --- Нижний брендинг ---
  ctx.fillStyle = C.textTert
  ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  ctx.fillText('neopost.app', PAD, H - 22)

  // Декоративный градиент справа снизу
  const decoGrad = ctx.createRadialGradient(W, H, 0, W, H, 250)
  decoGrad.addColorStop(0, 'rgba(99,102,241,0.12)')
  decoGrad.addColorStop(1, 'rgba(99,102,241,0)')
  ctx.fillStyle = decoGrad
  ctx.fillRect(0, 0, W, H)

  return canvas
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
