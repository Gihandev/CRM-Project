import { loginApi, registerApi, getProfileApi, addUserApi, getUsersApi } from '../api/authApi'

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

  async addUser(data) {
    const res = await addUserApi(data)
    return res.data
  },

  async getUsers() {
    const res = await getUsersApi()
    return res.data
  },
}