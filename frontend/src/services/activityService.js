import { getActivityApi } from '../api/activityApi'

export const activityService = {
  async getAll(params) { return (await getActivityApi(params)).data },
}