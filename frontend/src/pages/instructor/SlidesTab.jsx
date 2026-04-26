import { useState } from 'react'
import { api } from '../../utils/api.js'
import { EmptyState, Field, inputStyle, AIPanelShell, GradientButton, Spinner } from '../../components/ui.jsx'

export default function SlidesTab({ lesson, saveSlides, aiPanel, setAiPanel, onPresent }) {
  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {lesson.slides?.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>{lesson.slides.length} slides</p>
              <button onClick={() => setAiPanel('slides')} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 6, padding: '4px 10px', color: 'var(--text3)', fontSize: 11, cursor: 'pointer' }}>Regenerate</button>
              <button onClick={onPresent} style={{ background: 'var(--accent)', border: 'none', borderRadius: 6, padding: '4px 12px', color: 'white', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>Present</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: 12 }}>
              {lesson.slides.map((s, i) => <SlideThumb key={i} slide={s} index={i} />)}
            </div>
          </div>
        ) : (
          <EmptyState icon="slides" label="No slides yet" sub="Use the AI planner to generate a complete lecture presentation" action="Generate Slides" onAction={() => setAiPanel('slides')} />
        )}
      </div>
      {aiPanel === 'slides' && <AISlidesPanel lesson={lesson} saveSlides={saveSlides} onClose={() => setAiPanel(null)} />}
    </div>
  )
}

function SlideThumb({ slide, index }) {
  return (
    <div style={{
      background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
      padding: 12, aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', cursor: 'default'
    }}>
      <div>
        <p style={{ fontSize: 9, color: 'var(--text3)', marginBottom: 4 }}>SLIDE {index + 1}</p>
        <p style={{ fontSize: 11, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 5 }}>{slide.title}</p>
        {slide.bullets?.slice(0, 3).map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
            <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--accent)', marginTop: 4, flexShrink: 0 }} />
            <p style={{ fontSize: 9, color: 'var(--text3)', lineHeight: 1.4 }}>{b.substring(0, 50)}{b.length > 50 ? '…' : ''}</p>
          </div>
        ))}
        {slide.code && (
          <div style={{ background: '#0D1117', borderRadius: 4, padding: '3px 6px', marginTop: 4 }}>
            <p className="mono" style={{ fontSize: 8, color: '#79C0FF' }}>{slide.code.substring(0, 55)}…</p>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ width: 8, height: 5, background: slide.type === 'title' ? 'var(--accent)' : slide.type === 'code' ? 'var(--accent2)' : 'var(--text3)', borderRadius: 1, opacity: 0.5 }} />
      </div>
    </div>
  )
}

function AISlidesPanel({ lesson, saveSlides, onClose }) {
  const [topic, setTopic] = useState(lesson.title)
  const [concepts, setConcepts] = useState('')
  const [depth, setDepth] = useState('graduate')
  const [style, setStyle] = useState('technical')
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true); setError('')
    try {
      const { slides } = await api.ai.generateSlides({ topic, concepts, depth, style, count })
      await saveSlides(slides)
      onClose()
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const icon = {
    bg: 'linear-gradient(135deg,#6C8EFF,#A78BFA)',
    svg: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5h9M5.5 1l4.5 4.5L5.5 10" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  }

  return (
    <AIPanelShell title="AI Slide Planner" icon={icon} onClose={onClose} footer={
      <GradientButton onClick={generate} loading={loading}>
        {loading ? 'Generating…' : 'Generate Presentation'}
      </GradientButton>
    }>
      <Field label="Topic" hint="What is this lecture about?">
        <input value={topic} onChange={e => setTopic(e.target.value)} style={inputStyle} placeholder="e.g. Backpropagation Algorithm" />
      </Field>
      <Field label="Key Concepts" hint="Comma-separated topics to cover">
        <textarea value={concepts} onChange={e => setConcepts(e.target.value)} style={{ ...inputStyle, height: 72, resize: 'none' }} placeholder="chain rule, gradient flow, vanishing gradients, weight updates…" />
      </Field>
      <Field label="Audience Level">
        <select value={depth} onChange={e => setDepth(e.target.value)} style={inputStyle}>
          <option value="undergraduate">Undergraduate</option>
          <option value="graduate">Graduate (MS)</option>
          <option value="phd">PhD Level</option>
        </select>
      </Field>
      <Field label="Lecture Style">
        <select value={style} onChange={e => setStyle(e.target.value)} style={inputStyle}>
          <option value="technical">Technical & Mathematical</option>
          <option value="conceptual">Conceptual & Intuitive</option>
          <option value="practical">Practical & Code-heavy</option>
          <option value="mixed">Mixed Approach</option>
        </select>
      </Field>
      <Field label="Number of Slides">
        <select value={count} onChange={e => setCount(Number(e.target.value))} style={inputStyle}>
          {[6, 8, 10, 12, 15, 20].map(n => <option key={n} value={n}>{n} slides</option>)}
        </select>
      </Field>
      {error && <p style={{ color: 'var(--danger)', fontSize: 12, background: '#F8717115', padding: '8px 10px', borderRadius: 6, border: '1px solid #F8717130' }}>{error}</p>}
    </AIPanelShell>
  )
}
