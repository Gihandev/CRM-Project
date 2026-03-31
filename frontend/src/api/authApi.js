import client from './client'

export const loginApi      = (data) => client.post('/auth/login/', data)
export const registerApi   = (data) => client.post('/auth/register/', data)
export const getProfileApi = ()     => client.get('/auth/profile/')
export const addUserApi    = (data) => client.post('/auth/users/add/', data)
export const getUsersApi   = ()     => client.get('/auth/users/')