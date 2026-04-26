import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user?.name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'ST'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 20px',
        height: 52, flexShrink: 0, gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#34D399,#6C8EFF)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 7h7M2 10h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span className="serif" style={{ fontSize: 16, color: 'var(--text)' }}>EduForge</span>
          <span style={{ fontSize: 10, background: '#34D39920', color: '#34D399', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>Student</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#34D39922,#6C8EFF22)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#34D399' }}>{initials}</div>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 5, padding: '3px 10px', color: 'var(--text3)', fontSize: 11, cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <Outlet />
      </div>
    </div>
  )
}
