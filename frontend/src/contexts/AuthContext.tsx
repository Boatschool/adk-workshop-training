/**
 * Authentication Context
 * Manages user authentication state throughout the app
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, UserWithToken, LoginRequest, RegisterRequest } from '@/types'
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  clearAuthStorage,
} from '@utils/storage'
import * as authService from '@services/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth state from stored token
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken()
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } catch {
          // Token is invalid, clear it
          clearAuthStorage()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  // Listen for unauthorized events (401 responses)
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      clearAuthStorage()
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response: UserWithToken = await authService.login(credentials)
      setStoredToken(response.access_token)
      setUser(response)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true)
    try {
      const response: UserWithToken = await authService.register(data)
      setStoredToken(response.access_token)
      setUser(response)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    clearAuthStorage()
  }, [])

  const refreshUser = useCallback(async () => {
    const token = getStoredToken()
    if (!token) {
      setUser(null)
      return
    }

    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
      removeStoredToken()
    }
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
