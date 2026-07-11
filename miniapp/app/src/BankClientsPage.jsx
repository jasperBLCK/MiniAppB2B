import { useState, useEffect } from 'react'
import { ChevronRight, SearchIcon, PlusIcon, CloseIcon } from './icons'
import ClientPaymentsPage from './ClientPaymentsPage'

const TELEGRAM_ID = 'dev'
const API = '/api'

const ClientAvatar = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  return (
    <div style={{
      width: 42,
      height: 42,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #10B981, #059669)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 16,
      fontWeight: 700,
      flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}

const ClientItem = ({ client, onClick, onEdit }) => (
  <div style={{
    background: '#fff',
    borderRadius: 16,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    marginBottom: 10,
  }}>
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }}>
      <ClientAvatar name={client.name} />
      <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{client.name}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={(e) => { e.stopPropagation(); onEdit() }} style={{
        padding: '6px 12px',
        borderRadius: 8,
        border: 'none',
        background: '#F1F5F9',
        color: '#64748B',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
      }}>Карточка</button>
      <ChevronRight color="#94A3B8" size={18} />
    </div>
  </div>
)

const profileFields = [
  { key: 'contract_number', label: '№ договора', placeholder: 'SL-FSS-21/25-MAR' },
  { key: 'contract_date', label: 'Дата договора', placeholder: '2025-03-21', type: 'date' },
  { key: 'company_name', label: 'Компания-контрагент', placeholder: 'СОЛИС ГРУП – ФЗКО' },
  { key: 'recipient_name', label: 'Получатель', placeholder: 'EXPORTADORA FRUTICOLA DEL SUR S.A' },
  { key: 'recipient_address', label: 'Адрес получателя', placeholder: 'CALLE AMADOR MERINO REYNA NRO. 465...' },
  { key: 'recipient_bank', label: 'Банк получателя', placeholder: 'BANCO SANTANDER PERU S.A' },
  { key: 'recipient_bank_address', label: 'Адрес банка', placeholder: 'LIMA, PERU' },
  { key: 'recipient_swift', label: 'SWIFT', placeholder: 'BSAPPEPL' },
  { key: 'recipient_iban', label: 'IBAN / Счёт', placeholder: '0008098620' },
  { key: 'contract_details', label: 'Контракт', placeholder: 'FS-EF 26.02.2025 от 26.02.2025' },
  { key: 'standard_payment_purpose', label: 'Стандартное назначение платежа', placeholder: 'PAYMENT FOR POMEGRANAT INV...' },
  { key: 'standard_commission_percent', label: 'Стандартная комиссия %', placeholder: '1.6', type: 'number' },
  { key: 'principal_company_name', label: 'Принципал — компания', placeholder: 'ООО «Ромашка»' },
  { key: 'principal_company_address', label: 'Принципал — адрес', placeholder: 'Москва, ул. ...' },
  { key: 'principal_position', label: 'Принципал — должность', placeholder: 'Управляющий' },
  { key: 'principal_signatory_name', label: 'Принципал — ФИО', placeholder: 'Махмадуллоев Фаррух Исматуллоевич' },
  { key: 'agent_company_name', label: 'Агент — компания', placeholder: 'ООО ЭФ.ЭС.СПБ' },
  { key: 'agent_company_address', label: 'Агент — адрес', placeholder: 'Свободной экономической зоны' },
  { key: 'agent_position', label: 'Агент — должность', placeholder: 'Генеральный директор' },
  { key: 'agent_signatory_name', label: 'Агент — ФИО', placeholder: 'Акбар Караппан Виду Исматуллоевич' },
]

const emptyProfile = () => {
  const obj = {}
  profileFields.forEach(f => obj[f.key] = '')
  return obj
}

