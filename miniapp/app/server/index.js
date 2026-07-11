const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')
const { generateInvoice, generateApplication, generateReport } = require('./pdf')

const app = express()
const PORT = process.env.PORT || 3001

const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)

app.use(cors())
app.use(express.json())

const dbPath = path.join(__dirname, 'database.sqlite')
const db = new sqlite3.Database(dbPath)

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS banks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      telegram_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bank_id INTEGER NOT NULL,
      telegram_id TEXT NOT NULL,
      name TEXT NOT NULL,
      contract_number TEXT,
      contract_date TEXT,
      company_name TEXT,
      recipient_name TEXT,
      recipient_address TEXT,
      recipient_bank TEXT,
      recipient_bank_address TEXT,
      recipient_swift TEXT,
      recipient_iban TEXT,
      contract_details TEXT,
      standard_payment_purpose TEXT,
      standard_commission_percent REAL DEFAULT 0,
      principal_company_name TEXT,
      principal_company_address TEXT,
      principal_signatory_name TEXT,
      principal_position TEXT,
      agent_company_name TEXT,
      agent_company_address TEXT,
      agent_signatory_name TEXT,
      agent_position TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      telegram_id TEXT NOT NULL,
      payment_number INTEGER,
      payment_date TEXT,
      deadline_date TEXT,
      amount REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      exchange_rate REAL,
      rub_amount REAL DEFAULT 0,
      commission_percent REAL DEFAULT 0,
      commission_rub REAL DEFAULT 0,
      total_rub REAL DEFAULT 0,
      product_name TEXT,
      payment_purpose TEXT,
      recipient_name TEXT,
      recipient_address TEXT,
      recipient_bank TEXT,
      recipient_bank_address TEXT,
      recipient_swift TEXT,
      recipient_iban TEXT,
      contract_details TEXT,
      company_name TEXT,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    )
  `)
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_id INTEGER NOT NULL,
      telegram_id TEXT NOT NULL,
      type TEXT NOT NULL,
      filename TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
    )
  `)
})

// GET all banks for a user
app.get('/api/banks', (req, res) => {
  const telegramId = req.query.telegram_id || 'dev'
  db.all(
    'SELECT id, name FROM banks WHERE telegram_id = ? ORDER BY created_at DESC',
    [telegramId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(rows)
    }
  )
})

// POST add bank
app.post('/api/banks', (req, res) => {
  const { name, telegram_id } = req.body
  const telegramId = telegram_id || 'dev'

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Название банка обязательно' })
  }

  db.run(
    'INSERT INTO banks (telegram_id, name) VALUES (?, ?)',
    [telegramId, name.trim()],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ id: this.lastID, name: name.trim(), telegram_id: telegramId })
    }
  )
})

// DELETE bank
app.delete('/api/banks/:id', (req, res) => {
  const telegramId = req.query.telegram_id || 'dev'
  db.run(
    'DELETE FROM banks WHERE id = ? AND telegram_id = ?',
    [req.params.id, telegramId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ deleted: this.changes })
    }
  )
})

// GET clients for a bank
app.get('/api/banks/:bankId/clients', (req, res) => {
  const telegramId = req.query.telegram_id || 'dev'
  db.all(
    'SELECT * FROM clients WHERE bank_id = ? AND telegram_id = ? ORDER BY created_at DESC',
    [req.params.bankId, telegramId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(rows)
    }
  )
})

// GET single client
app.get('/api/clients/:id', (req, res) => {
  const telegramId = req.query.telegram_id || 'dev'
  db.get(
    'SELECT * FROM clients WHERE id = ? AND telegram_id = ?',
    [req.params.id, telegramId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message })
      if (!row) return res.status(404).json({ error: 'Клиент не найден' })
      res.json(row)
    }
  )
})

