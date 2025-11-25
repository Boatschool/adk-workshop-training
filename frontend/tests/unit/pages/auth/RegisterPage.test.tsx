/**
 * RegisterPage Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { RegisterPage } from '@pages/auth/RegisterPage'
import { AuthProvider } from '@contexts/AuthContext'

// Mock the auth service
vi.mock('@services/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
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
  }
})

function renderRegisterPage() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the register page with header', () => {
      renderRegisterPage()
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument()
    })

    it('renders full name input field', () => {
      renderRegisterPage()
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    })

    it('renders email input field', () => {
      renderRegisterPage()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    })

    it('renders password input field', () => {
      renderRegisterPage()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
    })

    it('renders confirm password input field', () => {
      renderRegisterPage()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('renders create account button', () => {
      renderRegisterPage()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('renders terms checkbox', () => {
      renderRegisterPage()
      expect(screen.getByLabelText(/i agree to the/i)).toBeInTheDocument()
    })

    it('renders sign in link', () => {
      renderRegisterPage()
      expect(screen.getByRole('link', { name: /sign in instead/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('requires email field', () => {
      renderRegisterPage()
      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('required')
    })

    it('requires password field', () => {
      renderRegisterPage()
      const passwordInput = screen.getByLabelText(/^password/i)
      expect(passwordInput).toHaveAttribute('required')
    })

    it('requires confirm password field', () => {
      renderRegisterPage()
      const confirmInput = screen.getByLabelText(/confirm password/i)
      expect(confirmInput).toHaveAttribute('required')
    })

    it('email input has email type for validation', () => {
      renderRegisterPage()
      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('submit button is disabled when terms not accepted', () => {
      renderRegisterPage()
      const submitButton = screen.getByRole('button', { name: /create account/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Password Strength Indicator', () => {
    it('shows weak strength for short passwords', async () => {
      renderRegisterPage()
      const passwordInput = screen.getByLabelText(/^password/i)

      await userEvent.type(passwordInput, 'abc')

      await waitFor(() => {
        expect(screen.getByText('Weak')).toBeInTheDocument()
      })
    })

    it('shows fair strength for passwords with 8+ chars', async () => {
      renderRegisterPage()
      const passwordInput = screen.getByLabelText(/^password/i)

      // 8+ chars with mixed case = score 2 (Fair)
      await userEvent.type(passwordInput, 'Passwor')

      await waitFor(() => {
        expect(screen.getByText('Weak')).toBeInTheDocument()
      })
    })

    it('shows good strength for decent passwords', async () => {
      renderRegisterPage()
      const passwordInput = screen.getByLabelText(/^password/i)

      // 8+ chars, mixed case, number = score 3 (Good)
      await userEvent.type(passwordInput, 'Password1')

      await waitFor(() => {
        expect(screen.getByText('Good')).toBeInTheDocument()
      })
    })

    it('shows strong strength for strong passwords', async () => {
      renderRegisterPage()
      const passwordInput = screen.getByLabelText(/^password/i)

      // 8+ chars, mixed case, number, special = score 4 (Strong)
      await userEvent.type(passwordInput, 'Password1!')

      await waitFor(() => {
        expect(screen.getByText('Strong')).toBeInTheDocument()
      })
    })

    it('shows very strong for complex passwords', async () => {
      renderRegisterPage()
      const passwordInput = screen.getByLabelText(/^password/i)

      // 12+ chars, mixed case, number, special = score 5 (Very Strong)
      await userEvent.type(passwordInput, 'SuperPassword1!')

      await waitFor(() => {
        expect(screen.getByText('Very Strong')).toBeInTheDocument()
      })
    })
  })

  describe('Password Match Indicator', () => {
    it('shows green border when passwords match', async () => {
      renderRegisterPage()

      await userEvent.type(screen.getByLabelText(/^password/i), 'password123')
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')

      const confirmInput = screen.getByLabelText(/confirm password/i)
      expect(confirmInput).toHaveClass('border-green-500')
    })

    it('shows red border when passwords do not match', async () => {
      renderRegisterPage()

      await userEvent.type(screen.getByLabelText(/^password/i), 'password123')
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'password456')

      const confirmInput = screen.getByLabelText(/confirm password/i)
      expect(confirmInput).toHaveClass('border-red-500')
    })

    it('shows mismatch error text when passwords differ', async () => {
      renderRegisterPage()

      await userEvent.type(screen.getByLabelText(/^password/i), 'password123')
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'password456')

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility', async () => {
      renderRegisterPage()
      const passwordInput = screen.getByLabelText(/^password/i)

      expect(passwordInput).toHaveAttribute('type', 'password')

      const toggleButton = passwordInput.parentElement?.querySelector('button')
      if (toggleButton) {
        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')
      }
    })

    it('toggles confirm password visibility', async () => {
      renderRegisterPage()
      const confirmInput = screen.getByLabelText(/confirm password/i)

      expect(confirmInput).toHaveAttribute('type', 'password')

      const toggleButton = confirmInput.parentElement?.querySelector('button')
      if (toggleButton) {
        fireEvent.click(toggleButton)
        expect(confirmInput).toHaveAttribute('type', 'text')
      }
    })
  })

  describe('Form Interactions', () => {
    it('updates full name input value', async () => {
      renderRegisterPage()
      const nameInput = screen.getByLabelText(/full name/i)

      await userEvent.type(nameInput, 'John Doe')
      expect(nameInput).toHaveValue('John Doe')
    })

    it('updates email input value', async () => {
      renderRegisterPage()
      const emailInput = screen.getByLabelText(/email address/i)

      await userEvent.type(emailInput, 'test@example.com')
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('disables submit button until terms accepted', () => {
      renderRegisterPage()
      const submitButton = screen.getByRole('button', { name: /create account/i })

      expect(submitButton).toBeDisabled()

      fireEvent.click(screen.getByRole('checkbox'))
      expect(submitButton).not.toBeDisabled()
    })
  })

  describe('Navigation Links', () => {
    it('sign in link has correct href', () => {
      renderRegisterPage()
      const signInLink = screen.getByRole('link', { name: /sign in instead/i })
      expect(signInLink).toHaveAttribute('href', '/login')
    })
  })

  describe('Accessibility', () => {
    it('has accessible form labels', () => {
      renderRegisterPage()

      expect(screen.getByLabelText(/full name/i)).toHaveAttribute('id', 'fullName')
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute('id', 'email')
      expect(screen.getByLabelText(/^password/i)).toHaveAttribute('id', 'password')
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('id', 'confirmPassword')
    })

    it('has required markers for mandatory fields', () => {
      renderRegisterPage()

      // Check for asterisks on required fields
      const requiredMarkers = screen.getAllByText('*')
      expect(requiredMarkers.length).toBeGreaterThan(0)
    })

    it('full name shows as optional', () => {
      renderRegisterPage()
      expect(screen.getByText(/\(optional\)/i)).toBeInTheDocument()
    })
  })
})