export default function BankClientsPage({ bank, onBack }) {
  const [search, setSearch] = useState('')
  const [clients, setClients] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileClient, setProfileClient] = useState(null)
  const [profileData, setProfileData] = useState(emptyProfile())

  const loadClients = async () => {
    try {
      const res = await fetch(`${API}/banks/${bank.id}/clients?telegram_id=${TELEGRAM_ID}`)
      const data = await res.json()
      setClients(data)
    } catch (e) {
      console.error('Ошибка загрузки клиентов', e)
    }
  }

  useEffect(() => {
    loadClients()
  }, [bank.id])

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  const handleAdd = async () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      setError('Введите название клиента')
      return
    }
    if (clients.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Такой клиент уже добавлен')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/banks/${bank.id}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, telegram_id: TELEGRAM_ID }),
      })
      const data = await res.json()
      if (res.ok) {
        setClients([data, ...clients])
        setNewName('')
        setError('')
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
    setNewName('')
    setError('')
  }

  const openProfile = (client) => {
    setProfileClient(client)
    const data = {}
    profileFields.forEach(f => data[f.key] = client[f.key] || '')
    setProfileData(data)
    setProfileOpen(true)
  }

  const closeProfile = () => {
    setProfileOpen(false)
    setProfileClient(null)
    setProfileData(emptyProfile())
    setError('')
  }

  const saveProfile = async () => {
    if (!profileClient) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/clients/${profileClient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileData, telegram_id: TELEGRAM_ID }),
      })
      const data = await res.json()
      if (res.ok) {
        await loadClients()
        closeProfile()
      } else {
        setError(data.error || 'Ошибка сохранения')
      }
    } catch (e) {
      setError('Нет связи с сервером')
    } finally {
      setLoading(false)
    }
  }

  if (selectedClient) {
    return <ClientPaymentsPage client={selectedClient} onBack={() => setSelectedClient(null)} />
  }

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
        <span style={{ fontWeight: 800, fontSize: 20, color: '#0F172A' }}>{bank.name}</span>
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
            placeholder="Поиск клиента"
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

        {/* Client list */}
        {filtered.length > 0 && (
          <div>
            {filtered.map(client => (
              <ClientItem
                key={client.id}
                client={client}
                onClick={() => setSelectedClient(client)}
                onEdit={() => openProfile(client)}
              />
            ))}
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
            Клиенты не добавлены
          </div>
        )}

        {/* Add client button */}
        <button onClick={() => setIsOpen(true)} style={{
          width: '100%',
          background: '#fff',
          border: '1px dashed #A7F3D0',
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
            background: '#ECFDF5',
            borderRadius: 10,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PlusIcon color="#10B981" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#10B981' }}>Добавить клиента</span>
        </button>
      </div>

      {/* Add client modal */}
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
            borderRadius: '24px 24px 0 0',
            padding: '24px 20px 32px',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Добавить клиента</span>
              <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <CloseIcon />
              </button>
            </div>

            <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 6, display: 'block' }}>
              Название компании / ФИО
            </label>
            <input
              autoFocus
              value={newName}
              onChange={e => { setNewName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Например, ООО Ромашка"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 14,
                border: `1.5px solid ${error ? '#EF4444' : '#E2E8F0'}`,
                fontSize: 15,
                outline: 'none',
                marginBottom: error ? 8 : 20,
                color: '#0F172A',
              }}
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
                background: loading ? '#6EE7B7' : '#10B981',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Profile modal */}
      {profileOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15,23,42,0.45)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }} onClick={closeProfile}>
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
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Карточка клиента</span>
              <button onClick={closeProfile} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <CloseIcon />
              </button>
            </div>

            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{profileClient?.name}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>Постоянные реквизиты для автозаполнения</div>

            {profileFields.map((field, idx) => (
              <div key={field.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 5, display: 'block' }}>
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  value={profileData[field.key]}
                  onChange={e => {
                    setProfileData({ ...profileData, [field.key]: e.target.value })
                    setError('')
                  }}
                  placeholder={field.placeholder}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1.5px solid #E2E8F0',
                    fontSize: 14,
                    outline: 'none',
                    color: '#0F172A',
                  }}
                />
              </div>
            ))}

            {error && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 14 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={closeProfile} style={{
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
              <button onClick={saveProfile} disabled={loading} style={{
                flex: 1,
                padding: '14px',
                borderRadius: 14,
                border: 'none',
                background: loading ? '#6EE7B7' : '#10B981',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
