import { useQuery } from '@tanstack/react-query'
import { checkServerHealth } from '../service/healthCheck'

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health-check'],
    queryFn: checkServerHealth,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    onSuccess: (data) => {
      console.log('Health check result:', data)
    },
    onError: (error) => {
      console.error('Health check failed:', error)
    }
  })
}
