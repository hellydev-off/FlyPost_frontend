export interface ShareReportData {
  channelTitle: string
  channelUsername: string
  subscriberCount: number | null
  growth7d: number | null
  published: number
  healthScore: number | null
}

const W = 600
const H = 900
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function fmtGrowth(n: number | null): string {
  if (n === null) return '—'
  return (n >= 0 ? '+' : '') + fmtNum(n)
}

function scoreColors(score: number): { main: string; glow: string; grad: string } {
  if (score >= 70) return { main: '#10B981', glow: 'rgba(16,185,129,0.45)', grad: '#34D399' }
  if (score >= 40) return { main: '#F59E0B', glow: 'rgba(245,158,11,0.45)', grad: '#FCD34D' }
  return { main: '#EF4444', glow: 'rgba(239,68,68,0.45)', grad: '#F87171' }
}

function scoreLabel(score: number): string {
  if (score >= 70) return 'Отлично'
  if (score >= 40) return 'Хорошо'
  return 'Требует внимания'
}

function getInitials(title: string): string {
  return title.split(/\s+/).map(w => w[0] ?? '').join('').toUpperCase().slice(0, 2)
}

export function generateReportCanvas(data: ShareReportData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // ─── Background ───────────────────────────────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, W * 0.6, H)
  bgGrad.addColorStop(0, '#06080F')
  bgGrad.addColorStop(1, '#0C1020')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  // ─── Декоративные блобы ───────────────────────────────────────
  // Фиолетовый — правый верх
  const blobPurple = ctx.createRadialGradient(W, 30, 0, W, 30, 400)
  blobPurple.addColorStop(0, 'rgba(139,92,246,0.50)')
  blobPurple.addColorStop(0.5, 'rgba(99,102,241,0.18)')
  blobPurple.addColorStop(1, 'rgba(99,102,241,0)')
  ctx.fillStyle = blobPurple
  ctx.fillRect(0, 0, W, H)

  // Голубой — левый низ
  const blobCyan = ctx.createRadialGradient(0, H, 0, 0, H, 360)
  blobCyan.addColorStop(0, 'rgba(34,211,238,0.30)')
  blobCyan.addColorStop(0.5, 'rgba(59,130,246,0.12)')
  blobCyan.addColorStop(1, 'rgba(59,130,246,0)')
  ctx.fillStyle = blobCyan
  ctx.fillRect(0, 0, W, H)

  // Синий — центр
  const blobMid = ctx.createRadialGradient(W * 0.15, H * 0.5, 0, W * 0.15, H * 0.5, 240)
  blobMid.addColorStop(0, 'rgba(79,70,229,0.20)')
  blobMid.addColorStop(1, 'rgba(79,70,229,0)')
  ctx.fillStyle = blobMid
  ctx.fillRect(0, 0, W, H)

  // ─── Точечная сетка ───────────────────────────────────────────
  ctx.fillStyle = 'rgba(255,255,255,0.020)'
  for (let gx = 18; gx < W; gx += 26) {
    for (let gy = 18; gy < H; gy += 26) {
      ctx.beginPath()
      ctx.arc(gx, gy, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // ─── Декоративные кольца вокруг аватара ──────────────────────
  const avatarCX = W / 2
  const avatarCY = 178
  const avatarR = 60
  ;[130, 106].forEach((r, i) => {
    ctx.beginPath()
    ctx.arc(avatarCX, avatarCY, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(139,92,246,${i === 0 ? 0.10 : 0.07})`
    ctx.lineWidth = 1
    ctx.stroke()
  })

  // ─── Верхняя полоска ─────────────────────────────────────────
  const topBar = ctx.createLinearGradient(0, 0, W, 0)
  topBar.addColorStop(0, 'rgba(139,92,246,0)')
  topBar.addColorStop(0.35, '#8B5CF6')
  topBar.addColorStop(0.65, '#6366F1')
  topBar.addColorStop(1, 'rgba(99,102,241,0)')
  ctx.fillStyle = topBar
  ctx.fillRect(0, 0, W, 3)

  // Свечение от полоски
  const topGlow = ctx.createLinearGradient(0, 3, 0, 50)
  topGlow.addColorStop(0, 'rgba(139,92,246,0.20)')
  topGlow.addColorStop(1, 'rgba(139,92,246,0)')
  ctx.fillStyle = topGlow
  ctx.fillRect(0, 3, W, 47)

  // ─── Логотип + дата ──────────────────────────────────────────
  ctx.textAlign = 'left'
  ctx.font = `bold 16px ${FONT}`
  ctx.fillStyle = '#A78BFA'
  ctx.fillText('Neo', 28, 44)
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText('Post', 28 + ctx.measureText('Neo').width, 44)

  ctx.textAlign = 'right'
  ctx.font = `12px ${FONT}`
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  const dateStr = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  ctx.fillText(dateStr, W - 28, 44)

  // Разделитель под шапкой
  const divTop = ctx.createLinearGradient(0, 0, W, 0)
  divTop.addColorStop(0, 'rgba(139,92,246,0)')
  divTop.addColorStop(0.3, 'rgba(139,92,246,0.40)')
  divTop.addColorStop(0.7, 'rgba(99,102,241,0.40)')
  divTop.addColorStop(1, 'rgba(99,102,241,0)')
  ctx.fillStyle = divTop
  ctx.fillRect(0, 56, W, 1)

  // ─── Аватар канала ────────────────────────────────────────────
  // Glow-кольцо
  const avatarGlow = ctx.createRadialGradient(avatarCX, avatarCY, avatarR - 6, avatarCX, avatarCY, avatarR + 22)
  avatarGlow.addColorStop(0, 'rgba(139,92,246,0.40)')
  avatarGlow.addColorStop(1, 'rgba(139,92,246,0)')
  ctx.beginPath()
  ctx.arc(avatarCX, avatarCY, avatarR + 22, 0, Math.PI * 2)
  ctx.fillStyle = avatarGlow
  ctx.fill()

  // Аватар
  const avatarFill = ctx.createLinearGradient(
    avatarCX - avatarR, avatarCY - avatarR,
    avatarCX + avatarR, avatarCY + avatarR,
  )
  avatarFill.addColorStop(0, '#A78BFA')
  avatarFill.addColorStop(0.5, '#6366F1')
  avatarFill.addColorStop(1, '#3B82F6')
  ctx.beginPath()
  ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2)
  ctx.fillStyle = avatarFill
  ctx.fill()

  // Блик на аватаре
  const highlight = ctx.createRadialGradient(
    avatarCX - 16, avatarCY - 18, 0,
    avatarCX - 16, avatarCY - 18, avatarR * 0.85,
  )
  highlight.addColorStop(0, 'rgba(255,255,255,0.22)')
  highlight.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.beginPath()
  ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2)
  ctx.fillStyle = highlight
  ctx.fill()

  // Буквы
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'
  ctx.font = `bold 36px ${FONT}`
  ctx.fillText(getInitials(data.channelTitle), avatarCX, avatarCY + 13)

  // ─── Название и username ──────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.fillStyle = '#F8FAFC'
  ctx.font = `bold 27px ${FONT}`
  let title = data.channelTitle
  while (ctx.measureText(title).width > W - 72 && title.length > 4) title = title.slice(0, -1)
  if (title !== data.channelTitle) title += '…'
  ctx.fillText(title, W / 2, 270)

  ctx.fillStyle = 'rgba(167,139,250,0.85)'
  ctx.font = `500 14px ${FONT}`
  ctx.fillText('@' + data.channelUsername, W / 2, 294)

  // ─── Плитка подписчиков ───────────────────────────────────────
  const pillW = 230
  const pillH = 84
  const pillX = (W - pillW) / 2
  const pillY = 318

  roundRect(ctx, pillX, pillY, pillW, pillH, 22)
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.09)'
  ctx.lineWidth = 1
  roundRect(ctx, pillX, pillY, pillW, pillH, 22)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(99,102,241,0.70)'
  ctx.shadowBlur = 22
  ctx.fillStyle = '#F8FAFC'
  ctx.font = `bold 38px ${FONT}`
  ctx.fillText(fmtNum(data.subscriberCount), W / 2, pillY + 47)
  ctx.shadowBlur = 0

  ctx.fillStyle = 'rgba(255,255,255,0.38)'
  ctx.font = `12px ${FONT}`
  ctx.fillText('подписчиков', W / 2, pillY + 68)

  // ─── Бейдж роста ─────────────────────────────────────────────
  const isPos = data.growth7d === null || data.growth7d >= 0
  const growthMain = data.growth7d === null ? '#94A3B8' : isPos ? '#10B981' : '#EF4444'
  const growthBg = data.growth7d === null
    ? 'rgba(148,163,184,0.12)'
    : isPos ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)'

  const badgeLabel = `${fmtGrowth(data.growth7d)}  за 7 дней`
  ctx.font = `600 13px ${FONT}`
  const badgeW = ctx.measureText(badgeLabel).width + 36
  const badgeX = (W - badgeW) / 2
  const badgeY = 422

  roundRect(ctx, badgeX, badgeY, badgeW, 34, 17)
  ctx.fillStyle = growthBg
  ctx.fill()
  ctx.strokeStyle = growthMain + '55'
  ctx.lineWidth = 1
  roundRect(ctx, badgeX, badgeY, badgeW, 34, 17)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.fillStyle = growthMain
  ctx.font = `600 13px ${FONT}`
  ctx.fillText(badgeLabel, W / 2, badgeY + 22)

  // ─── Health score arc ─────────────────────────────────────────
  if (data.healthScore !== null) {
    const hs = data.healthScore
    const { main, glow, grad } = scoreColors(hs)

    // Заголовок секции
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255,255,255,0.28)'
    ctx.font = `600 11px ${FONT}`
    ctx.fillText('ЗДОРОВЬЕ КАНАЛА', W / 2, 490)

    const arcCX = W / 2
    const arcCY = 580
    const arcR = 88
    const arcStart = Math.PI * 0.78
    const arcEnd   = Math.PI * 2.22

    // Glow-подложка за дугой
    const arcGlow = ctx.createRadialGradient(arcCX, arcCY, arcR - 20, arcCX, arcCY, arcR + 30)
    arcGlow.addColorStop(0, glow)
    arcGlow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.beginPath()
    ctx.arc(arcCX, arcCY, arcR + 30, 0, Math.PI * 2)
    ctx.fillStyle = arcGlow
    ctx.fill()

    // Трек дуги (фон)
    ctx.beginPath()
    ctx.arc(arcCX, arcCY, arcR, arcStart, arcEnd)
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 16
    ctx.lineCap = 'round'
    ctx.stroke()

    // Заполненная дуга
    const fillEnd = arcStart + (arcEnd - arcStart) * (hs / 100)
    const arcColorGrad = ctx.createLinearGradient(arcCX - arcR, arcCY, arcCX + arcR, arcCY)
    arcColorGrad.addColorStop(0, main)
    arcColorGrad.addColorStop(1, grad)
    ctx.beginPath()
    ctx.arc(arcCX, arcCY, arcR, arcStart, fillEnd)
    ctx.strokeStyle = arcColorGrad
    ctx.lineWidth = 16
    ctx.lineCap = 'round'
    ctx.shadowColor = main
    ctx.shadowBlur = 18
    ctx.stroke()
    ctx.shadowBlur = 0

    // Цифра в центре дуги
    ctx.textAlign = 'center'
    ctx.shadowColor = glow
    ctx.shadowBlur = 20
    ctx.fillStyle = '#F8FAFC'
    ctx.font = `bold 56px ${FONT}`
    ctx.fillText(String(hs), arcCX, arcCY + 20)
    ctx.shadowBlur = 0

    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = `13px ${FONT}`
    ctx.fillText('из 100', arcCX, arcCY + 44)

    // Вердикт под дугой
    ctx.fillStyle = main
    ctx.font = `700 15px ${FONT}`
    ctx.fillText(scoreLabel(hs), arcCX, arcCY + arcR + 28)
  }

  // ─── Карточки статистики ──────────────────────────────────────
  const cardY = data.healthScore !== null ? 714 : 488
  const gap = 14
  const cardW = (W - 28 * 2 - gap) / 2
  const cardH = 84

  const drawCard = (
    x: number, y: number, w: number, h: number,
    value: string, label: string, accentColor: string,
  ): void => {
    roundRect(ctx, x, y, w, h, 18)
    ctx.fillStyle = 'rgba(255,255,255,0.055)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.09)'
    ctx.lineWidth = 1
    roundRect(ctx, x, y, w, h, 18)
    ctx.stroke()

    // Акцентная линия сверху
    const accentLine = ctx.createLinearGradient(x, y, x + w * 0.65, y)
    accentLine.addColorStop(0, accentColor)
    accentLine.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = accentLine
    roundRect(ctx, x, y, w * 0.65, 2.5, 1.5)
    ctx.fill()

    ctx.textAlign = 'left'
    ctx.shadowColor = accentColor
    ctx.shadowBlur = 10
    ctx.fillStyle = '#F8FAFC'
    ctx.font = `bold 30px ${FONT}`
    ctx.fillText(value, x + 18, y + 48)
    ctx.shadowBlur = 0

    ctx.fillStyle = 'rgba(255,255,255,0.38)'
    ctx.font = `12px ${FONT}`
    ctx.fillText(label, x + 18, y + 68)
  }

  const growthFull = data.growth7d === null || data.growth7d >= 0 ? '#10B981' : '#EF4444'
  drawCard(28, cardY, cardW, cardH, String(data.published), 'опубликовано', '#8B5CF6')
  drawCard(28 + cardW + gap, cardY, cardW, cardH, fmtGrowth(data.growth7d), 'прирост за 7 дней', growthFull)

  // ─── Нижняя полоска + брендинг ────────────────────────────────
  const divBot = ctx.createLinearGradient(0, 0, W, 0)
  divBot.addColorStop(0, 'rgba(99,102,241,0)')
  divBot.addColorStop(0.35, 'rgba(99,102,241,0.38)')
  divBot.addColorStop(0.65, 'rgba(139,92,246,0.38)')
  divBot.addColorStop(1, 'rgba(139,92,246,0)')
  ctx.fillStyle = divBot
  ctx.fillRect(0, H - 72, W, 1)

  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.font = `12px ${FONT}`
  ctx.fillText('neopost.app', W / 2, H - 42)

  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  ctx.font = `10px ${FONT}`
  ctx.fillText('Telegram Channel Analytics', W / 2, H - 22)

  return canvas
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
