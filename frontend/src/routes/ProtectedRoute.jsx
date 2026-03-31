import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const token = localStorage.getItem('access_token')

  // Allow if store says authenticated OR a token exists in storage
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute