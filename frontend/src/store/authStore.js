import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user:            null,
  token:           null,
  isAuthenticated: false,

  // Called after successful login or register
  login: (user, token) => {
    localStorage.setItem('access_token', token)
    set({ user, token, isAuthenticated: true })
  },

  // Called on logout
  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, token: null, isAuthenticated: false })
  },

  // Called on page refresh to restore session
  setUser: (user) => set({ user, isAuthenticated: true }),
}))

export default useAuthStore