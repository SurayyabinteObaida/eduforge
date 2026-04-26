import { useState, useEffect } from 'react'
import { api } from '../../utils/api.js'
import { Spinner, TYPE_COLORS } from '../../components/ui.jsx'
import PresentationModal from '../instructor/PresentationModal.jsx'

export default function StudentCoursePage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [presenting, setPresenting] = useState(false)

  useEffect(() => {
    api.courses.list()
      .then(({ courses }) => {
        setCourses(courses)
        if (courses.length > 0) setSelectedCourseId(courses[0].id)
      })
      .finally(() => setLoading(false))
  }, [])

  const selectLesson = async (lesson) => {
    setLessonLoading(true)
    setSelectedLesson(null)
    try {
      const { lesson: full } = await api.lessons.get(lesson.id)
      setSelectedLesson(full)
    } catch (err) {
      console.error(err)
    } finally {
      setLessonLoading(false)
    }
  }

  const course = courses.find(c => c.id === selectedCourseId)

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Spinner color="var(--text3)" /> <span style={{ color: 'var(--text3)' }}>Loading your courses...</span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* Left sidebar — courses + lessons tree */}
      <div style={{ width: 260, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>My Courses</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {courses.length === 0 && (
            <p style={{ color: 'var(--text3)', fontSize: 12, padding: '12px 8px' }}>You are not enrolled in any courses yet.</p>
          )}
          {courses.map(c => (
            <div key={c.id}>
              <button onClick={() => { setSelectedCourseId(c.id); setSelectedLesson(null) }} style={{
                width: '100%', textAlign: 'left', padding: '10px 10px', borderRadius: 8, marginBottom: 4,
                background: selectedCourseId === c.id ? 'var(--bg4)' : 'none',
                border: selectedCourseId === c.id ? '1px solid var(--border2)' : '1px solid transparent',
                cursor: 'pointer'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color || '#6C8EFF', flexShrink: 0, marginTop: 4 }} />
                  <p style={{ fontSize: 12, fontWeight: 500, color: selectedCourseId === c.id ? 'var(--text)' : 'var(--text2)', lineHeight: 1.35 }}>{c.title}</p>
                </div>
              </button>

              {/* Show modules + lessons for selected course */}
              {selectedCourseId === c.id && c.modules?.filter(m => m.is_enabled).map(m => (
                <div key={m.id} style={{ paddingLeft: 8, marginBottom: 6 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', padding: '5px 8px', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3 }}>{m.title}</p>
                  {m.lessons?.filter(l => l.is_enabled).map(l => (
                    <button key={l.id} onClick={() => selectLesson(l)} style={{
                      width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: 6, marginBottom: 2,
                      background: selectedLesson?.id === l.id ? 'var(--bg3)' : 'none',
                      border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      {l.has_slides && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                      <p style={{ fontSize: 12, color: selectedLesson?.id === l.id ? 'var(--text)' : 'var(--text2)', lineHeight: 1.3 }}>{l.title}</p>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {lessonLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
            <Spinner color="var(--text3)" /> <span style={{ color: 'var(--text3)', fontSize: 13 }}>Loading lesson…</span>
          </div>
        ) : selectedLesson ? (
          <div style={{ padding: 28, maxWidth: 800 }}>
            {/* Lesson header */}
            <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 20, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>{selectedLesson.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text3)' }}>{course?.title} · {course?.code}</p>
            </div>

            {/* Lecture slides */}
            {selectedLesson.slides && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, background: 'var(--accent)22', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="2" width="11" height="8" rx="1.5" stroke="var(--accent)" strokeWidth="1.3"/><path d="M4 11h5" stroke="var(--accent)" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Lecture Slides</p>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>{selectedLesson.slides.length} slides</span>
                </div>
                <button onClick={() => setPresenting(true)} style={{
                  background: 'var(--accent)', border: 'none', borderRadius: 9, padding: '12px 22px',
                  color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 2.5l8 4-8 4V2.5z" fill="white"/></svg>
                  Open Lecture Presentation
                </button>
              </div>
            )}

            {/* Resources */}
            {selectedLesson.resources?.filter(r => r.is_enabled && r.type !== 'visualizer').length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, background: '#A78BFA22', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1l1.6 3.3L12 4.9l-3 2.8.7 4L6.5 10 3 11.7l.7-4L.5 4.9l3.9-.6L6.5 1z" stroke="#A78BFA" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Resources</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedLesson.resources.filter(r => r.is_enabled && r.type !== 'visualizer').map(r => {
                    const color = TYPE_COLORS[r.type] || '#6C8EFF'
                    return (
                      <a key={r.id} href={r.url || '#'} target="_blank" rel="noopener noreferrer" style={{
                        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 9,
                        padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
                        transition: 'border 0.15s'
                      }}>
                        <div style={{ width: 26, height: 26, background: color + '22', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ResourceTypeIcon type={r.type} color={color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.title}</p>
                          {r.description && <p style={{ fontSize: 11, color: 'var(--text3)', lineHeight: 1.4, marginTop: 1 }}>{r.description}</p>}
                        </div>
                        <span style={{ fontSize: 9, background: color + '22', color, padding: '2px 7px', borderRadius: 3, textTransform: 'uppercase', fontWeight: 600, flexShrink: 0 }}>{r.type}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Visualizers */}
            {selectedLesson.resources?.filter(r => r.is_enabled && r.type === 'visualizer').length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, background: '#F8717122', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="#F87171" strokeWidth="1.3"/><path d="M6.5 4v5M4 6.5h5" stroke="#F87171" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>Visualizers</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
                  {selectedLesson.resources.filter(r => r.is_enabled && r.type === 'visualizer').map(r => (
                    <div key={r.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)' }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{r.title}</p>
                        {r.description && <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{r.description}</p>}
                      </div>
                      <iframe
                        srcDoc={r.html_content}
                        style={{ width: '100%', height: 500, border: 'none', display: 'block' }}
                        sandbox="allow-scripts"
                        title={r.title}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nothing shared yet */}
            {!selectedLesson.slides && (!selectedLesson.resources || selectedLesson.resources.filter(r => r.is_enabled).length === 0) && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text3)' }}>
                <p style={{ fontSize: 15, marginBottom: 6 }}>Content coming soon</p>
                <p style={{ fontSize: 13 }}>Your instructor hasn't shared any content for this lesson yet.</p>
              </div>
            )}
          </div>
        ) : (
          // No lesson selected
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14 }}>
            {courses.length === 0 ? (
              <>
                <div style={{ width: 52, height: 52, background: 'var(--bg3)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="var(--text3)"/></svg>
                </div>
                <p style={{ color: 'var(--text2)', fontSize: 15 }}>Not enrolled in any courses</p>
                <p style={{ color: 'var(--text3)', fontSize: 13 }}>Ask your instructor to enroll you</p>
              </>
            ) : (
              <>
                <div style={{ width: 52, height: 52, background: 'var(--bg3)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="var(--text3)" strokeWidth="1.5"/><path d="M8 10h8M8 14h5" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <p style={{ color: 'var(--text3)', fontSize: 13 }}>Select a lesson from the left to begin</p>
              </>
            )}
          </div>
        )}
      </div>

      {presenting && selectedLesson?.slides && (
        <PresentationModal lesson={selectedLesson} onClose={() => setPresenting(false)} />
      )}
    </div>
  )
}

function ResourceTypeIcon({ type, color }) {
  const paths = {
    link: <path d="M5.5 8l2.5-2.5M4 9A3 3 0 019 4l-.5.5M10 4A3 3 0 015 9l.5-.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>,
    paper: <><rect x="2" y="1.5" width="9" height="10" rx="1" stroke={color} strokeWidth="1.3"/><path d="M4 5h5M4 7h3.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></>,
    framework: <polygon points="6.5,1 12,4 12,9 6.5,12 1,9 1,4" stroke={color} strokeWidth="1.3" fill="none"/>,
    playground: <path d="M2.5 10V7l4-5 4 5v3H8V8.5H5V10H2.5z" stroke={color} strokeWidth="1.3" fill="none"/>,
    tool: <path d="M8.5 2.5l2.5 2.5-5.5 6-2.5-2.5 5.5-6z" stroke={color} strokeWidth="1.3" fill="none"/>,
  }
  return <svg width="13" height="13" viewBox="0 0 13 13" fill="none">{paths[type] || paths.link}</svg>
}
