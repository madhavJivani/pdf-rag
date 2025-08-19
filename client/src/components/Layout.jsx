import React from 'react'
import { useLocation } from 'react-router-dom'
import NavBar from './NavBar'
import PublicNavBar from './PublicNavBar'
import useAuthStore from '../store/authStore'

const Layout = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()
  
  // Define routes that should show the public navbar
  const publicRoutes = ['/login', '/register']
  const isPublicRoute = publicRoutes.includes(location.pathname)
  
  // Show appropriate navbar based on authentication and route
  const showPublicNavBar = isPublicRoute || !isAuthenticated
  
  return (
    <div className="min-h-screen bg-gray-50">
      {showPublicNavBar ? <PublicNavBar /> : <NavBar />}
      {children}
    </div>
  )
}

export default Layout
