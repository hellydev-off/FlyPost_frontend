/**
 * NeoPost Demo Script — Playwright
 *
 * Запуск:
 *   node scripts/demo.mjs
 *
 * Опции (env):
 *   APP_URL=http://localhost:5173   — адрес приложения
 *   RECORD=true                     — записать видео в scripts/demo-video/
 *   SLOWMO=800                      — задержка между действиями (мс)
 *   HEADLESS=false                  — скрыть браузер
 */

import { chromium } from '@playwright/test'
import { spawn }     from 'child_process'
import path          from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const APP_URL  = process.env.APP_URL   || 'http://localhost:5173'
const RECORD   = process.env.RECORD    === 'true'
const SLOWMO   = parseInt(process.env.SLOWMO  || '700')
const HEADLESS = process.env.HEADLESS  === 'true'

const c = {
  blue:  s => `\x1b[34m${s}\x1b[0m`,
  green: s => `\x1b[32m${s}\x1b[0m`,
  gray:  s => `\x1b[90m${s}\x1b[0m`,
  bold:  s => `\x1b[1m${s}\x1b[0m`,
  red:   s => `\x1b[31m${s}\x1b[0m`,
}

function log(step, msg) {
  console.log(`${c.blue(`[${step}]`)} ${msg}`)
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// Плавный скролл к элементу — сначала JS smooth scroll, потом небольшая пауза
async function scrollTo(locator, { offset = 80, pause = 500 } = {}) {
  await locator.evaluate((el, off) => {
    const rect = el.getBoundingClientRect()
    const scrollEl = el.closest('[class*="screen"], [class*="modal"], [class*="content"], .app-body') ?? document.scrollingElement
    const targetTop = (scrollEl.scrollTop ?? 0) + rect.top - off
    scrollEl.scrollTo({ top: targetTop, behavior: 'smooth' })
    // Fallback — window
    window.scrollBy({ top: rect.top - off, behavior: 'smooth' })
  }, offset)
  await wait(pause)
}

// Скролл + клик: делает элемент видимым, потом кликает
async function scrollAndClick(locator, opts = {}) {
  await scrollTo(locator, opts)
  await locator.click()
}

// Скролл всей страницы/модалки вниз на N пикселей плавно
async function smoothScroll(page, dy = 300, pause = 600) {
  await page.evaluate(delta => {
    const scrollEl =
      document.querySelector('.app-body, [class*="modal__body"], [class*="screen"]') ??
      document.scrollingElement
    scrollEl.scrollBy({ top: delta, behavior: 'smooth' })
  }, dy)
  await wait(pause)
}

async function typeSlowly(locator, text, delay = 60) {
  await scrollTo(locator)
  await locator.click()
  await locator.clear()
  for (const char of text) {
    await locator.pressSequentially(char)
    await wait(delay)
  }
}

// ── Запустить dev-сервер если не запущен ──
async function ensureDevServer(url) {
  try {
    await fetch(url, { signal: AbortSignal.timeout(2000) })
    return null // уже запущен
  } catch {}

  log('0/8', 'Dev-сервер не запущен — запускаю...')
  const root = path.resolve(__dirname, '..')
  const vite = spawn('npm', ['run', 'dev'], { cwd: root, stdio: 'pipe' })

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Vite не запустился за 15 сек')), 15000)
    vite.stdout.on('data', d => {
      if (d.toString().includes('localhost')) { clearTimeout(timeout); resolve() }
    })
    vite.on('error', reject)
  })

  await wait(800)
  log('0/8', c.green('Dev-сервер готов'))
  return vite
}

