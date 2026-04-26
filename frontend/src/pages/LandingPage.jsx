import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#F0F5F2', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1A2E26' }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(240,245,242,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #CDE0D6', padding: '0 48px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#1A6B5A,#3DAA8A)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 4h11M2 7.5h8M2 11h5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.4px', color: '#1A2E26' }}>EduForge</span>
        </div>
        <button onClick={() => navigate('/login')} style={{ background: '#1A6B5A', border: 'none', borderRadius: 8, padding: '8px 20px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Sign In</button>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '130px 24px 80px', background: 'linear-gradient(180deg,#F0F5F2 0%,#E2EDE7 100%)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#1A6B5A18', border: '1px solid #1A6B5A30', borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A6B5A' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1A6B5A', letterSpacing: '0.04em' }}>AI-Powered Course Management</span>
        </div>
        <h1 style={{ fontSize: 'clamp(36px,6vw,68px)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.1, maxWidth: 760, margin: '0 auto 24px' }}>
          Plan lectures.<br />
          <span style={{ background: 'linear-gradient(135deg,#1A6B5A,#3DAA8A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Teach smarter.</span>
        </h1>
        <p style={{ fontSize: 17, color: '#4A6358', maxWidth: 500, margin: '0 auto 44px', lineHeight: 1.75 }}>
          EduForge helps instructors plan lectures, generate slides, build visualizers, and manage course content — all in one place.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login')} style={{ background: '#1A6B5A', border: 'none', borderRadius: 10, padding: '13px 28px', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px #1A6B5A33' }}>Instructor Portal →</button>
          <button onClick={() => navigate('/login')} style={{ background: 'white', border: '1.5px solid #CDE0D6', borderRadius: 10, padding: '13px 28px', color: '#1A2E26', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Student Portal →</button>
        </div>
      </section>

      {/* App preview */}
      <section style={{ background: '#E2EDE7', padding: '0 48px 80px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 960, background: 'white', borderRadius: 16, border: '1px solid #CDE0D6', overflow: 'hidden', boxShadow: '0 20px 60px rgba(26,46,38,0.1)' }}>
          <div style={{ background: '#F0F5F2', borderBottom: '1px solid #CDE0D6', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#C47F7F' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D4A96A' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3DAA8A' }} />
            <div style={{ flex: 1, background: '#DCE9E2', borderRadius: 5, height: 22, marginLeft: 8, display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
              <span style={{ fontSize: 11, color: '#8AA898' }}>eduforge-p2fc.onrender.com/instructor</span>
            </div>
          </div>
          <div style={{ display: 'flex', height: 380 }}>
            <div style={{ width: 180, borderRight: '1px solid #CDE0D6', padding: 12, background: '#F7FAF8' }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: '#8AA898', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>My Courses</p>
              {['Deep Learning MS','Computer Vision','NLP Fundamentals'].map((c,i) => (
                <div key={c} style={{ padding: '7px 8px', borderRadius: 6, background: i===0?'#1A6B5A12':'none', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: ['#1A6B5A','#C47F7F','#3DAA8A'][i], flexShrink: 0 }} />
                  <p style={{ fontSize: 10, color: i===0?'#1A6B5A':'#4A6358', fontWeight: i===0?600:400 }}>{c}</p>
                </div>
              ))}
            </div>
            <div style={{ width: 180, borderRight: '1px solid #CDE0D6', padding: 12, background: '#F7FAF8' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#4A6358', marginBottom: 8 }}>Deep Learning MS</p>
              {['Foundations','Training','CNNs'].map((m,i) => (
                <div key={m} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <div style={{ width: 20, height: 11, background: i===2?'#CDE0D6':'#1A6B5A', borderRadius: 6, position: 'relative' }}>
                      <div style={{ width: 9, height: 9, background: 'white', borderRadius: '50%', position: 'absolute', top: 1, left: i===2?1:10 }} />
                    </div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#4A6358' }}>{m}</p>
                  </div>
                  {i===0&&['Neurons','Activation Fns','Forward Prop'].map((l,j) => (
                    <div key={l} style={{ paddingLeft: 14, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 16, height: 9, background: j===1?'#1A6B5A':'#CDE0D6', borderRadius: 5, position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: 7, height: 7, background: 'white', borderRadius: '50%', position: 'absolute', top: 1, left: j===1?8:1 }} />
                      </div>
                      <p style={{ fontSize: 9, color: j===1?'#1A6B5A':'#8AA898' }}>{l}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1A2E26' }}>Activation Functions & Non-linearity</p>
                  <p style={{ fontSize: 10, color: '#8AA898' }}>Deep Learning MS</p>
                </div>
                <div style={{ background: '#1A6B5A', borderRadius: 6, padding: '5px 12px' }}>
                  <p style={{ fontSize: 10, color: 'white', fontWeight: 600 }}>▶ Present</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                {['Slides','Resources','Visualizer'].map((t,i) => (
                  <p key={t} style={{ fontSize: 11, color: i===0?'#1A6B5A':'#8AA898', fontWeight: i===0?600:400, borderBottom: i===0?'1.5px solid #1A6B5A':'none', paddingBottom: 6 }}>{t}</p>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {['Intro','What is Activation?','Sigmoid','ReLU','Tanh','Softmax','Comparison','Summary'].map((s,i) => (
                  <div key={s} style={{ background: '#F0F5F2', border: '1px solid #CDE0D6', borderRadius: 6, padding: 8, aspectRatio: '16/9', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 7, color: '#8AA898' }}>SLIDE {i+1}</p>
                    <p style={{ fontSize: 8, fontWeight: 600, color: '#1A2E26' }}>{s}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {[1,2].map(b=><div key={b} style={{ height: 2, background: '#CDE0D6', borderRadius: 1, width: b===1?'80%':'55%' }}/>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#1A6B5A', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 12 }}>Everything you need</p>
        <h2 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-1px', textAlign: 'center', marginBottom: 52, color: '#1A2E26' }}>Built for how instructors actually work</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
          {[
            { icon: '⚡', color: '#1A6B5A', title: 'AI Slide Generation', desc: 'Describe your lecture topic and key concepts. EduForge generates a complete, structured slide deck in seconds.' },
            { icon: '◎', color: '#C47F7F', title: 'Content Visibility Control', desc: 'Toggle modules, lessons, and resources on or off. Students only see what you choose to share, when you choose.' },
            { icon: '▶', color: '#3DAA8A', title: 'Web-Based Presentations', desc: 'Present directly from the browser. Full-screen mode, keyboard navigation, speaker notes — no PowerPoint needed.' },
            { icon: '✦', color: '#1A6B5A', title: 'Resource Curation', desc: 'AI suggests papers, frameworks, playgrounds, and tools relevant to your topic. Add them in one click.' },
            { icon: '◈', color: '#C47F7F', title: 'Concept Visualizers', desc: 'Describe a concept — sigmoid curves, gradient descent — and get an animated HTML visualizer, instantly.' },
            { icon: '◉', color: '#3DAA8A', title: 'Student Management', desc: 'Register students, set passwords, manage enrollments. Clean student portal with only what they need.' },
          ].map(f => (
            <div key={f.title} style={{ background: 'white', border: '1px solid #CDE0D6', borderRadius: 12, padding: 24 }}>
              <div style={{ width: 36, height: 36, background: f.color+'18', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 14 }}>{f.icon}</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1A2E26', marginBottom: 8 }}>{f.title}</p>
              <p style={{ fontSize: 13, color: '#4A6358', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two roles */}
      <section style={{ padding: '0 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { role: 'Instructor', color: '#1A6B5A', items: ['Create and organise courses, modules, and lessons','Generate full slide decks from a topic description','Build animated visualizers for complex concepts','Curate AI-suggested papers, tools, and playgrounds','Control exactly what students see and when','Register students and manage enrollments'], heading: 'Your command center for teaching' },
            { role: 'Student', color: '#C47F7F', items: ['Access all your enrolled courses in one place','View lecture slides directly in the browser','Full-screen presentation mode for focused study','Access curated papers, tools, and frameworks','Interactive concept visualizers per lesson','Content updated live as your instructor adds it'], heading: 'Everything your course has to offer' },
          ].map(({ role, color, items, heading }) => (
            <div key={role} style={{ background: 'white', border: '1.5px solid #CDE0D6', borderRadius: 14, padding: 32 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: color+'15', borderRadius: 100, padding: '4px 12px', marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color }}>{role}</span>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 16, color: '#1A2E26' }}>{heading}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map(item => (
                  <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 16, height: 16, background: color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <p style={{ fontSize: 13, color: '#4A6358', lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/login')} style={{ marginTop: 24, background: color, border: 'none', borderRadius: 8, padding: '10px 22px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>{role} Sign In →</button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#1A2E26', padding: '72px 48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 34, fontWeight: 700, color: 'white', letterSpacing: '-1px', marginBottom: 14 }}>Start teaching smarter today</h2>
        <p style={{ fontSize: 16, color: '#8AA898', marginBottom: 36, maxWidth: 400, margin: '0 auto 36px' }}>Your first course is one click away.</p>
        <button onClick={() => navigate('/login')} style={{ background: '#3DAA8A', border: 'none', borderRadius: 10, padding: '13px 32px', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Get Started →</button>
      </section>

      {/* Footer */}
      <footer style={{ background: '#111E18', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#1A6B5A,#3DAA8A)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 3h8M1.5 5.5h5.5M1.5 8h4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>EduForge</span>
        </div>
        <p style={{ fontSize: 12, color: '#4A6358' }}>AI-powered course management for modern instructors</p>
      </footer>
    </div>
  )
}