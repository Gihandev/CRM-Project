import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'
import { authService } from './services/authService'

import Login         from './pages/Login'
import Register      from './pages/Register'
import Dashboard     from './pages/Dashboard'
import Companies     from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'
import ActivityLog   from './pages/ActivityLog'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  const { setUser, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // On every page refresh, try to restore the user session
    // by fetching profile using the saved token
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

        {/* Public pages — no login needed */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected pages — must be logged in */}
        <Route path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/companies"
          element={<ProtectedRoute><Companies /></ProtectedRoute>} />
        <Route path="/companies/:id"
          element={<ProtectedRoute><CompanyDetail /></ProtectedRoute>} />
        <Route path="/activity"
          element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />

        {/* Default redirect */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App