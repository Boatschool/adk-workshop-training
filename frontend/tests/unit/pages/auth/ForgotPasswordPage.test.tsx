/**
 * ForgotPasswordPage Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ForgotPasswordPage } from '@pages/auth/ForgotPasswordPage'
import * as authService from '@services/auth'

// Mock the auth service
vi.mock('@services/auth', () => ({
  forgotPassword: vi.fn(),
}))

function renderForgotPasswordPage() {
  return render(
    <BrowserRouter>
      <ForgotPasswordPage />
    </BrowserRouter>
  )
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('renders the forgot password header', () => {
      renderForgotPasswordPage()
      expect(screen.getByRole('heading', { name: /forgot your password/i })).toBeInTheDocument()
    })

    it('renders the description text', () => {
      renderForgotPasswordPage()
      expect(screen.getByText(/we'll send you reset instructions/i)).toBeInTheDocument()
    })

    it('renders email input field', () => {
      renderForgotPasswordPage()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    })

    it('renders send reset link button', () => {
      renderForgotPasswordPage()
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
    })

    it('renders back to sign in link', () => {
      renderForgotPasswordPage()
      expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('requires email field', () => {
      renderForgotPasswordPage()
      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('required')
    })

    it('email input has email type for validation', () => {
      renderForgotPasswordPage()
      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })
  })

  describe('Form Submission', () => {
    it('calls forgotPassword service on submit', async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValueOnce(undefined)
      renderForgotPasswordPage()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com')
      })
    })

    it('shows loading state during submission', async () => {
      vi.mocked(authService.forgotPassword).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )
      renderForgotPasswordPage()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      fireEvent.click(submitButton)

      expect(await screen.findByText(/sending/i)).toBeInTheDocument()
    })

    it('shows success message after submission', async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValueOnce(undefined)
      renderForgotPasswordPage()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
      })
    })

    it('shows email in success message', async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValueOnce(undefined)
      renderForgotPasswordPage()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
      })
    })

    it('shows success message even on error (email enumeration prevention)', async () => {
      vi.mocked(authService.forgotPassword).mockRejectedValueOnce(new Error('User not found'))
      renderForgotPasswordPage()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, 'nonexistent@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument()
      })
    })
  })

  describe('Success State', () => {
    it('renders back to sign in link in success state', async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValueOnce(undefined)
      renderForgotPasswordPage()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument()
      })
    })

    it('allows trying a different email', async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValueOnce(undefined)
      renderForgotPasswordPage()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try a different email/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /try a different email/i }))

      // Should be back to form view
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    })

    it('clears email when trying different email', async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValueOnce(undefined)
      renderForgotPasswordPage()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, 'test@example.com')

      const submitButton = screen.getByRole('button', { name: /send reset link/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try a different email/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /try a different email/i }))

      // Email should be cleared
      expect(screen.getByLabelText(/email address/i)).toHaveValue('')
    })
  })

  describe('Navigation', () => {
    it('back to sign in link has correct href', () => {
      renderForgotPasswordPage()
      const backLink = screen.getByRole('link', { name: /back to sign in/i })
      expect(backLink).toHaveAttribute('href', '/login')
    })
  })

  describe('Accessibility', () => {
    it('email input has correct autocomplete attribute', () => {
      renderForgotPasswordPage()
      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('autocomplete', 'email')
    })

    it('email input has correct id for label association', () => {
      renderForgotPasswordPage()
      const emailInput = screen.getByLabelText(/email address/i)
      expect(emailInput).toHaveAttribute('id', 'email')
    })
  })
})
