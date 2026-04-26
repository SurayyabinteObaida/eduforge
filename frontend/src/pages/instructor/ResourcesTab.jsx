import { useEffect, useState } from 'react'
import { api } from '../../utils/api.js'
import { EmptyState, Toggle, AIPanelShell, GradientButton, TYPE_COLORS } from '../../components/ui.jsx'

export default function ResourcesTab({ lesson, addResource, toggleResource, deleteResource, aiPanel, setAiPanel }) {
  const resources = (lesson.resources || []).filter(r => r.type !== 'visualizer')
  const visibleCount = resources.filter(r => r.is_enabled).length
  const [editModal, setEditModal] = useState(null)

  const handleEdit = async (resourceId, data) => {
    await api.lessons.updateResource(lesson.id, resourceId, data)
    // Reload lesson resources via parent — for now optimistic update via reload
    window.location.reload()
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {resources.length === 0 ? (
          <EmptyState icon="resources" label="No resources yet" sub="Get AI suggestions or add resources manually for this lesson" action="Suggest Resources" onAction={() => setAiPanel('resources')} />
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ color: 'var(--text2)', fontSize: 13 }}>{resources.length} resources · {visibleCount} visible to students</p>
              <button onClick={() => setAiPanel('resources')} style={{ background: 'linear-gradient(135deg,#6C8EFF,#A78BFA)', border: 'none', borderRadius: 6, padding: '5px 12px', color: 'white', fontSize: 12, cursor: 'pointer' }}>+ Suggest More</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {resources.map(r => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onToggle={() => toggleResource(r.id, r.is_enabled)}
                  onDelete={() => deleteResource(r.id)}
                  onEdit={() => setEditModal(r)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      {aiPanel === 'resources' && <AIResourcesPanel lesson={lesson} addResource={addResource} onClose={() => setAiPanel(null)} />}
      {editModal && (
        <EditResourceModal
          resource={editModal}
          onSubmit={data => handleEdit(editModal.id, data)}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  )
}

function ResourceCard({ resource, onToggle, onDelete, onEdit }) {
  const color = TYPE_COLORS[resource.type] || 'var(--text3)'
  return (
    <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 24, height: 24, background: color + '22', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <TypeIcon type={resource.type} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{resource.title}</p>
          <span style={{ fontSize: 9, background: color + '22', color, padding: '1px 6px', borderRadius: 3, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.06em' }}>{resource.type}</span>
        </div>
        {resource.description && <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2, lineHeight: 1.4 }}>{resource.description}</p>}
        {resource.url && <p style={{ fontSize: 10, color: 'var(--accent)', opacity: 0.7, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resource.url}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <Toggle enabled={resource.is_enabled} onChange={onToggle} small />
        <button onClick={onEdit} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer', padding: 2 }}>✎</button>
        <button onClick={onDelete} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 16, cursor: 'pointer', padding: 2, lineHeight: 1 }}>×</button>
      </div>
    </div>
  )
}

function EditResourceModal({ resource, onSubmit, onClose }) {
  const [form, setForm] = useState({ title: resource.title || '', url: resource.url || '', description: resource.description || '', type: resource.type || 'link' })
  const [loading, setLoading] = useState(false)
  const types = ['link', 'paper', 'framework', 'playground', 'tool']

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try { await onSubmit(form); onClose() } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 12, padding: 24, width: '100%', maxWidth: 460 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 18 }}>Edit Resource</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <p style={lbl}>Title</p>
            <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={iSt} />
          </div>
          <div>
            <p style={lbl}>Type</p>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={iSt}>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p style={lbl}>URL</p>
            <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} style={iSt} placeholder="https://..." />
          </div>
          <div>
            <p style={lbl}>Description</p>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...iSt, height: 64, resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 7, padding: '7px 16px', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#6C8EFF,#A78BFA)', border: 'none', borderRadius: 7, padding: '7px 20px', color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TypeIcon({ type, color }) {
  const icons = {
    link: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M4.5 6.5l2-2M3 7.5A2.5 2.5 0 007.5 3l-.5.5M8 3.5A2.5 2.5 0 003.5 8l.5-.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    paper: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1.5" y="1" width="8" height="9" rx="1" stroke={color} strokeWidth="1.2"/><path d="M3.5 4h4M3.5 6h3" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>,
    framework: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><polygon points="5.5,1 10,4 10,8 5.5,10 1,8 1,4" stroke={color} strokeWidth="1.2" fill="none"/></svg>,
    playground: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 8.5V5.5l3.5-4 3.5 4v3H7V7H4v1.5H2z" stroke={color} strokeWidth="1.2" fill="none"/></svg>,
    tool: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7 2L9 4 4.5 8.5 2.5 6.5 7 2z" stroke={color} strokeWidth="1.2" fill="none"/></svg>,
    visualizer: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="3.5" stroke={color} strokeWidth="1.2"/><path d="M5.5 3v2l1.5 1.5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  }
  return icons[type] || icons.link
}

function AIResourcesPanel({ lesson, addResource, onClose }) {
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [added, setAdded] = useState(new Set())
  const [error, setError] = useState('')

  const suggest = async () => {
    setLoading(true); setError(''); setSuggestions([]); setAdded(new Set())
    try {
      const { resources } = await api.ai.suggestResources(lesson.title, 'Deep Learning')
      setSuggestions(resources)
    } catch (err) {
      setError('Failed to get suggestions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { suggest() }, [])

  const handleAdd = async (s, i) => {
    try { await addResource(s); setAdded(prev => new Set([...prev, i])) } catch (err) { console.error(err) }
  }

  const icon = {
    bg: 'linear-gradient(135deg,#A78BFA,#6C8EFF)',
    svg: <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1l1.2 2.4L9 4l-2 1.9.5 2.6L5.5 7.3 3 8.5l.5-2.6L1.5 4l2.3-.6L5.5 1z" stroke="white" strokeWidth="1" strokeLinejoin="round"/></svg>
  }

  return (
    <AIPanelShell title="AI Resource Suggestions" icon={icon} onClose={onClose} footer={
      <GradientButton onClick={suggest} loading={loading} gradient="linear-gradient(135deg,#A78BFA,#6C8EFF)">
        {loading ? 'Finding resources…' : 'Refresh Suggestions'}
      </GradientButton>
    }>
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 10 }}>
          <div style={{ width: 18, height: 18, border: '2px solid var(--border2)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: 'var(--text3)', fontSize: 12 }}>Finding the best resources…</p>
        </div>
      )}
      {error && <p style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</p>}
      {suggestions.map((s, i) => {
        const color = TYPE_COLORS[s.type] || 'var(--text3)'
        const isAdded = added.has(i)
        return (
          <div key={i} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{s.title}</p>
                  <span style={{ fontSize: 9, background: color + '22', color, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase', fontWeight: 600 }}>{s.type}</span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4, lineHeight: 1.4 }}>{s.description}</p>
                <p style={{ fontSize: 10, color: 'var(--accent)', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.url}</p>
              </div>
              <button onClick={() => handleAdd(s, i)} disabled={isAdded}
                style={{ background: isAdded ? 'var(--success)' : 'var(--accent)', border: 'none', borderRadius: 5, padding: '4px 10px', color: 'white', fontSize: 11, cursor: isAdded ? 'default' : 'pointer', flexShrink: 0, marginTop: 2, fontWeight: 500 }}>
                {isAdded ? '✓' : 'Add'}
              </button>
            </div>
          </div>
        )
      })}
    </AIPanelShell>
  )
}

const lbl = { fontSize: 11, fontWeight: 500, color: 'var(--text2)', marginBottom: 5 }
const iSt = { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 7, padding: '8px 10px', color: 'var(--text)', fontSize: 13, outline: 'none' }
