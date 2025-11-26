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
import { getStoredTenantId, setStoredTenantId } from '@utils/storage'
import { apiGet } from '@services/api'

interface TenantContextType {
  tenant: Tenant | null
  tenantId: string | null
  isLoading: boolean
  setTenantId: (tenantId: string) => void
  clearTenant: () => void
  refreshTenant: () => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [tenantId, setTenantIdState] = useState<string | null>(() =>
    getStoredTenantId()
  )
  const [isLoading, setIsLoading] = useState(false)

  // Fetch tenant details when tenantId changes
  useEffect(() => {
    const fetchTenant = async () => {
      if (!tenantId) {
        setTenant(null)
        return
      }

      setIsLoading(true)
      try {
        const tenantData = await apiGet<Tenant>(`/tenants/${tenantId}`)
        setTenant(tenantData)
      } catch {
        // If tenant fetch fails, clear it
        setTenant(null)
        setTenantIdState(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenant()
  }, [tenantId])

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
    isLoading,
    setTenantId: setTenantIdCallback,
    clearTenant,
    refreshTenant,
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
