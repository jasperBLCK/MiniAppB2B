/**
 * APEX PAY — Premium Fintech Icon System
 * Style: Outline + Duotone, rounded caps, 1.6px stroke
 * Color tokens: primary #2563EB, fill #EFF6FF, dark #1E40AF
 */

// ─── Logo Mark ─────────────────────────────────────────────────────────────
// Concept: Two interlocking arcs forming an "A" with a horizontal
// transfer-arrow cutting through — reads as speed + exchange + precision.

export const ApexLogoMark = ({ size = 36, light = false }) => {
  const c = light ? '#FFFFFF' : '#2563EB'
  const s = light ? 'rgba(255,255,255,0.25)' : '#EFF6FF'
  const a = light ? 'rgba(255,255,255,0.55)' : '#BFDBFE'
  return (
    <svg viewBox="0 0 40 40" fill="none" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {/* Background pill */}
      <rect width="40" height="40" rx="11" fill={light ? 'rgba(255,255,255,0.15)' : '#EFF6FF'} />
      {/* Left leg of A */}
      <path d="M10 30 L20 10" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Right leg of A */}
      <path d="M20 10 L30 30" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Cross-bar with arrow — the "transfer" element */}
      <path d="M14 23 H23.5" stroke={a} strokeWidth="2" strokeLinecap="round"/>
      <path d="M21.5 20.5 L24.5 23 L21.5 25.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export const ApexLogoFull = ({ height = 32, light = false }) => {
  const textColor = light ? '#FFFFFF' : '#0F172A'
  const subColor = light ? 'rgba(255,255,255,0.65)' : '#2563EB'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <ApexLogoMark size={height + 4} light={light} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontWeight: 800,
          fontSize: height * 0.56,
          color: textColor,
          letterSpacing: '-0.5px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>APEX</span>
        <span style={{
          fontWeight: 600,
          fontSize: height * 0.36,
          color: subColor,
          letterSpacing: '2.5px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}>PAY</span>
      </div>
    </div>
  )
}

// ─── Card Icons (36×36, duotone) ────────────────────────────────────────────

export const BankIcon = ({ size = 36 }) => (
  <svg viewBox="0 0 36 36" fill="none" width={size} height={size}>
    {/* Duotone fill layer */}
    <rect x="6" y="14" width="24" height="16" rx="2" fill="#BFDBFE" opacity="0.5"/>
    {/* Roof / pediment */}
    <path d="M4 14L18 5L32 14" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Base line */}
    <path d="M4 30H32" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round"/>
    {/* Left pillar */}
    <path d="M9 18V27" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round"/>
    {/* Center pillar */}
    <path d="M18 18V27" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round"/>
    {/* Right pillar */}
    <path d="M27 18V27" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round"/>
    {/* Platform */}
    <path d="M6 14H30" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round"/>
  </svg>
)

