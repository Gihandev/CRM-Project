import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { capitalize } from '../../utils/formatters'

// Icons as simple SVG components
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

const ICONS = {
  dashboard:  'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  companies:  'M3 9h18M3 15h18M9 3v18M15 3v18M3 3h18v18H3z',
  activity:   'M12 8v4l3 3M12 2a10 10 0 100 20A10 10 0 0012 2z',
  users:      'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  orgs:       'M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11',
  logout:     'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
  user:       'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
}

// Each nav link
const NavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
      font-medium transition-all ${
      active
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <span className={active ? 'text-indigo-600' : 'text-gray-400'}>
      <Icon d={ICONS[icon]} />
    </span>
    {label}
  </Link>
)

const Sidebar = () => {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const path     = location.pathname

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200
      flex flex-col fixed left-0 top-0 bottom-0 z-30">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center
            justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M3 9h18M3 15h18M9 3v18M15 3v18M3 3h18v18H3z"
                stroke="white" strokeWidth="2" fill="none"
                strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-base">CRM Pro</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavItem to="/dashboard" icon="dashboard" label="Dashboard"
          active={path === '/dashboard'} />
        <NavItem to="/companies" icon="companies" label="Companies"
          active={path.startsWith('/companies')} />
        <NavItem to="/activity"  icon="activity"  label="Activity Log"
          active={path === '/activity'} />

        {/* Admin only sections */}
        {user?.role === 'admin' && (
          <>
            <div className="pt-4 pb-1">
              <p className="text-xs font-semibold text-gray-400 uppercase
                tracking-wider px-3">
                Admin
              </p>
            </div>
            <NavItem to="/users"         icon="users" label="Users"
              active={path === '/users'} />
            <NavItem to="/organizations" icon="orgs"  label="Organizations"
              active={path === '/organizations'} />
          </>
        )}
      </nav>

      {/* Bottom — user info + logout */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-2">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center
            justify-center text-indigo-700 text-sm font-bold flex-shrink-0">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
            text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <Icon d={ICONS.logout} size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar