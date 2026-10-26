// In development: Vite proxy forwards /api → localhost:5000 (no env var needed)
// In production:  Set VITE_API_URL=https://your-backend.onrender.com/api in Vercel dashboard
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Required for HTTP-only cookie auth
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const cleanBase = API_BASE_URL.replace(/\/+$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${cleanBase}${cleanEndpoint}`

  try {
    const response = await fetch(url, options)

    let data
    try {
      data = await response.json()
    } catch {
      data = {}
    }

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`)
    }

    return data
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        `Unable to connect to the backend. ` +
        `In production, verify VITE_API_URL is set in your Vercel environment variables. ` +
        `In development, ensure the backend is running on localhost:5000.`
      )
    }
    throw error
  }
}
