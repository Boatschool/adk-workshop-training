/**
 * Library Resource Form Component
 * Form for creating and editing library resources
 */

import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from '@components/common'
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

const SOURCE_TYPES: { value: LibraryResourceSource; label: string }[] = [
  { value: 'external', label: 'External Link' },
  { value: 'embedded', label: 'Embedded Content' },
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
  topics: LibraryTopic[]
  difficulty: LibraryDifficulty
  author: string
  estimatedMinutes: string
  thumbnailUrl: string
  featured: boolean
}

const DEFAULT_FORM_STATE: FormState = {
  title: '',
  description: '',
  resourceType: 'article',
  source: 'external',
  externalUrl: '',
  contentHtml: '',
  topics: [],
  difficulty: 'beginner',
  author: '',
  estimatedMinutes: '',
  thumbnailUrl: '',
  featured: false,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data: CreateLibraryResourceData = {
      title: form.title,
      description: form.description,
      resource_type: form.resourceType,
      source: form.source,
      external_url: form.source === 'external' ? form.externalUrl : undefined,
      content_html: form.source === 'embedded' ? form.contentHtml : undefined,
      topics: form.topics,
      difficulty: form.difficulty,
      author: form.author || undefined,
      estimated_minutes: form.estimatedMinutes ? parseInt(form.estimatedMinutes, 10) : undefined,
      thumbnail_url: form.thumbnailUrl || undefined,
      featured: form.featured,
    }

    await onSubmit(data)
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
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
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
              onChange={(e) => updateField('resourceType', e.target.value as LibraryResourceType)}
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
              onChange={(e) => updateField('source', e.target.value as LibraryResourceSource)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {SOURCE_TYPES.map((s) => (
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
