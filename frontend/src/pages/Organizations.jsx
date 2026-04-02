import { useState, useEffect } from 'react'
import PageWrapper   from '../components/layout/PageWrapper'
import Modal         from '../components/ui/Modal'
import Input         from '../components/ui/Input'
import Spinner       from '../components/ui/Spinner'
import Alert         from '../components/ui/Alert'
import Badge         from '../components/ui/Badge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { authService } from '../services/authService'
import { formatDate }  from '../utils/formatters'
import useAuthStore    from '../store/authStore'

const EMPTY_ORG = {
  name: '', subscription_plan: 'basic',
  admin_username: '', admin_password: '', admin_email: '',
}

const Organizations = () => {
  const currentUser = useAuthStore((s) => s.user)
  const [orgs, setOrgs]       = useState([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen]         = useState(false)
  const [editTarget, setEdit]   = useState(null)
  const [form, setForm]         = useState(EMPTY_ORG)
  const [formError, setFE]      = useState('')
  const [saving, setSaving]     = useState(false)
  const [deleteTarget, setDT]   = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true)
      const data = await authService.getOrgs()
      setOrgs(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const openCreate = () => {
    setEdit(null); setForm(EMPTY_ORG); setFE(''); setOpen(true)
  }

  const openEdit = (org) => {
    setEdit(org)
    setForm({ name: org.name, subscription_plan: org.subscription_plan })
    setFE(''); setOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setFE('')
    try {
      if (editTarget) {
        await authService.updateOrg(editTarget.id, {
          name: form.name,
          subscription_plan: form.subscription_plan,
        })
      } else {
        await authService.createOrg(form)
      }
      setOpen(false); load()
    } catch (err) {
      const errs = err.response?.data?.errors
      if (errs) {
        const first = Object.values(errs)[0]
        setFE(Array.isArray(first) ? first[0] : String(first))
      } else {
        setFE(err.response?.data?.message || 'Failed to save.')
      }
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await authService.deleteOrg(deleteTarget.id)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.')
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage all organizations in the system.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white
            px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700
            transition shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          Add Organization
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Organization', 'Plan', 'Users', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold
                    text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orgs.length === 0 ? (
                <tr><td colSpan={5}
                  className="px-6 py-16 text-center text-gray-400 text-sm">
                  No organizations found.
                </td></tr>
              ) : orgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-100
                        flex items-center justify-center text-indigo-700
                        text-sm font-bold">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{org.name}</p>
                        {org.id === currentUser?.organization?.id && (
                          <p className="text-xs text-indigo-500">Your org</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={org.subscription_plan === 'pro' ? 'purple' : 'gray'}>
                      {org.subscription_plan}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {org.user_count} users
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {formatDate(org.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(org)}
                        className="text-sm text-indigo-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      {org.id !== currentUser?.organization?.id && (
                        <button
                          onClick={() => setDT(org)}
                          className="text-sm text-red-500 hover:underline font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editTarget ? 'Edit Organization' : 'New Organization'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Alert type="error" message={formError} />

          <Input label="Organization Name" name="name"
            value={form.name || ''} onChange={onChange}
            placeholder="Company name" required />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Subscription Plan
            </label>
            <select
              name="subscription_plan"
              value={form.subscription_plan || 'basic'}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300
                bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          {/* Only show admin fields when creating */}
          {!editTarget && (
            <>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Admin User for this Organization
                </p>
                <div className="space-y-3">
                  <Input label="Admin Username" name="admin_username"
                    value={form.admin_username || ''} onChange={onChange}
                    placeholder="admin username" required />
                  <Input label="Admin Email" name="admin_email" type="email"
                    value={form.admin_email || ''} onChange={onChange}
                    placeholder="admin@company.com" />
                  <Input label="Admin Password" name="admin_password" type="password"
                    value={form.admin_password || ''} onChange={onChange}
                    placeholder="Min 8 characters" required />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300
                text-gray-700 hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600
                text-white hover:bg-indigo-700 font-medium disabled:opacity-50">
              {saving ? 'Saving...' : editTarget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDT(null)}
        onConfirm={handleDelete}
        title="Delete Organization"
        message={`Delete "${deleteTarget?.name}" and all its data? This cannot be undone.`}
      />
    </PageWrapper>
  )
}

export default Organizations