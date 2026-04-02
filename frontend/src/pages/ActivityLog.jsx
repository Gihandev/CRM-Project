import { useState, useEffect } from 'react'
import PageWrapper from '../components/layout/PageWrapper'
import Spinner     from '../components/ui/Spinner'
import { activityService } from '../services/activityService'
import { formatDate, getActionColor } from '../utils/formatters'

const FILTERS = [
  { label: 'All',    value: '' },
  { label: 'Create', value: 'CREATE' },
  { label: 'Update', value: 'UPDATE' },
  { label: 'Delete', value: 'DELETE' },
]

const ActivityLog = () => {
  const [logs, setLogs]       = useState([])
  const [count, setCount]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [filter, setFilter]   = useState('')

  useEffect(() => { load() }, [page, filter])

  const load = async () => {
    try {
      setLoading(true)
      const params = { page }
      if (filter) params.action = filter
      const data = await activityService.getAll(params)
      setLogs(data.results)
      setCount(data.count)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const totalPages = Math.ceil(count / 20)

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-gray-500 text-sm mt-1">
          All actions performed in your organization.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1) }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border
              transition ${filter === f.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Time', 'User', 'Action', 'Record Type', 'Record ID'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold
                      text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.length === 0 ? (
                  <tr><td colSpan={5}
                    className="px-6 py-16 text-center text-gray-400 text-sm">
                    No activity logs found.
                  </td></tr>
                ) : logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100
                          flex items-center justify-center text-indigo-700
                          text-xs font-bold">
                          {log.user?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">
                          {log.user}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full
                        font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{log.model_name}</td>
                    <td className="px-6 py-3 text-gray-400 font-mono text-xs">
                      #{log.object_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3
              border-t border-gray-100 text-sm text-gray-500">
              <span>Showing <b>{logs.length}</b> of <b>{count}</b></span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded
                    border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                  ‹
                </button>
                <span className="text-xs">Page {page} of {totalPages || 1}</span>
                <button onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded
                    border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  )
}

export default ActivityLog