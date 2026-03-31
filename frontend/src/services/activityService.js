import { getActivityApi } from '../api/activityApi'

export const activityService = {

  async getAll(params) {
    const res = await getActivityApi(params)
    return res.data
  },
}