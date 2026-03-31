import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper    from '../components/layout/PageWrapper'
import Table          from '../components/ui/Table'
import Button         from '../components/ui/Button'
import Modal          from '../components/ui/Modal'
import Input          from '../components/ui/Input'
import Spinner        from '../components/ui/Spinner'
import Pagination     from '../components/ui/Pagination'
import Alert          from '../components/ui/Alert'
import { useCompanies }    from '../hooks/useCompanies'
import { companyService }  from '../services/companyService'
import { formatDate }      from '../utils/formatters'
import useAuthStore        from '../store/authStore'

const EMPTY = { name: '', industry: '', country: '' }

const Companies = () => {
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)

  // List state
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)

  // Modal state
  const [open, setOpen]           = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form, setForm]           = useState(EMPTY)
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)

  const { companies, count, loading, refetch } =
    useCompanies({ search, page })

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const openCreate = () => {
    setEditTarget(null)
    setForm(EMPTY)
    setFormError('')
    setOpen(true)
  }

  const openEdit = (company) => {
    setEditTarget(company)
    setForm({
      name:     company.name,
      industry: company.industry,
      country:  company.country,
    })
    setFormError('')
    setOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editTarget) {
        await companyService.update(editTarget.id, form)
      } else {
        await companyService.create(form)
      }
      setOpen(false)
      refetch()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (company) => {
    if (!window.confirm(`Delete "${company.name}"? This cannot be undone.`))
      return
    try {
      await companyService.remove(company.id)
      refetch()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.')
    }
  }

  // Table column definitions
  const columns = [
    {
      key: 'name', label: 'Company',
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Avatar circle with first letter */}
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center
            justify-center text-blue-700 text-xs font-bold flex-shrink-0">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{row.name}</span>
        </div>
      ),
    },
    { key: 'industry', label: 'Industry',
      render: (row) => row.industry || '—'
    },
    { key: 'country',  label: 'Country',
      render: (row) => row.country  || '—'
    },
    { key: 'created_at', label: 'Created',
      render: (row) => (
        <span className="text-gray-400 text-xs">{formatDate(row.created_at)}</span>
      )
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div
          className="flex gap-2 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          {['admin', 'manager'].includes(user?.role) && (
            <Button size="sm" variant="secondary" onClick={() => openEdit(row)}>
              Edit
            </Button>
          )}
          {user?.role === 'admin' && (
            <Button size="sm" variant="danger" onClick={() => handleDelete(row)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <PageWrapper>

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {count} {count === 1 ? 'company' : 'companies'} in your organization
          </p>
        </div>
        <Button onClick={openCreate}>
          + New Company
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="🔍  Search companies by name..."
          className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200
            focus:outline-none focus:ring-2 focus:ring-blue-500
            bg-gray-50 placeholder:text-gray-400"
        />
      </div>

      {/* Table */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Table
            columns={columns}
            data={companies}
            onRowClick={(row) => navigate(`/companies/${row.id}`)}
            emptyMessage="No companies yet. Create your first one!"
          />
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination
              page={page}
              totalCount={count}
              pageSize={10}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editTarget ? 'Edit Company' : 'New Company'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Alert type="error" message={formError} />

          <Input label="Company Name" name="name"
            value={form.name} onChange={handleChange}
            placeholder="e.g. Acme Corp" required />
          <Input label="Industry" name="industry"
            value={form.industry} onChange={handleChange}
            placeholder="e.g. Technology" />
          <Input label="Country" name="country"
            value={form.country} onChange={handleChange}
            placeholder="e.g. USA" />

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editTarget ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

    </PageWrapper>
  )
}

export default Companies