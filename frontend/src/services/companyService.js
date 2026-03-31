import {
  getCompaniesApi,
  getCompanyApi,
  createCompanyApi,
  updateCompanyApi,
  deleteCompanyApi,
} from '../api/companiesApi'

export const companyService = {

  async getAll(params) {
    const res = await getCompaniesApi(params)
    return res.data   // { count, page, results }
  },

  async getOne(id) {
    const res = await getCompanyApi(id)
    return res.data   // company with contacts inside
  },

  async create(data) {
    const res = await createCompanyApi(data)
    return res.data
  },

  async update(id, data) {
    const res = await updateCompanyApi(id, data)
    return res.data
  },

  async remove(id) {
    const res = await deleteCompanyApi(id)
    return res.data
  },
}