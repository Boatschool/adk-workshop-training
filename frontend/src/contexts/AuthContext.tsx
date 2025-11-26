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
  useRef,
  type ReactNode,
} from 'react'
import type { User, UserWithToken, LoginRequest, RegisterRequest } from '@/types'
import {
  getStoredToken,
  setStoredToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
  clearAuthStorage,
} from '@utils/storage'
import * as authService from '@services/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

// Token refresh interval (refresh 5 minutes before expiry)
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000 // 5 minutes in ms

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Schedule token refresh before expiry
  const scheduleTokenRefresh = useCallback((expiresIn: number) => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }

    // Calculate when to refresh (5 minutes before expiry)
    const refreshIn = Math.max(0, expiresIn * 1000 - TOKEN_REFRESH_BUFFER)

    refreshTimerRef.current = setTimeout(async () => {
      const refreshToken = getStoredRefreshToken()
      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken)
          setStoredToken(response.access_token)
          setStoredRefreshToken(response.refresh_token)
          // Schedule next refresh
          scheduleTokenRefresh(response.expires_in)
        } catch {
          // Refresh failed, user needs to re-authenticate
          setUser(null)
          clearAuthStorage()
        }
      }
    }, refreshIn)
  }, [])

  // Initialize auth state from stored token
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken()
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          // Schedule refresh - assume 1 hour expiry if we don't know exact time
          scheduleTokenRefresh(60 * 60)
        } catch {
          // Token is invalid, try to refresh
          const refreshToken = getStoredRefreshToken()
          if (refreshToken) {
            try {
              const response = await authService.refreshToken(refreshToken)
              setStoredToken(response.access_token)
              setStoredRefreshToken(response.refresh_token)
              const currentUser = await authService.getCurrentUser()
              setUser(currentUser)
              scheduleTokenRefresh(response.expires_in)
            } catch {
              // Refresh also failed, clear everything
              clearAuthStorage()
            }
          } else {
            clearAuthStorage()
          }
        }
      }
      setIsLoading(false)
    }

    initAuth()

    // Cleanup timer on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [scheduleTokenRefresh])

  // Listen for unauthorized events (401 responses)
  useEffect(() => {
    const handleUnauthorized = async () => {
      // Try to refresh token before giving up
      const refreshToken = getStoredRefreshToken()
      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken)
          setStoredToken(response.access_token)
          setStoredRefreshToken(response.refresh_token)
          scheduleTokenRefresh(response.expires_in)
          // Retry the original request - user should retry their action
          return
        } catch {
          // Refresh failed
        }
      }
      setUser(null)
      clearAuthStorage()
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [scheduleTokenRefresh])

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true)
    try {
      const response: UserWithToken = await authService.login(credentials)
      setStoredToken(response.access_token)
      setStoredRefreshToken(response.refresh_token)
      setUser(response)
      scheduleTokenRefresh(response.expires_in)
    } finally {
      setIsLoading(false)
    }
  }, [scheduleTokenRefresh])

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true)
    try {
      const response: UserWithToken = await authService.register(data)
      setStoredToken(response.access_token)
      setStoredRefreshToken(response.refresh_token)
      setUser(response)
      scheduleTokenRefresh(response.expires_in)
    } finally {
      setIsLoading(false)
    }
  }, [scheduleTokenRefresh])

  const logout = useCallback(async () => {
    // Clear refresh timer
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
    }

    // Try to call logout endpoint to revoke tokens
    try {
      await authService.logout()
    } catch {
      // Ignore errors - we're logging out anyway
    }

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
      // Try refresh token
      const refreshToken = getStoredRefreshToken()
      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken)
          setStoredToken(response.access_token)
          setStoredRefreshToken(response.refresh_token)
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          scheduleTokenRefresh(response.expires_in)
        } catch {
          setUser(null)
          clearAuthStorage()
        }
      } else {
        setUser(null)
        clearAuthStorage()
      }
    }
  }, [scheduleTokenRefresh])

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
