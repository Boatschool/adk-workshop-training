/**
 * Next Steps Section Component
 * Displays contextual suggestions based on user progress
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useUserSettings } from '@hooks/useUserSettings'
import { useUserBookmarks } from '@hooks/useLibrary'
import { useGuides } from '@hooks/useGuides'
import { cn } from '@utils/cn'

interface NextStep {
  id: string
  title: string
  description: string
  href: string
  icon: React.ReactNode
  external?: boolean
}

// Icons for different suggestion types
const SetupIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const WorkshopIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const GuideIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const LibraryIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const BuilderIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
)

const BookmarkIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

interface NextStepsSectionProps {
  className?: string
}

export function NextStepsSection({ className }: NextStepsSectionProps) {
  const { settings, getBuilderUrl } = useUserSettings()
  const { data: bookmarks } = useUserBookmarks()
  const { data: guides } = useGuides(true) // published only

  const nextSteps = useMemo<NextStep[]>(() => {
    const steps: NextStep[] = []

    // Priority 1: Complete setup if not done
    if (!settings.setupCompleted) {
      steps.push({
        id: 'complete-setup',
        title: 'Complete Setup',
        description: 'Finish setting up your development environment to get started.',
        href: '/getting-started',
        icon: <SetupIcon />,
      })
    }

    // Priority 2: Suggest a guide for learning
    // Always suggest the getting-started guide or first available guide
    if (steps.length < 3) {
      const suggestedGuide = guides?.find(g => g.slug === 'getting-started') || guides?.[0]
      if (suggestedGuide) {
        steps.push({
          id: 'read-guide',
          title: `Read: ${suggestedGuide.title}`,
          description: suggestedGuide.description,
          href: `/guides/${suggestedGuide.slug}`,
          icon: <GuideIcon />,
        })
      }
    }

    // Priority 3: Explore workshops
    if (steps.length < 3) {
      steps.push({
        id: 'explore-workshops',
        title: 'Explore Workshops',
        description: 'Follow structured learning paths to build AI agents step by step.',
        href: '/workshops',
        icon: <WorkshopIcon />,
      })
    }

    // Priority 4: Try the Visual Builder (if setup completed)
    if (settings.setupCompleted && steps.length < 3) {
      steps.push({
        id: 'try-builder',
        title: 'Try Visual Agent Builder',
        description: 'Build an AI agent with drag-and-drop, no coding required.',
        href: getBuilderUrl(),
        icon: <BuilderIcon />,
        external: true,
      })
    }

    // Priority 5: Explore the library
    if (steps.length < 3) {
      steps.push({
        id: 'explore-library',
        title: 'Explore the Library',
        description: 'Browse articles, videos, and documentation about AI agents.',
        href: '/library',
        icon: <LibraryIcon />,
      })
    }

    // Priority 6: Check bookmarks if user has some
    if (bookmarks && bookmarks.length > 0 && steps.length < 3) {
      steps.push({
        id: 'view-bookmarks',
        title: 'Continue Reading',
        description: `You have ${bookmarks.length} bookmarked resource${bookmarks.length === 1 ? '' : 's'} to explore.`,
        href: '/library?bookmarked=true',
        icon: <BookmarkIcon />,
      })
    }

    // Return max 3 steps
    return steps.slice(0, 3)
  }, [settings.setupCompleted, bookmarks, guides, getBuilderUrl])

  // Don't render if no steps
  if (nextSteps.length === 0) {
    return null
  }

  return (
    <section className={cn('', className)} aria-labelledby="next-steps-heading">
      <h2
        id="next-steps-heading"
        className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
      >
        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        What's Next
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Based on your progress, we recommend:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nextSteps.map((step) => {
          const cardContent = (
            <div className="p-5 h-full flex flex-col">
              {/* Icon */}
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-4">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-500 dark:text-gray-400 flex-1">
                {step.description}
              </p>

              {/* Arrow indicator */}
              <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                <span>Get started</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {step.external && (
                  <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </div>
            </div>
          )

          // External links open in new tab
          if (step.external) {
            return (
              <a
                key={step.id}
                href={step.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
              >
                {cardContent}
              </a>
            )
          }

          // Internal links use React Router
          return (
            <Link
              key={step.id}
              to={step.href}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
            >
              {cardContent}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
