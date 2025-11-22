/**
 * API Client for ADK Platform
 * Handles all HTTP requests with JWT authentication and tenant headers
 */

import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'
import {
  getStoredToken,
  getStoredTenantId,
  removeStoredToken,
} from '@utils/storage'
import type { ApiError } from '@/types'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token and tenant ID
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add JWT token
    const token = getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add tenant ID header
    const tenantId = getStoredTenantId()
    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized - clear token and redirect
    if (error.response?.status === 401) {
      removeStoredToken()
      // Dispatch event for auth context to handle
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    // Transform error for consistent handling
    const apiError: ApiError = error.response?.data ?? {
      type: 'about:blank',
      title: 'Network Error',
      status: error.response?.status ?? 0,
      detail: error.message || 'An unexpected error occurred',
    }

    return Promise.reject(apiError)
  }
)

// Export the configured instance
export { api }

// Convenience methods
export const apiGet = <T>(url: string, params?: Record<string, unknown>) =>
  api.get<T>(url, { params }).then((res) => res.data)

export const apiPost = <T>(url: string, data?: unknown) =>
  api.post<T>(url, data).then((res) => res.data)

export const apiPatch = <T>(url: string, data?: unknown) =>
  api.patch<T>(url, data).then((res) => res.data)

export const apiPut = <T>(url: string, data?: unknown) =>
  api.put<T>(url, data).then((res) => res.data)

export const apiDelete = <T>(url: string) =>
  api.delete<T>(url).then((res) => res.data)
