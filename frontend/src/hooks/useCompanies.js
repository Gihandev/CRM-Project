import { useState, useEffect } from 'react'
import { companyService } from '../services/companyService'

export const useCompanies = (params) => {
  const [companies, setCompanies] = useState([])
  const [count, setCount]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  // Re-fetch whenever page or search changes
  useEffect(() => {
    fetch()
  }, [params?.page, params?.search])

  const fetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await companyService.getAll(params)
      setCompanies(data.results)
      setCount(data.count)
    } catch (err) {
      setError('Failed to load companies.')
    } finally {
      setLoading(false)
    }
  }

  // refetch is exposed so pages can call it after create/delete
  return { companies, count, loading, error, refetch: fetch }
}