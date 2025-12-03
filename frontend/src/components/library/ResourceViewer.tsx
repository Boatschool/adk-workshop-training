/**
 * Resource Viewer Component
 * Renders different types of embedded content (markdown, PDF, video)
 */

import { useMemo } from 'react'
import { marked } from 'marked'
import { MarkdownRenderer } from '@components/exercise/MarkdownRenderer'
import type { LibraryResource } from '@/types/models'

interface ResourceViewerProps {
  resource: LibraryResource
}

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true,
})

export function ResourceViewer({ resource }: ResourceViewerProps) {
  // Convert markdown to HTML
  const htmlContent = useMemo(() => {
    if (resource.contentHtml) {
      return marked.parse(resource.contentHtml) as string
    }
    return null
  }, [resource.contentHtml])

  // Handle embedded markdown content
  if (htmlContent) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <MarkdownRenderer content={htmlContent} className="max-w-none" />
      </div>
    )
  }

  // Handle PDF content
  if (resource.type === 'pdf' && resource.contentPath) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <iframe
          src={resource.contentPath}
          title={resource.title}
          className="w-full h-[800px]"
          loading="lazy"
        />
      </div>
    )
  }

  // Handle video content (YouTube, Vimeo, or direct)
  if (resource.type === 'video' && resource.contentPath) {
    // Check if it's a YouTube URL
    const youtubeMatch = resource.contentPath.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
    )
    if (youtubeMatch) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="relative w-full pt-[56.25%]">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
              title={resource.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )
    }

    // Check if it's a Vimeo URL
    const vimeoMatch = resource.contentPath.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="relative w-full pt-[56.25%]">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
              title={resource.title}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )
    }

    // Direct video file
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <video
          src={resource.contentPath}
          title={resource.title}
          className="w-full"
          controls
          preload="metadata"
        />
      </div>
    )
  }

  // Fallback for unsupported content
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
      <svg
        className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Content Not Available
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This resource's content could not be loaded.
      </p>
    </div>
  )
}
