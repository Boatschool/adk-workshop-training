/**
 * LocalStorage utilities with type safety
 */

const TOKEN_KEY = 'adk_access_token'
const REFRESH_TOKEN_KEY = 'adk_refresh_token'
const TENANT_KEY = 'adk_tenant_id'
const THEME_KEY = 'adk_theme'

/**
 * Get the stored access token
 */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Store the access token
 */
export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Remove the stored access token
 */
export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Get the stored refresh token
 */
export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * Store the refresh token
 */
export function setStoredRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/**
 * Remove the stored refresh token
 */
export function removeStoredRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * Get the stored tenant ID
 */
export function getStoredTenantId(): string | null {
  return localStorage.getItem(TENANT_KEY)
}

/**
 * Store the tenant ID
 */
export function setStoredTenantId(tenantId: string): void {
  localStorage.setItem(TENANT_KEY, tenantId)
}

/**
 * Remove the stored tenant ID
 */
export function removeStoredTenantId(): void {
  localStorage.removeItem(TENANT_KEY)
}

/**
 * Get the stored theme
 */
export function getStoredTheme(): 'light' | 'dark' | null {
  const theme = localStorage.getItem(THEME_KEY)
  if (theme === 'light' || theme === 'dark') return theme
  return null
}

/**
 * Store the theme preference
 */
export function setStoredTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(THEME_KEY, theme)
}

/**
 * Clear all stored auth data
 */
export function clearAuthStorage(): void {
  removeStoredToken()
  removeStoredRefreshToken()
  removeStoredTenantId()
}
