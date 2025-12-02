/**
 * Interactive Setup Wizard
 * Step-by-step guide for setting up ADK development environment
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CodeBlock } from '@components/common'
import { useUserSettings } from '@hooks/useUserSettings'
import { detectPlatform, getPlatformName, getPlatformIcon, getPythonCommand, getVenvActivateCommand, getShellType, type Platform } from '@utils/platform'
import { cn } from '@utils/cn'

type SetupStep = 'welcome' | 'prerequisites' | 'venv' | 'install-adk' | 'api-key' | 'verify' | 'complete'

interface Step {
  id: SetupStep
  title: string
  description: string
}

const steps: Step[] = [
  { id: 'welcome', title: 'Welcome', description: 'Overview' },
  { id: 'prerequisites', title: 'Prerequisites', description: 'Check requirements' },
  { id: 'venv', title: 'Virtual Environment', description: 'Create workspace' },
  { id: 'install-adk', title: 'Install ADK', description: 'Install Google ADK' },
  { id: 'api-key', title: 'API Key', description: 'Configure access' },
  { id: 'verify', title: 'Verify', description: 'Test installation' },
  { id: 'complete', title: 'Complete', description: 'You\'re ready!' },
]

export function SetupWizard() {
  const [platform] = useState<Platform>(() => detectPlatform())
  const [builderConnected, setBuilderConnected] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const { settings, updateSetting, earnBadge, getHealthUrl, completeSetupStep } = useUserSettings()

  // Use currentSetupStep from settings, default to 'welcome'
  const currentStep = settings.currentSetupStep || 'welcome'
  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  // Check if Visual Builder is running
  useEffect(() => {
    const checkBuilder = async () => {
      try {
        await fetch(getHealthUrl(), {
          method: 'HEAD',
          mode: 'no-cors',
        })
        setBuilderConnected(true)
      } catch {
        setBuilderConnected(false)
      }
    }

    if (currentStep === 'verify' || currentStep === 'complete') {
      checkBuilder()
      const interval = setInterval(checkBuilder, 5000)
      return () => clearInterval(interval)
    }
  }, [currentStep, getHealthUrl])

  const goToStep = (step: SetupStep) => {
    completeSetupStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      const nextStepId = steps[nextIndex].id
      completeSetupStep(nextStepId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      const prevStepId = steps[prevIndex].id
      completeSetupStep(prevStepId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const markSetupComplete = () => {
    updateSetting('setupCompleted', true)
    updateSetting('setupCompletedAt', new Date().toISOString())
    earnBadge('environment-setup')
    setShowCelebration(true)
    setTimeout(() => setShowCelebration(false), 5000) // Hide after 5 seconds
  }

  const pythonCmd = getPythonCommand(platform)
  const venvActivate = getVenvActivateCommand(platform)
  const shellType = getShellType(platform)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Celebration Toast */}
      {showCelebration && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-2xl p-6 max-w-md">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">🚀</span>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Achievement Unlocked!</h3>
                <p className="text-green-50 text-sm mb-2">
                  You earned the <strong>Environment Setup</strong> badge
                </p>
                <p className="text-xs text-green-100">
                  Check your dashboard to see all your achievements
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Development Environment Setup
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Follow this guide to set up Google ADK and the Visual Agent Builder
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => goToStep(step.id)}
                className={cn(
                  'flex flex-col items-center gap-2 cursor-pointer group',
                  index <= currentStepIndex ? 'opacity-100' : 'opacity-40'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
                  index < currentStepIndex
                    ? 'bg-green-500 text-white'
                    : index === currentStepIndex
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                )}>
                  {index < currentStepIndex ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="text-center hidden md:block">
                  <div className={cn(
                    'text-xs font-medium',
                    index <= currentStepIndex ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {step.description}
                  </div>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div className={cn(
                  'h-0.5 flex-1 mx-2',
                  index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 mb-6">
        {currentStep === 'welcome' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to ADK Training! 👋
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                This wizard will guide you through setting up your local development environment for building AI agents with Google's Agent Development Kit (ADK).
              </p>
            </div>

            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
              <h3 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
                What you'll learn:
              </h3>
              <ul className="space-y-2 text-primary-800 dark:text-primary-200">
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  How to install and configure Google ADK
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Set up the Visual Agent Builder for hands-on practice
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verify your installation and troubleshoot issues
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{getPlatformIcon(platform)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Detected Platform: {getPlatformName(platform)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Instructions will be customized for your operating system
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Using {shellType}
              </p>
            </div>

            {/* Video Tutorial Placeholder */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Video Tutorial
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Watch a 5-minute walkthrough of the setup process
                  </p>
                </div>
              </div>
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Video Coming Soon
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    For now, follow the step-by-step instructions below
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Estimated Time: 15-20 minutes
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Make sure you have a stable internet connection and admin rights on your computer
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'prerequisites' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Prerequisites
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Before we begin, make sure you have the following:
            </p>

            <div className="space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 dark:text-primary-400 font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Python 3.11 or higher
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Check your Python version:
                    </p>
                    <CodeBlock code={`${pythonCmd} --version`} />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Expected output: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Python 3.11.x</code> or higher
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 dark:text-primary-400 font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Google API Key
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      You'll need a Google API key with Generative Language API enabled. Get one at:
                    </p>
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      https://aistudio.google.com/apikey
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 dark:text-primary-400 font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Terminal Access
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Basic familiarity with command-line interface ({shellType})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'venv' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create Virtual Environment
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              A virtual environment keeps your project dependencies isolated from other Python projects.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Step 1: Create the virtual environment
                </h3>
                <CodeBlock
                  code={`${pythonCmd} -m venv ~/adk-workshop`}
                  title="Create virtual environment"
                />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Step 2: Activate the virtual environment
                </h3>
                <CodeBlock
                  code={venvActivate}
                  title="Activate virtual environment"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  You'll know it's activated when you see <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">(adk-workshop)</code> in your terminal prompt
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Pro Tip
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      You'll need to activate this environment every time you open a new terminal session
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'install-adk' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Install Google ADK
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Now let's install the Agent Development Kit in your virtual environment.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Install the ADK package
                </h3>
                <CodeBlock
                  code="pip install google-adk"
                  title="Install Google ADK"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  This may take a few minutes as it downloads all required dependencies
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Verify the installation
                </h3>
                <CodeBlock
                  code="adk --version"
                  title="Check ADK version"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  You should see the version number displayed (e.g., <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">1.18.0</code>)
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                      Success!
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      If you see the version number, Google ADK is installed correctly
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'api-key' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Configure API Key
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The ADK needs your Google API key to make requests to Google's AI models.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Option 1: Environment Variable (Recommended)
                </h3>
                <CodeBlock
                  code={platform === 'windows'
                    ? 'set GOOGLE_API_KEY=your-api-key-here'
                    : 'export GOOGLE_API_KEY=your-api-key-here'
                  }
                  title={platform === 'windows' ? 'Windows Command Prompt' : 'Terminal'}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Replace <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">your-api-key-here</code> with your actual API key
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Option 2: .env File (Persistent)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Create a <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code> file in your project directory:
                </p>
                <CodeBlock
                  code="GOOGLE_API_KEY=your-api-key-here"
                  title=".env file"
                  language="bash"
                />
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-red-900 dark:text-red-100 mb-1">
                      Security Warning
                    </h4>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      Never commit your <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">.env</code> file to version control. Add it to <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">.gitignore</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'verify' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Verify Installation
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Let's test that everything is working by starting the Visual Builder.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Start the Visual Builder
                </h3>
                <CodeBlock
                  code="adk web --port 8000"
                  title="Start ADK Visual Builder"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  The server will start on port 8000. Keep this terminal window open.
                </p>
              </div>

              <div className={cn(
                'border-2 rounded-lg p-6 transition-colors',
                builderConnected
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-700'
              )}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    builderConnected
                      ? 'bg-green-100 dark:bg-green-900/40'
                      : 'bg-gray-200 dark:bg-gray-700'
                  )}>
                    {builderConnected ? (
                      <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className={cn(
                      'font-semibold text-lg',
                      builderConnected
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-gray-900 dark:text-white'
                    )}>
                      {builderConnected ? 'Visual Builder Connected! ✓' : 'Waiting for Visual Builder...'}
                    </h3>
                    <p className={cn(
                      'text-sm',
                      builderConnected
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-600 dark:text-gray-400'
                    )}>
                      {builderConnected
                        ? `Running at ${settings.localBuilderUrl}`
                        : 'Start the server using the command above'
                      }
                    </p>
                  </div>
                </div>

                {builderConnected && (
                  <a
                    href={`${settings.localBuilderUrl}/dev-ui`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Open Visual Builder
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>

              {!builderConnected && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Troubleshooting
                      </h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        If the builder doesn't connect, check that your API key is set correctly and that no other process is using port 8000.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="space-y-6 text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Setup Complete! 🎉
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Your development environment is ready for building AI agents
              </p>
            </div>

            {builderConnected ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  ✓ Visual Builder is running
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                  You're all set to start building agents!
                </p>
                <a
                  href={`${settings.localBuilderUrl}/dev-ui`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  Launch Visual Builder
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Remember to start the Visual Builder with <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded">adk web --port 8000</code>
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Next Steps
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Link
                  to="/workshops"
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      Start a Workshop
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Learn agent development through hands-on workshops
                  </p>
                </Link>

                <Link
                  to="/guides/visual-agent-builder-guide"
                  className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                      Read the Guides
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Explore detailed guides and reference documentation
                  </p>
                </Link>
              </div>
            </div>

            {!settings.setupCompleted && (
              <button
                onClick={markSetupComplete}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Mark setup as complete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStepIndex === 0}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
            currentStepIndex === 0
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        {currentStepIndex < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium transition-colors"
          >
            Next Step
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium transition-colors"
          >
            Go to Dashboard
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  )
}
