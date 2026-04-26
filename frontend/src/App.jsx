import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import LoginPage from './pages/LoginPage.jsx'
import InstructorLayout from './pages/instructor/InstructorLayout.jsx'
import CoursesPage from './pages/instructor/CoursesPage.jsx'
import StudentsPage from './pages/instructor/StudentsPage.jsx'
import StudentLayout from './pages/student/StudentLayout.jsx'
import StudentCoursePage from './pages/student/StudentCoursePage.jsx'

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'instructor' ? '/instructor' : '/student'} replace />
  }
  return children
}

function FullPageSpinner() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6C8EFF,#A78BFA)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 5h12M2 8h8M2 11h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <p style={{ color: 'var(--text3)', fontSize: 13 }}>Loading EduForge...</p>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return <FullPageSpinner />

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'instructor' ? '/instructor' : '/student'} replace /> : <LoginPage />
      } />

      {/* Instructor routes */}
      <Route path="/instructor" element={
        <RequireAuth role="instructor"><InstructorLayout /></RequireAuth>
      }>
        <Route index element={<CoursesPage />} />
        <Route path="students" element={<StudentsPage />} />
      </Route>

      {/* Student routes */}
      <Route path="/student" element={
        <RequireAuth role="student"><StudentLayout /></RequireAuth>
      }>
        <Route index element={<StudentCoursePage />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={
        user
          ? <Navigate to={user.role === 'instructor' ? '/instructor' : '/student'} replace />
          : <Navigate to="/login" replace />
      } />
    </Routes>
  )
}
