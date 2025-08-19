import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './components/Login'
import Register from './components/Register'
import Home from './components/Home'
import ProtectedRoute from './components/ProtectedRoute'
import useAuthStore from './store/authStore'
import { useHealthCheck } from './hooks/useHealthCheck'

const App = () => {
  const { isAuthenticated } = useAuthStore()
  const { data: healthData, isLoading, error } = useHealthCheck()

  // Console log the health check results
  React.useEffect(() => {
    if (healthData) {
      console.log('Health check result:', healthData)
    }
    if (error) {
      console.error('Health check error:', error)
    }
  }, [healthData, error])

  return (
    <Layout>
      <Routes>
        {/* Redirect root to appropriate page */}
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
          } 
        />
        
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Login />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Register />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/home" 
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
          } 
        />
      </Routes>
    </Layout>
  )
}

export default App