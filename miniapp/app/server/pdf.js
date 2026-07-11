const { PDFDocument, rgb } = require('pdf-lib')
const fontkit = require('@pdf-lib/fontkit')
const fs = require('fs')
const path = require('path')
const { execFile, spawnSync } = require('child_process')

const DARK = rgb(0.059, 0.09, 0.165)
const MUTED = rgb(0.392, 0.478, 0.541)

const fontRegularPath = path.join(__dirname, 'fonts', 'Roboto-Regular.ttf')
const fontBoldPath = path.join(__dirname, 'fonts', 'Roboto-Bold.ttf')

async function createPdfDoc() {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  return pdfDoc
}

function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('ru-RU')
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('ru-RU')
}

function formatMoney(num) {
  return Number(num || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function numberToWords(num) {
  const n = Math.round(Number(num) * 100) / 100
  const rubles = Math.floor(n)
  const kopecks = Math.round((n - rubles) * 100)

  const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
  const onesF = ['', 'одна', 'две', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять']
  const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать']
  const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто']
  const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот']

  function group(n, feminine) {
    const parts = []
    const h = Math.floor(n / 100)
    const t = Math.floor((n % 100) / 10)
    const o = n % 10
    if (h) parts.push(hundreds[h])
    if (t === 1) {
      parts.push(teens[o])
    } else {
      if (t) parts.push(tens[t])
      if (o) parts.push(feminine ? onesF[o] : ones[o])
    }
    return parts.join(' ')
  }

  function rubleWord(n) {
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod100 >= 11 && mod100 <= 19) return 'рублей'
    if (mod10 === 1) return 'рубль'
    if (mod10 >= 2 && mod10 <= 4) return 'рубля'
    return 'рублей'
  }

  function thousandWord(n) {
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod100 >= 11 && mod100 <= 19) return 'тысяч'
    if (mod10 === 1) return 'тысяча'
    if (mod10 >= 2 && mod10 <= 4) return 'тысячи'
    return 'тысяч'
  }

  function millionWord(n) {
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod100 >= 11 && mod100 <= 19) return 'миллионов'
    if (mod10 === 1) return 'миллион'
    if (mod10 >= 2 && mod10 <= 4) return 'миллиона'
    return 'миллионов'
  }

  function billionWord(n) {
    const mod10 = n % 10
    const mod100 = n % 100
    if (mod100 >= 11 && mod100 <= 19) return 'миллиардов'
    if (mod10 === 1) return 'миллиард'
    if (mod10 >= 2 && mod10 <= 4) return 'миллиарда'
    return 'миллиардов'
  }

  if (rubles === 0) return `ноль ${rubleWord(0)} ${String(kopecks).padStart(2, '0')} копеек`

  const parts = []
  const billions = Math.floor(rubles / 1_000_000_000)
  const millions = Math.floor((rubles % 1_000_000_000) / 1_000_000)
  const thousands = Math.floor((rubles % 1_000_000) / 1_000)
  const remainder = rubles % 1_000

  if (billions) parts.push(`${group(billions, false)} ${billionWord(billions)}`)
  if (millions) parts.push(`${group(millions, false)} ${millionWord(millions)}`)
  if (thousands) parts.push(`${group(thousands, true)} ${thousandWord(thousands)}`)
  if (remainder) parts.push(group(remainder, false))

  const text = parts.join(' ').replace(/\s+/g, ' ').trim()
  const firstLetter = text.charAt(0).toUpperCase() + text.slice(1)
  return `${firstLetter} ${rubleWord(rubles)} ${String(kopecks).padStart(2, '0')} копеек`
}

function wrapText(text, maxLen) {
  if (!text) return ''
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen - 3) + '...'
}

function drawText(page, text, x, y, options = {}) {
  const fontSize = options.size || 10
  const color = options.color || DARK
  const font = options.font
  if (!font) {
    throw new Error('drawText called without font')
  }
  page.drawText(String(text || ''), { x, y, size: fontSize, color, font })
}

function drawParagraph(page, text, x, y, maxWidth, lineHeight, font, size = 10) {
  const words = String(text || '').split(' ')
  let line = ''
  let currentY = y
  const approxCharWidth = size * 0.45
  const maxChars = Math.floor(maxWidth / approxCharWidth)

  words.forEach(word => {
    if ((line + ' ' + word).trim().length > maxChars && line.length > 0) {
      drawText(page, line, x, currentY, { size, font })
      currentY -= lineHeight
      line = word
    } else {
      line = line ? line + ' ' + word : word
    }
  })
  if (line) {
    drawText(page, line, x, currentY, { size, font })
    currentY -= lineHeight
  }
  return currentY
}

