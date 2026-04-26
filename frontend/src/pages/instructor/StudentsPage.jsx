import { useState, useEffect } from 'react'
import { api } from '../../utils/api.js'
import { Spinner, TYPE_COLORS } from '../../components/ui.jsx'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', courseIds: [] })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.students.list(), api.courses.list()])
      .then(([sRes, cRes]) => { setStudents(sRes.students); setCourses(cRes.courses) })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const { student } = await api.students.create({ ...form, courseIds: form.courseIds.map(Number) })
      setStudents(ss => [student, ...ss])
      setForm({ name: '', email: '', password: '', courseIds: [] })
      setShowForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this student?')) return
    await api.students.delete(id)
    setStudents(ss => ss.filter(s => s.id !== id))
  }

  const toggleCourse = id => {
    setForm(f => ({
      ...f,
      courseIds: f.courseIds.includes(id) ? f.courseIds.filter(c => c !== id) : [...f.courseIds, id]
    }))
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Spinner color="var(--text3)" /> <span style={{ color: 'var(--text3)' }}>Loading students...</span>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p className="serif" style={{ fontSize: 22, color: 'var(--text)' }}>Students</p>
          <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 3 }}>{students.length} registered</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{
          background: showForm ? 'var(--bg4)' : 'linear-gradient(135deg,#6C8EFF,#A78BFA)',
          border: showForm ? '1px solid var(--border2)' : 'none',
          borderRadius: 8, padding: '8px 18px', color: showForm ? 'var(--text2)' : 'white',
          fontSize: 13, fontWeight: 500, cursor: 'pointer'
        }}>{showForm ? 'Cancel' : '+ Register Student'}</button>
      </div>

      {/* Registration form */}
      {showForm && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 10, padding: 22, marginBottom: 24 }}>
          <p style={{ fontWeight: 500, color: 'var(--text)', fontSize: 14, marginBottom: 18 }}>Register New Student</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputSt} placeholder="e.g. Bilal Khan" />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputSt} placeholder="student@university.edu" />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input required type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={inputSt} placeholder="Min 6 characters" />
              </div>
              <div>
                <label style={labelStyle}>Enroll in Courses</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                  {courses.map(c => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.courseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
                      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{c.code} — {c.title.substring(0, 28)}{c.title.length > 28 ? '…' : ''}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 12, background: '#F8717115', padding: '8px 10px', borderRadius: 6 }}>{error}</p>}
            <button type="submit" disabled={submitting} style={{
              background: submitting ? 'var(--bg4)' : 'var(--accent)', border: 'none',
              borderRadius: 7, padding: '8px 22px', color: 'white', fontSize: 13, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer'
            }}>{submitting ? 'Registering…' : 'Register'}</button>
          </form>
        </div>
      )}

      {/* Students grid */}
      {students.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text3)' }}>
          <p style={{ fontSize: 15, marginBottom: 6 }}>No students yet</p>
          <p style={{ fontSize: 13 }}>Register your first student using the button above</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 12 }}>
          {students.map(s => {
            const initials = s.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
            return (
              <div key={s.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, flexShrink: 0,
                  background: 'linear-gradient(135deg,#6C8EFF22,#A78BFA22)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, color: 'var(--accent)'
                }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{s.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{s.email}</p>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {s.courses?.map(c => (
                      <span key={c.id} style={{ fontSize: 9, background: 'var(--accent)22', color: 'var(--accent)', padding: '2px 7px', borderRadius: 3, fontWeight: 600 }}>{c.code}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 2, flexShrink: 0 }}>×</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const labelStyle = { fontSize: 11, fontWeight: 500, color: 'var(--text2)', display: 'block', marginBottom: 5 }
const inputSt = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 7, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }
