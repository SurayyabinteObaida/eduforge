import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

export default function InstructorLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const page = location.pathname.includes('students') ? 'students' : 'courses'

  const initials = user?.name?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'DR'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 20px',
        height: 52, flexShrink: 0, gap: 20
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg,#6C8EFF,#A78BFA)',
            borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 4h10M2 7h7M2 10h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="serif" style={{ fontSize: 16, color: 'var(--text)' }}>EduForge</span>
        </div>

        {/* Nav tabs */}
        {['courses', 'students'].map(p => (
          <button key={p} onClick={() => navigate(p === 'courses' ? '/instructor' : '/instructor/students')}
            style={{
              background: 'none', border: 'none',
              color: page === p ? 'var(--accent)' : 'var(--text2)',
              fontSize: 13, fontWeight: page === p ? 500 : 400,
              padding: '4px 0', cursor: 'pointer', textTransform: 'capitalize',
              borderBottom: page === p ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              marginBottom: -1
            }}
          >{p}</button>
        ))}

        <div style={{ flex: 1 }} />

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28,
            background: 'linear-gradient(135deg,#6C8EFF33,#A78BFA33)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: 'var(--accent)'
          }}>{initials}</div>
          <span style={{ fontSize: 12, color: 'var(--text2)' }}>{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login') }} style={{
            background: 'none', border: '1px solid var(--border2)', borderRadius: 5,
            padding: '3px 10px', color: 'var(--text3)', fontSize: 11, cursor: 'pointer'
          }}>Sign out</button>
        </div>
      </div>

      {/* Page content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <Outlet />
      </div>
    </div>
  )
}
