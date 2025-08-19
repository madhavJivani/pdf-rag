import React from 'react'
import { useLogout } from '../hooks/useAuth'
import useAuthStore from '../store/authStore'

const NavBar = () => {
  const logoutMutation = useLogout()
  const { user } = useAuthStore()
  console.log('NavBar user:', user)

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">PDF RAG</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">
              {user?.userName 
                ? user.userName.length > 12 
                  ? `${user.userName.substring(0, 12)}...` 
                  : user.userName
                : 'User'
              }
            </span>
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
