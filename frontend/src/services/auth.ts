/**
 * Authentication Service
 * Handles login, registration, and user management
 */

import { apiPost, apiGet } from './api'
import type {
  User,
  UserWithToken,
  LoginRequest,
  RegisterRequest,
} from '@/types'

/**
 * Token response from refresh endpoint
 */
interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

/**
 * Message response from auth endpoints
 */
interface MessageResponse {
  message: string
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<UserWithToken> {
  return apiPost<UserWithToken>('/users/login', credentials)
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<UserWithToken> {
  return apiPost<UserWithToken>('/users/register', data)
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  return apiGet<User>('/users/me')
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(refreshToken: string): Promise<TokenResponse> {
  return apiPost<TokenResponse>('/auth/refresh', { refresh_token: refreshToken })
}

/**
 * Logout current user (revokes all refresh tokens)
 */
export async function logout(): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/logout')
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/forgot-password', { email })
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/reset-password', {
    token,
    new_password: newPassword,
  })
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<MessageResponse> {
  return apiPost<MessageResponse>('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
}

/**
 * Check if a token is still valid by fetching the current user
 */
export async function validateToken(): Promise<boolean> {
  try {
    await getCurrentUser()
    return true
  } catch {
    return false
  }
}
