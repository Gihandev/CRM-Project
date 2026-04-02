import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import { authService } from './services/authService'

import Login          from './pages/Login'
import Register       from './pages/Register'
import Dashboard      from './pages/Dashboard'
import Companies      from './pages/Companies'
import CompanyDetail  from './pages/CompanyDetail'
import ActivityLog    from './pages/ActivityLog'
import Users          from './pages/Users'
import Organizations  from './pages/Organizations'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  const { setUser, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Restore session on page refresh
    const token = localStorage.getItem('access_token')
    if (token && !isAuthenticated) {
      authService.getProfile()
        .then((user) => setUser(user))
        .catch(() => localStorage.removeItem('access_token'))
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/companies"
          element={<ProtectedRoute><Companies /></ProtectedRoute>} />
        <Route path="/companies/:id"
          element={<ProtectedRoute><CompanyDetail /></ProtectedRoute>} />
        <Route path="/activity"
          element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
        <Route path="/users"
          element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/organizations"
          element={<ProtectedRoute><Organizations /></ProtectedRoute>} />

        {/* Redirects */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App