async function generateApplication(payment, client, bank) {
  const scriptPath = path.join(__dirname, 'fill_template.py')
  const outPath = path.join(__dirname, 'uploads', `application_${payment.payment_number || payment.id}.pdf`)

  const data = {
    contract_number: client?.contract_number || '',
    contract_date: client?.contract_date || '',
    company_name: client?.company_name || '',
    payment_number: payment.payment_number || payment.id,
    payment_date: payment.payment_date || '',
    deadline_date: payment.deadline_date || payment.payment_date || '',
    amount: payment.amount || 0,
    currency: payment.currency || 'USD',
    exchange_rate: payment.exchange_rate || 0,
    rub_amount: payment.rub_amount || 0,
    amount_words: numberToWords(payment.rub_amount || 0),
    product_name: payment.product_name || '',
    payment_purpose: payment.payment_purpose || '',
    recipient_name: payment.recipient_name || '',
    recipient_address: payment.recipient_address || '',
    recipient_bank: payment.recipient_bank || '',
    recipient_bank_address: payment.recipient_bank_address || '',
    recipient_iban: payment.recipient_iban || '',
    recipient_swift: payment.recipient_swift || '',
    contract_details: payment.contract_details || '',
    commission_percent: payment.commission_percent || 0,
    commission_rub: payment.commission_rub || 0,
    total_rub: payment.total_rub || 0,
    principal_signatory_name: client?.principal_signatory_name || '',
    principal_company_name: client?.principal_company_name || '',
    principal_position: client?.principal_position || 'Генеральный директор',
    agent_signatory_name: client?.agent_signatory_name || '',
    agent_position: client?.agent_position || 'Директор',
    agent_company_name: client?.agent_company_name || '',
  }

  const result = spawnSync('python', [scriptPath, JSON.stringify(data), outPath], {
    encoding: 'utf8',
    timeout: 30000,
  })

  if (result.error) throw new Error('Python error: ' + result.error.message)
  if (result.status !== 0) throw new Error('fill_template failed: ' + (result.stderr || result.stdout))

  return fs.readFileSync(outPath)
}

