import { useState, useEffect } from 'react'
import { api } from '../../utils/api.js'
import { EmptyState, Field, inputStyle, AIPanelShell, GradientButton, Toggle } from '../../components/ui.jsx'

export default function VisualizerTab({ lesson, addResource, toggleResource, deleteResource, aiPanel, setAiPanel }) {
  const visualizers = (lesson.resources || []).filter(r => r.type === 'visualizer')
  const [openVisualizer, setOpenVisualizer] = useState(null)

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {visualizers.length === 0 ? (
          <EmptyState icon="visualizer" label="No visualizers yet" sub="Describe a deep learning concept and Claude will build an animated educational widget" action="Build Visualizer" onAction={() => setAiPanel('visualizer')} />
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>
                {visualizers.length} visualizer{visualizers.length > 1 ? 's' : ''} · {visualizers.filter(v => v.is_enabled).length} visible to students
              </p>
              <button onClick={() => setAiPanel('visualizer')} style={{ background: '#1A6B5A', border: 'none', borderRadius: 6, padding: '5px 12px', color: 'white', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>+ New Visualizer</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
              {visualizers.map(v => (
                <VisualizerCard
                  key={v.id}
                  visualizer={v}
                  onOpen={() => setOpenVisualizer(v)}
                  onToggle={() => toggleResource(v.id, v.is_enabled)}
                  onDelete={() => deleteResource(v.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {aiPanel === 'visualizer' && (
        <AIVisualizerPanel lesson={lesson} addResource={addResource} onClose={() => setAiPanel(null)} />
      )}

      {openVisualizer && (
        <VisualizerModal visualizer={openVisualizer} onClose={() => setOpenVisualizer(null)} />
      )}
    </div>
  )
}

function VisualizerCard({ visualizer, onOpen, onToggle, onDelete }) {
  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', opacity: visualizer.is_enabled ? 1 : 0.6 }}>
      {/* Title bar */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg3)' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C47F7F' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4A96A' }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3DAA8A' }} />
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginLeft: 4, flex: 1 }}>{visualizer.title}</p>
      </div>

      {/* Preview thumbnail */}
      <div style={{ height: 180, overflow: 'hidden', pointerEvents: 'none', background: 'white' }}>
        <iframe
          srcDoc={visualizer.html_content}
          style={{ width: '100%', height: '100%', border: 'none' }}
          sandbox="allow-scripts"
          title={visualizer.title}
        />
      </div>

      {/* Controls */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Toggle enabled={visualizer.is_enabled} onChange={onToggle} small />
        <span style={{ fontSize: 11, color: 'var(--text3)', flex: 1 }}>{visualizer.is_enabled ? 'Visible to students' : 'Hidden from students'}</span>
        <button onClick={onOpen} style={{ background: '#1A6B5A', border: 'none', borderRadius: 6, padding: '4px 12px', color: 'white', fontSize: 11, cursor: 'pointer', fontWeight: 500 }}>Open ↗</button>
        <button onClick={onDelete} style={{ background: 'none', border: '1px solid #B85C5C30', borderRadius: 6, padding: '4px 10px', color: 'var(--danger)', fontSize: 11, cursor: 'pointer' }}>Delete</button>
      </div>
    </div>
  )
}

function VisualizerModal({ visualizer, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--bg3)', borderBottom: '1px solid var(--border)', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C47F7F' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4A96A' }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3DAA8A' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginLeft: 6 }}>{visualizer.title}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <p style={{ fontSize: 11, color: 'var(--text3)' }}>Press Esc to close</p>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 14px', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>Close</button>
        </div>
      </div>
      <iframe
        srcDoc={visualizer.html_content}
        style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
        sandbox="allow-scripts"
        title={visualizer.title}
      />
    </div>
  )
}

function AIVisualizerPanel({ lesson, addResource, onClose }) {
  const [concept, setConcept] = useState('')
  const [description, setDescription] = useState('')
  const [colorScheme, setColorScheme] = useState('light')
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
    bg: '#1A6B5A',
    svg: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="3.5" stroke="white" strokeWidth="1.2"/><path d="M5.5 3v5M3 5.5h5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/></svg>
  }

  return (
    <AIPanelShell title="AI Visualizer Builder" icon={icon} onClose={onClose} footer={
      <div style={{ display: 'flex', gap: 8 }}>
        <GradientButton onClick={generate} loading={loading} gradient="linear-gradient(135deg,#1A6B5A,#3DAA8A)" style={{ flex: 1 }}>
          {loading ? 'Building…' : 'Generate'}
        </GradientButton>
        {preview && (
          <GradientButton onClick={save} gradient="linear-gradient(135deg,#1A6B5A,#3DAA8A)" style={{ flex: 1 }}>
            Save to Lesson
          </GradientButton>
        )}
      </div>
    }>
      <Field label="Concept" hint="What should this visualize?">
        <input value={concept} onChange={e => setConcept(e.target.value)} style={inputStyle} placeholder="e.g. Sigmoid Activation Function" />
      </Field>
      <Field label="What to Show" hint="Describe what the visualizer should demonstrate">
        <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, height: 80, resize: 'none' }} placeholder="Show the S-curve, how inputs map to 0–1 range, saturation at extremes…" />
      </Field>
      <Field label="Color Scheme">
        <div style={{ display: 'flex', gap: 8 }}>
          {['light', 'dark'].map(c => (
            <button key={c} onClick={() => setColorScheme(c)} style={{
              flex: 1, background: colorScheme === c ? '#1A6B5A18' : 'none',
              border: colorScheme === c ? '1px solid #1A6B5A' : '1px solid var(--border)',
              borderRadius: 6, padding: '6px', color: colorScheme === c ? '#1A6B5A' : 'var(--text3)',
              fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', fontWeight: colorScheme === c ? 600 : 400
            }}>{c}</button>
          ))}
        </div>
      </Field>
      {error && <p style={{ color: 'var(--danger)', fontSize: 12, background: '#B85C5C12', padding: '8px 10px', borderRadius: 6 }}>{error}</p>}
      {preview && (
        <div>
          <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, fontWeight: 500 }}>Preview</p>
          <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', height: 260 }}>
            <iframe srcDoc={preview} style={{ width: '100%', height: '100%', border: 'none' }} sandbox="allow-scripts" title="Visualizer preview" />
          </div>
          <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 6 }}>Happy with it? Click Save to Lesson.</p>
        </div>
      )}
    </AIPanelShell>
  )
}