// POST add client to a bank
app.post('/api/banks/:bankId/clients', (req, res) => {
  const data = req.body
  const telegramId = data.telegram_id || 'dev'
  const bankId = req.params.bankId

  if (!data.name || !data.name.trim()) {
    return res.status(400).json({ error: 'Название клиента обязательно' })
  }

  const fields = [
    'bank_id', 'telegram_id', 'name',
    'contract_number', 'contract_date', 'company_name',
    'recipient_name', 'recipient_address', 'recipient_bank', 'recipient_bank_address',
    'recipient_swift', 'recipient_iban', 'contract_details',
    'standard_payment_purpose', 'standard_commission_percent',
    'principal_company_name', 'principal_company_address', 'principal_signatory_name', 'principal_position',
    'agent_company_name', 'agent_company_address', 'agent_signatory_name', 'agent_position'
  ]
  const values = [
    bankId, telegramId, data.name?.trim(),
    data.contract_number || '', data.contract_date || '', data.company_name || '',
    data.recipient_name || '', data.recipient_address || '', data.recipient_bank || '', data.recipient_bank_address || '',
    data.recipient_swift || '', data.recipient_iban || '', data.contract_details || '',
    data.standard_payment_purpose || '', data.standard_commission_percent || 0,
    data.principal_company_name || '', data.principal_company_address || '', data.principal_signatory_name || '', data.principal_position || '',
    data.agent_company_name || '', data.agent_company_address || '', data.agent_signatory_name || '', data.agent_position || ''
  ]

  const columns = fields.join(', ')
  const placeholders = fields.map(() => '?').join(', ')

  db.run(
    `INSERT INTO clients (${columns}) VALUES (${placeholders})`,
    values,
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ id: this.lastID, name: data.name?.trim(), bank_id: parseInt(bankId) })
    }
  )
})

// PATCH update client profile
app.patch('/api/clients/:id', (req, res) => {
  const data = req.body
  const telegramId = data.telegram_id || 'dev'
  const clientId = req.params.id

  const fields = [
    'name', 'contract_number', 'contract_date', 'company_name',
    'recipient_name', 'recipient_address', 'recipient_bank', 'recipient_bank_address',
    'recipient_swift', 'recipient_iban', 'contract_details',
    'standard_payment_purpose', 'standard_commission_percent',
    'principal_company_name', 'principal_company_address', 'principal_signatory_name', 'principal_position',
    'agent_company_name', 'agent_company_address', 'agent_signatory_name', 'agent_position'
  ]
  const updates = []
  const values = []
  fields.forEach(f => {
    if (data[f] !== undefined) {
      updates.push(`${f} = ?`)
      values.push(data[f])
    }
  })

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Нет данных для обновления' })
  }
  values.push(clientId, telegramId)

  db.run(
    `UPDATE clients SET ${updates.join(', ')} WHERE id = ? AND telegram_id = ?`,
    values,
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ updated: this.changes })
    }
  )
})

// DELETE client
app.delete('/api/clients/:id', (req, res) => {
  const telegramId = req.query.telegram_id || 'dev'
  db.run(
    'DELETE FROM clients WHERE id = ? AND telegram_id = ?',
    [req.params.id, telegramId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ deleted: this.changes })
    }
  )
})

// GET payments for a client
app.get('/api/clients/:clientId/payments', (req, res) => {
  const telegramId = req.query.telegram_id || 'dev'
  db.all(
    'SELECT * FROM payments WHERE client_id = ? AND telegram_id = ? ORDER BY created_at DESC',
    [req.params.clientId, telegramId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json(rows)
    }
  )
})

// GET single payment with documents
app.get('/api/payments/:id', (req, res) => {
  const telegramId = req.query.telegram_id || 'dev'
  db.get(
    'SELECT * FROM payments WHERE id = ? AND telegram_id = ?',
    [req.params.id, telegramId],
    (err, payment) => {
      if (err) return res.status(500).json({ error: err.message })
      if (!payment) return res.status(404).json({ error: 'Платёж не найден' })
      db.all(
        'SELECT * FROM documents WHERE payment_id = ? AND telegram_id = ? ORDER BY created_at DESC',
        [req.params.id, telegramId],
        (err2, docs) => {
          if (err2) return res.status(500).json({ error: err2.message })
          res.json({ ...payment, documents: docs || [] })
        }
      )
    }
  )
})

