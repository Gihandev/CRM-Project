import client from './client'

export const getActivityApi = (params) => client.get('/activity/', { params })