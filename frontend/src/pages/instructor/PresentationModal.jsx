import { useState, useEffect, useRef } from 'react'

export default function PresentationModal({ lesson, onClose }) {
  const [current, setCurrent] = useState(0)
  const containerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const slides = lesson.slides || []
  const slide = slides[current]

  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setCurrent(c => Math.min(c + 1, slides.length - 1))
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   setCurrent(c => Math.max(c - 1, 0))
      if (e.key === 'Escape' && !isFullscreen) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [slides.length, isFullscreen, onClose])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }

  if (!slide) return null

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,46,38,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 24 }}>
      <div ref={containerRef} style={{
        width: '100%', maxWidth: 960,
        background: '#FFFFFF',
        borderRadius: isFullscreen ? 0 : 14,
        border: '1px solid var(--border)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(26,46,38,0.15)',
        ...(isFullscreen ? { position: 'fixed', inset: 0, maxWidth: '100%' } : {})
      }}>
        {/* Toolbar */}
        <div style={{ background: '#F0F5F2', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <p style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{lesson.title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>{current + 1} / {slides.length}</p>
            <button onClick={toggleFullscreen} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 6, padding: '4px 12px', color: 'var(--text2)', fontSize: 11, cursor: 'pointer' }}>
              {isFullscreen ? '⊠ Exit' : '⛶ Fullscreen'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Slide content */}
        <div style={{ flex: 1, padding: isFullscreen ? '64px 88px' : '52px 68px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 400, background: '#FFFFFF' }}>
          <SlideContent slide={slide} fullscreen={isFullscreen} />
        </div>

        {/* Nav bar */}
        <div style={{ background: '#F0F5F2', padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button onClick={() => setCurrent(c => Math.max(c - 1, 0))} disabled={current === 0}
            style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 18px', color: current === 0 ? 'var(--text3)' : 'var(--text)', fontSize: 12, cursor: current === 0 ? 'not-allowed' : 'pointer' }}>
            ← Prev
          </button>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, background: i === current ? 'var(--accent)' : 'var(--border2)', cursor: 'pointer', transition: 'width 0.2s, background 0.2s' }} />
            ))}
          </div>
          <button onClick={() => setCurrent(c => Math.min(c + 1, slides.length - 1))} disabled={current === slides.length - 1}
            style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 18px', color: current === slides.length - 1 ? 'var(--text3)' : 'var(--text)', fontSize: 12, cursor: current === slides.length - 1 ? 'not-allowed' : 'pointer' }}>
            Next →
          </button>
        </div>
      </div>

      {/* Speaker notes */}
      {slide.notes && !isFullscreen && (
        <div style={{ marginTop: 12, background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 18px', width: '100%', maxWidth: 960 }}>
          <p style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, fontWeight: 600 }}>Speaker Notes</p>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{slide.notes}</p>
        </div>
      )}
    </div>
  )
}

function SlideContent({ slide, fullscreen }) {
  const titleSize  = fullscreen ? 52 : 36
  const bodySize   = fullscreen ? 20 : 16
  const bulletSize = fullscreen ? 18 : 15
  const codeSize   = fullscreen ? 15 : 13

  if (slide.type === 'title') return (
    <div style={{ textAlign: 'center' }}>
      <p className="serif" style={{ fontSize: titleSize, color: 'var(--text)', lineHeight: 1.2, marginBottom: 18 }}>{slide.title}</p>
      {slide.bullets?.[0] && <p style={{ fontSize: bodySize, color: 'var(--text2)', maxWidth: 560, margin: '0 auto' }}>{slide.bullets[0]}</p>}
    </div>
  )

  if (slide.type === 'code') return (
    <div>
      <p style={{ fontSize: fullscreen ? 28 : 22, fontWeight: 600, color: 'var(--text)', marginBottom: 20, lineHeight: 1.3 }}>{slide.title}</p>
      {slide.bullets && (
        <div style={{ marginBottom: 18 }}>
          {slide.bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: bulletSize, flexShrink: 0, marginTop: 2 }}>·</div>
              <p style={{ color: 'var(--text2)', fontSize: bulletSize, lineHeight: 1.65 }}>{b}</p>
            </div>
          ))}
        </div>
      )}
      {slide.code && (
        <pre style={{ background: '#1A2E26', border: '1px solid var(--border2)', borderRadius: 10, padding: '18px 22px', overflow: 'auto', fontSize: codeSize, lineHeight: 1.7 }}>
          <code className="mono" style={{ color: '#A8D5C4' }}>{slide.code}</code>
        </pre>
      )}
    </div>
  )

  if (slide.type === 'summary') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div style={{ width: 4, height: 32, background: 'var(--accent)', borderRadius: 2 }} />
        <p style={{ fontSize: fullscreen ? 30 : 24, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{slide.title}</p>
      </div>
      {slide.bullets && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {slide.bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--bg)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ width: 20, height: 20, background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2.5 2.5 3.5-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p style={{ fontSize: bulletSize, color: 'var(--text2)', lineHeight: 1.65 }}>{b}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // content (default)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <div style={{ width: 4, height: fullscreen ? 36 : 28, background: 'var(--accent)', borderRadius: 2 }} />
        <p style={{ fontSize: fullscreen ? 32 : 26, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{slide.title}</p>
      </div>
      {slide.bullets && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {slide.bullets.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: bulletSize * 0.42 }} />
              <p style={{ fontSize: bulletSize, color: 'var(--text2)', lineHeight: 1.7 }}>{b}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}