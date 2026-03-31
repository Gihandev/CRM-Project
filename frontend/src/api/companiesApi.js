import client from './client'

export const getCompaniesApi  = (params)      => client.get('/companies/', { params })
export const getCompanyApi    = (id)          => client.get(`/companies/${id}/`)
export const createCompanyApi = (data)        => client.post('/companies/', data)
export const updateCompanyApi = (id, data)    => client.put(`/companies/${id}/`, data)
export const deleteCompanyApi = (id)          => client.delete(`/companies/${id}/`)