// POST add payment to a client
app.post('/api/clients/:clientId/payments', (req, res) => {
  const data = req.body
  const telegramId = data.telegram_id || 'dev'
  const clientId = req.params.clientId

  if (!data.amount || isNaN(data.amount) || Number(data.amount) <= 0) {
    return res.status(400).json({ error: 'Укажите сумму' })
  }

  db.get('SELECT * FROM clients WHERE id = ? AND telegram_id = ?', [clientId, telegramId], (err, client) => {
    if (err) return res.status(500).json({ error: err.message })
    if (!client) return res.status(404).json({ error: 'Клиент не найден' })

    const amount = Number(data.amount)
    const currency = data.currency || 'USD'
    const exchangeRate = data.exchange_rate ? Number(data.exchange_rate) : null
    const commissionPercent = data.commission_percent !== undefined ? Number(data.commission_percent) : (client.standard_commission_percent || 0)
    const paymentDate = data.payment_date || new Date().toISOString().split('T')[0]

    // Auto calculations
    let rubAmount = 0
    let commissionRub = 0
    let totalRub = 0
    if (exchangeRate && exchangeRate > 0) {
      rubAmount = amount * exchangeRate
      commissionRub = rubAmount * (commissionPercent / 100)
      totalRub = rubAmount + commissionRub
    }

    // Auto-fill from client profile
    const recipientName = data.recipient_name || client.recipient_name || ''
    const recipientAddress = data.recipient_address || client.recipient_address || ''
    const recipientBank = data.recipient_bank || client.recipient_bank || ''
    const recipientBankAddress = data.recipient_bank_address || client.recipient_bank_address || ''
    const recipientSwift = data.recipient_swift || client.recipient_swift || ''
    const recipientIban = data.recipient_iban || client.recipient_iban || ''
    const contractDetails = data.contract_details || client.contract_details || ''
    const paymentPurpose = data.payment_purpose || client.standard_payment_purpose || data.description || ''
    const companyName = data.company_name || client.company_name || ''
    const productName = data.product_name || ''

    const deadlineDate = data.deadline_date || null

    // Generate payment number — global autoincrement
    db.get('SELECT MAX(payment_number) as maxNum FROM payments WHERE telegram_id = ?', [telegramId], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message })
      const paymentNumber = (row?.maxNum || 0) + 1

      const fields = [
        'client_id', 'telegram_id', 'payment_number', 'payment_date', 'deadline_date', 'amount', 'currency', 'exchange_rate',
        'rub_amount', 'commission_percent', 'commission_rub', 'total_rub', 'product_name', 'payment_purpose',
        'recipient_name', 'recipient_address', 'recipient_bank', 'recipient_bank_address', 'recipient_swift', 'recipient_iban',
        'contract_details', 'company_name', 'description'
      ]
      const values = [
        clientId, telegramId, paymentNumber, paymentDate, deadlineDate, amount, currency, exchangeRate,
        rubAmount, commissionPercent, commissionRub, totalRub, productName, paymentPurpose,
        recipientName, recipientAddress, recipientBank, recipientBankAddress, recipientSwift, recipientIban,
        contractDetails, companyName, data.description || ''
      ]
      const columns = fields.join(', ')
      const placeholders = fields.map(() => '?').join(', ')

      db.run(
        `INSERT INTO payments (${columns}) VALUES (${placeholders})`,
        values,
        function (err3) {
          if (err3) return res.status(500).json({ error: err3.message })
          res.json({
            id: this.lastID,
            payment_number: paymentNumber,
            payment_date: paymentDate,
            deadline_date: deadlineDate,
            amount,
            currency,
            exchange_rate: exchangeRate,
            rub_amount: rubAmount,
            commission_percent: commissionPercent,
            commission_rub: commissionRub,
            total_rub: totalRub,
            product_name: productName,
            payment_purpose: paymentPurpose,
            recipient_name: recipientName,
            recipient_address: recipientAddress,
            recipient_bank: recipientBank,
            recipient_bank_address: recipientBankAddress,
            recipient_swift: recipientSwift,
            recipient_iban: recipientIban,
            contract_details: contractDetails,
            company_name: companyName,
            description: data.description || '',
            status: 'new',
          })
        }
      )
    })
  })
})

