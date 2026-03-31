import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import Badge from '../ui/Badge'
import { capitalize } from '../../utils/formatters'

// Nav links shown in the top bar
const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/companies', label: 'Companies' },
  { to: '/activity',  label: 'Activity Log' },
]

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">

        {/* Left — logo + links */}
        <div className="flex items-center gap-8">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">CR</span>
            </div>
            <span className="font-bold text-gray-900 text-sm hidden sm:block">
              CRM System
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center">
            {NAV_LINKS.map((link) => {
              const active = location.pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    px-3 h-14 flex items-center text-sm font-medium
                    border-b-2 transition-colors
                    ${active
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                    }
                  `}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right — user info + logout */}
        <div className="flex items-center gap-3">

          {/* Org name */}
          <span className="text-xs text-gray-400 hidden md:block truncate max-w-32">
            {user?.organization?.name}
          </span>

          {/* Role badge */}
          <Badge color={
            user?.role === 'admin'   ? 'purple' :
            user?.role === 'manager' ? 'blue'   : 'gray'
          }>
            {capitalize(user?.role)}
          </Badge>

          {/* Username */}
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.username}
          </span>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-xs text-gray-500 px-3 py-1.5 rounded-lg
              hover:bg-red-50 hover:text-red-600 border border-gray-200
              hover:border-red-200 transition font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar