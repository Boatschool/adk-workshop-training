/**
 * Announcement Form Component
 * Modal form for creating/editing announcements (What's New section)
 */

import { useState, useEffect } from 'react'
import { Button } from '@components/common'
import { cn } from '@utils/cn'
import type { Announcement, CreateAnnouncementData, UpdateAnnouncementData } from '@services/announcements'

// Discriminated union for form props based on mode
type AnnouncementFormProps = {
  isOpen: boolean
  onClose: () => void
  isLoading?: boolean
} & (
  | {
      mode: 'create'
      onSubmit: (data: CreateAnnouncementData) => Promise<void>
      announcement?: undefined
    }
  | {
      mode: 'edit'
      onSubmit: (data: UpdateAnnouncementData) => Promise<void>
      announcement: Announcement
    }
)

const announcementTypes = [
  { value: 'general', label: 'General' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'guide', label: 'Guide' },
  { value: 'library', label: 'Library Resource' },
  { value: 'news', label: 'News' },
  { value: 'feature', label: 'New Feature' },
]

const badgeColors = [
  { value: 'blue', label: 'Blue', preview: 'bg-blue-100 text-blue-700' },
  { value: 'green', label: 'Green', preview: 'bg-green-100 text-green-700' },
  { value: 'amber', label: 'Amber', preview: 'bg-amber-100 text-amber-700' },
  { value: 'red', label: 'Red', preview: 'bg-red-100 text-red-700' },
  { value: 'purple', label: 'Purple', preview: 'bg-purple-100 text-purple-700' },
]

export function AnnouncementForm({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  announcement,
  mode,
}: AnnouncementFormProps) {
  // Initialize form state based on mode and announcement
  const getInitialTitle = () => announcement && mode === 'edit' ? announcement.title : ''
  const getInitialDescription = () => announcement && mode === 'edit' ? announcement.description : ''
  const getInitialType = (): string => announcement && mode === 'edit' ? announcement.announcementType : 'general'
  const getInitialLinkUrl = () => announcement && mode === 'edit' ? (announcement.linkUrl || '') : ''
  const getInitialBadgeText = () => announcement && mode === 'edit' ? (announcement.badgeText || '') : ''
  const getInitialBadgeColor = (): string => announcement && mode === 'edit' ? announcement.badgeColor : 'blue'
  const getInitialDisplayOrder = () => announcement && mode === 'edit' ? announcement.displayOrder : 0
  const getInitialIsActive = () => announcement && mode === 'edit' ? announcement.isActive : true

  const [title, setTitle] = useState(getInitialTitle)
  const [description, setDescription] = useState(getInitialDescription)
  const [announcementType, setAnnouncementType] = useState<string>(getInitialType)
  const [linkUrl, setLinkUrl] = useState(getInitialLinkUrl)
  const [badgeText, setBadgeText] = useState(getInitialBadgeText)
  const [badgeColor, setBadgeColor] = useState<string>(getInitialBadgeColor)
  const [displayOrder, setDisplayOrder] = useState(getInitialDisplayOrder)
  const [isActive, setIsActive] = useState(getInitialIsActive)

  // Reset form when announcement changes (for edit mode with different announcements)
  // Using key prop on parent ensures remount, but this handles edge cases
  useEffect(() => {
    if (announcement && mode === 'edit') {
      setTitle(announcement.title)
      setDescription(announcement.description)
      setAnnouncementType(announcement.announcementType)
      setLinkUrl(announcement.linkUrl || '')
      setBadgeText(announcement.badgeText || '')
      setBadgeColor(announcement.badgeColor)
      setDisplayOrder(announcement.displayOrder)
      setIsActive(announcement.isActive)
    }
    // Only run when announcement.id changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcement?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const formData = {
      title,
      description,
      announcementType,
      linkUrl: linkUrl || null,
      badgeText: badgeText || null,
      badgeColor,
      displayOrder,
      isActive,
    }

    // Type assertion based on mode - both types have the same shape
    if (mode === 'create') {
      await onSubmit(formData as CreateAnnouncementData)
    } else {
      await onSubmit(formData as UpdateAnnouncementData)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Add Announcement' : 'Edit Announcement'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={255}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter announcement title"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description (shown on dashboard)"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {description.length}/500 characters
              </p>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={announcementType}
                onChange={(e) => setAnnouncementType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {announcementTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Link URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Link URL
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="/workshops or https://..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Internal path (e.g., /workshops) or external URL
              </p>
            </div>

            {/* Badge Text & Color - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="NEW, UPDATED, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Badge Color
                </label>
                <select
                  value={badgeColor}
                  onChange={(e) => setBadgeColor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {badgeColors.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Badge Preview */}
            {badgeText && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Preview:</span>
                <span className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded',
                  badgeColors.find(c => c.value === badgeColor)?.preview || 'bg-blue-100 text-blue-700'
                )}>
                  {badgeText}
                </span>
              </div>
            )}

            {/* Display Order & Active - side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Lower = higher priority
                </p>
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !title || !description}
              >
                {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
