import { useMutation, useQuery } from '@tanstack/react-query'
import { registerUser, loginUser, logoutUser, getUser } from '../service/authService'
import useAuthStore from '../store/authStore'

// Register hook
export const useRegister = () => {
  return useMutation({
    mutationFn: ({ userName, password }) => registerUser(userName, password),
    onSuccess: (data) => {
      console.log('Registration successful:', data)
    },
    onError: (error) => {
      console.error('Registration error:', error)
    }
  })
}

// Get user hook
export const useGetUser = (authToken) => {
  console.log('useGetUser called with authToken:', authToken)
  return useQuery({
    queryKey: ['user', authToken],
    queryFn: () => {
      console.log('useGetUser queryFn executing with token:', authToken)
      return getUser(authToken)
    },
    enabled: !!authToken, // Only run if authToken exists
    onSuccess: (data) => {
      console.log('Get user successful:', data)
    },
    onError: (error) => {
      console.error('Get user error:', error)
    }
  })
}

// Login hook
export const useLogin = () => {
  const { setUser } = useAuthStore()
  
  console.log('useLogin - setUser function:', setUser)
  
  return useMutation({
    mutationFn: ({ userName, password }) => loginUser(userName, password),
    onSuccess: async (data) => {
      console.log('Login successful:', data)
      console.log('Login response structure:', JSON.stringify(data, null, 2))
      if (data.success && data.data) {
        // Extract authToken from login response
        const { authToken } = data.data
        console.log('Extracted authToken:', authToken)
        
        console.log('🚀 Now fetching user data...')
        // Immediately fetch user data after successful login
        const userResponse = await getUser(authToken)
        console.log('🚀 User data response:', userResponse)
        
        if (userResponse.success && userResponse.data) {
          // Set both user data and token
          setUser(userResponse.data.user, authToken)
          console.log('🚀 User data set successfully!')
        } else {
          console.error('Failed to fetch user data:', userResponse.error)
        }
      }
    },
    onError: (error) => {
      console.error('Login error:', error)
    }
  })
}

// Logout hook
export const useLogout = () => {
  const { unSetUser, authToken } = useAuthStore()
  
  return useMutation({
    mutationFn: () => logoutUser(authToken),
    onSuccess: (data) => {
      console.log('Logout successful:', data)
      unSetUser()
    },
    onError: (error) => {
      console.error('Logout error:', error)
      // Even if logout fails on server, clear local auth state
      unSetUser()
    }
  })
}
