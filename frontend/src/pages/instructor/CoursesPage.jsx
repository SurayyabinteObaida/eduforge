import { useState } from 'react'
import { useCourses, useLesson } from '../../hooks/useCourses.js'
import { Toggle, EmptyState, Spinner } from '../../components/ui.jsx'
import SlidesTab from './SlidesTab.jsx'
import ResourcesTab from './ResourcesTab.jsx'
import VisualizerTab from './VisualizerTab.jsx'
import PresentationModal from './PresentationModal.jsx'

export default function CoursesPage() {
  const { courses, loading, toggleModule, toggleLesson, markLessonHasSlides } = useCourses()
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [aiPanel, setAiPanel] = useState(null)
  const [tab, setTab] = useState('Slides')
  const [presenting, setPresenting] = useState(false)

  const { lesson, loading: lessonLoading, saveSlides, addResource, toggleResource, deleteResource } = useLesson(selectedLessonId)

  const selectedCourse = courses.find(c => c.id === selectedCourseId)

  // Find module id for the selected lesson
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

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Spinner color="var(--text3)" /> <span style={{ color: 'var(--text3)' }}>Loading courses...</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* Sidebar 1 — Course list */}
      <div style={{ width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>My Courses</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {courses.map(c => (
            <button key={c.id} onClick={() => { setSelectedCourseId(c.id); setSelectedLessonId(null); setAiPanel(null) }}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 10px', borderRadius: 8, marginBottom: 4,
                background: selectedCourseId === c.id ? 'var(--bg4)' : 'none',
                border: selectedCourseId === c.id ? '1px solid var(--border2)' : '1px solid transparent',
                cursor: 'pointer'
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color || '#6C8EFF', flexShrink: 0, marginTop: 4 }} />
                <p style={{ fontSize: 12, fontWeight: 500, color: selectedCourseId === c.id ? 'var(--text)' : 'var(--text2)', lineHeight: 1.35 }}>{c.title}</p>
              </div>
              <p style={{ fontSize: 10, color: 'var(--text3)', paddingLeft: 14 }}>{c.code} · {c.student_count || 0} students</p>
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar 2 — Modules + Lessons */}
      {selectedCourse && (
        <div style={{ width: 240, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text2)', lineHeight: 1.3 }}>{selectedCourse.title}</p>
            <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{selectedCourse.semester}</p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {selectedCourse.modules?.map(m => (
              <div key={m.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 6 }}>
                  <Toggle enabled={m.is_enabled} onChange={() => toggleModule(selectedCourse.id, m.id, m.is_enabled)} small />
                  <p style={{ fontSize: 11, fontWeight: 600, color: m.is_enabled ? 'var(--text2)' : 'var(--text3)', flex: 1, lineHeight: 1.3 }}>{m.title}</p>
                </div>
                {m.lessons?.map(l => (
                  <div key={l.id} onClick={() => { setSelectedLessonId(l.id); setAiPanel(null); setTab('Slides') }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 8px 6px 20px', borderRadius: 6, cursor: 'pointer', marginBottom: 2,
                      background: selectedLessonId === l.id ? 'var(--bg4)' : 'none'
                    }}>
                    <Toggle enabled={l.is_enabled} onChange={e => { e.stopPropagation(); toggleLesson(selectedCourse.id, m.id, l.id, l.is_enabled) }} small />
                    <p style={{ fontSize: 12, color: selectedLessonId === l.id ? 'var(--text)' : l.is_enabled ? 'var(--text2)' : 'var(--text3)', flex: 1, lineHeight: 1.3 }}>{l.title}</p>
                    {l.has_slides && <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
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
          {/* Lesson header */}
          <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>{lesson.title}</p>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{selectedCourse?.title}</p>
            </div>
            <div style={{ flex: 1 }} />
            {lesson.slides && (
              <button onClick={() => setPresenting(true)} style={{
                background: 'var(--accent)', border: 'none', borderRadius: 7, padding: '6px 14px',
                color: 'white', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2.5 2l7 3.5-7 3.5V2z" fill="white"/></svg>
                Present
              </button>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', padding: '0 20px', flexShrink: 0 }}>
            {['Slides', 'Resources', 'Visualizer'].map(t => (
              <button key={t} onClick={() => { setTab(t); setAiPanel(null) }} style={{
                background: 'none', border: 'none',
                color: tab === t ? 'var(--accent)' : 'var(--text2)',
                fontSize: 13, padding: '10px 0', marginRight: 20,
                borderBottom: tab === t ? '1.5px solid var(--accent)' : '1.5px solid transparent',
                marginBottom: -1, cursor: 'pointer', fontWeight: tab === t ? 500 : 400
              }}>{t}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {lessonLoading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Spinner color="var(--text3)" /> <span style={{ color: 'var(--text3)', fontSize: 13 }}>Loading lesson...</span>
              </div>
            ) : (
              <>
                {tab === 'Slides' && <SlidesTab lesson={lesson} saveSlides={handleSaveSlides} aiPanel={aiPanel} setAiPanel={setAiPanel} onPresent={() => setPresenting(true)} />}
                {tab === 'Resources' && <ResourcesTab lesson={lesson} addResource={addResource} toggleResource={toggleResource} deleteResource={deleteResource} aiPanel={aiPanel} setAiPanel={setAiPanel} />}
                {tab === 'Visualizer' && <VisualizerTab lesson={lesson} addResource={addResource} aiPanel={aiPanel} setAiPanel={setAiPanel} />}
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
              <p style={{ color: 'var(--text3)', fontSize: 13 }}>Choose a course from the left to get started</p>
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

      {presenting && lesson?.slides && (
        <PresentationModal lesson={lesson} onClose={() => setPresenting(false)} />
      )}
    </div>
  )
}
