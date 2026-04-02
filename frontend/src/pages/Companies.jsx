import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper   from '../components/layout/PageWrapper'
import Modal         from '../components/ui/Modal'
import Input         from '../components/ui/Input'
import Spinner       from '../components/ui/Spinner'
import Alert         from '../components/ui/Alert'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useCompanies }   from '../hooks/useCompanies'
import { companyService } from '../services/companyService'
import { formatDate }     from '../utils/formatters'
import useAuthStore       from '../store/authStore'

const EMPTY = { name: '', industry: '', country: '' }

// Pencil icon
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7
      M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

// Trash icon
const DeleteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
  </svg>
)

// Chevron right
const ChevronIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
)

const Companies = () => {
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)

  const [open, setOpen]         = useState(false)
  const [editTarget, setEdit]   = useState(null)
  const [form, setForm]         = useState(EMPTY)
  const [formError, setFE]      = useState('')
  const [saving, setSaving]     = useState(false)

  const [deleteTarget, setDT]   = useState(null)

  const { companies, count, loading, refetch } =
    useCompanies({ search, page })

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const openCreate = () => {
    setEdit(null); setForm(EMPTY); setFE(''); setOpen(true)
  }

  const openEdit = (c) => {
    setEdit(c)
    setForm({ name: c.name, industry: c.industry || '', country: c.country || '' })
    setFE(''); setOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setFE('')
    try {
      if (editTarget) await companyService.update(editTarget.id, form)
      else            await companyService.create(form)
      setOpen(false); refetch()
    } catch (err) {
      setFE(err.response?.data?.message || 'Failed to save.')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await companyService.remove(deleteTarget.id)
      refetch()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.')
    }
  }

  const totalPages = Math.ceil(count / 10)

  return (
    <PageWrapper>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage your organization's client companies.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white
            px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700
            transition shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          Add Company
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search companies..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg
                w-full focus:outline-none focus:ring-2 focus:ring-indigo-500
                bg-gray-50 placeholder:text-gray-400"
            />
          </div>
        </div>

        {loading ? <Spinner /> : (
          <>
            {/* Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Company', 'Industry', 'Country', 'Created At', 'Actions'].map((h) => (
                    <th key={h}
                      className="px-6 py-3 text-left text-xs font-semibold
                        text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {companies.length === 0 ? (
                  <tr><td colSpan={5}
                    className="px-6 py-16 text-center text-gray-400 text-sm">
                    No companies yet. Add your first one!
                  </td></tr>
                ) : companies.map((c) => (
                  <tr key={c.id}
                    className="hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => navigate(`/companies/${c.id}`)}>

                    {/* Company name + avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100
                          flex items-center justify-center text-indigo-700
                          text-sm font-bold flex-shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {c.industry || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {c.country  || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {formatDate(c.created_at)}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        {['admin', 'manager'].includes(user?.role) && (
                          <button
                            onClick={() => openEdit(c)}
                            className="text-gray-400 hover:text-indigo-600 transition"
                            title="Edit"
                          >
                            <EditIcon />
                          </button>
                        )}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => setDT(c)}
                            className="text-gray-400 hover:text-red-500 transition"
                            title="Delete"
                          >
                            <DeleteIcon />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/companies/${c.id}`)}
                          className="text-gray-400 hover:text-gray-600 transition"
                        >
                          <ChevronIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination footer */}
            <div className="flex items-center justify-between px-6 py-3
              border-t border-gray-100 text-sm text-gray-500">
              <span>
                Showing <b>1</b> to <b>{Math.min(10, count)}</b> of{' '}
                <b>{count}</b> results
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded
                    border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >‹</button>
                <span className="px-3 py-1 bg-gray-50 rounded border
                  border-gray-200 text-xs font-medium">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded
                    border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                >›</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editTarget ? 'Edit Company' : 'Add Company'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Alert type="error" message={formError} />
          <Input label="Company Name" name="name" value={form.name}
            onChange={onChange} placeholder="e.g. Acme Corp" required />
          <Input label="Industry" name="industry" value={form.industry}
            onChange={onChange} placeholder="e.g. Technology" />
          <Input label="Country" name="country" value={form.country}
            onChange={onChange} placeholder="e.g. USA" />
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300
                text-gray-700 hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white
                hover:bg-indigo-700 font-medium disabled:opacity-50">
              {saving ? 'Saving...' : editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDT(null)}
        onConfirm={handleDelete}
        title="Delete Company"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </PageWrapper>
  )
}

export default Companies