async function generateApplication_UNUSED(payment, client, bank) {
  const templatePath = path.join(__dirname, 'template_application.pdf')
  const signaturePath = path.join(__dirname, 'signature.png')
  const stampPath = path.join(__dirname, 'stamp.png')

  const templateBytes = fs.readFileSync(templatePath)
  const pdfDoc = await PDFDocument.load(templateBytes)
  pdfDoc.registerFontkit(fontkit)

  const font = await pdfDoc.embedFont(fs.readFileSync(fontRegularPath), { subset: true })
  const bold = await pdfDoc.embedFont(fs.readFileSync(fontBoldPath), { subset: true })

  const page = pdfDoc.getPages()[0]
  // Оборачиваем существующий контент в q/Q — наши операции будут поверх
  page.node.wrapContentStreams()
  const { width: W, height: H } = page.getSize()
  // H = 843, шрифт в шаблоне 12pt, строки через ~14pt
  // pdf-lib: y считается снизу. y = H - top (top из pdfplumber)
  // Для рисования текста: y = H - top  (базовая линия примерно совпадает с top)

  const WHITE = rgb(1, 1, 1)
  const BLACK = rgb(0, 0, 0)
  const SZ = 11.5  // рабочий размер шрифта (шаблон 12pt, Roboto чуть шире)
  const LH = 14    // межстрочный интервал в шаблоне

  // Закрыть строку белым и написать новый текст
  // top — координата сверху из pdfplumber
  function ow(x, top, w, text, fnt, sz) {
    sz = sz || SZ
    page.drawRectangle({ x: x - 1, y: H - top - 1, width: w + 2, height: LH + 1, color: WHITE })
    page.drawText(String(text || ''), { x, y: H - top - sz + 2, size: sz, font: fnt || font, color: BLACK })
  }

  // Закрыть блок строк и написать многострочный текст с выравниванием по ширине
  function owBlock(x, topStart, blockH, maxW, text, fnt, sz) {
    sz = sz || SZ
    // Стереть весь блок
    page.drawRectangle({ x: x - 1, y: H - topStart - blockH, width: maxW + 2, height: blockH + 2, color: WHITE })
    // Разбить на строки
    const words = String(text || '').split(' ')
    const approxCW = sz * 0.53
    const maxChars = Math.floor(maxW / approxCW)
    const lines = []
    let line = ''
    words.forEach(word => {
      if ((line + ' ' + word).trim().length > maxChars && line) { lines.push(line); line = word }
      else { line = line ? line + ' ' + word : word }
    })
    if (line) lines.push(line)
    lines.forEach((l, i) => {
      page.drawText(l, { x, y: H - topStart - sz + 2 - i * LH, size: sz, font: fnt || font, color: BLACK })
    })
  }

  // ── Заголовок строка 1 (top=76): "... № [договор] от [дата] года" ──
  // Закрываем от x=333 (знак №) до конца строки
  page.drawRectangle({ x: 333, y: H - 76 - 1, width: W - 333 - 40, height: LH + 1, color: WHITE })
  page.drawText(`№ ${client?.contract_number || '___'} от ${formatDate(client?.contract_date)} года`, {
    x: 333.2, y: H - 76 - SZ + 2, size: SZ, font: bold, color: BLACK
  })

  // ── Заголовок строка 2 (top=90): "в адрес компании «...»" ──
  ow(313.9, 90, W - 313.9 - 40, `в адрес компании «${client?.company_name || '___'}»`, font)

  // ── Заявка № ... от ... (top=138) ──
  ow(226.0, 138, 200, `Заявка № ${payment.payment_number || payment.id} от ${formatDate(payment.payment_date)} г.`, bold, SZ + 0.5)

  // ── Основной абзац (top=170..239) — 5 строк, высота ~70 ──
  const amountWords = numberToWords(payment.rub_amount)
  const currencyName = payment.currency === 'USD' ? 'долларов' : payment.currency === 'EUR' ? 'евро' : payment.currency
  const currencyFull = payment.currency === 'USD' ? 'доллар США' : payment.currency === 'EUR' ? 'евро' : payment.currency
  const deadline = formatDate(payment.deadline_date || payment.payment_date)
  const bodyText = `Согласно заключенному Агентскому договору № ${client?.contract_number || '___'} от ${formatDate(client?.contract_date)} года просим перевести ${formatMoney(payment.amount)} ${currencyName} по курсу ${formatMoney(payment.exchange_rate)} рублей за 1 ${currencyFull} в сумме ${formatMoney(payment.rub_amount)} рублей (${amountWords}) в срок до ${deadline} г. (включительно) за товар ${payment.product_name || '___'} с назначением «${payment.payment_purpose || '___'}» на следующие реквизиты:`
  owBlock(63.9, 170, 75, 478, bodyText, font)

  // ── Реквизиты: значения (закрываем только значения, метки оставляем) ──
  // Получатель (top=270) — значение с x=122
  ow(122.3, 270, W - 122.3 - 40, payment.recipient_name || '—', font)
  // Адрес (top=283) — значение с x=96
  ow(96.5, 283, W - 96.5 - 40, payment.recipient_address || '—', font)
  // Банк (top=296) — значение с x=92
  ow(92.1, 296, W - 92.1 - 40, payment.recipient_bank || '—', font)
  // Адрес банка (top=309) — значение с x=96
  ow(96.5, 309, W - 96.5 - 40, payment.recipient_bank_address || '—', font)
  // IBAN (top=322) — значение с x=92
  ow(92.2, 322, W - 92.2 - 40, payment.recipient_iban || '—', font)
  // SWIFT (top=334) — значение с x=98
  ow(98.4, 334, W - 98.4 - 40, payment.recipient_swift || '—', font)
  // Контракт (top=347) — значение с x=114
  ow(114.7, 347, W - 114.7 - 40, payment.contract_details || '—', font)

  // ── Комиссия строка 1 (top=388): "... равно [%] % от суммы платежа и" ──
  // Закрываем только значение % — от x=381
  page.drawRectangle({ x: 381, y: H - 388 - 1, width: 160, height: LH + 1, color: WHITE })
  page.drawText(`${String(payment.commission_percent || 0).replace('.', ',')} % от суммы платежа и`, {
    x: 381.2, y: H - 388 - SZ + 2, size: SZ, font, color: BLACK
  })

  // ── Комиссия строка 2 (top=401): "составляет, соответственно, [сумма] руб." ──
  // Закрываем значение от x=212
  page.drawRectangle({ x: 212, y: H - 401 - 1, width: 160, height: LH + 1, color: WHITE })
  page.drawText(`${formatMoney(payment.commission_rub)} руб.`, {
    x: 212.1, y: H - 401 - SZ + 2, size: SZ, font, color: BLACK
  })

  // ── Итого (top=416): "... Агента: [сумма] руб." ──
  page.drawRectangle({ x: 350, y: H - 416 - 1, width: 200, height: LH + 1, color: WHITE })
  page.drawText(`${formatMoney(payment.total_rub)} руб.`, {
    x: 351.6, y: H - 416 - SZ + 2, size: SZ, font: bold, color: BLACK
  })

  // ── «В случае...» строка 2 (top=461): договор ──
  // Закрываем "SL-FSS-21/25-MAR от 21.03.2025 года" x0=191
  page.drawRectangle({ x: 191, y: H - 461 - 1, width: 200, height: LH + 1, color: WHITE })
  page.drawText(`${client?.contract_number || '___'} от ${formatDate(client?.contract_date)} года`, {
    x: 191.3, y: H - 461 - SZ + 2, size: SZ, font, color: BLACK
  })

  // ── Уполномоченное лицо Принципала ФИО (top=548) ──
  page.drawRectangle({ x: 129, y: H - 548 - 1, width: 260, height: LH + 1, color: WHITE })
  page.drawText(client?.principal_signatory_name || '___', {
    x: 129.5, y: H - 548 - SZ + 2, size: SZ, font, color: BLACK
  })

  // ── Правая колонка: компания принципала (top=617) ──
  page.drawRectangle({ x: 327, y: H - 617 - 1, width: 220, height: LH + 1, color: WHITE })
  page.drawText(client?.principal_company_name || '___', {
    x: 327.9, y: H - 617 - SZ + 2, size: SZ, font: bold, color: BLACK
  })

  // ── Левая колонка: должность агента (top=700) ──
  page.drawRectangle({ x: 70, y: H - 700 - 1, width: 240, height: LH + 1, color: WHITE })
  page.drawText(client?.agent_position || 'Управляющий', {
    x: 70.1, y: H - 700 - SZ + 2, size: SZ, font, color: BLACK
  })

  // ── Правая колонка: должность принципала (top=714) ──
  page.drawRectangle({ x: 323, y: H - 714 - 1, width: 230, height: LH + 1, color: WHITE })
  page.drawText(client?.principal_position || 'Генеральный директор', {
    x: 323.7, y: H - 714 - SZ + 2, size: SZ, font, color: BLACK
  })

  // ── ФИО агента (top=768 и 782) — две строки ──
  const agentName = client?.agent_signatory_name || '___'
  const agentParts = agentName.split(' ')
  const agentLine1 = agentParts.slice(0, 3).join(' ')
  const agentLine2 = agentParts.slice(3).join(' ')
  page.drawRectangle({ x: 70, y: H - 768 - 1, width: 240, height: LH + 1, color: WHITE })
  page.drawText(agentLine1, { x: 70.1, y: H - 768 - SZ + 2, size: SZ, font, color: BLACK })
  if (agentLine2) {
    page.drawRectangle({ x: 70, y: H - 782 - 1, width: 240, height: LH + 1, color: WHITE })
    page.drawText(agentLine2, { x: 70.1, y: H - 782 - SZ + 2, size: SZ, font, color: BLACK })
  }

  // ── ФИО принципала (top=754 и 768) ──
  const princName = client?.principal_signatory_name || '___'
  const princParts = princName.split(' ')
  const princLine1 = princParts.slice(0, 2).join(' ')
  const princLine2 = princParts.slice(2).join(' ')
  page.drawRectangle({ x: 323, y: H - 754 - 1, width: 230, height: LH + 1, color: WHITE })
  page.drawText(princLine1, { x: 323.7, y: H - 754 - SZ + 2, size: SZ, font, color: BLACK })
  if (princLine2) {
    page.drawRectangle({ x: 323, y: H - 768 - 1, width: 230, height: LH + 1, color: WHITE })
    page.drawText(princLine2, { x: 323.7, y: H - 768 - SZ + 2, size: SZ, font, color: BLACK })
  }

  // ── Подпись (агент — левая сторона) ──
  if (fs.existsSync(signaturePath)) {
    const sigBytes = fs.readFileSync(signaturePath)
    const sigImg = await pdfDoc.embedPng(sigBytes)
    // Подпись располагается между "Управляющий" (top=700) и ФИО (top=768)
    page.drawImage(sigImg, { x: 68, y: H - 755, width: 120, height: 55, opacity: 0.92 })
  }

  // ── Печать (агент — поверх подписи, левая сторона) ──
  if (fs.existsSync(stampPath)) {
    const stmpBytes = fs.readFileSync(stampPath)
    const stmpImg = await pdfDoc.embedPng(stmpBytes)
    page.drawImage(stmpImg, { x: 118, y: H - 775, width: 90, height: 90, opacity: 0.82 })
  }

  return pdfDoc.save()
}

