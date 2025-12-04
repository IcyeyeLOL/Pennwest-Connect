'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import Cookies from 'js-cookie'

interface User {
  email: string
  username: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      fetchUser(token)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      } else {
        // Token invalid, clear it
        Cookies.remove('token')
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      Cookies.remove('token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}


