const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Important for HTTP-only cookies
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const cleanBase = API_BASE_URL.replace(/\/+$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${cleanBase}${cleanEndpoint}`

  try {
    let response
    try {
      response = await fetch(url, options)
    } catch (networkErr) {
      // If relative /api proxy fails, fallback directly to localhost:5000
      if (!cleanBase.startsWith('http')) {
        response = await fetch(`http://localhost:5000/api${cleanEndpoint}`, options)
      } else {
        throw networkErr
      }
    }

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
      throw new Error('Unable to connect to the backend server. Please verify the API is running at http://localhost:5000')
    }
    throw error
  }
}
