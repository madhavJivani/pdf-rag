import { useEffect } from 'react'
import useAuthStore from '../store/authStore'
import { useGetUser } from '../hooks/useAuth'

const UserDataFetcher = () => {
  const { authToken, user, setUser, unSetUser } = useAuthStore()
  
  console.log('🚀 UserDataFetcher RENDERED!')
  console.log('UserDataFetcher - authToken:', authToken)
  console.log('UserDataFetcher - user:', user)
  
  const { 
    data: userData, 
    isLoading, 
    error,
    isSuccess 
  } = useGetUser(authToken)

  console.log('UserDataFetcher - userData:', userData)
  console.log('UserDataFetcher - isLoading:', isLoading)
  console.log('UserDataFetcher - error:', error)
  console.log('UserDataFetcher - isSuccess:', isSuccess)

  useEffect(() => {
    if (isSuccess && userData?.success && userData?.data?.user) {
      console.log('Fetched user data:', userData.data.user)
      // Update the store with the fetched user data
      setUser(userData.data.user, authToken)
    }
    
    if (error) {
      console.error('Failed to fetch user data:', error)
      // If we can't fetch user data, clear the auth state
      unSetUser()
    }
  }, [isSuccess, userData, error, authToken, setUser, unSetUser])

  // This component doesn't render anything
  return null
}

export default UserDataFetcher
