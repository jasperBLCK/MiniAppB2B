import { useState } from 'react'
import './App.css'
import BanksPage from './BanksPage'
import {
  BankIcon,
  ClientsIcon,
  PaymentsIcon,
  DocsIcon,
  SettingsIcon,
  HomeNavIcon,
  ClientNavIcon,
  PayNavIcon,
  SettingsNavIcon,
  ChevronRight,
  MenuIcon,
  BuildingIcon,
  GlobeIcon,
} from './icons'

const deals = []

const navItems = [
  { label: 'Главная', icon: (a) => <HomeNavIcon active={a} />, id: 'home' },
  { label: 'Клиенты', icon: (a) => <ClientNavIcon active={a} />, id: 'clients' },
  { label: 'Платежи', icon: (a) => <PayNavIcon active={a} />, id: 'payments' },
  { label: 'Настройки', icon: (a) => <SettingsNavIcon active={a} />, id: 'settings' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [page, setPage] = useState('home')

  if (page === 'banks') {
    return <BanksPage onBack={() => setPage('home')} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', background: '#eef2f8' }}>
      {/* Header */}
      <header style={{
        background: '#fff',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <span style={{ fontWeight: 800, fontSize: 20, color: '#0F172A', letterSpacing: '-0.5px' }}>
          APEX <span style={{ color: '#2563EB' }}>PAY</span>
        </span>
        <button style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, padding: '9px 11px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <MenuIcon />
        </button>
      </header>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 90px' }}>

        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF4FF 60%, #DBEAFE 100%)',
          borderRadius: 24,
          padding: '26px 20px 22px 24px',
          marginBottom: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
          position: 'relative',
          minHeight: 160,
          boxShadow: '0 4px 24px rgba(37,99,235,0.10)',
          border: '1px solid rgba(219,234,254,0.8)',
        }}>
          {/* Decorative circle blur */}
          <div style={{
            position: 'absolute',
            right: -20,
            top: -30,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(147,197,253,0.35) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ zIndex: 1, flex: '0 0 55%', maxWidth: '55%' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', lineHeight: 1.2, marginBottom: 10 }}>
              Добро<br />пожаловать
            </h1>
            <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
              Управляйте переводами,<br />
              клиентами и документами<br />
              в одном месте
            </p>
          </div>
          <div style={{ flex: '0 0 45%', maxWidth: '45%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
            <img src="/logo.jpg" alt="" style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 20px rgba(37,99,235,0.22))' }} />
          </div>
        </div>

        {/* 4 Menu Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          {[
            { label: 'Банки', icon: <BankIcon />, action: () => setPage('banks') },
            { label: 'Клиенты', icon: <ClientsIcon /> },
            { label: 'Платежи', icon: <PaymentsIcon /> },
            { label: 'Документы', icon: <DocsIcon /> },
          ].map(({ label, icon, action }) => (
            <button key={label} onClick={action} style={{
              background: '#fff',
              border: 'none',
              borderRadius: 18,
              padding: '22px 16px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              cursor: 'pointer',
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              gap: 12,
            }}>
              <div style={{
                background: '#EFF6FF',
                borderRadius: 16,
                width: 58,
                height: 58,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(37,99,235,0.10)',
              }}>
                {icon}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>{label}</span>
                <div style={{ background: '#eff6ff', borderRadius: 50, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Deals */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Последние сделки</span>
            <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              Все сделки <ChevronRight color="#2563eb" size={14} />
            </button>
          </div>

          {deals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0 8px', color: '#9ca3af', fontSize: 14 }}>
              Сделок пока нет
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {deals.map((deal, i) => (
                <div key={deal.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 4px',
                  borderBottom: i < deals.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      background: '#eff6ff',
                      borderRadius: 10,
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {deal.icon}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{deal.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 20,
                      whiteSpace: 'nowrap',
                      background: deal.status === 'Завершено' ? '#dcfce7' : deal.status === 'В работе' ? '#dbeafe' : '#fff7ed',
                      color: deal.status === 'Завершено' ? '#16a34a' : deal.status === 'В работе' ? '#2563eb' : '#ea580c',
                    }}>
                      {deal.status}
                    </span>
                    <ChevronRight color="#9ca3af" size={16} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

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
