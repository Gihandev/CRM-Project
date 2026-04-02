import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import useAuthStore from '../store/authStore'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'

const Login = () => {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login    = useAuthStore((s) => s.login)

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { tokens, user } = await authService.login(form.username, form.password)
      login(user, tokens.access)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50
      flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-indigo-600 rounded-xl flex items-center
              justify-center shadow-lg mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M3 9h18M3 15h18M9 3v18M15 3v18M3 3h18v18H3z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">CRM Pro</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <Alert type="error" message={error} />

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <Input label="Username" name="username" value={form.username}
              onChange={onChange} placeholder="Enter username" required />
            <Input label="Password" name="password" type="password"
              value={form.password} onChange={onChange}
              placeholder="Enter password" required />

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg
                font-medium hover:bg-indigo-700 transition disabled:opacity-50
                text-sm mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            No account?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Register organization
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login