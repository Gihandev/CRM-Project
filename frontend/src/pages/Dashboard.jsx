import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Spinner from '../components/ui/Spinner'
import useAuthStore from '../store/authStore'
import { companyService }  from '../services/companyService'
import { contactService }  from '../services/contactService'
import { activityService } from '../services/activityService'
import { formatDate, getActionColor } from '../utils/formatters'

// Stat card exactly like the design
const StatCard = ({ icon, label, value, iconBg, iconColor }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center
        justify-center ${iconColor}`}>
        {icon}
      </div>
      <span className="text-xs text-green-600 font-medium bg-green-50
        px-2 py-0.5 rounded-full flex items-center gap-0.5">
        ↗ 12%
      </span>
    </div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
)

const Dashboard = () => {
  const user     = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [stats, setStats]     = useState({ companies: 0, contacts: 0, activities: 0 })
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const [c, ct, l] = await Promise.all([
        companyService.getAll({ page: 1 }),
        contactService.getAll({ page: 1 }),
        activityService.getAll({ page: 1 }),
      ])
      setStats({
        companies:  c.count,
        contacts:   ct.count,
        activities: l.count,
      })
      setLogs(l.results.slice(0, 6))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) return <PageWrapper><Spinner /></PageWrapper>

  return (
    <PageWrapper>
      {/* Org badge top right */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Organization Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Overview of your organization's CRM activity.
          </p>
        </div>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5
          rounded-full font-medium">
          {user?.organization?.name}
        </span>
      </div>

      {/* Stat cards — 3 columns like design */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9h18M3 15h18M9 3v18M15 3v18M3 3h18v18H3z"/></svg>}
          label="Total Companies"
          value={stats.companies}
          iconBg="bg-blue-50" iconColor="text-blue-600"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
          label="Total Contacts"
          value={stats.contacts}
          iconBg="bg-indigo-50" iconColor="text-indigo-600"
        />
        <StatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/></svg>}
          label="Total Activities"
          value={stats.activities}
          iconBg="bg-orange-50" iconColor="text-orange-500"
        />
      </div>

      {/* Bottom row — Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Activity — takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4
            border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Recent Activity</h2>
            <button
              onClick={() => navigate('/activity')}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              View all
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              No recent activity found.
            </div>
          ) : (
            <div className="divide-y divide-gray-50 px-6">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">{log.user}</span>
                      {' · '}{log.model_name} #{log.object_id}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">

            {/* Add Company */}
            <button
              onClick={() => navigate('/companies')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl
                border border-gray-200 hover:border-indigo-300
                hover:bg-indigo-50 transition text-center"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center
                justify-center text-gray-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9h18M3 15h18M9 3v18M15 3v18M3 3h18v18H3z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Add Company</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Register a new client organization
                </p>
              </div>
            </button>

            {/* Add Contact */}
            <button
              onClick={() => navigate('/companies')}
              className="flex flex-col items-center gap-2 p-4 rounded-xl
                border border-gray-200 hover:border-indigo-300
                hover:bg-indigo-50 transition text-center"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center
                justify-center text-gray-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 11l-4 4-4-4M19 15V7"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Add Contact</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Add a person to a company
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default Dashboard