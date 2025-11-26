/**
 * Dashboard Page
 * Main landing page for the ADK Workshop Training platform
 */

import {
  AchievementsSection,
  ProgressCard,
  QuickStartCard,
  ResourceSection,
  SetupProgressBanner,
  TipCard,
  VisualBuilderStatus,
} from '@components/dashboard'

// Icons as inline SVGs for simplicity
const DumbbellIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h2v12H4zm14 0h2v12h-2zM8 10h8v4H8z" />
  </svg>
)

const BookIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const FlagIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
  </svg>
)

const EyeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const CodeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
)

const ToolIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const BoltIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const WrenchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
  </svg>
)

const QuestionIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const TicketIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
  </svg>
)

const RocketIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
)

const LightbulbIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

// Mock data - will be replaced with API calls
const mockProgress = {
  exercisesCompleted: 1,
  totalExercises: 3,
  materialsViewed: 5,
  lastActive: new Date().toISOString(),
  completedExercises: ['exercise-1-basic-agent'],
}

export function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Skip Link Target */}
      <a id="main-content" className="sr-only focus:not-sr-only">
        Main content
      </a>

      {/* Setup Progress Banner for new users */}
      <SetupProgressBanner />

      {/* Welcome Section with Visual Builder Status */}
      <section className="mb-8">
        <VisualBuilderStatus />
      </section>

      {/* Achievements Section */}
      <AchievementsSection />

      {/* Progress Overview */}
      <section className="mb-8" aria-labelledby="progress-heading">
        <h2
          id="progress-heading"
          className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Your Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProgressCard
            icon={<DumbbellIcon />}
            title="Exercises Completed"
            value={mockProgress.exercisesCompleted}
            total={mockProgress.totalExercises}
          />
          <ProgressCard
            icon={<BookIcon />}
            title="Materials Viewed"
            value={mockProgress.materialsViewed}
            detail="Keep exploring!"
          />
          <ProgressCard
            icon={<ClockIcon />}
            title="Last Active"
            value=""
            detail={
              mockProgress.lastActive
                ? new Date(mockProgress.lastActive).toLocaleDateString()
                : 'Just started!'
            }
          />
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="mb-8" aria-labelledby="quick-start-heading">
        <h2
          id="quick-start-heading"
          className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quick Start
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickStartCard
            number={1}
            icon={<FlagIcon />}
            title="Getting Started"
            description="New to ADK? Start here to set up your environment and understand the basics."
            href="/guides/getting-started"
            timeEstimate="15 min"
            recommended
            variant="primary"
          />
          <QuickStartCard
            number={2}
            icon={<EyeIcon />}
            title="Visual Builder Guide"
            description="Learn how to use the Visual Agent Builder - no coding required!"
            href="/guides/visual-agent-builder-guide"
            timeEstimate="10 min"
            variant="secondary"
          />
          <QuickStartCard
            number={3}
            icon={<DumbbellIcon />}
            title="First Exercise"
            description="Build your first AI agent with step-by-step instructions."
            href="/exercises/exercise-1-basic-agent"
            timeEstimate="30 min"
            variant="tertiary"
          />
        </div>
      </section>

      {/* Resources Grid */}
      <section className="mb-8" aria-labelledby="resources-heading">
        <h2
          id="resources-heading"
          className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Workshop Materials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ResourceSection
            icon={<BookIcon />}
            title="Guides & References"
            count={4}
            resources={[
              {
                title: 'Visual Agent Builder Guide',
                href: '/guides/visual-agent-builder-guide',
                icon: <EyeIcon />,
              },
              {
                title: 'ADK Quickstart Guide',
                href: '/guides/quickstart-guide',
                icon: <BoltIcon />,
              },
              {
                title: 'Command Cheat Sheet',
                href: '/guides/cheat-sheet',
                icon: <DocumentIcon />,
              },
              {
                title: 'Troubleshooting Guide',
                href: '/guides/troubleshooting-guide',
                icon: <WrenchIcon />,
              },
            ]}
          />
          <ResourceSection
            icon={<DumbbellIcon />}
            title="Hands-On Exercises"
            count={3}
            resources={[
              {
                title: 'Exercise 1: Build Your First Agent',
                href: '/exercises/exercise-1-basic-agent',
                icon: <StarIcon />,
                completed: mockProgress.completedExercises.includes('exercise-1-basic-agent'),
              },
              {
                title: 'Exercise 2: Adding Tools',
                href: '/exercises/exercise-2-agents-with-tools',
                icon: <ToolIcon />,
                completed: mockProgress.completedExercises.includes('exercise-2-agents-with-tools'),
              },
              {
                title: 'Exercise 3: Multi-Agent Systems',
                href: '/exercises/exercise-3-multi-agent-systems',
                icon: <UsersIcon />,
                completed: mockProgress.completedExercises.includes('exercise-3-multi-agent-systems'),
              },
            ]}
          />
          <ResourceSection
            icon={<CodeIcon />}
            title="Sample Agents"
            count={3}
            resources={[
              {
                title: 'HR FAQ Agent',
                href: '/examples/01-simple-faq-agent',
                icon: <QuestionIcon />,
              },
              {
                title: 'Meeting Room Scheduler',
                href: '/examples/02-meeting-room-scheduler',
                icon: <CalendarIcon />,
              },
              {
                title: 'Facilities Ticket Router',
                href: '/examples/03-facilities-ticket-router',
                icon: <TicketIcon />,
              },
            ]}
          />
        </div>
      </section>

      {/* Pro Tips Section */}
      <section aria-labelledby="tips-heading">
        <h2
          id="tips-heading"
          className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
        >
          <LightbulbIcon />
          Pro Tips
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TipCard
            icon={<RocketIcon />}
            title="Use the Visual Builder"
            description="No coding required! The Visual Builder makes it easy to create agents with drag-and-drop."
          />
          <TipCard
            icon={<SaveIcon />}
            title="Save Your Work"
            description="Export your agents regularly. You can always import them back into the Visual Builder."
          />
          <TipCard
            icon={<QuestionIcon />}
            title="Ask Questions"
            description="Stuck? Check the troubleshooting guide or ask your instructor for help."
          />
          <TipCard
            icon={<UsersIcon />}
            title="Learn Together"
            description="Pair up with another participant! Teaching others reinforces your own learning."
          />
        </div>
      </section>
    </div>
  )
}
