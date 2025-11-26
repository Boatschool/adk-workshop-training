/**
 * LoginPage Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '@pages/auth/LoginPage'
import { AuthProvider } from '@contexts/AuthContext'

// Mock the auth service
vi.mock('@services/auth', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
  refreshToken: vi.fn(),
  logout: vi.fn(),
}))

// Mock storage utilities
vi.mock('@utils/storage', () => ({
  getStoredToken: vi.fn(() => null),
  setStoredToken: vi.fn(),
  getStoredRefreshToken: vi.fn(() => null),
  setStoredRefreshToken: vi.fn(),
  clearAuthStorage: vi.fn(),
}))

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

function renderLoginPage() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the login page with header', () => {
      renderLoginPage()
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    })

    it('renders email input field', () => {
      renderLoginPage()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    })

    it('renders password input field', () => {
      renderLoginPage()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('renders sign in button', () => {
      renderLoginPage()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('renders remember me checkbox', () => {
      renderLoginPage()
      expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument()
    })

    it('renders forgot password link', () => {
      renderLoginPage()
      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
    })

    it('renders create account link', () => {
      renderLoginPage()
      expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('requires email field', () => {
      renderLoginPage()
      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('required')
    })

    it('requires password field', () => {
      renderLoginPage()
      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('required')
    })

    it('email input has email type for validation', () => {
      renderLoginPage()
      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility when clicking the eye icon', async () => {
      renderLoginPage()
      const passwordInput = screen.getByLabelText(/password/i)

      // Password should be hidden by default
      expect(passwordInput).toHaveAttribute('type', 'password')

      // Find and click the toggle button
      const toggleButton = passwordInput.parentElement?.querySelector('button')
      expect(toggleButton).toBeInTheDocument()

      if (toggleButton) {
        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')

        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'password')
      }
    })
  })

  describe('Form Interactions', () => {
    it('updates email input value', async () => {
      renderLoginPage()
      const emailInput = screen.getByLabelText(/email address/i)

      await userEvent.type(emailInput, 'test@example.com')
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('updates password input value', async () => {
      renderLoginPage()
      const passwordInput = screen.getByLabelText(/password/i)

      await userEvent.type(passwordInput, 'password123')
      expect(passwordInput).toHaveValue('password123')
    })

    it('toggles remember me checkbox', async () => {
      renderLoginPage()
      const checkbox = screen.getByLabelText(/remember me/i)

      expect(checkbox).not.toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()

      fireEvent.click(checkbox)
      expect(checkbox).not.toBeChecked()
    })
  })

  describe('Navigation Links', () => {
    it('forgot password link has correct href', () => {
      renderLoginPage()
      const forgotLink = screen.getByRole('link', { name: /forgot password/i })
      expect(forgotLink).toHaveAttribute('href', '/forgot-password')
    })

    it('create account link has correct href', () => {
      renderLoginPage()
      const registerLink = screen.getByRole('link', { name: /create an account/i })
      expect(registerLink).toHaveAttribute('href', '/register')
    })
  })

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      renderLoginPage()

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
    })

    it('email input has correct autocomplete attribute', () => {
      renderLoginPage()
      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('autocomplete', 'email')
    })

    it('password input has correct autocomplete attribute', () => {
      renderLoginPage()
      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password')
    })
  })
})
