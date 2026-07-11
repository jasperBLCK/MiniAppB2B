import { useState, useEffect } from 'react'
import { ChevronRight, SearchIcon, PlusIcon, CloseIcon } from './icons'
import PaymentDetailPage from './PaymentDetailPage'

const TELEGRAM_ID = 'dev'
const API = '/api'

const statusLabels = {
  new: { text: 'Новый', bg: '#DBEAFE', color: '#2563EB' },
  processing: { text: 'В обработке', bg: '#FEF3C7', color: '#D97706' },
  closed: { text: 'Закрыт', bg: '#DCFCE7', color: '#16A34A' },
}

const PaymentItem = ({ payment, onClick }) => {
  const st = statusLabels[payment.status] || statusLabels.new
  return (
    <div onClick={onClick} style={{
      background: '#fff',
      borderRadius: 16,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
      marginBottom: 10,
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #F59E0B, #D97706)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {payment.currency === 'USD' ? '$' : payment.currency === 'EUR' ? '€' : payment.currency === 'CNY' ? '¥' : '₽'}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>
            {payment.payment_number || `#${payment.id}`}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
            {Number(payment.amount).toLocaleString()} {payment.currency}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: 20,
          background: st.bg,
          color: st.color,
        }}>
          {st.text}
        </span>
        <ChevronRight color="#94A3B8" size={16} />
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1.5px solid #E2E8F0',
  fontSize: 14,
  outline: 'none',
  color: '#0F172A',
  background: '#fff',
}

const labelStyle = { fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 5, display: 'block' }

export default function ClientPaymentsPage({ client, onBack }) {
  const [search, setSearch] = useState('')
  const [payments, setPayments] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fullClient, setFullClient] = useState(client)

  // Form fields
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [exchangeRate, setExchangeRate] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [productName, setProductName] = useState('')
  const [paymentPurpose, setPaymentPurpose] = useState('')
  const [commissionPercent, setCommissionPercent] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [recipientBank, setRecipientBank] = useState('')
  const [recipientBankAddress, setRecipientBankAddress] = useState('')
  const [recipientSwift, setRecipientSwift] = useState('')
  const [recipientIban, setRecipientIban] = useState('')
  const [contractDetails, setContractDetails] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [deadlineDate, setDeadlineDate] = useState('')

  const loadPayments = async () => {
    try {
      const res = await fetch(`${API}/clients/${client.id}/payments?telegram_id=${TELEGRAM_ID}`)
      const data = await res.json()
      setPayments(data)
    } catch (e) {
      console.error('Ошибка загрузки платежей', e)
    }
  }

  const loadClient = async () => {
    try {
      const res = await fetch(`${API}/clients/${client.id}?telegram_id=${TELEGRAM_ID}`)
      const data = await res.json()
      setFullClient(data)
    } catch (e) {
      console.error('Ошибка загрузки клиента', e)
    }
  }

  useEffect(() => {
    loadPayments()
    loadClient()
  }, [client.id])

  const filtered = payments.filter(p =>
    (p.payment_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.payment_purpose || '').toLowerCase().includes(search.toLowerCase()) ||
    String(p.amount).includes(search)
  )

  const openForm = () => {
    const c = fullClient
    setCurrency(c?.standard_commission_percent ? 'USD' : 'USD')
    setCommissionPercent(c?.standard_commission_percent ? String(c.standard_commission_percent) : '')
    setRecipientName(c?.recipient_name || '')
    setRecipientAddress(c?.recipient_address || '')
    setRecipientBank(c?.recipient_bank || '')
    setRecipientBankAddress(c?.recipient_bank_address || '')
    setRecipientSwift(c?.recipient_swift || '')
    setRecipientIban(c?.recipient_iban || '')
    setContractDetails(c?.contract_details || '')
    setPaymentPurpose(c?.standard_payment_purpose || '')
    setCompanyName(c?.company_name || '')
    setProductName('')
    setPaymentDate(new Date().toISOString().split('T')[0])
    setExchangeRate('')
    setAmount('')
    setDescription('')
    setDeadlineDate('')
    setError('')
    setIsOpen(true)
  }

  const resetForm = () => {
    setAmount('')
    setCurrency('USD')
    setExchangeRate('')
    setPaymentDate(new Date().toISOString().split('T')[0])
    setProductName('')
    setPaymentPurpose('')
    setCommissionPercent('')
    setRecipientName('')
    setRecipientAddress('')
    setRecipientBank('')
    setRecipientBankAddress('')
    setRecipientSwift('')
    setRecipientIban('')
    setContractDetails('')
    setCompanyName('')
    setDescription('')
    setDeadlineDate('')
    setError('')
  }

  const calculated = () => {
    const amt = Number(amount)
    const rate = Number(exchangeRate)
    const pct = Number(commissionPercent)
    if (!amt || !rate) return { rub: 0, commission: 0, total: 0 }
    const rub = amt * rate
    const commission = rub * (pct || 0) / 100
    return { rub, commission, total: rub + commission }
  }

  const handleAdd = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('Введите корректную сумму')
      return
    }
    if (!exchangeRate || isNaN(exchangeRate) || Number(exchangeRate) <= 0) {
      setError('Введите курс обмена')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/clients/${client.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          currency,
          exchange_rate: Number(exchangeRate),
          payment_date: paymentDate,
          product_name: productName,
          payment_purpose: paymentPurpose,
          commission_percent: commissionPercent ? Number(commissionPercent) : 0,
          recipient_name: recipientName,
          recipient_address: recipientAddress,
          recipient_bank: recipientBank,
          recipient_bank_address: recipientBankAddress,
          recipient_swift: recipientSwift,
          recipient_iban: recipientIban,
          contract_details: contractDetails,
          company_name: companyName,
          deadline_date: deadlineDate || null,
          description,
          telegram_id: TELEGRAM_ID,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setPayments([data, ...payments])
        resetForm()
        setIsOpen(false)
      } else {
        setError(data.error || 'Ошибка сохранения')
      }
    } catch (e) {
      setError('Нет связи с сервером')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    resetForm()
  }

  if (selectedPayment) {
    return <PaymentDetailPage payment={selectedPayment} onBack={() => { setSelectedPayment(null); loadPayments() }} />
  }

  const calc = calculated()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: '#eef2f8' }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <button onClick={onBack} style={{
          background: '#F1F5F9',
          border: 'none',
          borderRadius: 10,
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transform: 'rotate(180deg)',
        }}>
          <ChevronRight color="#374151" size={18} />
        </button>
        <span style={{ fontWeight: 800, fontSize: 20, color: '#0F172A' }}>{client.name}</span>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 90px' }}>
        {/* Search */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          marginBottom: 14,
        }}>
          <SearchIcon />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск платежа"
            style={{
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: '#0F172A',
              flex: 1,
              background: 'transparent',
            }}
          />
        </div>

        {/* Payments list */}
        {filtered.length > 0 && (
          <div>
            {filtered.map(p => <PaymentItem key={p.id} payment={p} onClick={() => setSelectedPayment(p)} />)}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{
            background: '#fff',
            borderRadius: 18,
            padding: '36px 20px',
            textAlign: 'center',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            color: '#94A3B8',
            fontSize: 15,
          }}>
            Платежей нет
          </div>
        )}

        {/* Add payment button */}
        <button onClick={openForm} style={{
          width: '100%',
          background: '#fff',
          border: '1px dashed #FDE68A',
          borderRadius: 16,
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          cursor: 'pointer',
          marginTop: 14,
        }}>
          <div style={{
            background: '#FFFBEB',
            borderRadius: 10,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PlusIcon color="#D97706" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#D97706' }}>Создать платёж</span>
        </button>
      </div>

      {/* Modal — Create Payment */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.45)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }} onClick={handleCancel}>
          <div style={{
            background: '#fff',
            width: '100%',
            maxWidth: 430,
            maxHeight: '85vh',
            overflowY: 'auto',
            borderRadius: '24px 24px 0 0',
            padding: '24px 20px 32px',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Новый платёж</span>
              <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <CloseIcon />
              </button>
            </div>

            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 14 }}>Поля со * обязательны. Остальные подставляются из карточки клиента.</div>

            {/* Amount + Currency */}
            <label style={labelStyle}>Сумма *</label>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input
                autoFocus
                value={amount}
                onChange={e => { setAmount(e.target.value); setError('') }}
                placeholder="40000.00"
                type="number"
                style={{ ...inputStyle, flex: 1 }}
              />
              <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inputStyle, width: 90, flex: 'none' }}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="RUB">RUB</option>
                <option value="CNY">CNY</option>
              </select>
            </div>

            {/* Exchange rate */}
            <label style={labelStyle}>Курс обмена *</label>
            <input
              value={exchangeRate}
              onChange={e => { setExchangeRate(e.target.value); setError('') }}
              placeholder="73.20"
              type="number"
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            {/* Payment date */}
            <label style={labelStyle}>Дата заявки</label>
            <input
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              type="date"
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            {/* Deadline date */}
            <label style={labelStyle}>Срок исполнения</label>
            <input
              value={deadlineDate}
              onChange={e => setDeadlineDate(e.target.value)}
              type="date"
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            {/* Product */}
            <label style={labelStyle}>Товар</label>
            <input
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="гранаты"
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            {/* Payment purpose */}
            <label style={labelStyle}>Назначение платежа</label>
            <input
              value={paymentPurpose}
              onChange={e => setPaymentPurpose(e.target.value)}
              placeholder="PAYMENT FOR POMEGRANAT INV. FC07-00002654"
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            {/* Commission */}
            <label style={labelStyle}>Комиссия агента, %</label>
            <input
              value={commissionPercent}
              onChange={e => setCommissionPercent(e.target.value)}
              placeholder="1.6"
              type="number"
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            {/* Calculation preview */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Автоматический расчёт</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#64748B' }}>Сумма в рублях:</span>
                <span style={{ fontWeight: 600 }}>{calc.rub.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#64748B' }}>Комиссия:</span>
                <span style={{ fontWeight: 600 }}>{calc.commission.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#64748B' }}>Итого:</span>
                <span style={{ fontWeight: 700 }}>{calc.total.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</span>
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Реквизиты получателя</div>
            <input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Получатель" style={{ ...inputStyle, marginBottom: 8 }} />
            <input value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} placeholder="Адрес получателя" style={{ ...inputStyle, marginBottom: 8 }} />
            <input value={recipientBank} onChange={e => setRecipientBank(e.target.value)} placeholder="Банк получателя" style={{ ...inputStyle, marginBottom: 8 }} />
            <input value={recipientBankAddress} onChange={e => setRecipientBankAddress(e.target.value)} placeholder="Адрес банка" style={{ ...inputStyle, marginBottom: 8 }} />
            <input value={recipientIban} onChange={e => setRecipientIban(e.target.value)} placeholder="IBAN / Счёт" style={{ ...inputStyle, marginBottom: 8 }} />
            <input value={recipientSwift} onChange={e => setRecipientSwift(e.target.value)} placeholder="SWIFT" style={{ ...inputStyle, marginBottom: 12 }} />

            <label style={labelStyle}>Контракт</label>
            <input
              value={contractDetails}
              onChange={e => setContractDetails(e.target.value)}
              placeholder="FS-EF 26.02.2025 от 26.02.2025"
              style={{ ...inputStyle, marginBottom: 12 }}
            />

            {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 14 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCancel} style={{
                flex: 1,
                padding: '14px',
                borderRadius: 14,
                border: '1px solid #E2E8F0',
                background: '#fff',
                color: '#64748B',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}>Отмена</button>
              <button onClick={handleAdd} disabled={loading} style={{
                flex: 1,
                padding: '14px',
                borderRadius: 14,
                border: 'none',
                background: loading ? '#FDE68A' : '#D97706',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>{loading ? 'Сохранение...' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
