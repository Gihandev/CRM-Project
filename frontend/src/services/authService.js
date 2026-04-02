import {
  loginApi, registerApi, getProfileApi,
  getUsersApi, addUserApi, updateUserApi, deleteUserApi,
  getOrgsApi, createOrgApi, updateOrgApi, deleteOrgApi,
} from '../api/authApi'

export const authService = {

  async login(username, password) {
    const res = await loginApi({ username, password })
    return res.data   // { tokens, user }
  },

  async register(formData) {
    const res = await registerApi(formData)
    return res.data   // { tokens, user }
  },

  async getProfile() {
    const res = await getProfileApi()
    return res.data   // user object
  },



  //Users

  async addUser(data) {
    const res = await addUserApi(data)
    return res.data
  },

  async getUsers() {
    const res = await getUsersApi()
    return res.data
  },

  async updateUser(id, data) {
    const res = await updateUserApi(id, data)
    return res.data
  },

  async deleteUser(id) {
    const res = await deleteUserApi(id)
    return res.data
  },


  //Organizations

  async getOrgs() {
    const res = await getOrgsApi()
    return res.data
  },

  async createOrg(data) {
    const res = await createOrgApi(data)
    return res.data
  },

  async updateOrg(id, data) {
    const res = await updateOrgApi(id, data)
    return res.data
  },
  
  async deleteOrg(id) {
    const res = await deleteOrgApi(id)
    return res.data
  },
}