// ── Сценарий ──
async function runDemo(page) {

  // 1. Открыть приложение, сбросить сессию
  log('1/8', 'Открываю приложение...')
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded' })
  // Чистим старый токен чтобы роутер не перебросил на home
  await page.evaluate(() => localStorage.removeItem('fp_token'))
  await wait(300)

  // 2. Перейти на /login напрямую
  log('2/8', 'Авторизуюсь как Hellylo...')
  await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle' })
  await wait(600)

  // Ввести username в dev-форму
  const usernameInput = page.locator('.login__form input, input[placeholder="devuser"]').first()
  await usernameInput.waitFor({ state: 'visible', timeout: 8000 })
  await wait(400)
  await typeSlowly(usernameInput, 'Hellylo', 80)
  await wait(500)

  // Нажать «Войти»
  const submitBtn = page.locator('.login__form button, .login__submit').first()
  await scrollAndClick(submitBtn)

  // Ждём переход на главную
  await page.waitForURL(`${APP_URL}/`, { timeout: 10000 })
  log('2/8', c.green('Авторизован!'))
  await wait(1500)

  // 3. Главная — пауза, показываем интерфейс
  log('3/8', 'Главная страница...')
  await wait(1200)
  await smoothScroll(page, 180, 900)
  await smoothScroll(page, -180, 700)

  // 4. Переход к созданию поста
  log('4/8', 'Создаю новый пост...')
  // Кнопка + в навбаре (nav-create-btn)
  const createNav = page.locator('.bottom-nav__item--create, a[href="/posts/create"]').first()
  await scrollAndClick(createNav)
  await page.waitForURL('**/posts/create', { timeout: 8000 })
  await wait(1000)

  // Если нет канала — попробуем просто продолжить
  const hasChannel = await page.locator('.channel-selector, select[name="channelId"], [class*="channel"]').first()
    .isVisible({ timeout: 2000 }).catch(() => false)
  if (!hasChannel) {
    log('4/8', c.gray('Канал не выбран — продолжаю...'))
  }
  await wait(600)

  // 5. Открыть AI-генератор
  log('5/8', 'Открываю AI-генератор...')
  const aiGenBtn = page.locator('.ai-toolbar__gen').first()
  await aiGenBtn.waitFor({ state: 'visible', timeout: 6000 })
  await scrollAndClick(aiGenBtn)
  await wait(700)

  // Модалка с полем темы
  const topicInput = page.locator('.ai-form__input, input[placeholder*="тем" i], input[placeholder*="topic" i]').first()
  await topicInput.waitFor({ state: 'visible', timeout: 5000 })
  await wait(300)
  await typeSlowly(topicInput, 'тренды музыки в 2025 году', 55)
  await wait(600)

  // Выбрать тон "Экспертный"
  const expertChip = page.locator('.ai-form__chip').nth(1) // 0=neutral, 1=expert
  if (await expertChip.isVisible({ timeout: 1000 }).catch(() => false)) {
    await scrollAndClick(expertChip)
    await wait(400)
  }

  // Выбрать длину "Средний"
  const mediumChip = page.locator('.ai-form__chips').nth(1).locator('.ai-form__chip').nth(1)
  if (await mediumChip.isVisible({ timeout: 1000 }).catch(() => false)) {
    await scrollAndClick(mediumChip)
    await wait(400)
  }

  // Нажать «Сгенерировать»
  const genBtn = page.locator('.ai-form button[class*="btn"], .ai-form .app-btn, button:has-text("Сгенерировать"), button:has-text("Generate")').last()
  await scrollAndClick(genBtn)
  log('5/8', c.gray('Ожидаю генерацию ИИ...'))

  // Ждём пока модалка закроется (генерация завершена)
  await page.locator('.ai-form__input').waitFor({ state: 'hidden', timeout: 30000 })
  log('5/8', c.green('Текст сгенерирован!'))
  await wait(1500)

  // 6. Изменить тон через AI
  log('6/8', 'Меняю тон через AI...')
  // Кнопка тона — 5-я в improveActions (индекс 4): shorten/expand/rephrase/fix/tone
  const toneBtn = page.locator('.ai-toolbar__btn').nth(4)
  await toneBtn.waitFor({ state: 'visible', timeout: 5000 })
  await scrollAndClick(toneBtn)
  await wait(700)

  // Модалка тона — выбрать пресет
  const toneModal = page.locator('.tone-form')
  if (await toneModal.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Скролл чтобы показать содержимое модалки
    await smoothScroll(page, 150, 400)
    // Выбрать второй пресет
    const preset = page.locator('.tone-form__preset').nth(1)
    if (await preset.isVisible().catch(() => false)) {
      await scrollAndClick(preset)
      await wait(400)
    }
    // Нажать «Применить»
    const applyBtn = page.locator('.tone-form button[class*="btn"], button:has-text("Применить"), button:has-text("Apply")').last()
    await scrollAndClick(applyBtn)
    log('6/8', c.gray('Ожидаю смену тона...'))
    await page.locator('.tone-form').waitFor({ state: 'hidden', timeout: 15000 })
    log('6/8', c.green('Тон изменён!'))
    await wait(1500)
  } else {
    log('6/8', c.gray('Модалка тона не открылась, пропускаю'))
  }

  // 7. Расширить текст через AI (кнопка expand)
  log('7/8', 'Расширяю текст через AI...')
  // expand — индекс 1 (shorten=0, expand=1, rephrase=2, fix=3, tone=4)
  const expandBtn = page.locator('.ai-toolbar__btn').nth(1)
  if (await expandBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await scrollAndClick(expandBtn)
    log('7/8', c.gray('Ожидаю расширения текста...'))
    // Ждём пока спиннер исчезнет
    await page.locator('.ai-toolbar__btn--loading').waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {})
    log('7/8', c.green('Текст расширен!'))
    await wait(1500)
  } else {
    log('7/8', c.gray('Кнопка expand не найдена, пропускаю'))
  }

  // Скролл чтобы показать превью поста
  await smoothScroll(page, 300, 900)
  await smoothScroll(page, -300, 700)

  // 8. Опубликовать
  log('8/8', 'Публикую пост...')
  const publishBtn = page.locator('button:has-text("Опубликовать"), button:has-text("Publish")').first()
  await publishBtn.waitFor({ state: 'visible', timeout: 5000 })
  await wait(400)
  await scrollAndClick(publishBtn)
  log('8/8', c.gray('Ожидаю публикацию...'))

  // Ждём навигацию обратно на главную
  await page.waitForURL('**/', { timeout: 15000 }).catch(() => {})
  log('8/8', c.green('Пост опубликован!'))
  await wait(3000)
}

