import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { httpClient } from '../lib/httpClient'

interface TokenPayload {
  userId: number
  username: string
  isAdmin: boolean
}

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  token: string
  user: TokenPayload
}

interface AuthContextValue {
  currentUser: TokenPayload | null
  token: string | null
  isInitialized: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]!)) as {
      userId: number
      username: string
      isAdmin: boolean
      exp: number
    }
    if (payload.exp * 1000 < Date.now()) return null
    return { userId: payload.userId, username: payload.username, isAdmin: payload.isAdmin }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<TokenPayload | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) {
      const payload = decodeToken(stored)
      if (payload) {
        setToken(stored)
        setCurrentUser(payload)
      } else {
        localStorage.removeItem('token')
      }
    }
    setIsInitialized(true)
  }, [])

  const login = async (credentials: LoginRequest): Promise<void> => {
    const data = await httpClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setCurrentUser(data.user)
  }

  const logout = (): void => {
    localStorage.removeItem('token')
    setToken(null)
    setCurrentUser(null)
    navigate('/login', { replace: true })
  }

  return (
    <AuthContext.Provider value={{ currentUser, token, isInitialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
