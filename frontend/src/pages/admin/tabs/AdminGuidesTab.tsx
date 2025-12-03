/**
 * Admin Guides Tab
 * Guide management content for the admin console
 * Extracted from AdminGuidesPage for use in tabbed interface
 */

import { useState, useCallback, useMemo } from 'react'
import {
  useGuides,
  useCreateGuide,
  useUpdateGuide,
  useDeleteGuide,
} from '@hooks/useGuides'
import {
  DataTable,
  type Column,
  ConfirmModal,
  BulkActionsBar,
  SearchInput,
  StatusBadge,
  GuideForm,
} from '@components/admin'
import { Button } from '@components/common'
import { formatDate } from '@utils/format'
import type { GuideListItem, Guide, GuideIcon } from '@/types'
import { showToast } from '@stores/uiStore'
import type { CreateGuideData, UpdateGuideData } from '@services/guides'
import { getGuideBySlug } from '@services/guides'

type SortDirection = 'asc' | 'desc'

// Helper to get icon component
function getIconComponent(icon: GuideIcon) {
  switch (icon) {
    case 'book':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'rocket':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      )
    case 'terminal':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
        </svg>
      )
    case 'wrench':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
        </svg>
      )
    case 'play':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
      )
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
  }
}

export function AdminGuidesTab() {
  // Filters
  const [search, setSearch] = useState('')
  const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>(undefined)
  const [sortColumn, setSortColumn] = useState<string>('displayOrder')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null)
  const [deletingGuides, setDeletingGuides] = useState<string[]>([])
  const [loadingEditGuide, setLoadingEditGuide] = useState(false)

  // Queries & mutations - fetch all guides for admin (including unpublished)
  const { data: guides = [], isLoading, refetch } = useGuides(false)
  const createGuide = useCreateGuide()
  const updateGuide = useUpdateGuide()
  const deleteGuide = useDeleteGuide()

  // Filter and sort guides
  const filteredGuides = useMemo(() => {
    let result = [...guides]

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (guide) =>
          guide.title.toLowerCase().includes(searchLower) ||
          guide.slug.toLowerCase().includes(searchLower) ||
          guide.description.toLowerCase().includes(searchLower)
      )
    }

    // Filter by published status
    if (publishedFilter !== undefined) {
      result = result.filter((guide) => guide.published === publishedFilter)
    }

    // Sort
    result.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortColumn]
      const bVal = (b as unknown as Record<string, unknown>)[sortColumn]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      let comparison: number
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [guides, search, publishedFilter, sortColumn, sortDirection])

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }, [sortColumn])

  // Handle edit - need to fetch full guide with content
  const handleEdit = async (guide: GuideListItem) => {
    setLoadingEditGuide(true)
    try {
      const fullGuide = await getGuideBySlug(guide.slug)
      setEditingGuide(fullGuide)
    } catch {
      showToast('Failed to load guide for editing', 'error')
    } finally {
      setLoadingEditGuide(false)
    }
  }

  // Table columns
  const columns: Column<GuideListItem>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        sortable: true,
        render: (guide) => (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-gray-400">
              {getIconComponent(guide.icon)}
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {guide.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                /{guide.slug}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'description',
        header: 'Description',
        render: (guide) => (
          <span className="text-gray-600 dark:text-gray-400 text-sm truncate max-w-xs block">
            {guide.description.slice(0, 80)}...
          </span>
        ),
      },
      {
        key: 'displayOrder',
        header: 'Order',
        sortable: true,
        width: '80px',
        render: (guide) => (
          <span className="text-gray-600 dark:text-gray-400">
            {guide.displayOrder}
          </span>
        ),
      },
      {
        key: 'published',
        header: 'Status',
        sortable: true,
        width: '120px',
        render: (guide) => (
          <StatusBadge
            label={guide.published ? 'Published' : 'Draft'}
            variant={guide.published ? 'success' : 'warning'}
          />
        ),
      },
      {
        key: 'updatedAt',
        header: 'Updated',
        sortable: true,
        width: '120px',
        render: (guide) => (
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {formatDate(guide.updatedAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: '80px',
        render: (guide) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => handleEdit(guide)}
              disabled={loadingEditGuide}
              className="p-1 text-gray-400 hover:text-primary-500 transition-colors disabled:opacity-50"
              title="Edit guide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setDeletingGuides([guide.slug])}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete guide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ),
      },
    ],
    [loadingEditGuide]
  )

  // Bulk actions
  const bulkActions = useMemo(
    () => [
      {
        label: 'Publish',
        onClick: async () => {
          // Get slugs from selected IDs
          const slugs = guides
            .filter((g) => selectedIds.has(g.id))
            .map((g) => g.slug)
          const promises = slugs.map((slug) =>
            updateGuide.mutateAsync({ slug, data: { published: true } })
          )
          try {
            await Promise.all(promises)
            showToast(`${slugs.length} guide(s) published`, 'success')
            setSelectedIds(new Set())
          } catch {
            showToast('Failed to publish guides', 'error')
          }
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      },
      {
        label: 'Unpublish',
        onClick: async () => {
          const slugs = guides
            .filter((g) => selectedIds.has(g.id))
            .map((g) => g.slug)
          const promises = slugs.map((slug) =>
            updateGuide.mutateAsync({ slug, data: { published: false } })
          )
          try {
            await Promise.all(promises)
            showToast(`${slugs.length} guide(s) unpublished`, 'success')
            setSelectedIds(new Set())
          } catch {
            showToast('Failed to unpublish guides', 'error')
          }
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ),
      },
      {
        label: 'Delete',
        onClick: () => {
          const slugs = guides
            .filter((g) => selectedIds.has(g.id))
            .map((g) => g.slug)
          setDeletingGuides(slugs)
        },
        variant: 'danger' as const,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
      },
    ],
    [selectedIds, guides, updateGuide]
  )

  const handleCreate = async (data: CreateGuideData | UpdateGuideData) => {
    await createGuide.mutateAsync(data as CreateGuideData)
    showToast('Guide created successfully', 'success')
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: CreateGuideData | UpdateGuideData) => {
    if (!editingGuide) return
    await updateGuide.mutateAsync({ slug: editingGuide.slug, data: data as UpdateGuideData })
    showToast('Guide updated successfully', 'success')
    setEditingGuide(null)
  }

  const handleDelete = async () => {
    const promises = deletingGuides.map((slug) => deleteGuide.mutateAsync(slug))
    try {
      await Promise.all(promises)
      showToast(`${deletingGuides.length} guide(s) deleted`, 'success')
      setDeletingGuides([])
      setSelectedIds(new Set())
    } catch {
      showToast('Failed to delete guides', 'error')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Guides Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage documentation and guides
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Guide
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search guides..."
          className="w-64"
        />
        <select
          value={publishedFilter === undefined ? 'all' : publishedFilter ? 'published' : 'draft'}
          onChange={(e) => {
            const val = e.target.value
            setPublishedFilter(val === 'all' ? undefined : val === 'published')
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button
          onClick={() => refetch()}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        actions={bulkActions}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Data Table */}
      <DataTable
        data={filteredGuides}
        columns={columns}
        keyExtractor={(guide) => guide.id}
        isLoading={isLoading}
        emptyMessage="No guides found"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Create Guide Modal */}
      <GuideForm
        key="create-form"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={createGuide.isPending}
        mode="create"
      />

      {/* Edit Guide Modal - key forces remount when editing different guides */}
      {editingGuide && (
        <GuideForm
          key={`edit-${editingGuide.slug}`}
          isOpen={!!editingGuide}
          onClose={() => setEditingGuide(null)}
          onSubmit={handleUpdate}
          isLoading={updateGuide.isPending}
          guide={editingGuide}
          mode="edit"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deletingGuides.length > 0}
        onClose={() => setDeletingGuides([])}
        onConfirm={handleDelete}
        title="Delete Guides"
        message={`Are you sure you want to delete ${deletingGuides.length} guide(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteGuide.isPending}
      />
    </div>
  )
}
