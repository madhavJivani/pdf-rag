import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      // State
      isAuthenticated: false,
      user: undefined,
      authToken: undefined,

      // Actions
      setUser: (userData, token) => set(() => ({
        isAuthenticated: !!userData && !!token, // Only authenticated if we have both user and token
        user: userData,
        authToken: token
      })),

      setAuthToken: (token) => set((state) => ({
        authToken: token,
        // Keep existing user and isAuthenticated state
      })),

      unSetUser: () => set(() => ({
        isAuthenticated: false,
        user: undefined,
        authToken: undefined
      }))
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated, 
        user: state.user,
        authToken: state.authToken
      })
    }
  )
)

export default useAuthStore
