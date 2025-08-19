import axios from 'axios'
import { SERVER_URL } from './constant.js'

// Register service
export const registerUser = async (userName, password) => {
  try {
    const response = await axios.post(`${SERVER_URL}/api/auth/register`, {
      userName,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    return {
      success: true,
      data: response.data,
      status: response.status
    }
  } catch (error) {
    console.error('Registration failed:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || null
    }
  }
}

// Login service
export const loginUser = async (userName, password) => {
  try {
    const response = await axios.post(`${SERVER_URL}/api/auth/login`, {
      userName,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    return {
      success: true,
      data: response.data,
      status: response.status
    }
  } catch (error) {
    console.error('Login failed:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || null
    }
  }
}

// Get user service
export const getUser = async (authToken) => {
  try {
    // Using POST even though server route is GET, because server expects body data
    const response = await axios.post(`${SERVER_URL}/api/auth/`, {
      authToken
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    console.log('Get user response:', response.data)
    return {
      success: true,
      data: response.data,
      status: response.status
    }
  } catch (error) {
    console.error('Get user failed:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || null
    }
  }
}

// Logout service
export const logoutUser = async (authToken) => {
  try {
    const response = await axios.post(`${SERVER_URL}/api/auth/logout`, {
      authToken
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    return {
      success: true,
      data: response.data,
      status: response.status
    }
  } catch (error) {
    console.error('Logout failed:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status || null
    }
  }
}