async function generateInvoice(payment, client, bank) {
  const pdfDoc = await createPdfDoc()
  const page = pdfDoc.addPage([612, 792])
  const font = await pdfDoc.embedFont(fs.readFileSync(fontRegularPath), { subset: true })
  const bold = await pdfDoc.embedFont(fs.readFileSync(fontBoldPath), { subset: true })

  let y = 760
  const left = 50

  drawText(page, 'ИНВОЙС', left, y, { size: 18, font: bold })
  y -= 30
  drawText(page, `Номер: INV-${payment.payment_number || payment.id}`, left, y, { size: 11, font })
  y -= 18
  drawText(page, `Дата: ${formatDate(payment.payment_date)}`, left, y, { size: 11, font })
  y -= 18
  drawText(page, `Клиент: ${client?.name || '—'}`, left, y, { size: 11, font })
  y -= 18
  drawText(page, `Сумма: ${formatMoney(payment.amount)} ${payment.currency}`, left, y, { size: 11, font: bold })
  y -= 18
  drawText(page, `Назначение: ${payment.payment_purpose || '—'}`, left, y, { size: 10, font })
  y -= 18
  drawText(page, `Получатель: ${payment.recipient_name || '—'}`, left, y, { size: 10, font })
  y -= 14
  drawText(page, `Банк: ${payment.recipient_bank || '—'}`, left, y, { size: 10, font })
  y -= 14
  drawText(page, `IBAN: ${payment.recipient_iban || '—'}`, left, y, { size: 10, font })
  y -= 14
  drawText(page, `SWIFT: ${payment.recipient_swift || '—'}`, left, y, { size: 10, font })

  return pdfDoc.save()
}