// ── Точка входа ──
;(async () => {
  console.log(c.bold('\n  NeoPost Demo Runner\n'))
  console.log(c.gray(`  APP_URL : ${APP_URL}`))
  console.log(c.gray(`  RECORD  : ${RECORD}`))
  console.log(c.gray(`  SLOWMO  : ${SLOWMO}ms`))
  console.log(c.gray(`  HEADLESS: ${HEADLESS}\n`))

  const videoDir = path.join(__dirname, 'demo-video')

  let devServer = null
  if (APP_URL.includes('localhost')) {
    devServer = await ensureDevServer(APP_URL).catch(err => {
      console.error(c.red('  ✗ ' + err.message))
      process.exit(1)
    })
  }

  const browser = await chromium.launch({
    headless: HEADLESS,
    slowMo: SLOWMO,
    args: ['--window-size=430,932'],
  })

  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    deviceScaleFactor: 2,
    ...(RECORD ? { recordVideo: { dir: videoDir, size: { width: 430, height: 932 } } } : {}),
  })

  const page = await context.newPage()

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(c.gray(`  [app] ${msg.text()}`))
  })

  try {
    await runDemo(page)
    console.log(c.green('\n  ✓ Демо завершено успешно!\n'))
    if (RECORD) console.log(c.blue(`  Видео: scripts/demo-video/\n`))
  } catch (err) {
    console.error(c.red('\n  ✗ Ошибка: ' + err.message + '\n'))
    if (RECORD) await page.screenshot({ path: path.join(__dirname, 'demo-error.png') })
  } finally {
    await context.close()
    await browser.close()
    if (devServer) devServer.kill()
  }
})()
