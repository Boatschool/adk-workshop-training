/**
 * Guide Form Component
 * Form for creating and editing guides
 */

import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from '@components/common'
import type { Guide, GuideIcon } from '@/types/models'
import type { CreateGuideData, UpdateGuideData } from '@services/guides'

const ICONS: { value: GuideIcon; label: string; icon: React.ReactNode }[] = [
  {
    value: 'book',
    label: 'Book',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    value: 'rocket',
    label: 'Rocket',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  },
  {
    value: 'terminal',
    label: 'Terminal',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    value: 'wrench',
    label: 'Wrench',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
      </svg>
    ),
  },
  {
    value: 'play',
    label: 'Play',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
  },
]

interface FormState {
  slug: string
  title: string
  description: string
  contentHtml: string
  icon: GuideIcon
  displayOrder: string
  published: boolean
}

const DEFAULT_FORM_STATE: FormState = {
  slug: '',
  title: '',
  description: '',
  contentHtml: '',
  icon: 'book',
  displayOrder: '0',
  published: true,
}

function getInitialState(mode: 'create' | 'edit', guide?: Guide | null): FormState {
  if (mode === 'edit' && guide) {
    return {
      slug: guide.slug,
      title: guide.title,
      description: guide.description,
      contentHtml: guide.contentHtml,
      icon: guide.icon,
      displayOrder: guide.displayOrder.toString(),
      published: guide.published,
    }
  }
  return { ...DEFAULT_FORM_STATE }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

interface GuideFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateGuideData | UpdateGuideData) => Promise<void>
  isLoading: boolean
  guide?: Guide | null
  mode: 'create' | 'edit'
}

export function GuideForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  guide,
  mode,
}: GuideFormProps) {
  // Form state initialized from props - parent should use key prop to reset
  const [form, setForm] = useState<FormState>(() => getInitialState(mode, guide))

  // Helper to update individual form fields
  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // Auto-generate slug from title when creating
  const handleTitleChange = (title: string) => {
    updateField('title', title)
    if (mode === 'create') {
      updateField('slug', generateSlug(title))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data: CreateGuideData = {
      slug: form.slug,
      title: form.title,
      description: form.description,
      content_html: form.contentHtml,
      icon: form.icon,
      display_order: form.displayOrder ? parseInt(form.displayOrder, 10) : 0,
      published: form.published,
    }

    await onSubmit(data)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Guide' : 'Edit Guide'}
      description={mode === 'create' ? 'Add a new guide to the documentation' : 'Update guide details'}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            {mode === 'create' ? 'Create Guide' : 'Save Changes'}
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
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Getting Started"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Slug *
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            required
            pattern="[a-z0-9-]+"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            placeholder="e.g., getting-started"
          />
          <p className="mt-1 text-xs text-gray-500">
            URL-friendly identifier. Use lowercase letters, numbers, and hyphens.
          </p>
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
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="A brief description of this guide..."
          />
        </div>

        {/* Icon and Display Order Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon *
            </label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((iconOption) => (
                <button
                  key={iconOption.value}
                  type="button"
                  onClick={() => updateField('icon', iconOption.value)}
                  className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${
                    form.icon === iconOption.value
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-500'
                  }`}
                  title={iconOption.label}
                >
                  {iconOption.icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Order
            </label>
            <input
              type="number"
              value={form.displayOrder}
              onChange={(e) => updateField('displayOrder', e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lower numbers appear first.
            </p>
          </div>
        </div>

        {/* Content HTML */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Content (HTML) *
          </label>
          <textarea
            value={form.contentHtml}
            onChange={(e) => updateField('contentHtml', e.target.value)}
            required
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            placeholder="<h2>Your content here...</h2>"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter HTML content that will be rendered for this guide.
          </p>
        </div>

        {/* Published Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={form.published}
            onChange={(e) => updateField('published', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label
            htmlFor="published"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Published (visible to users)
          </label>
        </div>
      </form>
    </Modal>
  )
}
