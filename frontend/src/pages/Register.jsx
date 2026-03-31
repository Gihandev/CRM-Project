import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import useAuthStore from '../store/authStore'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

const Register = () => {
  const [form, setForm] = useState({
    org_name: '', username: '', email: '', password: '',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const login    = useAuthStore((s) => s.login)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { tokens, user } = await authService.register(form)
      login(user, tokens.access)
      navigate('/dashboard')
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]
        setError(Array.isArray(first) ? first[0] : String(first))
      } else {
        setError(err.response?.data?.message || 'Registration failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100
      flex items-center justify-center px-4 m-5">

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          <div className="flex flex-col items-center mb-7">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center
              justify-center shadow-lg mb-3">
              <span className="text-white font-bold text-lg">CR</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Create your organization
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Get started with your CRM today
            </p>
          </div>

          <Alert type="error" message={error} />

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Input label="Organization Name" name="org_name"
              value={form.org_name} onChange={handleChange}
              placeholder="Your company name" required />
            <Input label="Username" name="username"
              value={form.username} onChange={handleChange}
              placeholder="Choose a username" required />
            <Input label="Email" name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="your@email.com" />
            <Input label="Password" name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="Minimum 8 characters" required />

            <Button type="submit" disabled={loading} size="lg" className="w-full mt-2">
              {loading ? 'Creating...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register