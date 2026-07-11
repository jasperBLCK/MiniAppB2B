import { useState, useEffect } from 'react'
import { ChevronRight } from './icons'

const TELEGRAM_ID = 'dev'
const API = '/api'

const statusLabels = {
  new: { text: 'Новый', bg: '#DBEAFE', color: '#2563EB' },
  processing: { text: 'В обработке', bg: '#FEF3C7', color: '#D97706' },
  closed: { text: 'Закрыт', bg: '#DCFCE7', color: '#16A34A' },
}

const docTypeLabels = {
  invoice: 'Инвойс',
  application: 'Заявка',
  report: 'Отчёт',
}


const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
    <span style={{ fontSize: 13, color: '#64748B' }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', textAlign: 'right', maxWidth: '60%' }}>{value || '—'}</span>
  </div>
)

export default function PaymentDetailPage({ payment, onBack }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState({})

  const loadDetail = async () => {
    try {
      const res = await fetch(`${API}/payments/${payment.id}?telegram_id=${TELEGRAM_ID}`)
      const data = await res.json()
      setDetail(data)
    } catch (e) {
      console.error('Ошибка загрузки', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDetail()
  }, [payment.id])

  const p = detail || payment
  const st = statusLabels[p.status] || statusLabels.new
  const docs = detail?.documents || []

  const handleGenerate = async (type) => {
    setGenerating(g => ({ ...g, [type]: true }))
    try {
      const res = await fetch(`${API}/payments/${payment.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, telegram_id: TELEGRAM_ID }),
      })
      if (res.ok) {
        await loadDetail()
      } else {
        const data = await res.json()
        alert(data.error || 'Ошибка генерации')
      }
    } catch (e) {
      alert('Нет связи с сервером')
    } finally {
      setGenerating(g => ({ ...g, [type]: false }))
    }
  }

  const handleDownload = (docId, filename) => {
    window.open(`${API}/documents/${docId}/download?telegram_id=${TELEGRAM_ID}`, '_blank')
  }


  const formatRub = (n) => Number(n || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 })

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
        <span style={{ fontWeight: 800, fontSize: 20, color: '#0F172A' }}>{p.payment_number || `Платёж #${p.id}`}</span>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 30px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#94A3B8' }}>Загрузка...</div>
        ) : (
          <>
            {/* Status + Amount card */}
            <div style={{
              background: '#fff',
              borderRadius: 18,
              padding: '20px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              marginBottom: 14,
              textAlign: 'center',
            }}>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '5px 14px',
                borderRadius: 20,
                background: st.bg,
                color: st.color,
              }}>
                {st.text}
              </span>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginTop: 14 }}>
                {Number(p.amount).toLocaleString()} {p.currency}
              </div>
              {p.description && (
                <div style={{ fontSize: 14, color: '#64748B', marginTop: 6 }}>{p.description}</div>
              )}
            </div>

            {/* Details card */}
            <div style={{
              background: '#fff',
              borderRadius: 18,
              padding: '16px 18px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Детали</div>
              <InfoRow label="Номер" value={p.payment_number} />
              <InfoRow label="Дата заявки" value={p.payment_date ? new Date(p.payment_date).toLocaleDateString('ru-RU') : '—'} />
              <InfoRow label="Срок исполнения" value={p.deadline_date ? new Date(p.deadline_date).toLocaleDateString('ru-RU') : '—'} />
              <InfoRow label="Курс обмена" value={p.exchange_rate ? `${p.exchange_rate}` : '—'} />
              <InfoRow label="Сумма в рублях" value={`${formatRub(p.rub_amount)} ₽`} />
              <InfoRow label="Комиссия" value={`${p.commission_percent || 0}% = ${formatRub(p.commission_rub)} ₽`} />
              <InfoRow label="Итого" value={`${formatRub(p.total_rub)} ₽`} />
              <InfoRow label="Товар" value={p.product_name} />
              <InfoRow label="Назначение" value={p.payment_purpose} />
              <InfoRow label="Компания" value={p.company_name} />
            </div>

            {/* Recipient details */}
            <div style={{
              background: '#fff',
              borderRadius: 18,
              padding: '16px 18px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Реквизиты получателя</div>
              <InfoRow label="Получатель" value={p.recipient_name} />
              <InfoRow label="Адрес" value={p.recipient_address} />
              <InfoRow label="Банк" value={p.recipient_bank} />
              <InfoRow label="Адрес банка" value={p.recipient_bank_address} />
              <InfoRow label="IBAN / Счёт" value={p.recipient_iban} />
              <InfoRow label="SWIFT" value={p.recipient_swift} />
              <InfoRow label="Контракт" value={p.contract_details} />
            </div>

            {/* Documents card */}
            <div style={{
              background: '#fff',
              borderRadius: 18,
              padding: '16px 18px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              marginBottom: 14,
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', marginBottom: 12 }}>Документы</div>
              {docs.length === 0 ? (
                <div style={{ color: '#94A3B8', fontSize: 13, padding: '8px 0' }}>Документов пока нет</div>
              ) : (
                docs.map(doc => (
                  <div key={doc.id} onClick={() => handleDownload(doc.id, doc.filename)} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #F1F5F9',
                    cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: doc.type === 'invoice' ? '#EDE9FE' : doc.type === 'application' ? '#DBEAFE' : doc.type === 'report' ? '#DCFCE7' : '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        color: doc.type === 'invoice' ? '#7C3AED' : doc.type === 'application' ? '#2563EB' : doc.type === 'report' ? '#16A34A' : '#64748B',
                      }}>
                        PDF
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{docTypeLabels[doc.type] || doc.type}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{doc.filename || 'Файл'}</div>
                      </div>
                    </div>
                    <ChevronRight color="#94A3B8" size={16} />
                  </div>
                ))
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <button onClick={() => handleGenerate('application')} disabled={generating.application} style={{
                  flex: 1,
                  minWidth: 110,
                  padding: '12px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#DBEAFE',
                  color: '#2563EB',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: generating.application ? 0.7 : 1,
                }}>{generating.application ? '...' : 'Заявка'}</button>
                <button onClick={() => handleGenerate('report')} disabled={generating.report} style={{
                  flex: 1,
                  minWidth: 110,
                  padding: '12px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#DCFCE7',
                  color: '#16A34A',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: generating.report ? 0.7 : 1,
                }}>{generating.report ? '...' : 'Отчёт'}</button>
                <button onClick={() => handleGenerate('invoice')} disabled={generating.invoice} style={{
                  flex: 1,
                  minWidth: 110,
                  padding: '12px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#EDE9FE',
                  color: '#7C3AED',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: generating.invoice ? 0.7 : 1,
                }}>{generating.invoice ? '...' : 'Инвойс'}</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
