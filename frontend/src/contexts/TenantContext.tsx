/**
 * Tenant Context
 * Manages multi-tenant state throughout the app
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Tenant } from '@/types'
import {
  getStoredTenantId,
  setStoredTenantId,
  removeStoredTenantId,
  getDefaultTenantId,
} from '@utils/storage'
import { apiGet } from '@services/api'

// Response from the public tenant validation endpoint
interface TenantExistsResponse {
  exists: boolean
  name: string | null
}

interface TenantContextType {
  tenant: Tenant | null
  tenantId: string | null
  tenantName: string | null
  tenantError: string | null
  isLoading: boolean
  setTenantId: (tenantId: string) => void
  clearTenant: () => void
  refreshTenant: () => Promise<void>
  resetToDefaultTenant: () => void
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [tenantName, setTenantName] = useState<string | null>(null)
  const [tenantId, setTenantIdState] = useState<string | null>(() =>
    getStoredTenantId()
  )
  const [tenantError, setTenantError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start as loading to validate on mount

  // Reset to default tenant
  const resetToDefaultTenant = useCallback(() => {
    const defaultId = getDefaultTenantId()
    removeStoredTenantId() // Clear invalid stored value
    setStoredTenantId(defaultId) // Set to default
    setTenantIdState(defaultId)
    setTenantError(null)
  }, [])

  // Validate tenant on startup using public endpoint (no auth required)
  useEffect(() => {
    const validateTenant = async () => {
      if (!tenantId) {
        setTenant(null)
        setTenantName(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setTenantError(null)
      try {
        // Use public endpoint that doesn't require authentication
        const response = await apiGet<TenantExistsResponse>(
          `/tenants/${tenantId}/exists`
        )

        if (response.exists) {
          setTenantName(response.name)
          setTenantError(null)
        } else {
          // Tenant doesn't exist - reset to default
          const storedId = tenantId
          const defaultId = getDefaultTenantId()

          if (storedId !== defaultId) {
            setTenantError(
              `Tenant '${storedId.substring(0, 8)}...' not found. Resetting to default tenant.`
            )
            setTimeout(() => {
              resetToDefaultTenant()
            }, 3000)
          } else {
            setTenantError(
              'Default tenant not found. Please contact support.'
            )
          }
          setTenantName(null)
        }
      } catch (error) {
        // Network error or API issue
        const errorMessage =
          error instanceof Error ? error.message : 'Connection error'
        setTenantError(
          `Unable to validate tenant. Please check your connection. (${errorMessage})`
        )
        setTenantName(null)
      } finally {
        setIsLoading(false)
      }
    }

    validateTenant()
  }, [tenantId, resetToDefaultTenant])

  const setTenantIdCallback = useCallback((newTenantId: string) => {
    setTenantIdState(newTenantId)
    setStoredTenantId(newTenantId)
  }, [])

  const clearTenant = useCallback(() => {
    setTenant(null)
    setTenantIdState(null)
    // Don't clear from storage - tenant selection persists
  }, [])

  const refreshTenant = useCallback(async () => {
    if (!tenantId) return

    setIsLoading(true)
    try {
      const tenantData = await apiGet<Tenant>(`/tenants/${tenantId}`)
      setTenant(tenantData)
    } catch {
      // Silently fail refresh
    } finally {
      setIsLoading(false)
    }
  }, [tenantId])

  const value: TenantContextType = {
    tenant,
    tenantId,
    tenantName,
    tenantError,
    isLoading,
    setTenantId: setTenantIdCallback,
    clearTenant,
    refreshTenant,
    resetToDefaultTenant,
  }

  return (
    <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
  )
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
