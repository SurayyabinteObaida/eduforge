import { useState, useEffect } from 'react'
import { api } from '../../utils/api.js'
import { EmptyState, Field, inputStyle, AIPanelShell, GradientButton, Toggle } from '../../components/ui.jsx'

export default function VisualizerTab({ lesson, addResource, aiPanel, setAiPanel }) {
  const visualizers = (lesson.resources || []).filter(r => r.type === 'visualizer')

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {visualizers.length === 0 ? (
          <EmptyState icon="visualizer" label="No visualizers yet" sub="Describe a deep learning concept and Claude will build an animated educational widget" action="Build Visualizer" onAction={() => setAiPanel('visualizer')} />
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>{visualizers.length} visualizer{visualizers.length > 1 ? 's' : ''}</p>
              <button onClick={() => setAiPanel('visualizer')} style={{ background: 'linear-gradient(135deg,#F87171,#F59E0B)', border: 'none', borderRadius: 6, padding: '5px 12px', color: 'white', fontSize: 12, cursor: 'pointer' }}>+ New Visualizer</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
              {visualizers.map(v => <VisualizerCard key={v.id} visualizer={v} />)}
            </div>
          </div>
        )}
      </div>
      {aiPanel === 'visualizer' && (
        <AIVisualizerPanel lesson={lesson} addResource={addResource} onClose={() => setAiPanel(null)} />
      )}
    </div>
  )
}

function VisualizerCard({ visualizer }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F87171' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399' }} />
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginLeft: 4, flex: 1 }}>{visualizer.title}</p>
          <button onClick={() => setOpen(true)} style={{ background: 'var(--accent)', border: 'none', borderRadius: 5, padding: '3px 10px', color: 'white', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>
            Open ↗
          </button>
        </div>
        <div style={{ height: 200, overflow: 'hidden', pointerEvents: 'none' }}>
          <iframe
            srcDoc={visualizer.html_content}
            style={{ width: '100%', height: '100%', border: 'none' }}
            sandbox="allow-scripts"
            title={visualizer.title}
          />
        </div>
        {visualizer.description && (
          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text3)' }}>{visualizer.description}</p>
          </div>
        )}
      </div>
      {open && <VisualizerModal visualizer={visualizer} onClose={() => setOpen(false)} />}
    </>
  )
}

function VisualizerModal({ visualizer, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 1000, background: 'var(--bg2)', borderRadius: 12, border: '1px solid var(--border2)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        <div style={{ padding: '12px 18px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F87171' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399' }} />
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginLeft: 6 }}>{visualizer.title}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <iframe
            srcDoc={visualizer.html_content}
            style={{ width: '100%', height: '100%', border: 'none', minHeight: 600 }}
            sandbox="allow-scripts"
            title={visualizer.title}
          />
        </div>
      </div>
      <p style={{ color: 'var(--text3)', fontSize: 12, marginTop: 12 }}>Press Esc to close</p>
    </div>
  )
}

function AIVisualizerPanel({ lesson, addResource, onClose }) {
  const [concept, setConcept] = useState('')
  const [description, setDescription] = useState('')
  const [colorScheme, setColorScheme] = useState('dark')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  const generate = async () => {
    if (!concept.trim()) { setError('Please enter a concept name.'); return }
    setLoading(true); setError(''); setPreview(null)
    try {
      const { html } = await api.ai.generateVisualizer({ concept, description, colorScheme })
      setPreview(html)
    } catch (err) {
      setError(err.message || 'Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    if (!preview) return
    try {
      await addResource({ type: 'visualizer', title: concept, description: description || 'AI-generated visualizer', html_content: preview })
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  const icon = {
    bg: 'linear-gradient(135deg,#F87171,#F59E0B)',
    svg: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="3.5" stroke="white" strokeWidth="1.2"/><path d="M5.5 3v5M3 5.5h5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
  }

  return (
    <AIPanelShell title="AI Visualizer Builder" icon={icon} onClose={onClose} footer={
      <div style={{ display: 'flex', gap: 8 }}>
        <GradientButton onClick={generate} loading={loading} gradient="linear-gradient(135deg,#F87171,#F59E0B)" style={{ flex: 1 }}>
          {loading ? 'Building…' : 'Generate'}
        </GradientButton>
        {preview && (
          <GradientButton onClick={save} style={{ flex: 1 }}>
            Save to Lesson
          </GradientButton>
        )}
      </div>
    }>
      <Field label="Concept" hint="What should this visualize?">
        <input value={concept} onChange={e => setConcept(e.target.value)} style={inputStyle} placeholder="e.g. Sigmoid Activation Function" />
      </Field>
      <Field label="What to Show" hint="Describe what the visualizer should demonstrate">
        <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, height: 80, resize: 'none' }} placeholder="Show the S-curve, how inputs map to 0–1 range, saturation at extremes, derivative…" />
      </Field>
      <Field label="Color Scheme">
        <div style={{ display: 'flex', gap: 8 }}>
          {['dark', 'light'].map(c => (
            <button key={c} onClick={() => setColorScheme(c)} style={{
              flex: 1, background: colorScheme === c ? 'var(--bg4)' : 'none',
              border: colorScheme === c ? '1px solid var(--accent)' : '1px solid var(--border)',
              borderRadius: 6, padding: '6px', color: colorScheme === c ? 'var(--accent)' : 'var(--text3)',
              fontSize: 12, cursor: 'pointer', textTransform: 'capitalize'
            }}>{c}</button>
          ))}
        </div>
      </Field>
      {error && <p style={{ color: 'var(--danger)', fontSize: 12, background: '#F8717115', padding: '8px 10px', borderRadius: 6 }}>{error}</p>}
      {preview && (
        <div>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>Preview</p>
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', height: 200 }}>
            <iframe srcDoc={preview} style={{ width: '100%', height: '100%', border: 'none' }} sandbox="allow-scripts" title="Visualizer preview" />
          </div>
          <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>Happy with it? Click Save to Lesson.</p>
        </div>
      )}
    </AIPanelShell>
  )
}
