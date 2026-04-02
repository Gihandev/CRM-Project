import {
  getCompaniesApi,
  getCompanyApi,
  createCompanyApi,
  updateCompanyApi,
  deleteCompanyApi,
} from '../api/companiesApi'

export const companyService = {
  async getAll(params) { return (await getCompaniesApi(params)).data },
  async getOne(id)     { return (await getCompanyApi(id)).data },
  async create(data)   { return (await createCompanyApi(data)).data },
  async update(id, data){ return (await updateCompanyApi(id, data)).data },
  async remove(id)     { return (await deleteCompanyApi(id)).data },
}