export const ClientsIcon = ({ size = 36 }) => (
  <svg viewBox="0 0 36 36" fill="none" width={size} height={size}>
    {/* Duotone fill */}
    <circle cx="13" cy="12" r="5" fill="#BFDBFE" opacity="0.5"/>
    <circle cx="25" cy="13" r="3.5" fill="#BFDBFE" opacity="0.35"/>
    {/* Primary person */}
    <circle cx="13" cy="12" r="4.5" stroke="#2563EB" strokeWidth="1.7"/>
    <path d="M4 29c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="#2563EB" strokeWidth="1.7" strokeLinecap="round"/>
    {/* Secondary person */}
    <circle cx="25" cy="13" r="3.2" stroke="#1E40AF" strokeWidth="1.5"/>
    <path d="M28 24c1.9.8 3.3 2.7 3.3 4.9" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M22 24c-.9.4-1.7 1.1-2.3 2" stroke="#1E40AF" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export const PaymentsIcon = ({ size = 36 }) => (
  <svg viewBox="0 0 36 36" fill="none" width={size} height={size}>
    {/* Card body duotone */}
    <rect x="4" y="10" width="28" height="18" rx="4" fill="#BFDBFE" opacity="0.45"/>
    {/* Card outline */}
    <rect x="4" y="10" width="28" height="18" rx="4" stroke="#2563EB" strokeWidth="1.7"/>
    {/* Stripe */}
    <path d="M4 16H32" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="square"/>
    {/* Chip */}
    <rect x="8" y="21" width="7" height="4" rx="1.5" fill="#BFDBFE" stroke="#2563EB" strokeWidth="1.3"/>
    {/* Dots */}
    <circle cx="24" cy="23" r="1.2" fill="#2563EB"/>
    <circle cx="28" cy="23" r="1.2" fill="#1E40AF" opacity="0.5"/>
    {/* Arrow — transfer signal */}
    <path d="M20 7 L24 4 L28 7" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 4V9" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

export const DocsIcon = ({ size = 36 }) => (
  <svg viewBox="0 0 36 36" fill="none" width={size} height={size}>
    {/* Page body duotone */}
    <path d="M9 4H22L31 13V32C31 32.6 30.6 33 30 33H9C8.4 33 8 32.6 8 32V5C8 4.4 8.4 4 9 4Z" fill="#BFDBFE" opacity="0.45"/>
    {/* Page outline */}
    <path d="M9 4H22L31 13V32C31 32.6 30.6 33 30 33H9C8.4 33 8 32.6 8 32V5C8 4.4 8.4 4 9 4Z" stroke="#2563EB" strokeWidth="1.7" strokeLinejoin="round"/>
    {/* Fold */}
    <path d="M22 4V13H31" stroke="#2563EB" strokeWidth="1.7" strokeLinejoin="round"/>
    {/* Lines of text */}
    <path d="M13 20H26" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M13 24H26" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M13 28H20" stroke="#1E40AF" strokeWidth="1.6" strokeLinecap="round" opacity="0.6"/>
    {/* Checkmark seal */}
    <circle cx="26" cy="28" r="4" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1.4"/>
    <path d="M24 28L25.5 29.5L28 27" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const SettingsIcon = ({ size = 36 }) => (
  <svg viewBox="0 0 36 36" fill="none" width={size} height={size}>
    {/* Outer ring duotone */}
    <circle cx="18" cy="18" r="12" fill="#BFDBFE" opacity="0.3"/>
    {/* Inner circle */}
    <circle cx="18" cy="18" r="4.5" stroke="#2563EB" strokeWidth="1.7"/>
    {/* Gear teeth — 6 nodes evenly spaced */}
    {[0,60,120,180,240,300].map((deg, i) => {
      const r1 = 9.5, r2 = 13
      const a = (deg * Math.PI) / 180
      const x1 = 18 + r1 * Math.sin(a), y1 = 18 - r1 * Math.cos(a)
      const x2 = 18 + r2 * Math.sin(a), y2 = 18 - r2 * Math.cos(a)
      return <path key={i} d={`M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}`}
        stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round"/>
    })}
    {/* Outer track */}
    <circle cx="18" cy="18" r="11" stroke="#2563EB" strokeWidth="1.5" strokeDasharray="3.5 2.5"/>
  </svg>
)

// ─── Nav Bar Icons (22×22) ───────────────────────────────────────────────────

export const HomeNavIcon = ({ active }) => {
  const c = active ? '#2563EB' : '#94A3B8'
  const f = active ? '#BFDBFE' : 'transparent'
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
      {active && <path d="M5 11.5V21H10V16H14V21H19V11.5" fill={f} opacity="0.4"/>}
      <path d="M3 11L12 3L21 11" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 9.5V20C5 20.6 5.4 21 6 21H9.5V16.5H14.5V21H18C18.6 21 19 20.6 19 20V9.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export const ClientNavIcon = ({ active }) => {
  const c = active ? '#2563EB' : '#94A3B8'
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
      {active && <circle cx="9" cy="7" r="4" fill="#BFDBFE" opacity="0.45"/>}
      <circle cx="9" cy="7" r="3.5" stroke={c} strokeWidth="1.7"/>
      <path d="M2 21c0-4.4 3.1-7 7-7s7 3.1 7 7" stroke={c} strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M17 11c1.7 0 3 1.3 3 3M19 21c1.2-.5 2-1.7 2-3" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity={active ? 1 : 0.7}/>
    </svg>
  )
}

export const PayNavIcon = ({ active }) => {
  const c = active ? '#2563EB' : '#94A3B8'
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
      {active && <rect x="3" y="7" width="18" height="12" rx="3" fill="#BFDBFE" opacity="0.4"/>}
      <rect x="3" y="7" width="18" height="12" rx="3" stroke={c} strokeWidth="1.7"/>
      <path d="M3 11H21" stroke={c} strokeWidth="1.8" strokeLinecap="square"/>
      <rect x="6" y="14" width="5" height="3" rx="1" stroke={c} strokeWidth="1.3"/>
    </svg>
  )
}

export const SettingsNavIcon = ({ active }) => {
  const c = active ? '#2563EB' : '#94A3B8'
  return (
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
      {active && <circle cx="12" cy="12" r="8" fill="#BFDBFE" opacity="0.35"/>}
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.7"/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const r1 = 5.5, r2 = 8.5
        const a = (deg * Math.PI) / 180
        const x1 = 12 + r1 * Math.sin(a), y1 = 12 - r1 * Math.cos(a)
        const x2 = 12 + r2 * Math.sin(a), y2 = 12 - r2 * Math.cos(a)
        return <path key={i} d={`M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}`}
          stroke={c} strokeWidth="1.9" strokeLinecap="round"/>
      })}
    </svg>
  )
}

// ─── Utility Icons ───────────────────────────────────────────────────────────

export const ChevronRight = ({ color = '#2563EB', size = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
    <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const SearchIcon = ({ size = 20, color = '#94A3B8' }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
    <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8"/>
    <path d="M16 16L21 21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const PlusIcon = ({ size = 20, color = '#2563EB' }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
    <path d="M12 5V19M5 12H19" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const CloseIcon = ({ size = 20, color = '#64748B' }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
    <path d="M6 6L18 18M18 6L6 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const MenuIcon = ({ light = false }) => (
  <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
    <path d="M4 6H20" stroke={light ? '#fff' : '#374151'} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M4 12H16" stroke={light ? '#fff' : '#374151'} strokeWidth="1.8" strokeLinecap="round"/>
    <path d="M4 18H20" stroke={light ? '#fff' : '#374151'} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

export const BuildingIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
    <rect x="3" y="8" width="18" height="13" rx="1.5" fill="#BFDBFE" opacity="0.4"/>
    <path d="M3 21H21M5 21V9L12 5L19 9V21" stroke="#2563EB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="9" y="14" width="6" height="7" rx="1" stroke="#2563EB" strokeWidth="1.4"/>
  </svg>
)

export const GlobeIcon = ({ size = 20 }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size}>
    <circle cx="12" cy="12" r="9" fill="#BFDBFE" opacity="0.35"/>
    <circle cx="12" cy="12" r="9" stroke="#2563EB" strokeWidth="1.6"/>
    <path d="M12 3C9.5 6.2 8 9.2 8 12S9.5 17.8 12 21M12 3C14.5 6.2 16 9.2 16 12S14.5 17.8 12 21" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3.5 9H20.5M3.5 15H20.5" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
