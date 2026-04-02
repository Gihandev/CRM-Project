import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper   from '../components/layout/PageWrapper'
import Modal         from '../components/ui/Modal'
import Input         from '../components/ui/Input'
import Spinner       from '../components/ui/Spinner'
import Alert         from '../components/ui/Alert'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { companyService } from '../services/companyService'
import { contactService } from '../services/contactService'
import { formatDate }     from '../utils/formatters'
import useAuthStore       from '../store/authStore'

const EMPTY = { full_name: '', email: '', phone: '', role: '' }

const CompanyDetail = () => {
  const { id }   = useParams()
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)

  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  const [open, setOpen]             = useState(false)
  const [editContact, setEC]        = useState(null)
  const [form, setForm]             = useState(EMPTY)
  const [formError, setFE]          = useState('')
  const [saving, setSaving]         = useState(false)
  const [deleteTarget, setDT]       = useState(null)

  // Edit company modal
  const [editCompanyOpen, setECO]   = useState(false)
  const [companyForm, setCF]        = useState({})
  const [companySaving, setCS]      = useState(false)
  const [companyError, setCE]       = useState('')

  useEffect(() => { load() }, [id])

  const load = async () => {
    try {
      setLoading(true)
      const data = await companyService.getOne(id)
      setCompany(data)
    } catch { navigate('/companies') }
    finally { setLoading(false) }
  }

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const openCreate = () => {
    setEC(null); setForm(EMPTY); setFE(''); setOpen(true)
  }

  const openEdit = (c) => {
    setEC(c)
    setForm({
      full_name: c.full_name,
      email: c.email,
      phone: c.phone || '',
      role:  c.role  || '',
    })
    setFE(''); setOpen(true)
  }

  const openEditCompany = () => {
    setCF({
      name:     company.name,
      industry: company.industry || '',
      country:  company.country  || '',
    })
    setCE(''); setECO(true)
  }

  const handleSaveContact = async (e) => {
    e.preventDefault()
    setSaving(true); setFE('')
    try {
      if (editContact) await contactService.update(editContact.id, form)
      else             await contactService.create({ ...form, company: Number(id) })
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

  const handleSaveCompany = async (e) => {
    e.preventDefault()
    setCS(true); setCE('')
    try {
      await companyService.update(id, companyForm)
      setECO(false); load()
    } catch (err) {
      setCE(err.response?.data?.message || 'Failed to update.')
    } finally { setCS(false) }
  }

  const handleDeleteContact = async () => {
    try {
      await contactService.remove(deleteTarget.id)
      load()
    } catch { alert('Failed to delete.') }
  }

  if (loading) return <PageWrapper><Spinner /></PageWrapper>

  return (
    <PageWrapper>

      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/companies')}
          className="w-8 h-8 flex items-center justify-center rounded-lg
            border border-gray-200 hover:bg-gray-100 text-gray-500 transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        {/* Company avatar + name */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-indigo-100
          flex items-center justify-center text-indigo-700 text-xl font-bold
          flex-shrink-0">
          {company.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            {company.industry && (
              <span className="flex items-center gap-1">🏢 {company.industry}</span>
            )}
            {company.industry && company.country && <span>·</span>}
            {company.country && (
              <span>{company.country}</span>
            )}
          </div>
        </div>

        {/* Edit company button */}
        {['admin', 'manager'].includes(user?.role) && (
          <button
            onClick={openEditCompany}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border
              border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium
              transition"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7
                M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </button>
        )}
      </div>

      {/* Two column layout */}
      <div className="flex gap-6">

        {/* Left — Contacts */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

            {/* Contacts header */}
            <div className="flex items-center justify-between px-6 py-4
              border-b border-gray-100">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2
                    M9 11a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
                <h2 className="font-bold text-gray-900">Contacts</h2>
              </div>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-indigo-600 text-white
                  px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700
                  transition shadow-sm"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2
                    M9 11a4 4 0 100-8 4 4 0 000 8zM23 11l-4 4-4-4M19 15V7"/>
                </svg>
                Add Contact
              </button>
            </div>

            {/* Contact list */}
            {(!company.contacts || company.contacts.length === 0) ? (
              <div className="py-16 text-center text-gray-400 text-sm">
                No contacts yet. Add your first contact.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {company.contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between
                    px-6 py-4 hover:bg-gray-50 transition">

                    {/* Avatar + name + role */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100
                        flex items-center justify-center text-indigo-700
                        font-bold text-sm flex-shrink-0">
                        {c.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {c.full_name}
                        </p>
                        <p className="text-xs text-gray-400">{c.role || '—'}</p>
                      </div>
                    </div>

                    {/* Email + phone + actions */}
                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex items-center gap-4
                        text-sm text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <svg width="13" height="13" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6"/>
                          </svg>
                          {c.email}
                        </span>
                        {c.phone && (
                          <span className="flex items-center gap-1.5">
                            <svg width="13" height="13" viewBox="0 0 24 24"
                              fill="none" stroke="currentColor" strokeWidth="2"
                              strokeLinecap="round">
                              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.02 1.18 2 2 0 012 .02h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
                            </svg>
                            {c.phone}
                          </span>
                        )}
                      </div>

                      {/* Edit / Delete */}
                      <div className="flex items-center gap-3">
                        {['admin', 'manager'].includes(user?.role) && (
                          <button
                            onClick={() => openEdit(c)}
                            className="text-sm text-indigo-600 hover:underline font-medium"
                          >
                            Edit
                          </button>
                        )}
                        {user?.role === 'admin' && (
                          <button
                            onClick={() => setDT(c)}
                            className="text-sm text-red-500 hover:underline font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — Company details sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4">

          {/* Company details card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase
              tracking-wider mb-4">
              Company Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                  Created At
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  {formatDate(company.created_at)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                  Organization ID
                </p>
                <p className="text-sm text-gray-900 font-medium">
                  org-{company.organization}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
                  Status
                </p>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1
                  rounded-full font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Need Help card */}
          <div className="bg-indigo-600 rounded-xl p-5 text-white">
            <h3 className="font-bold text-base mb-1">Need Help?</h3>
            <p className="text-indigo-200 text-xs mb-4 leading-relaxed">
              Contact our support team if you have any issues managing this company.
            </p>
            <button className="w-full bg-white text-indigo-600 py-2 rounded-lg
              text-sm font-semibold hover:bg-indigo-50 transition">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editContact ? 'Edit Contact' : 'Add Contact'}
      >
        <form onSubmit={handleSaveContact} className="space-y-4">
          <Alert type="error" message={formError} />
          <Input label="Full Name" name="full_name" value={form.full_name}
            onChange={onChange} placeholder="Jane Doe" required />
          <Input label="Email" name="email" type="email" value={form.email}
            onChange={onChange} placeholder="jane@example.com" required />
          <Input label="Phone" name="phone" value={form.phone}
            onChange={onChange} placeholder="Optional — 8 to 15 digits" />
          <Input label="Role" name="role" value={form.role}
            onChange={onChange} placeholder="e.g. CTO" />
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300
                text-gray-700 hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600
                text-white hover:bg-indigo-700 font-medium disabled:opacity-50">
              {saving ? 'Saving...' : editContact ? 'Update' : 'Add Contact'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        isOpen={editCompanyOpen}
        onClose={() => setECO(false)}
        title="Edit Company"
      >
        <form onSubmit={handleSaveCompany} className="space-y-4">
          <Alert type="error" message={companyError} />
          <Input label="Company Name" name="name"
            value={companyForm.name || ''}
            onChange={(e) => setCF((p) => ({ ...p, name: e.target.value }))}
            required />
          <Input label="Industry" name="industry"
            value={companyForm.industry || ''}
            onChange={(e) => setCF((p) => ({ ...p, industry: e.target.value }))} />
          <Input label="Country" name="country"
            value={companyForm.country || ''}
            onChange={(e) => setCF((p) => ({ ...p, country: e.target.value }))} />
          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setECO(false)}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300
                text-gray-700 hover:bg-gray-50 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={companySaving}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600
                text-white hover:bg-indigo-700 font-medium disabled:opacity-50">
              {companySaving ? 'Saving...' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Contact confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDT(null)}
        onConfirm={handleDeleteContact}
        title="Delete Contact"
        message={`Delete "${deleteTarget?.full_name}"? This cannot be undone.`}
      />
    </PageWrapper>
  )
}

export default CompanyDetail