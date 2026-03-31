import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Spinner from '../components/ui/Spinner'
import useAuthStore from '../store/authStore'
import { companyService }  from '../services/companyService'
import { contactService }  from '../services/contactService'
import { activityService } from '../services/activityService'
import { formatDate, getActionColor, capitalize } from '../utils/formatters'

// Small stat card only used on this page
const StatCard = ({ label, value, sub, color, to }) => {
  const card = (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5
      hover:shadow-md transition-shadow">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
  return to ? (
    <Link to={to} className="block">{card}</Link>
  ) : card
}

const Dashboard = () => {
  const user = useAuthStore((s) => s.user)
  const [stats, setStats]     = useState({ companies: 0, contacts: 0 })
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [c, ct, l] = await Promise.all([
        companyService.getAll({ page: 1 }),
        contactService.getAll({ page: 1 }),
        activityService.getAll({ page: 1 }),
      ])
      setStats({ companies: c.count, contacts: ct.count })
      setLogs(l.results.slice(0, 8))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageWrapper><Spinner /></PageWrapper>

  return (
    <PageWrapper>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Good day, {user?.username} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.organization?.name} &nbsp;·&nbsp;
          {capitalize(user?.organization?.subscription_plan)} plan
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Companies"
          value={stats.companies}
          sub="Click to manage"
          color="text-blue-600"
          to="/companies"
        />
        <StatCard
          label="Contacts"
          value={stats.contacts}
          color="text-emerald-600"
        />
        <StatCard
          label="Your Role"
          value={capitalize(user?.role)}
          sub={user?.organization?.name}
          color="text-purple-600"
        />
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Activity</h2>
          <Link to="/activity"
            className="text-xs text-blue-600 hover:underline font-medium">
            View all →
          </Link>
        </div>

        {logs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No activity yet. Start by creating a company.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => (
              <div key={log.id}
                className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  {/* Action badge */}
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full font-medium
                    ${getActionColor(log.action)}
                  `}>
                    {log.action}
                  </span>
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">{log.user}</span>
                    {' '}{log.action.toLowerCase()}d a{' '}
                    <span className="text-gray-500">{log.model_name}</span>
                    {' '}
                    <span className="text-gray-400 text-xs">#{log.object_id}</span>
                  </span>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                  {formatDate(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

export default Dashboard