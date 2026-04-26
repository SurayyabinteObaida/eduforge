import { useState, useEffect } from 'react'
import { api } from '../../utils/api.js'
import { Spinner } from '../../components/ui.jsx'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { type: 'create' | 'edit', data? }
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.students.list(), api.courses.list()])
      .then(([sRes, cRes]) => { setStudents(sRes.students); setCourses(cRes.courses) })
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (form) => {
    const { student } = await api.students.create({ ...form, courseIds: form.courseIds.map(Number) })
    // Re-fetch to get courses populated
    const { students: fresh } = await api.students.list()
    setStudents(fresh)
    setModal(null)
  }

  const handleUpdate = async (id, form) => {
    await api.students.update(id, { name: form.name, email: form.email, password: form.password || undefined })
    // Handle enrollment changes
    const student = students.find(s => s.id === id)
    const currentCourseIds = student.courses?.map(c => c.id) || []
    const newCourseIds = form.courseIds.map(Number)
    const toEnroll = newCourseIds.filter(id => !currentCourseIds.includes(id))
    const toUnenroll = currentCourseIds.filter(id => !newCourseIds.includes(id))
    await Promise.all([
      ...toEnroll.map(cid => api.students.enroll(id, cid)),
      ...toUnenroll.map(cid => api.students.unenroll(id, cid))
    ])
    const { students: fresh } = await api.students.list()
    setStudents(fresh)
    setModal(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this student? This cannot be undone.')) return
    await api.students.delete(id)
    setStudents(ss => ss.filter(s => s.id !== id))
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Spinner color="var(--text3)" /> <span style={{ color: 'var(--text3)' }}>Loading students...</span>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p className="serif" style={{ fontSize: 22, color: 'var(--text)' }}>Students</p>
          <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 3 }}>{students.length} registered</p>
        </div>
        <button onClick={() => setModal({ type: 'create' })} style={{ background: 'linear-gradient(135deg,#6C8EFF,#A78BFA)', border: 'none', borderRadius: 8, padding: '8px 18px', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
          + Register Student
        </button>
      </div>

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
                <div style={{ width: 40, height: 40, flexShrink: 0, background: 'linear-gradient(135deg,#6C8EFF22,#A78BFA22)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{s.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>{s.email}</p>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {s.courses?.map(c => (
                      <span key={c.id} style={{ fontSize: 9, background: 'var(--accent)22', color: 'var(--accent)', padding: '2px 7px', borderRadius: 3, fontWeight: 600 }}>{c.code}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                  <button onClick={() => setModal({ type: 'edit', data: s })} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 5, padding: '3px 8px', color: 'var(--text3)', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: '1px solid #F8717130', borderRadius: 5, padding: '3px 8px', color: 'var(--danger)', fontSize: 11, cursor: 'pointer' }}>Remove</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <StudentFormModal
          title={modal.type === 'create' ? 'Register New Student' : 'Edit Student'}
          initial={modal.data}
          courses={courses}
          isEdit={modal.type === 'edit'}
          onSubmit={form => modal.type === 'create' ? handleCreate(form) : handleUpdate(modal.data.id, form)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

function StudentFormModal({ title, initial = {}, courses, isEdit, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    password: '',
    courseIds: initial.courses?.map(c => c.id) || []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleCourse = id => {
    setForm(f => ({ ...f, courseIds: f.courseIds.includes(id) ? f.courseIds.filter(c => c !== id) : [...f.courseIds, id] }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name || !form.email) { setError('Name and email are required.'); return }
    if (!isEdit && !form.password) { setError('Password is required.'); return }
    setLoading(true)
    try { await onSubmit(form) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 480 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 20 }}>{title}</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={lbl}>Full Name</p>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={iSt} placeholder="Ayesha Siddiqui" />
            </div>
            <div>
              <p style={lbl}>Email</p>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={iSt} placeholder="student@uni.edu" />
            </div>
          </div>
          <div>
            <p style={lbl}>{isEdit ? 'New Password (leave blank to keep)' : 'Password'}</p>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={iSt} placeholder={isEdit ? 'Leave blank to keep current' : 'Min 6 characters'} />
          </div>
          <div>
            <p style={lbl}>Course Enrollments</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              {courses.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.courseIds.includes(c.id)} onChange={() => toggleCourse(c.id)} style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{c.code} — {c.title.substring(0, 32)}{c.title.length > 32 ? '…' : ''}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 12, background: '#F8717115', padding: '8px 10px', borderRadius: 6 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 7, padding: '7px 16px', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#6C8EFF,#A78BFA)', border: 'none', borderRadius: 7, padding: '7px 20px', color: 'white', fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const lbl = { fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginBottom: 5 }
const iSt = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 7, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }
