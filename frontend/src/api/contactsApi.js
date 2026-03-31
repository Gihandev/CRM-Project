import client from './client'

export const getContactsApi   = (params)   => client.get('/contacts/', { params })
export const createContactApi = (data)     => client.post('/contacts/', data)
export const updateContactApi = (id, data) => client.put(`/contacts/${id}/`, data)
export const deleteContactApi = (id)       => client.delete(`/contacts/${id}/`)