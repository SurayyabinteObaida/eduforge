// ─── Spinner ──────────────────────────────────────────────
export function Spinner({ size = 14, color = 'white' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${color}30`,
      borderTop: `2px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0
    }} />
  )
}

// ─── Toggle switch ────────────────────────────────────────
export function Toggle({ enabled, onChange, small = false }) {
  const w = small ? 28 : 36
  const h = small ? 16 : 20
  const t = small ? 12 : 16
  return (
    <div
      onClick={e => { e.stopPropagation(); onChange(e) }}
      style={{
        width: w, height: h,
        background: enabled ? 'var(--accent)' : 'var(--border2)',
        borderRadius: h, cursor: 'pointer', position: 'relative',
        flexShrink: 0, transition: 'background 0.2s'
      }}
    >
      <div style={{
        width: t, height: t, background: 'white', borderRadius: '50%',
        position: 'absolute',
        top: (h - t) / 2,
        left: enabled ? w - t - (h - t) / 2 : (h - t) / 2,
        transition: 'left 0.2s'
      }} />
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────
export function EmptyState({ icon, label, sub, action, onAction }) {
  const icons = {
    slides: <path d="M3 4h18v13H3zM8 20h8M12 17v3" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    resources: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="var(--text3)" strokeWidth="1.5" strokeLinejoin="round"/>,
    visualizer: <><circle cx="12" cy="12" r="9" stroke="var(--text3)" strokeWidth="1.5"/><path d="M12 8v8M8 12h8" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"/></>,
    students: <><circle cx="12" cy="8" r="3.5" stroke="var(--text3)" strokeWidth="1.5"/><path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"/></>,
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: 48 }}>
      <div style={{ width: 52, height: 52, background: 'var(--bg3)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">{icons[icon]}</svg>
      </div>
      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text2)' }}>{label}</p>
      <p style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>{sub}</p>
      {action && (
        <button onClick={onAction} style={{
          background: 'linear-gradient(135deg,#6C8EFF,#A78BFA)', border: 'none',
          borderRadius: 8, padding: '8px 20px', color: 'white', fontSize: 13, fontWeight: 500,
          cursor: 'pointer', marginTop: 4
        }}>{action}</button>
      )}
    </div>
  )
}

// ─── Form field wrapper ───────────────────────────────────
export function Field({ label, hint, children }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginBottom: 5 }}>{label}</p>
      {children}
      {hint && <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{hint}</p>}
    </div>
  )
}

// ─── Input style ──────────────────────────────────────────
export const inputStyle = {
  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)',
  borderRadius: 7, padding: '7px 10px', color: 'var(--text)', fontSize: 13, outline: 'none'
}

// ─── Resource type config ─────────────────────────────────
export const TYPE_COLORS = {
  link: '#6C8EFF', paper: '#A78BFA', framework: '#34D399',
  playground: '#F59E0B', tool: '#60A5FA', visualizer: '#F87171'
}

export const TYPE_LABELS = ['link', 'paper', 'framework', 'playground', 'tool', 'visualizer']

// ─── AI Panel shell ───────────────────────────────────────
export function AIPanelShell({ title, icon, onClose, children, footer }) {
  return (
    <div className="slide-in" style={{
      width: 360, background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 22, height: 22, background: icon.bg, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon.svg}
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{title}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 20, lineHeight: 1, cursor: 'pointer' }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
      {footer && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          {footer}
        </div>
      )}
    </div>
  )
}

// ─── Gradient button ──────────────────────────────────────
export function GradientButton({ onClick, disabled, loading, children, gradient = 'linear-gradient(135deg,#6C8EFF,#A78BFA)', style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled || loading} style={{
      background: (disabled || loading) ? 'var(--bg4)' : gradient,
      border: 'none', borderRadius: 8, padding: '9px 16px',
      color: 'white', fontSize: 13, fontWeight: 500,
      cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: '100%', ...style
    }}>
      {loading ? <><Spinner /> Loading...</> : children}
    </button>
  )
}
