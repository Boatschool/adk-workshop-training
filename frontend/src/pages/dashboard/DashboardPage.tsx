/**
 * Dashboard Page
 * Main landing page for the AI Agent Knowledge Hub
 * Redesigned to match Agent Architect dashboard styling
 */

import { useMemo } from 'react'
import {
  ContentPillarCard,
  FeaturedSection,
  NewsSection,
  NextStepsSection,
  QuickActionsSection,
  StatsCard,
  VisualBuilderStatus,
} from '@components/dashboard'
import { useWorkshops } from '@hooks/useWorkshops'
import { useGuides } from '@hooks/useGuides'
import { useLibraryResources, useUserBookmarks, useUserProgress } from '@hooks/useLibrary'

// Icons
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

// Stats icons
const BoltIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const BookmarkIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  const workshopCount = workshopsData?.items?.length || 3
  const guideCount = guides?.length || 4
  const libraryCount = libraryResources?.length || 50
  const bookmarkCount = bookmarks?.length || 0

  // Calculate workshops in progress (placeholder - would need real progress tracking)
  const workshopsInProgress = useMemo(() => {
    // For now, return a placeholder. In a real implementation,
    // this would check user's workshop progress
    return workshopsData?.items?.length ? Math.min(2, workshopsData.items.length) : 0
  }, [workshopsData])

  // Count unique topics from resources the user has viewed
  const topicsExplored = useMemo(() => {
    if (!progressData || !libraryResources) return 0

    const resourceMap = new Map(libraryResources.map(r => [r.id, r]))
    const viewedResourceIds = new Set(progressData.map(p => p.resource_id))

    const uniqueTopics = new Set<string>()
    viewedResourceIds.forEach(resourceId => {
      const resource = resourceMap.get(resourceId)
      if (resource?.topics) {
        resource.topics.forEach(topic => uniqueTopics.add(topic))
      }
    })

    return uniqueTopics.size
  }, [progressData, libraryResources])

  // Get preview items for each pillar
  const workshopPreviews = workshopsData?.items?.slice(0, 3).map(w => ({
    id: w.id,
    title: w.title,
    href: `/workshops/${w.id}`,
  })) || [
    { id: 'placeholder-1', title: 'ADK Fundamentals', href: '/workshops' },
    { id: 'placeholder-2', title: 'Building with Tools', href: '/workshops' },
    { id: 'placeholder-3', title: 'Multi-Agent Systems', href: '/workshops' },
  ]

  const guidePreviews = guides?.slice(0, 3).map(g => ({
    id: g.id,
    title: g.title,
    href: `/guides/${g.slug}`,
  })) || [
    { id: 'placeholder-1', title: 'Getting Started', href: '/guides' },
    { id: 'placeholder-2', title: 'Visual Builder Guide', href: '/guides' },
    { id: 'placeholder-3', title: 'Troubleshooting', href: '/guides' },
  ]

  const libraryPreviews = [
    { id: 'placeholder-1', title: 'Agent Architecture Patterns', href: '/library' },
    { id: 'placeholder-2', title: 'Prompt Engineering Guide', href: '/library' },
    { id: 'placeholder-3', title: 'Tool Integration Docs', href: '/library' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Skip Link Target */}
      <a id="main-content" className="sr-only focus:not-sr-only">
        Main content
      </a>

      {/* Welcome Section */}
      <section className="mb-8">
        <VisualBuilderStatus />
      </section>

      {/* Stats Row - 3 Metrics */}
      <section className="mb-8" aria-label="Your progress">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            icon={<BoltIcon />}
            label="Workshops In Progress"
            value={workshopsInProgress}
            color="blue"
          />
          <StatsCard
            icon={<BookmarkIcon />}
            label="Resources Bookmarked"
            value={bookmarkCount}
            color="amber"
          />
          <StatsCard
            icon={<SparklesIcon />}
            label="Topics Explored"
            value={topicsExplored}
            color="green"
          />
        </div>
      </section>

      {/* Quick Actions + Platform Features */}
      <QuickActionsSection />

      {/* Featured Resources Section */}
      <FeaturedSection />

      {/* News Section */}
      <NewsSection />

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
          {/* Workshops */}
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

          {/* Guides */}
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

          {/* Library */}
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

      {/* What's Next Section */}
      <NextStepsSection />
    </div>
  )
}
