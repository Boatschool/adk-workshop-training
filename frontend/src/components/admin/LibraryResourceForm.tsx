/**
 * Library Resource Form Component
 * Form for creating and editing library resources
 */

import { useState, useCallback } from 'react'
import { Modal } from './Modal'
import { FileUpload } from './FileUpload'
import { Button } from '@components/common'
import { uploadLibraryDocument } from '@services/library'
import type { LibraryResourceWithUserData, LibraryResourceType, LibraryResourceSource, LibraryTopic, LibraryDifficulty } from '@/types/models'
import type { CreateLibraryResourceData, UpdateLibraryResourceData } from '@services/library'

const RESOURCE_TYPES: { value: LibraryResourceType; label: string }[] = [
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'pdf', label: 'PDF' },
  { value: 'tool', label: 'Tool' },
  { value: 'course', label: 'Course' },
  { value: 'documentation', label: 'Documentation' },
]

const SOURCE_TYPES: { value: LibraryResourceSource; label: string; description: string }[] = [
  { value: 'external', label: 'External Link', description: 'Link to an external resource' },
  { value: 'embedded', label: 'Embedded Content', description: 'HTML/Markdown content' },
  { value: 'uploaded', label: 'Upload File', description: 'Upload a PDF document' },
]

const TOPICS: { value: LibraryTopic; label: string }[] = [
  { value: 'agent-fundamentals', label: 'Agent Fundamentals' },
  { value: 'prompt-engineering', label: 'Prompt Engineering' },
  { value: 'multi-agent-systems', label: 'Multi-Agent Systems' },
  { value: 'tools-integrations', label: 'Tools & Integrations' },
  { value: 'deployment', label: 'Deployment' },
  { value: 'best-practices', label: 'Best Practices' },
]

const DIFFICULTIES: { value: LibraryDifficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

interface FormState {
  title: string
  description: string
  resourceType: LibraryResourceType
  source: LibraryResourceSource
  externalUrl: string
  contentHtml: string
  contentPath: string
  topics: LibraryTopic[]
  difficulty: LibraryDifficulty
  author: string
  estimatedMinutes: string
  thumbnailUrl: string
  featured: boolean
}

interface UploadState {
  isUploading: boolean
  progress: number
  uploadedFile: { filePath: string; fileName: string } | null
  error: string | null
}

const DEFAULT_FORM_STATE: FormState = {
  title: '',
  description: '',
  resourceType: 'article',
  source: 'external',
  externalUrl: '',
  contentHtml: '',
  contentPath: '',
  topics: [],
  difficulty: 'beginner',
  author: '',
  estimatedMinutes: '',
  thumbnailUrl: '',
  featured: false,
}

const DEFAULT_UPLOAD_STATE: UploadState = {
  isUploading: false,
  progress: 0,
  uploadedFile: null,
  error: null,
}

function getInitialState(mode: 'create' | 'edit', resource?: LibraryResourceWithUserData | null): FormState {
  if (mode === 'edit' && resource) {
    return {
      title: resource.title,
      description: resource.description,
      resourceType: resource.type,
      source: resource.source,
      externalUrl: resource.externalUrl || '',
      contentHtml: resource.contentHtml || '',
      contentPath: resource.contentPath || '',
      topics: [...resource.topics],
      difficulty: resource.difficulty,
      author: resource.author || '',
      estimatedMinutes: resource.estimatedMinutes?.toString() || '',
      thumbnailUrl: resource.thumbnailUrl || '',
      featured: resource.featured || false,
    }
  }
  return { ...DEFAULT_FORM_STATE, topics: [] }
}

function getInitialUploadState(mode: 'create' | 'edit', resource?: LibraryResourceWithUserData | null): UploadState {
  if (mode === 'edit' && resource && resource.source === 'uploaded' && resource.contentPath) {
    // Extract filename from path
    const pathParts = resource.contentPath.split('/')
    let fileName = pathParts[pathParts.length - 1]
    // Remove unique prefix if present
    if (fileName.length > 13 && fileName[12] === '_') {
      fileName = fileName.substring(13)
    }
    return {
      ...DEFAULT_UPLOAD_STATE,
      uploadedFile: { filePath: resource.contentPath, fileName },
    }
  }
  return { ...DEFAULT_UPLOAD_STATE }
}

interface LibraryResourceFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateLibraryResourceData | UpdateLibraryResourceData) => Promise<void>
  isLoading: boolean
  resource?: LibraryResourceWithUserData | null
  mode: 'create' | 'edit'
}

