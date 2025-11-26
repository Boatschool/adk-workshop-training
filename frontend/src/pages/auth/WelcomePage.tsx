/**
 * Welcome Page Component
 * Onboarding flow for new users after registration
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Build AI Agents',
    description:
      'Create powerful AI agents using Google ADK with our intuitive visual builder or code-based approach.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Interactive Workshops',
    description:
      'Learn through hands-on exercises with step-by-step guidance and real-world examples.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Track Progress',
    description:
      'Monitor your learning journey with detailed progress tracking and achievement badges.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
]

export function WelcomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1)
        setIsAnimating(false)
      }, 150)
    } else {
      // Onboarding complete, go to dashboard
      navigate('/', { replace: true })
    }
  }

  const handleSkip = () => {
    navigate('/', { replace: true })
  }

  const handleGetStarted = () => {
    navigate('/getting-started', { replace: true })
  }

  const firstName = user?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-3xl">A</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {firstName}!
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Let's get you started with ADK Platform
          </p>
        </div>

        {/* Onboarding Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-8">
            {onboardingSteps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-primary-500 w-8'
                    : index < currentStep
                      ? 'bg-primary-300 dark:bg-primary-700'
                      : 'bg-gray-200 dark:bg-gray-700'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div
            className={`text-center transition-opacity duration-150 ${
              isAnimating ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="text-primary-500 dark:text-primary-400 mb-6 flex justify-center">
              {onboardingSteps[currentStep].icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {onboardingSteps[currentStep].title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
              {onboardingSteps[currentStep].description}
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={handleSkip}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                       font-medium transition-colors px-4 py-2"
            >
              Skip tour
            </button>

            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-primary-500 to-purple-600
                       text-white font-medium rounded-lg shadow-lg
                       hover:from-primary-600 hover:to-purple-700
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                       transition-all duration-200 flex items-center gap-2"
            >
              {currentStep < onboardingSteps.length - 1 ? (
                <>
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              ) : (
                'Get Started'
              )}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleGetStarted}
            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md
                     hover:shadow-lg hover:scale-[1.02] transition-all duration-200
                     border border-gray-100 dark:border-gray-700"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Quick Start Guide</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set up your first agent</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/workshops')}
            className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md
                     hover:shadow-lg hover:scale-[1.02] transition-all duration-200
                     border border-gray-100 dark:border-gray-700"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white">Browse Workshops</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Explore available courses</p>
            </div>
          </button>
        </div>

        {/* Helpful Tips */}
        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
          <div className="flex items-start gap-3">
            <div className="text-primary-500 dark:text-primary-400 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-primary-900 dark:text-primary-100">Pro Tip</h4>
              <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                Start with the "Introduction to ADK" workshop to learn the fundamentals before
                building your first agent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
