import {
  getContactsApi,
  createContactApi,
  updateContactApi,
  deleteContactApi,
} from '../api/contactsApi'

export const contactService = {

  async getAll(params) {
    const res = await getContactsApi(params)
    return res.data
  },

  async create(data) {
    const res = await createContactApi(data)
    return res.data
  },

  async update(id, data) {
    const res = await updateContactApi(id, data)
    return res.data
  },

  async remove(id) {
    const res = await deleteContactApi(id)
    return res.data
  },
}

