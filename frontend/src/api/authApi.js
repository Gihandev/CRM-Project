import client from './client'


//Auth
export const loginApi      = (data) => client.post('/auth/login/', data)
export const registerApi   = (data) => client.post('/auth/register/', data)
export const getProfileApi = ()     => client.get('/auth/profile/')

//Users
export const getUsersApi    = ()        => client.get('/auth/users/')
export const addUserApi     = (data)    => client.post('/auth/users/', data)
export const updateUserApi  = (id, data)=> client.put(`/auth/users/${id}/`, data)
export const deleteUserApi  = (id)      => client.delete(`/auth/users/${id}/`)

//Organizations
export const getOrgsApi     = ()        => client.get('/auth/organizations/')
export const createOrgApi   = (data)    => client.post('/auth/organizations/', data)
export const updateOrgApi   = (id, data)=> client.put(`/auth/organizations/${id}/`, data)
export const deleteOrgApi   = (id)      => client.delete(`/auth/organizations/${id}/`)