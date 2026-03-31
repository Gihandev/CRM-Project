import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper   from '../components/layout/PageWrapper'
import Table         from '../components/ui/Table'
import Button        from '../components/ui/Button'
import Modal         from '../components/ui/Modal'
import Input         from '../components/ui/Input'
import Spinner       from '../components/ui/Spinner'
import Alert         from '../components/ui/Alert'
import { companyService } from '../services/companyService'
import { contactService } from '../services/contactService'
import { formatDate }     from '../utils/formatters'
import useAuthStore       from '../store/authStore'

const EMPTY_CONTACT = { full_name: '', email: '', phone: '', role: '' }

const CompanyDetail = () => {
  const { id }   = useParams()
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)

  const [company, setCompany]     = useState(null)
  const [loading, setLoading]     = useState(true)

  // Contact modal
  const [open, setOpen]               = useState(false)
  const [editContact, setEditContact] = useState(null)
  const [form, setForm]               = useState(EMPTY_CONTACT)
  const [formError, setFormError]     = useState('')
  const [saving, setSaving]           = useState(false)

  useEffect(() => { load() }, [id])

  const load = async () => {
    try {
      setLoading(true)
      const data = await companyService.getOne(id)
      setCompany(data)
    } catch {
      navigate('/companies')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const openCreate = () => {
    setEditContact(null)
    setForm(EMPTY_CONTACT)
    setFormError('')
    setOpen(true)
  }

  const openEdit = (contact) => {
    setEditContact(contact)
    setForm({
      full_name: contact.full_name,
      email:     contact.email,
      phone:     contact.phone || '',
      role:      contact.role  || '',
    })
    setFormError('')
    setOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editContact) {
        await contactService.update(editContact.id, form)
      } else {
        await contactService.create({ ...form, company: Number(id) })
      }
      setOpen(false)
      load()
    } catch (err) {
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]
        setFormError(Array.isArray(first) ? first[0] : String(first))
      } else {
        setFormError(err.response?.data?.message || 'Failed to save.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (contact) => {
    if (!window.confirm(`Delete "${contact.full_name}"?`)) return
    try {
      await contactService.remove(contact.id)
      load()
    } catch {
      alert('Failed to delete contact.')
    }
  }

  const contactColumns = [
    {
      key: 'full_name', label: 'Name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center
            justify-center text-emerald-700 text-xs font-bold flex-shrink-0">
            {row.full_name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{row.full_name}</span>
        </div>
      ),
    },
    { key: 'email', label: 'Email',
      render: (row) => (
        <span className="text-blue-600 text-sm">{row.email}</span>
      )
    },
    { key: 'phone', label: 'Phone',
      render: (row) => row.phone || '—'
    },
    { key: 'role',  label: 'Role',
      render: (row) => row.role  || '—'
    },
    { key: 'created_at', label: 'Added',
      render: (row) => (
        <span className="text-xs text-gray-400">{formatDate(row.created_at)}</span>
      )
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <div className="flex gap-2 justify-end"
          onClick={(e) => e.stopPropagation()}>
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

  if (loading) return <PageWrapper><Spinner /></PageWrapper>

  return (
    <PageWrapper>

      {/* Back */}
      <button
        onClick={() => navigate('/companies')}
        className="flex items-center gap-1.5 text-sm text-gray-500
          hover:text-gray-700 mb-5 transition"
      >
        ← Back to Companies
      </button>

      {/* Company info card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center
            justify-center text-white text-xl font-bold shadow-sm flex-shrink-0">
            {company.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
            <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-gray-500">
              {company.industry && (
                <span className="flex items-center gap-1">
                  🏢 {company.industry}
                </span>
              )}
              {company.country && (
                <span className="flex items-center gap-1">
                  🌍 {company.country}
                </span>
              )}
              <span className="flex items-center gap-1">
                📅 Created {formatDate(company.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-4
          border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-800">Contacts</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {company.contacts?.length || 0} contact
              {company.contacts?.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button size="sm" onClick={openCreate}>
            + Add Contact
          </Button>
        </div>

        {/* Contacts table */}
        <div className="p-4">
          <Table
            columns={contactColumns}
            data={company.contacts || []}
            emptyMessage="No contacts yet. Add your first contact!"
          />
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editContact ? 'Edit Contact' : 'Add Contact'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Alert type="error" message={formError} />

          <Input label="Full Name" name="full_name"
            value={form.full_name} onChange={handleChange}
            placeholder="Jane Doe" required />
          <Input label="Email" name="email" type="email"
            value={form.email} onChange={handleChange}
            placeholder="jane@example.com" required />
          <Input label="Phone" name="phone"
            value={form.phone} onChange={handleChange}
            placeholder="Optional — 8 to 15 digits" />
          <Input label="Role" name="role"
            value={form.role} onChange={handleChange}
            placeholder="e.g. Manager" />

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : editContact ? 'Update' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </Modal>

    </PageWrapper>
  )
}

export default CompanyDetail