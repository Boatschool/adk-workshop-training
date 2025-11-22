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