export function LibraryResourceForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  resource,
  mode,
}: LibraryResourceFormProps) {
  // Form state initialized from props - parent should use key prop to reset
  const [form, setForm] = useState<FormState>(() => getInitialState(mode, resource))
  const [upload, setUpload] = useState<UploadState>(() => getInitialUploadState(mode, resource))

  // Helper to update individual form fields
  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleTopicToggle = (topic: LibraryTopic) => {
    setForm(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }))
  }

  // Handle source change - reset source-specific fields
  const handleSourceChange = (newSource: LibraryResourceSource) => {
    updateField('source', newSource)
    // Clear upload state when switching away from uploaded
    if (newSource !== 'uploaded') {
      setUpload(DEFAULT_UPLOAD_STATE)
      updateField('contentPath', '')
    }
    // Clear other source-specific fields
    if (newSource !== 'external') {
      updateField('externalUrl', '')
    }
    if (newSource !== 'embedded') {
      updateField('contentHtml', '')
    }
  }

  // Handle file selection and upload
  const handleFileSelect = useCallback(async (file: File) => {
    setUpload(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
    }))

    try {
      const result = await uploadLibraryDocument(file, (progress) => {
        setUpload(prev => ({ ...prev, progress }))
      })

      setUpload({
        isUploading: false,
        progress: 100,
        uploadedFile: { filePath: result.filePath, fileName: result.fileName },
        error: null,
      })

      // Update form with the file path
      updateField('contentPath', result.filePath)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUpload(prev => ({
        ...prev,
        isUploading: false,
        progress: 0,
        error: errorMessage,
      }))
    }
  }, [])

  // Handle clearing uploaded file
  const handleClearUpload = useCallback(() => {
    setUpload(DEFAULT_UPLOAD_STATE)
    updateField('contentPath', '')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data: CreateLibraryResourceData = {
      title: form.title,
      description: form.description,
      resource_type: form.resourceType,
      source: form.source,
      external_url: form.source === 'external' ? form.externalUrl : undefined,
      content_html: form.source === 'embedded' ? form.contentHtml : undefined,
      content_path: form.source === 'uploaded' ? form.contentPath : undefined,
      topics: form.topics,
      difficulty: form.difficulty,
      author: form.author || undefined,
      estimated_minutes: form.estimatedMinutes ? parseInt(form.estimatedMinutes, 10) : undefined,
      thumbnail_url: form.thumbnailUrl || undefined,
      featured: form.featured,
    }

    await onSubmit(data)
  }

  // Get available source types based on resource type
  const getAvailableSourceTypes = () => {
    // Only show "Upload File" option for PDF resource type
    if (form.resourceType === 'pdf') {
      return SOURCE_TYPES
    }
    // For other types, exclude upload option
    return SOURCE_TYPES.filter(s => s.value !== 'uploaded')
  }

  // When resource type changes, reset source if necessary
  const handleResourceTypeChange = (newType: LibraryResourceType) => {
    updateField('resourceType', newType)
    // If switching away from PDF and source is uploaded, reset to external
    if (newType !== 'pdf' && form.source === 'uploaded') {
      handleSourceChange('external')
    }
  }

  // Validation for submit button
  const isFormValid = () => {
    if (!form.title || !form.description) return false
    if (form.source === 'external' && !form.externalUrl) return false
    if (form.source === 'embedded' && !form.contentHtml) return false
    if (form.source === 'uploaded' && !form.contentPath) return false
    return true
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Library Resource' : 'Edit Library Resource'}
      description={mode === 'create' ? 'Add a new resource to the library' : 'Update resource details'}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading || upload.isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!isFormValid() || upload.isUploading}
          >
            {mode === 'create' ? 'Create Resource' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Introduction to AI Agents"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="A brief description of this resource..."
          />
        </div>

        {/* Type and Source Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resource Type *
            </label>
            <select
              value={form.resourceType}
              onChange={(e) => handleResourceTypeChange(e.target.value as LibraryResourceType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {RESOURCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Source *
            </label>
            <select
              value={form.source}
              onChange={(e) => handleSourceChange(e.target.value as LibraryResourceSource)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {getAvailableSourceTypes().map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* External URL (shown when source is external) */}
        {form.source === 'external' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              External URL *
            </label>
            <input
              type="url"
              value={form.externalUrl}
              onChange={(e) => updateField('externalUrl', e.target.value)}
              required={form.source === 'external'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://example.com/article"
            />
          </div>
        )}

        {/* Content HTML (shown when source is embedded) */}
        {form.source === 'embedded' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content (HTML) *
            </label>
            <textarea
              value={form.contentHtml}
              onChange={(e) => updateField('contentHtml', e.target.value)}
              required={form.source === 'embedded'}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              placeholder="<h1>Your content here...</h1>"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter HTML content that will be rendered for this resource.
            </p>
          </div>
        )}

        {/* File Upload (shown when source is uploaded) */}
        {form.source === 'uploaded' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PDF Document *
            </label>
            <FileUpload
              onFileSelect={handleFileSelect}
              onClear={handleClearUpload}
              uploadProgress={upload.progress}
              isUploading={upload.isUploading}
              uploadedFile={upload.uploadedFile}
              error={upload.error}
              accept="application/pdf"
              maxSizeMB={50}
              disabled={isLoading}
            />
          </div>
        )}

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Difficulty *
          </label>
          <select
            value={form.difficulty}
            onChange={(e) => updateField('difficulty', e.target.value as LibraryDifficulty)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {/* Topics */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Topics
          </label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((topic) => (
              <button
                key={topic.value}
                type="button"
                onClick={() => handleTopicToggle(topic.value)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  form.topics.includes(topic.value)
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-500'
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* Author and Estimated Time Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Author / Source
            </label>
            <input
              type="text"
              value={form.author}
              onChange={(e) => updateField('author', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Google, OpenAI"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              value={form.estimatedMinutes}
              onChange={(e) => updateField('estimatedMinutes', e.target.value)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., 15"
            />
          </div>
        </div>

        {/* Thumbnail URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Thumbnail URL
          </label>
          <input
            type="url"
            value={form.thumbnailUrl}
            onChange={(e) => updateField('thumbnailUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Featured Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={form.featured}
            onChange={(e) => updateField('featured', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="featured"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Feature this resource on the homepage
          </label>
        </div>
      </form>
    </Modal>
  )
}
