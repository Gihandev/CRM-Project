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

const EMPTY_USER = { username: '', email: '', password: '', role: 'staff' }

const ROLE_COLORS = {
  admin:   'purple',
  manager: 'blue',
  staff:   'gray',
}

const Users = () => {
  const currentUser = useAuthStore((s) => s.user)
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen]           = useState(false)
  const [editTarget, setEdit]     = useState(null)
  const [form, setForm]           = useState(EMPTY_USER)
  const [formError, setFE]        = useState('')
  const [saving, setSaving]       = useState(false)
  const [deleteTarget, setDT]     = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      setLoading(true)
      const data = await authService.getUsers()
      setUsers(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const openCreate = () => {
    setEdit(null); setForm(EMPTY_USER); setFE(''); setOpen(true)
  }

  const openEdit = (u) => {
    setEdit(u)
    setForm({ username: u.username, email: u.email, password: '', role: u.role })
    setFE(''); setOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setFE('')
    try {
      if (editTarget) {
        // Don't send empty password on update
        const payload = { username: form.username, email: form.email, role: form.role }
        await authService.updateUser(editTarget.id, payload)
      } else {
        await authService.addUser(form)
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
      await authService.deleteUser(deleteTarget.id)
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete.')
    }
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage users in your organization.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white
            px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700
            transition shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['User', 'Email', 'Role', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold
                    text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr><td colSpan={4}
                  className="px-6 py-16 text-center text-gray-400 text-sm">
                  No users found.
                </td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100
                        flex items-center justify-center text-indigo-700
                        text-sm font-bold">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.username}</p>
                        {u.id === currentUser?.id && (
                          <p className="text-xs text-gray-400">You</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{u.email || '—'}</td>
                  <td className="px-6 py-4">
                    <Badge color={ROLE_COLORS[u.role] || 'gray'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(u)}
                        className="text-sm text-indigo-600 hover:underline font-medium"
                      >
                        Edit
                      </button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => setDT(u)}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editTarget ? 'Edit User' : 'Add User'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Alert type="error" message={formError} />
          <Input label="Username" name="username" value={form.username}
            onChange={onChange} placeholder="Choose a username" required />
          <Input label="Email" name="email" type="email" value={form.email}
            onChange={onChange} placeholder="user@example.com" />
          {!editTarget && (
            <Input label="Password" name="password" type="password"
              value={form.password} onChange={onChange}
              placeholder="Min 8 characters" required />
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={onChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300
                bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300
                text-gray-700 hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600
                text-white hover:bg-indigo-700 font-medium disabled:opacity-50">
              {saving ? 'Saving...' : editTarget ? 'Update' : 'Add User'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDT(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Delete user "${deleteTarget?.username}"? This cannot be undone.`}
      />
    </PageWrapper>
  )
}

export default Users