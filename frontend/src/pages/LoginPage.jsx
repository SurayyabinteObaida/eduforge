import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'instructor' ? '/instructor' : '/student', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="fade-in" style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#1A6B5A,#3DAA8A)', borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 4px 16px #1A6B5A22' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 10h11M3 14h8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px' }}>EduForge</h1>
          <p style={{ color: 'var(--text3)', fontSize: 13, marginTop: 4 }}>Course Management Portal</p>
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px', boxShadow: '0 4px 24px rgba(26,46,38,0.07)' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>Sign in to your account</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={inputStyle} />
            </div>
            {error && <div style={{ background: '#B85C5C12', border: '1px solid #B85C5C30', borderRadius: 7, padding: '9px 12px', color: 'var(--danger)', fontSize: 13 }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 4, background: loading ? 'var(--bg3)' : '#1A6B5A', border: 'none', borderRadius: 8, padding: '11px', color: 'white', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: loading ? 'none' : '0 2px 12px #1A6B5A33' }}>
              {loading ? <><Spinner /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, marginTop: 20 }}>Contact your instructor to get access</p>
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 7, padding: '9px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' }

function Spinner() {
  return <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
}