/**
 * Resource Viewer Component
 * Renders different types of embedded content (markdown, PDF, video)
 */

import { useMemo, useState, useEffect } from 'react'
import { marked } from 'marked'
import { MarkdownRenderer } from '@components/exercise/MarkdownRenderer'
import { getResourceDownloadUrl } from '@services/library'
import type { LibraryResource } from '@/types/models'

interface ResourceViewerProps {
  resource: LibraryResource
}

// Configure marked for safe rendering
marked.setOptions({
  gfm: true,
  breaks: true,
})

// Inline SVG icons
const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

const FileIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

/**
 * Component for viewing uploaded PDF files
 */
function UploadedPdfViewer({ resource }: { resource: LibraryResource }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPdfUrl() {
      try {
        setLoading(true)
        setError(null)
        const response = await getResourceDownloadUrl(resource.id)
        setPdfUrl(response.downloadUrl)
      } catch (err) {
        console.error('Failed to get PDF URL:', err)
        setError('Failed to load PDF. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchPdfUrl()
  }, [resource.id])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <SpinnerIcon className="w-8 h-8 mx-auto text-primary-500 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
      </div>
    )
  }

  if (error || !pdfUrl) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <FileIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {error || 'PDF Not Available'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Unable to display this PDF in the browser.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <ExternalLinkIcon className="w-4 h-4" />
          Open in New Tab
        </a>
        <a
          href={pdfUrl}
          download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <DownloadIcon className="w-4 h-4" />
          Download
        </a>
      </div>

      {/* PDF iframe */}
      <iframe
        src={pdfUrl}
        title={resource.title}
        className="w-full h-[700px]"
        loading="lazy"
      />
    </div>
  )
}

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

  // Handle uploaded PDF content (source === 'uploaded')
  if (resource.source === 'uploaded' && resource.contentPath) {
    return <UploadedPdfViewer resource={resource} />
  }

  // Handle PDF content with direct URL (legacy or external PDF)
  if (resource.type === 'pdf' && resource.contentPath && !resource.contentPath.startsWith('library/')) {
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
