import { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'))
  const [loading, setLoading] = useState(true)

  async function fetchUser() {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await client.get('/user')
      setUser(res.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [token])

  async function login(email, password) {
    const res = await client.post('/login', { email, password })
    localStorage.setItem('auth_token', res.data.token)
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function register(name, email, password, password_confirmation) {
    const res = await client.post('/register', { name, email, password, password_confirmation })
    localStorage.setItem('auth_token', res.data.token)
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function logout() {
    await client.post('/logout')
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
