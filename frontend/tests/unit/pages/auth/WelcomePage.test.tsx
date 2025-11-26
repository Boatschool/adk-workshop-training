/**
 * WelcomePage Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { WelcomePage } from '@pages/auth/WelcomePage'
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

function renderWelcomePage() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <WelcomePage />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('WelcomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the welcome header', () => {
      renderWelcomePage()
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument()
    })

    it('renders the ADK Platform logo', () => {
      renderWelcomePage()
      // Logo is the "A" in the gradient box
      expect(screen.getByText('A')).toBeInTheDocument()
    })

    it('renders onboarding steps content', () => {
      renderWelcomePage()
      expect(screen.getByText(/build ai agents/i)).toBeInTheDocument()
    })

    it('renders progress dots', () => {
      renderWelcomePage()
      const dots = screen.getAllByRole('button').filter((btn) =>
        btn.getAttribute('aria-label')?.includes('step')
      )
      expect(dots).toHaveLength(3)
    })

    it('renders skip button', () => {
      renderWelcomePage()
      expect(screen.getByRole('button', { name: /skip tour/i })).toBeInTheDocument()
    })

    it('renders next button', () => {
      renderWelcomePage()
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })

    it('renders quick action buttons', () => {
      renderWelcomePage()
      expect(screen.getByText(/quick start guide/i)).toBeInTheDocument()
      expect(screen.getByText(/browse workshops/i)).toBeInTheDocument()
    })

    it('renders pro tip section', () => {
      renderWelcomePage()
      expect(screen.getByText(/pro tip/i)).toBeInTheDocument()
    })
  })

  describe('Onboarding Navigation', () => {
    it('shows first step by default', () => {
      renderWelcomePage()
      expect(screen.getByText(/build ai agents/i)).toBeInTheDocument()
    })

    it('advances to next step when clicking next', async () => {
      renderWelcomePage()

      const nextButton = screen.getByRole('button', { name: /next/i })
      fireEvent.click(nextButton)

      // Wait for animation
      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(screen.getByText(/interactive workshops/i)).toBeInTheDocument()
    })

    it('shows get started button on last step', async () => {
      renderWelcomePage()

      const nextButton = screen.getByRole('button', { name: /next/i })

      // Click through all steps
      fireEvent.click(nextButton)
      await new Promise((resolve) => setTimeout(resolve, 200))

      fireEvent.click(nextButton)
      await new Promise((resolve) => setTimeout(resolve, 200))

      expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
    })

    it('navigates to dashboard when clicking get started on last step', async () => {
      renderWelcomePage()

      const nextButton = screen.getByRole('button', { name: /next/i })

      // Click through all steps
      fireEvent.click(nextButton)
      await new Promise((resolve) => setTimeout(resolve, 200))

      fireEvent.click(nextButton)
      await new Promise((resolve) => setTimeout(resolve, 200))

      const getStartedButton = screen.getByRole('button', { name: /get started/i })
      fireEvent.click(getStartedButton)

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })

    it('navigates to specific step when clicking progress dot', () => {
      renderWelcomePage()

      const dots = screen.getAllByRole('button').filter((btn) =>
        btn.getAttribute('aria-label')?.includes('step')
      )

      fireEvent.click(dots[2]) // Click on step 3

      expect(screen.getByText(/track progress/i)).toBeInTheDocument()
    })
  })

  describe('Skip Functionality', () => {
    it('navigates to dashboard when clicking skip', () => {
      renderWelcomePage()

      const skipButton = screen.getByRole('button', { name: /skip tour/i })
      fireEvent.click(skipButton)

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  describe('Quick Actions', () => {
    it('navigates to getting started when clicking quick start guide', () => {
      renderWelcomePage()

      const quickStartButton = screen.getByText(/quick start guide/i).closest('button')
      if (quickStartButton) {
        fireEvent.click(quickStartButton)
        expect(mockNavigate).toHaveBeenCalledWith('/getting-started', { replace: true })
      }
    })

    it('navigates to workshops when clicking browse workshops', () => {
      renderWelcomePage()

      const workshopsButton = screen.getByText(/browse workshops/i).closest('button')
      if (workshopsButton) {
        fireEvent.click(workshopsButton)
        expect(mockNavigate).toHaveBeenCalledWith('/workshops')
      }
    })
  })

  describe('Accessibility', () => {
    it('progress dots have aria-labels', () => {
      renderWelcomePage()

      const dots = screen.getAllByRole('button').filter((btn) =>
        btn.getAttribute('aria-label')?.includes('step')
      )

      dots.forEach((dot, index) => {
        expect(dot).toHaveAttribute('aria-label', `Go to step ${index + 1}`)
      })
    })
  })
})