// PATCH update payment status
app.patch('/api/payments/:id', (req, res) => {
  const { status, telegram_id } = req.body
  const telegramId = telegram_id || 'dev'
  if (!['new', 'processing', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Неверный статус' })
  }
  db.run(
    'UPDATE payments SET status = ? WHERE id = ? AND telegram_id = ?',
    [status, req.params.id, telegramId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ updated: this.changes })
    }
  )
})

// DELETE payment
app.delete('/api/payments/:id', (req, res) => {
  const telegramId = req.query.telegram_id || 'dev'
  db.run(
    'DELETE FROM payments WHERE id = ? AND telegram_id = ?',
    [req.params.id, telegramId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ deleted: this.changes })
    }
  )
})

// POST generate document PDF
app.post('/api/payments/:id/documents', async (req, res) => {
  const telegramId = req.body.telegram_id || req.query.telegram_id || 'dev'
  const type = req.body.type
  const paymentId = req.params.id

  if (!['invoice', 'application', 'report'].includes(type)) {
    return res.status(400).json({ error: 'Неверный тип документа' })
  }

  db.get('SELECT * FROM payments WHERE id = ? AND telegram_id = ?', [paymentId, telegramId], (err, payment) => {
    if (err) return res.status(500).json({ error: err.message })
    if (!payment) return res.status(404).json({ error: 'Платёж не найден' })

    db.get('SELECT * FROM clients WHERE id = ? AND telegram_id = ?', [payment.client_id, telegramId], (err2, client) => {
      if (err2) return res.status(500).json({ error: err2.message })
      db.get('SELECT * FROM banks WHERE id = ? AND telegram_id = ?', [client?.bank_id, telegramId], (err3, bank) => {
        if (err3) return res.status(500).json({ error: err3.message })

        const generate = type === 'invoice' ? generateInvoice : type === 'application' ? generateApplication : generateReport
        const filename = `${type}_${payment.payment_number || payment.id}.pdf`
        const filePath = path.join(uploadsDir, filename)

        generate(payment, client, bank).then(async (pdfBytes) => {
          fs.writeFileSync(filePath, pdfBytes)

          db.get('SELECT * FROM documents WHERE payment_id = ? AND type = ? AND telegram_id = ?', [paymentId, type, telegramId], (err4, existing) => {
            if (err4) return res.status(500).json({ error: err4.message })
            if (existing) {
              db.run('UPDATE documents SET filename = ? WHERE id = ?', [filename, existing.id], function (err5) {
                if (err5) return res.status(500).json({ error: err5.message })
                res.json({ id: existing.id, type, filename, payment_id: parseInt(paymentId) })
              })
            } else {
              db.run('INSERT INTO documents (payment_id, telegram_id, type, filename) VALUES (?, ?, ?, ?)', [paymentId, telegramId, type, filename], function (err5) {
                if (err5) return res.status(500).json({ error: err5.message })
                res.json({ id: this.lastID, type, filename, payment_id: parseInt(paymentId) })
              })
            }
          })
        }).catch(err => res.status(500).json({ error: err.message }))
      })
    })
  })
})

// GET download document
app.get('/api/documents/:id/download', (req, res) => {
  const telegramId = req.query.telegram_id || 'dev'
  db.get('SELECT * FROM documents WHERE id = ? AND telegram_id = ?', [req.params.id, telegramId], (err, doc) => {
    if (err) return res.status(500).json({ error: err.message })
    if (!doc) return res.status(404).json({ error: 'Документ не найден' })
    const filePath = path.join(uploadsDir, doc.filename)
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Файл не найден' })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${doc.filename}"`)
    fs.createReadStream(filePath).pipe(res)
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
