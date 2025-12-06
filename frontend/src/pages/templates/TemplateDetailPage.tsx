/**
 * TemplateDetailPage
 * View template details, download, or copy YAML
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getTemplate,
  downloadTemplate,
  toggleTemplateBookmark,
  downloadYamlFile,
  copyToClipboard,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from '@/services/templates'
import type { AgentTemplateWithUserData } from '@/types/models'

// Inline SVG icons
const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const CopyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const BookmarkIcon = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
)

const LoaderIcon = ({ className }: { className?: string }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
)

const WrenchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [template, setTemplate] = useState<AgentTemplateWithUserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isBookmarking, setIsBookmarking] = useState(false)

  useEffect(() => {
    async function fetchTemplate() {
      if (!id) return
      setIsLoading(true)
      setError(null)
      try {
        const data = await getTemplate(id)
        setTemplate(data)
      } catch (err) {
        setError('Template not found or access denied.')
        console.error('Error fetching template:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTemplate()
  }, [id])

  const handleDownload = async () => {
    if (!id || !template) return
    setIsDownloading(true)
    try {
      const response = await downloadTemplate(id)
      downloadYamlFile(response.content, response.filename)
      // Update local download count
      setTemplate((prev) =>
        prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : prev
      )
    } catch (err) {
      console.error('Error downloading template:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopyToClipboard = async () => {
    if (!template) return
    const success = await copyToClipboard(template.yamlContent)
    if (success) {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleBookmarkToggle = async () => {
    if (!id || !template) return
    setIsBookmarking(true)
    try {
      const result = await toggleTemplateBookmark(id)
      setTemplate((prev) => (prev ? { ...prev, isBookmarked: result.isBookmarked } : prev))
    } catch (err) {
      console.error('Error toggling bookmark:', err)
    } finally {
      setIsBookmarking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoaderIcon className="w-8 h-8 text-blue-600" />
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-700 dark:text-red-300 mb-4">{error || 'Template not found'}</p>
          <button
            onClick={() => navigate('/templates')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Back to Templates
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link
        to="/templates"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Templates
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{template.name}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span>by {template.authorName}</span>
            <span>-</span>
            <span className="text-blue-600 dark:text-blue-400">{CATEGORY_LABELS[template.category]}</span>
            <span>-</span>
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_COLORS[template.difficulty]}`}
            >
              {DIFFICULTY_LABELS[template.difficulty]}
            </span>
          </div>
        </div>
        <button
          onClick={handleBookmarkToggle}
          disabled={isBookmarking}
          className={`p-2 rounded-lg border transition-colors ${
            template.isBookmarked
              ? 'border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          }`}
          aria-label={template.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <BookmarkIcon className="w-5 h-5" filled={template.isBookmarked} />
        </button>
      </div>

      {/* Description */}
      <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
        <p className="text-gray-700 dark:text-gray-300">{template.description}</p>
        {template.useCase && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Use Case</h3>
            <p className="text-gray-600 dark:text-gray-400">{template.useCase}</p>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
        {template.model && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <span className="font-medium">Model:</span>
            <span>{template.model}</span>
          </div>
        )}
        {template.hasTools && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <WrenchIcon className="w-4 h-4" />
            <span>Uses tools</span>
          </div>
        )}
        {template.hasSubAgents && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <UsersIcon className="w-4 h-4" />
            <span>Multi-agent</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <DownloadIcon className="w-4 h-4" />
          <span>{template.downloadCount.toLocaleString()} downloads</span>
        </div>
      </div>

      {/* Tags */}
      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* YAML Content */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Agent Configuration</h2>
        </div>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
            <code>{template.yamlContent}</code>
          </pre>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isDownloading ? (
            <LoaderIcon className="w-4 h-4" />
          ) : (
            <DownloadIcon className="w-4 h-4" />
          )}
          Download YAML
        </button>
        <button
          onClick={handleCopyToClipboard}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {isCopied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <CopyIcon className="w-4 h-4" />
              Copy to Clipboard
            </>
          )}
        </button>
      </div>

      {/* Setup instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Setup Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-300">
          <li>Download or copy the YAML content above</li>
          <li>
            Save the file to your <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">agents/</code>{' '}
            folder as <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">{template.name.toLowerCase().replace(/\s+/g, '_')}/root_agent.yaml</code>
          </li>
          <li>Restart the Visual Builder or click refresh</li>
          <li>Select the agent from the dropdown menu</li>
        </ol>
      </div>
    </div>
  )
}
