import {
  getContactsApi,
  createContactApi,
  updateContactApi,
  deleteContactApi,
} from '../api/contactsApi'

export const contactService = {
  async getAll(params)   { return (await getContactsApi(params)).data },
  async create(data)     { return (await createContactApi(data)).data },
  async update(id, data) { return (await updateContactApi(id, data)).data },
  async remove(id)       { return (await deleteContactApi(id)).data },
}