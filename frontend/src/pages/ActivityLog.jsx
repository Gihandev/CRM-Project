import { useState, useEffect } from 'react'
import PageWrapper   from '../components/layout/PageWrapper'
import Table         from '../components/ui/Table'
import Spinner       from '../components/ui/Spinner'
import Pagination    from '../components/ui/Pagination'
import { activityService } from '../services/activityService'
import { formatDate, getActionColor } from '../utils/formatters'

// Filter options shown as tabs
const FILTERS = [
  { label: 'All',    value: ''       },
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
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: 'timestamp', label: 'Time',
      render: (row) => (
        <span className="text-xs text-gray-500">{formatDate(row.timestamp)}</span>
      ),
    },
    {
      key: 'user', label: 'User',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center
            justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
            {row.user?.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-sm text-gray-800">{row.user}</span>
        </div>
      ),
    },
    {
      key: 'action', label: 'Action',
      render: (row) => (
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium
          ${getActionColor(row.action)}`}>
          {row.action}
        </span>
      ),
    },
    {
      key: 'model_name', label: 'Record Type',
      render: (row) => (
        <span className="text-sm text-gray-700">{row.model_name}</span>
      ),
    },
    {
      key: 'object_id', label: 'Record ID',
      render: (row) => (
        <span className="text-xs text-gray-400 font-mono">#{row.object_id}</span>
      ),
    },
  ]

  return (
    <PageWrapper>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-500 mt-1">
          All actions performed in your organization
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setPage(1) }}
            className={`
              px-4 py-1.5 rounded-lg text-sm font-medium border transition
              ${filter === f.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Table
              columns={columns}
              data={logs}
              emptyMessage="No activity logs found."
            />
            <div className="px-4 py-3 border-t border-gray-100">
              <Pagination
                page={page}
                totalCount={count}
                pageSize={20}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

    </PageWrapper>
  )
}

export default ActivityLog