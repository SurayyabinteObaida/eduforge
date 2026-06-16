import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import SlidesDownloadButton from "../components/SlidesDownloadButton";

export default function InstructorLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const page = location.pathname.includes('students') ? 'students' : 'courses'
  const initials = user?.name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'IN'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 20px', height: 52, flexShrink: 0, gap: 20 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#1A6B5A,#3DAA8A)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 7h7M2 10h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>EduForge</span>
        </div>

        {/* Nav */}
        {['courses', 'students'].map(p => (
          <button key={p} onClick={() => navigate(p === 'courses' ? '/instructor' : '/instructor/students')}
            style={{ background: 'none', border: 'none', color: page === p ? 'var(--accent)' : 'var(--text2)', fontSize: 13, fontWeight: page === p ? 600 : 400, padding: '4px 0', cursor: 'pointer', textTransform: 'capitalize', borderBottom: page === p ? '1.5px solid var(--accent)' : '1.5px solid transparent', marginBottom: -1 }}>
            {p}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, background: '#1A6B5A18', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#1A6B5A' }}>{initials}</div>
          <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500 }}>{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', color: 'var(--text3)', fontSize: 11, cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <Outlet />
      </div>
    </div>
  )
}