async function generateReport(payment, client, bank) {
  const pdfDoc = await createPdfDoc()
  const page = pdfDoc.addPage([612, 792])
  const font = await pdfDoc.embedFont(fs.readFileSync(fontRegularPath), { subset: true })
  const bold = await pdfDoc.embedFont(fs.readFileSync(fontBoldPath), { subset: true })

  let y = 760
  const left = 50

  drawText(page, 'ОТЧЁТ О ВЫПОЛНЕНИИ ПЛАТЕЖА', left, y, { size: 16, font: bold })
  y -= 30
  drawText(page, `Номер платежа: ${payment.payment_number || payment.id}`, left, y, { size: 11, font })
  y -= 18
  drawText(page, `Дата: ${formatDate(payment.payment_date)}`, left, y, { size: 11, font })
  y -= 18
  drawText(page, `Клиент: ${client?.name || '—'}`, left, y, { size: 11, font })
  y -= 18
  drawText(page, `Сумма перевода: ${formatMoney(payment.amount)} ${payment.currency}`, left, y, { size: 11, font: bold })
  y -= 18
  drawText(page, `Курс: ${payment.exchange_rate || '—'}`, left, y, { size: 11, font })
  y -= 18
  drawText(page, `Сумма в рублях: ${formatMoney(payment.rub_amount)} ₽`, left, y, { size: 11, font })
  y -= 18
  drawText(page, `Комиссия: ${formatMoney(payment.commission_rub)} ₽`, left, y, { size: 11, font })
  y -= 18
  drawText(page, `Итого: ${formatMoney(payment.total_rub)} ₽`, left, y, { size: 11, font: bold })
  y -= 18
  drawText(page, `Получатель: ${payment.recipient_name || '—'}`, left, y, { size: 10, font })
  y -= 14
  drawText(page, `Назначение: ${payment.payment_purpose || '—'}`, left, y, { size: 10, font })
  y -= 30
  drawText(page, 'Сделка выполнена. Документ подтверждает перевод средств.', left, y, { size: 10, color: MUTED, font })

  return pdfDoc.save()
}

module.exports = { generateInvoice, generateApplication, generateReport }
