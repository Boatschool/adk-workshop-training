/**
 * Dashboard Page
 * Main landing page for the AI Agent Knowledge Hub
 * Balanced content: Workshops (40%), Guides (30%), Library (30%)
 */

import {
  AchievementsSection,
  ContentPillarCard,
  FeaturedSection,
  NextStepsSection,
  ProgressCard,
  VisualBuilderStatus,
} from '@components/dashboard'
import { useWorkshops } from '@hooks/useWorkshops'
import { useGuides } from '@hooks/useGuides'
import { useLibraryResources, useUserBookmarks, useUserProgress } from '@hooks/useLibrary'
import { Link } from 'react-router-dom'

// Icons
const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const WorkshopIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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

const BookmarkIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

const TrophyIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

export function DashboardPage() {
  // Fetch data
  const { data: workshopsData } = useWorkshops({ status: 'published' })
  const { data: guides } = useGuides(true) // published only
  const { data: libraryResources } = useLibraryResources()
  const { data: bookmarks } = useUserBookmarks()
  const { data: progressData } = useUserProgress()

  // Calculate counts
  const workshopCount = workshopsData?.items?.length || 3 // Default to 3 if loading
  const guideCount = guides?.length || 4
  const libraryCount = libraryResources?.length || 50
  const bookmarkCount = bookmarks?.length || 0

  // Calculate recent activity
  const recentProgress = progressData?.slice(0, 5) || []
  const topicsExplored = new Set(
    progressData?.map(p => p.resource_id?.split('-')[0]).filter(Boolean) || []
  ).size

  // Get preview items for each pillar
  const workshopPreviews = workshopsData?.items?.slice(0, 3).map(w => ({
    title: w.title,
    href: `/workshops/${w.id}`,
  })) || [
    { title: 'ADK Fundamentals', href: '/workshops' },
    { title: 'Building with Tools', href: '/workshops' },
    { title: 'Multi-Agent Systems', href: '/workshops' },
  ]

  const guidePreviews = guides?.slice(0, 3).map(g => ({
    title: g.title,
    href: `/guides/${g.slug}`,
  })) || [
    { title: 'Getting Started', href: '/guides' },
    { title: 'Visual Builder Guide', href: '/guides' },
    { title: 'Troubleshooting', href: '/guides' },
  ]

  const libraryPreviews = [
    { title: 'Agent Architecture Patterns', href: '/library' },
    { title: 'Prompt Engineering Guide', href: '/library' },
    { title: 'Tool Integration Docs', href: '/library' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Skip Link Target */}
      <a id="main-content" className="sr-only focus:not-sr-only">
        Main content
      </a>

      {/* Welcome Section with Search */}
      <section className="mb-8">
        <VisualBuilderStatus />
      </section>

      {/* Achievements Section (conditional) */}
      <AchievementsSection />

      {/* Featured Resources Section */}
      <FeaturedSection />

      {/* Explore & Learn - Three Pillar Grid */}
      <section className="mb-8" aria-labelledby="explore-heading">
        <h2
          id="explore-heading"
          className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Explore & Learn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Workshops - 40% priority */}
          <ContentPillarCard
            icon={<WorkshopIcon />}
            title="Workshops"
            description="Structured learning paths to build AI agents step by step"
            count={workshopCount}
            countLabel="workshops"
            previewItems={workshopPreviews}
            href="/workshops"
            ctaLabel="Browse"
          />

          {/* Guides - 30% priority */}
          <ContentPillarCard
            icon={<GuideIcon />}
            title="Guides"
            description="Step-by-step how-to tutorials and reference documentation"
            count={guideCount}
            countLabel="guides"
            previewItems={guidePreviews}
            href="/guides"
            ctaLabel="View All"
          />

          {/* Library - 30% priority */}
          <ContentPillarCard
            icon={<LibraryIcon />}
            title="Library"
            description="Articles, videos, documentation, and curated resources"
            count={libraryCount}
            countLabel="resources"
            previewItems={libraryPreviews}
            href="/library"
            ctaLabel="Explore"
          />
        </div>
      </section>

      {/* Continue Learning Section */}
      <section className="mb-8" aria-labelledby="continue-heading">
        <h2
          id="continue-heading"
          className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Continue Learning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recently Viewed */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center">
                <ClockIcon />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Recently Viewed</h3>
            </div>
            {recentProgress.length > 0 ? (
              <ul className="space-y-2">
                {recentProgress.slice(0, 3).map((progress, index) => (
                  <li key={progress.id || index} className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 inline-block mr-2" />
                    Resource {index + 1}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start exploring to track your history
              </p>
            )}
            <Link
              to="/library"
              className="mt-4 inline-flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              Browse Library
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Bookmarked */}
          <ProgressCard
            icon={<BookmarkIcon />}
            title="Bookmarked"
            value={bookmarkCount}
            detail={bookmarkCount > 0 ? 'saved resources' : 'Bookmark resources to save them'}
          />

          {/* Your Activity */}
          <ProgressCard
            icon={<TrophyIcon />}
            title="Your Activity"
            value={topicsExplored}
            detail={topicsExplored > 0 ? 'topics explored' : 'Start learning to track progress'}
          />
        </div>
      </section>

      {/* What's Next Section */}
      <NextStepsSection />
    </div>
  )
}
