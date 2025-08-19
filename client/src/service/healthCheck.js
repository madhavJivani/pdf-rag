import axios from 'axios'
import { SERVER_URL } from './constant.js'

export const checkServerHealth = async () => {
  try {
    const response = await axios.get(`${SERVER_URL}/health-check`, {
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
    console.error('Health check failed:', error)
    return {
      success: false,
      error: error.message,
      status: error.response?.status || null
    }
  }
}
