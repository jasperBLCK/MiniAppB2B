import { useState, useEffect } from 'react'
import { ChevronRight, SearchIcon, PlusIcon, CloseIcon, HomeNavIcon, ClientNavIcon, PayNavIcon, SettingsNavIcon } from './icons'
import BankClientsPage from './BankClientsPage'

const TELEGRAM_ID = 'dev'
const API = '/api'

const navItems = [
  { label: 'Главная', icon: (a) => <HomeNavIcon active={a} />, id: 'home' },
  { label: 'Клиенты', icon: (a) => <ClientNavIcon active={a} />, id: 'clients' },
  { label: 'Платежи', icon: (a) => <PayNavIcon active={a} />, id: 'payments' },
  { label: 'Настройки', icon: (a) => <SettingsNavIcon active={a} />, id: 'settings' },
]

const BankAvatar = ({ name }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  return (
    <div style={{
      width: 44,
      height: 44,
      borderRadius: 12,
      background: 'linear-gradient(135deg, #2563EB, #1E40AF)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 18,
      fontWeight: 700,
      flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}

const BankItem = ({ bank, onClick }) => (
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
      <BankAvatar name={bank.name} />
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 4 }}>{bank.name}</div>
        <div style={{ fontSize: 13, color: '#64748B' }}>
          Клиентов <span style={{ color: '#2563EB', fontWeight: 700 }}>{bank.clients}</span>
        </div>
      </div>
    </div>
    <ChevronRight color="#94A3B8" size={18} />
  </div>
)

export default function BanksPage({ onBack }) {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('home')
  const [banks, setBanks] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedBank, setSelectedBank] = useState(null)

  const loadBanks = async () => {
    try {
      const res = await fetch(`${API}/banks?telegram_id=${TELEGRAM_ID}`)
      const data = await res.json()
      setBanks(data.map(b => ({ id: b.id, name: b.name, clients: 0 })))
    } catch (e) {
      console.error('Ошибка загрузки банков', e)
    }
  }

  useEffect(() => {
    loadBanks()
  }, [])

  const filtered = banks.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  const handleAdd = async () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      setError('Введите название банка')
      return
    }
    if (banks.some(b => b.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Такой банк уже добавлен')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/banks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, telegram_id: TELEGRAM_ID }),
      })
      const data = await res.json()
      if (res.ok) {
        setBanks([...banks, { id: data.id, name: data.name, clients: 0 }])
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

  if (selectedBank) {
    return <BankClientsPage bank={selectedBank} onBack={() => setSelectedBank(null)} />
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
        <span style={{ fontWeight: 800, fontSize: 20, color: '#0F172A' }}>Банки</span>
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
            placeholder="Поиск банка"
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

        {/* Bank list */}
        {filtered.length > 0 && (
          <div>
            {filtered.map(bank => <BankItem key={bank.id} bank={bank} onClick={() => setSelectedBank(bank)} />)}
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
            Банки не добавлены
          </div>
        )}

        {/* Add bank button */}
        <button onClick={() => setIsOpen(true)} style={{
          width: '100%',
          background: '#fff',
          border: '1px dashed #BFDBFE',
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
            background: '#EFF6FF',
            borderRadius: 10,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <PlusIcon />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#2563EB' }}>Добавить банк</span>
        </button>
      </div>

      {/* Modal */}
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
              <span style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>Добавить банк</span>
              <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <CloseIcon />
              </button>
            </div>

            <label style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginBottom: 6, display: 'block' }}>
              Название банка
            </label>
            <input
              autoFocus
              value={newName}
              onChange={e => { setNewName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Например, СберБанк"
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
                background: loading ? '#93C5FD' : '#2563EB',
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        background: '#fff',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0 12px',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.07)',
        zIndex: 50,
      }}>
        {navItems.map(({ label, icon, id }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '4px 12px',
                borderRadius: 12,
                transition: 'background 0.15s',
              }}
            >
              {isActive ? (
                <div style={{ background: '#eff6ff', borderRadius: 10, padding: '4px 14px 2px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  {icon(true)}
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#2563eb' }}>{label}</span>
                </div>
              ) : (
                <>
                  {icon(false)}
                  <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>{label}</span>
                </>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
