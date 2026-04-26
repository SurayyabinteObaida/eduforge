import { useState } from 'react'
import { useCourses, useLesson } from '../../hooks/useCourses.js'
import { Toggle, EmptyState, Spinner } from '../../components/ui.jsx'
import { api } from '../../utils/api.js'
import SlidesTab from './SlidesTab.jsx'
import ResourcesTab from './ResourcesTab.jsx'
import VisualizerTab from './VisualizerTab.jsx'
import PresentationModal from './PresentationModal.jsx'

const COURSE_COLORS = ['#6C8EFF','#A78BFA','#34D399','#F59E0B','#F87171','#60A5FA','#EC4899']

export default function CoursesPage() {
  const { courses, loading, reload, toggleModule, toggleLesson, markLessonHasSlides } = useCourses()
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [aiPanel, setAiPanel] = useState(null)
  const [tab, setTab] = useState('Slides')
  const [presenting, setPresenting] = useState(false)
  const [modal, setModal] = useState(null)

  const { lesson, loading: lessonLoading, saveSlides, addResource, toggleResource, deleteResource } = useLesson(selectedLessonId)
  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  let selectedModuleId = null
  if (selectedCourse && selectedLessonId) {
    for (const m of selectedCourse.modules) {
      if (m.lessons?.find(l => l.id === selectedLessonId)) { selectedModuleId = m.id; break }
    }
  }

  const handleSaveSlides = async (data) => {
    await saveSlides(data)
    if (selectedCourse && selectedModuleId && selectedLessonId) {
      markLessonHasSlides(selectedCourseId, selectedModuleId, selectedLessonId)
    }
  }

  const handleCreateCourse = async (data) => { await api.courses.create(data); reload(); setModal(null) }
  const handleUpdateCourse = async (id, data) => { await api.courses.update(id, data); reload(); setModal(null) }
  const handleDeleteCourse = async (id) => {
    if (!confirm('Delete this course and all its content?')) return
    await api.courses.delete(id)
    if (selectedCourseId === id) { setSelectedCourseId(null); setSelectedLessonId(null) }
    reload()
  }

  const handleCreateModule = async (courseId, title) => {
    const order = selectedCourse?.modules?.length || 0
    await api.courses.createModule(courseId, { title, sort_order: order })
    reload(); setModal(null)
  }
  const handleUpdateModule = async (courseId, moduleId, title) => { await api.courses.updateModule(courseId, moduleId, { title }); reload(); setModal(null) }
  const handleDeleteModule = async (courseId, moduleId) => {
    if (!confirm('Delete this module and all its lessons?')) return
    await api.courses.deleteModule(courseId, moduleId)
    const mod = selectedCourse?.modules?.find(m => m.id === moduleId)
    if (mod?.lessons?.find(l => l.id === selectedLessonId)) setSelectedLessonId(null)
    reload()
  }

  const handleCreateLesson = async (courseId, moduleId, title) => {
    const mod = selectedCourse?.modules?.find(m => m.id === moduleId)
    await api.courses.createLesson(courseId, moduleId, { title, sort_order: mod?.lessons?.length || 0 })
    reload(); setModal(null)
  }
  const handleUpdateLesson = async (courseId, moduleId, lessonId, title) => { await api.courses.updateLesson(courseId, moduleId, lessonId, { title }); reload(); setModal(null) }
  const handleDeleteLesson = async (courseId, moduleId, lessonId) => {
    if (!confirm('Delete this lesson?')) return
    await api.courses.deleteLesson(courseId, moduleId, lessonId)
    if (selectedLessonId === lessonId) setSelectedLessonId(null)
    reload()
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Spinner color="var(--text3)" /> <span style={{ color: 'var(--text3)' }}>Loading courses...</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* Sidebar 1 — Courses */}
      <div style={{ width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>My Courses</p>
          <button onClick={() => setModal({ type: 'create-course' })} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 20, cursor: 'pointer', lineHeight: 1 }} title="New course">+</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {courses.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 12, padding: '12px 8px', lineHeight: 1.5 }}>No courses yet. Click + to create one.</p>}
          {courses.map(c => (
            <div key={c.id} style={{ position: 'relative', marginBottom: 4 }}>
              <button onClick={() => { setSelectedCourseId(c.id); setSelectedLessonId(null); setAiPanel(null) }}
                style={{ width: '100%', textAlign: 'left', padding: '10px 10px', borderRadius: 8, background: selectedCourseId === c.id ? 'var(--bg4)' : 'none', border: selectedCourseId === c.id ? '1px solid var(--border2)' : '1px solid transparent', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color || '#6C8EFF', flexShrink: 0, marginTop: 4 }} />
                  <p style={{ fontSize: 12, fontWeight: 500, color: selectedCourseId === c.id ? 'var(--text)' : 'var(--text2)', lineHeight: 1.35, flex: 1, paddingRight: 28 }}>{c.title}</p>
                </div>
                <p style={{ fontSize: 10, color: 'var(--text3)', paddingLeft: 14 }}>{c.code} · {c.student_count || 0} students</p>
              </button>
              <div style={{ position: 'absolute', top: 8, right: 6, display: 'flex', gap: 2 }}>
                <button onClick={e => { e.stopPropagation(); setModal({ type: 'edit-course', data: c }) }} style={iconBtn}>✎</button>
                <button onClick={e => { e.stopPropagation(); handleDeleteCourse(c.id) }} style={iconBtn}>×</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar 2 — Modules + Lessons */}
      {selectedCourse && (
        <div style={{ width: 250, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedCourse.title}</p>
              <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{selectedCourse.semester}</p>
            </div>
            <button onClick={() => setModal({ type: 'create-module', data: { courseId: selectedCourse.id } })}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 20, cursor: 'pointer', lineHeight: 1, flexShrink: 0 }} title="Add module">+</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {selectedCourse.modules?.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 12, padding: '12px 8px' }}>No modules yet. Click + to add.</p>}
            {selectedCourse.modules?.map(m => (
              <div key={m.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 6px', borderRadius: 6 }}>
                  <Toggle enabled={m.is_enabled} onChange={() => toggleModule(selectedCourse.id, m.id, m.is_enabled)} small />
                  <p style={{ fontSize: 11, fontWeight: 600, color: m.is_enabled ? 'var(--text2)' : 'var(--text3)', flex: 1, lineHeight: 1.3 }}>{m.title}</p>
                  <button onClick={() => setModal({ type: 'edit-module', data: { courseId: selectedCourse.id, moduleId: m.id, title: m.title } })} style={iconBtn}>✎</button>
                  <button onClick={() => handleDeleteModule(selectedCourse.id, m.id)} style={iconBtn}>×</button>
                  <button onClick={() => setModal({ type: 'create-lesson', data: { courseId: selectedCourse.id, moduleId: m.id } })} style={{ ...iconBtn, color: 'var(--accent)', fontSize: 16 }}>+</button>
                </div>
                {m.lessons?.map(l => (
                  <div key={l.id} onClick={() => { setSelectedLessonId(l.id); setAiPanel(null); setTab('Slides') }}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 6px 5px 18px', borderRadius: 6, cursor: 'pointer', marginBottom: 2, background: selectedLessonId === l.id ? 'var(--bg4)' : 'none' }}>
                    <Toggle enabled={l.is_enabled} onChange={e => { e.stopPropagation(); toggleLesson(selectedCourse.id, m.id, l.id, l.is_enabled) }} small />
                    <p style={{ fontSize: 12, color: selectedLessonId === l.id ? 'var(--text)' : l.is_enabled ? 'var(--text2)' : 'var(--text3)', flex: 1, lineHeight: 1.3 }}>{l.title}</p>
                    {l.has_slides && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                    <button onClick={e => { e.stopPropagation(); setModal({ type: 'edit-lesson', data: { courseId: selectedCourse.id, moduleId: m.id, lessonId: l.id, title: l.title } }) }} style={iconBtn}>✎</button>
                    <button onClick={e => { e.stopPropagation(); handleDeleteLesson(selectedCourse.id, m.id, l.id) }} style={iconBtn}>×</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main workspace */}
      {lesson ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{lesson.title}</p>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{selectedCourse?.title}</p>
            </div>
            <div style={{ flex: 1 }} />
            {lesson.slides && (
              <button onClick={() => setPresenting(true)} style={{ background: 'var(--accent)', border: 'none', borderRadius: 7, padding: '6px 14px', color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2.5 2l7 3.5-7 3.5V2z" fill="white"/></svg>
                Present
              </button>
            )}
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', padding: '0 20px', flexShrink: 0 }}>
            {['Slides', 'Resources', 'Visualizer'].map(t => (
              <button key={t} onClick={() => { setTab(t); setAiPanel(null) }} style={{ background: 'none', border: 'none', color: tab === t ? 'var(--accent)' : 'var(--text2)', fontSize: 13, padding: '10px 0', marginRight: 20, borderBottom: tab === t ? '1.5px solid var(--accent)' : '1.5px solid transparent', marginBottom: -1, cursor: 'pointer', fontWeight: tab === t ? 500 : 400 }}>{t}</button>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {lessonLoading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Spinner color="var(--text3)" /> <span style={{ color: 'var(--text3)', fontSize: 13 }}>Loading lesson...</span>
              </div>
            ) : (
              <>
                {tab === 'Slides' && <SlidesTab lesson={lesson} saveSlides={handleSaveSlides} aiPanel={aiPanel} setAiPanel={setAiPanel} onPresent={() => setPresenting(true)} />}
                {tab === 'Resources' && <ResourcesTab lesson={lesson} addResource={addResource} toggleResource={toggleResource} deleteResource={deleteResource} aiPanel={aiPanel} setAiPanel={setAiPanel} />}
                {tab === 'Visualizer' && <VisualizerTab lesson={lesson} addResource={addResource} toggleResource={toggleResource} deleteResource={deleteResource} aiPanel={aiPanel} setAiPanel={setAiPanel} />}
              </>
            )}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          {!selectedCourse ? (
            <>
              <div style={{ width: 52, height: 52, background: 'var(--bg3)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 10h16M4 14h10" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <p className="serif" style={{ fontSize: 22, color: 'var(--text)' }}>Select a course</p>
              <p style={{ color: 'var(--text3)', fontSize: 13 }}>Choose a course from the left or create a new one</p>
              <button onClick={() => setModal({ type: 'create-course' })} style={{ background: 'linear-gradient(135deg,#6C8EFF,#A78BFA)', border: 'none', borderRadius: 8, padding: '8px 20px', color: 'white', fontSize: 13, cursor: 'pointer', marginTop: 4 }}>+ Create First Course</button>
            </>
          ) : (
            <>
              <div style={{ width: 52, height: 52, background: 'var(--bg3)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="var(--text3)" strokeWidth="1.5"/><path d="M8 10h8M8 14h5" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <p style={{ color: 'var(--text3)', fontSize: 13 }}>Select a lesson from the modules panel</p>
            </>
          )}
        </div>
      )}

      {presenting && lesson?.slides && <PresentationModal lesson={lesson} onClose={() => setPresenting(false)} />}

      {modal?.type === 'create-course' && <CourseFormModal title="New Course" onSubmit={handleCreateCourse} onClose={() => setModal(null)} />}
      {modal?.type === 'edit-course' && <CourseFormModal title="Edit Course" initial={modal.data} onSubmit={d => handleUpdateCourse(modal.data.id, d)} onClose={() => setModal(null)} />}
      {(modal?.type === 'create-module' || modal?.type === 'edit-module') && (
        <SimpleTextModal
          title={modal.type === 'create-module' ? 'Add Module' : 'Rename Module'}
          label="Module Title"
          initial={modal.data?.title || ''}
          onSubmit={title => modal.type === 'create-module' ? handleCreateModule(modal.data.courseId, title) : handleUpdateModule(modal.data.courseId, modal.data.moduleId, title)}
          onClose={() => setModal(null)}
        />
      )}
      {(modal?.type === 'create-lesson' || modal?.type === 'edit-lesson') && (
        <SimpleTextModal
          title={modal.type === 'create-lesson' ? 'Add Lesson' : 'Rename Lesson'}
          label="Lesson Title"
          initial={modal.data?.title || ''}
          onSubmit={title => modal.type === 'create-lesson' ? handleCreateLesson(modal.data.courseId, modal.data.moduleId, title) : handleUpdateLesson(modal.data.courseId, modal.data.moduleId, modal.data.lessonId, title)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}

function CourseFormModal({ title, initial = {}, onSubmit, onClose }) {
  const [form, setForm] = useState({ title: initial.title || '', code: initial.code || '', semester: initial.semester || '', description: initial.description || '', color: initial.color || '#6C8EFF' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title || !form.code || !form.semester) { setError('Title, code and semester are required.'); return }
    setLoading(true)
    try { await onSubmit(form) } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <Overlay onClose={onClose}>
      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 20 }}>{title}</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label="Course Title">
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={iStyle} placeholder="Deep Learning for MS Computer Science" />
        </FormField>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormField label="Course Code">
            <input required value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} style={iStyle} placeholder="CS-601" />
          </FormField>
          <FormField label="Semester">
            <input required value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} style={iStyle} placeholder="Fall 2025" />
          </FormField>
        </div>
        <FormField label="Description (optional)">
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...iStyle, height: 64, resize: 'none' }} placeholder="Brief course description..." />
        </FormField>
        <FormField label="Color">
          <div style={{ display: 'flex', gap: 8 }}>
            {COURSE_COLORS.map(c => (
              <div key={c} onClick={() => setForm(f => ({ ...f, color: c }))} style={{ width: 22, height: 22, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '2px solid white' : '2px solid transparent' }} />
            ))}
          </div>
        </FormField>
        {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
          <button type="submit" disabled={loading} style={submitBtn}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Overlay>
  )
}

function SimpleTextModal({ title, label, initial = '', onSubmit, onClose }) {
  const [value, setValue] = useState(initial)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!value.trim()) return
    setLoading(true)
    try { await onSubmit(value.trim()) } finally { setLoading(false) }
  }

  return (
    <Overlay onClose={onClose}>
      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 16 }}>{title}</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <FormField label={label}>
          <input autoFocus required value={value} onChange={e => setValue(e.target.value)} style={iStyle} placeholder={`Enter ${label.toLowerCase()}...`} />
        </FormField>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
          <button type="submit" disabled={loading} style={submitBtn}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Overlay>
  )
}

function Overlay({ onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 480 }}>
        {children}
      </div>
    </div>
  )
}

function FormField({ label, children }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginBottom: 5 }}>{label}</p>
      {children}
    </div>
  )
}

const iStyle = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 7, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }
const iconBtn = { background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer', padding: '2px 3px', lineHeight: 1 }
const cancelBtn = { background: 'none', border: '1px solid var(--border2)', borderRadius: 7, padding: '7px 16px', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' }
const submitBtn = { background: 'linear-gradient(135deg,#6C8EFF,#A78BFA)', border: 'none', borderRadius: 7, padding: '7px 20px', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }