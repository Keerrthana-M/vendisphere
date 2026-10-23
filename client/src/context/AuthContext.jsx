import { createContext, useContext, useState, useEffect } from 'react'
import { apiRequest } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)

  const refreshCartCount = async () => {
    try {
      const data = await apiRequest('/cart')
      const totalItems = data?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
      setCartCount(totalItems)
    } catch {
      setCartCount(0)
    }
  }

  const checkAuth = async () => {
    try {
      const data = await apiRequest('/auth/me')
      setUser(data.user)
      if (data.user?.role === 'customer') {
        refreshCartCount()
      }
    } catch (error) {
      setUser(null)
      setCartCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const data = await apiRequest('/auth/login', 'POST', { email, password })
      setUser(data.user)
      if (data.user?.role === 'customer') {
        refreshCartCount()
      }
      return data.user
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData) => {
    setLoading(true)
    try {
      const data = await apiRequest('/auth/register', 'POST', formData)
      setUser(data.user)
      return data.user
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', 'POST')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setCartCount(0)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        cartCount,
        refreshCartCount,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
