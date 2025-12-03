/**
 * Admin Library Tab
 * Library resource management content for the admin console
 * Extracted from AdminLibraryPage for use in tabbed interface
 */

import { useState, useCallback, useMemo } from 'react'
import { useLibraryResources } from '@hooks/useLibrary'
import {
  useCreateLibraryResource,
  useUpdateLibraryResource,
  useDeleteLibraryResource,
} from '@hooks/useAdminLibrary'
import {
  DataTable,
  type Column,
  ConfirmModal,
  BulkActionsBar,
  SearchInput,
  StatusBadge,
  LibraryResourceForm,
} from '@components/admin'
import { Button } from '@components/common'
import { formatDate } from '@utils/format'
import type { LibraryResourceWithUserData, LibraryResourceType, LibraryDifficulty } from '@/types'
import { showToast } from '@stores/uiStore'
import type { CreateLibraryResourceData, UpdateLibraryResourceData } from '@services/library'

type SortDirection = 'asc' | 'desc'

// Helper to get difficulty color
function getDifficultyVariant(difficulty: LibraryDifficulty): 'success' | 'warning' | 'error' {
  switch (difficulty) {
    case 'beginner':
      return 'success'
    case 'intermediate':
      return 'warning'
    case 'advanced':
      return 'error'
    default:
      return 'success'
  }
}

// Helper to get type icon
function getTypeIcon(type: LibraryResourceType) {
  switch (type) {
    case 'article':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case 'video':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'pdf':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    case 'tool':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'course':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'documentation':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    default:
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
  }
}

export function AdminLibraryTab() {
  // Filters & pagination
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<LibraryResourceType | ''>('')
  const [difficultyFilter, setDifficultyFilter] = useState<LibraryDifficulty | ''>('')
  const [featuredFilter, setFeaturedFilter] = useState<boolean | undefined>(undefined)
  const [sortColumn, setSortColumn] = useState<string>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<LibraryResourceWithUserData | null>(null)
  const [deletingResources, setDeletingResources] = useState<string[]>([])

  // Queries & mutations
  const { data: resources = [], isLoading, refetch } = useLibraryResources({
    search: search || undefined,
    type: typeFilter || undefined,
    difficulty: difficultyFilter || undefined,
    featured: featuredFilter,
  })
  const createResource = useCreateLibraryResource()
  const updateResource = useUpdateLibraryResource()
  const deleteResource = useDeleteLibraryResource()

  // Sort resources
  const sortedResources = useMemo(() => {
    return [...resources].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortColumn]
      const bVal = (b as unknown as Record<string, unknown>)[sortColumn]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = String(aVal).localeCompare(String(bVal))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [resources, sortColumn, sortDirection])

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }, [sortColumn])

  // Table columns
  const columns: Column<LibraryResourceWithUserData>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        sortable: true,
        render: (resource) => (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-gray-400">
              {getTypeIcon(resource.type)}
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {resource.title}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {resource.description.slice(0, 60)}...
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        width: '120px',
        render: (resource) => (
          <span className="capitalize text-gray-700 dark:text-gray-300">
            {resource.type}
          </span>
        ),
      },
      {
        key: 'source',
        header: 'Source',
        sortable: true,
        width: '100px',
        render: (resource) => (
          <span className={`inline-flex items-center gap-1 text-sm ${
            resource.source === 'external'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-green-600 dark:text-green-400'
          }`}>
            {resource.source === 'external' ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                External
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                Embedded
              </>
            )}
          </span>
        ),
      },
      {
        key: 'difficulty',
        header: 'Difficulty',
        sortable: true,
        width: '120px',
        render: (resource) => (
          <StatusBadge
            label={resource.difficulty}
            variant={getDifficultyVariant(resource.difficulty)}
          />
        ),
      },
      {
        key: 'featured',
        header: 'Featured',
        sortable: true,
        width: '100px',
        render: (resource) => (
          resource.featured ? (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Yes
            </span>
          ) : (
            <span className="text-gray-400">No</span>
          )
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        width: '120px',
        render: (resource) => (
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {formatDate(resource.createdAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: '80px',
        render: (resource) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingResource(resource)}
              className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
              title="Edit resource"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setDeletingResources([resource.id])}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete resource"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ),
      },
    ],
    []
  )

  // Bulk actions
  const bulkActions = useMemo(
    () => [
      {
        label: 'Feature',
        onClick: async () => {
          const promises = Array.from(selectedIds).map((id) =>
            updateResource.mutateAsync({ id, data: { featured: true } })
          )
          try {
            await Promise.all(promises)
            showToast(`${selectedIds.size} resource(s) featured`, 'success')
            setSelectedIds(new Set())
          } catch {
            showToast('Failed to feature resources', 'error')
          }
        },
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ),
      },
      {
        label: 'Unfeature',
        onClick: async () => {
          const promises = Array.from(selectedIds).map((id) =>
            updateResource.mutateAsync({ id, data: { featured: false } })
          )
          try {
            await Promise.all(promises)
            showToast(`${selectedIds.size} resource(s) unfeatured`, 'success')
            setSelectedIds(new Set())
          } catch {
            showToast('Failed to unfeature resources', 'error')
          }
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ),
      },
      {
        label: 'Delete',
        onClick: () => setDeletingResources(Array.from(selectedIds)),
        variant: 'danger' as const,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
      },
    ],
    [selectedIds, updateResource]
  )

  const handleCreate = async (data: CreateLibraryResourceData | UpdateLibraryResourceData) => {
    await createResource.mutateAsync(data as CreateLibraryResourceData)
    showToast('Resource created successfully', 'success')
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: CreateLibraryResourceData | UpdateLibraryResourceData) => {
    if (!editingResource) return
    await updateResource.mutateAsync({ id: editingResource.id, data: data as UpdateLibraryResourceData })
    showToast('Resource updated successfully', 'success')
    setEditingResource(null)
  }

  const handleDelete = async () => {
    const promises = deletingResources.map((id) => deleteResource.mutateAsync(id))
    try {
      await Promise.all(promises)
      showToast(`${deletingResources.length} resource(s) deleted`, 'success')
      setDeletingResources([])
      setSelectedIds(new Set())
    } catch {
      showToast('Failed to delete resources', 'error')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Library Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage learning resources in the library
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Resource
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search resources..."
          className="w-64"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as LibraryResourceType | '')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Types</option>
          <option value="article">Article</option>
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="tool">Tool</option>
          <option value="course">Course</option>
          <option value="documentation">Documentation</option>
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value as LibraryDifficulty | '')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Difficulties</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select
          value={featuredFilter === undefined ? 'all' : featuredFilter ? 'featured' : 'not_featured'}
          onChange={(e) => {
            const val = e.target.value
            setFeaturedFilter(val === 'all' ? undefined : val === 'featured')
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Resources</option>
          <option value="featured">Featured Only</option>
          <option value="not_featured">Not Featured</option>
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
        data={sortedResources}
        columns={columns}
        keyExtractor={(resource) => resource.id}
        isLoading={isLoading}
        emptyMessage="No library resources found"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Create Resource Modal */}
      <LibraryResourceForm
        key="create-form"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={createResource.isPending}
        mode="create"
      />

      {/* Edit Resource Modal - key forces remount when editing different resources */}
      {editingResource && (
        <LibraryResourceForm
          key={`edit-${editingResource.id}`}
          isOpen={!!editingResource}
          onClose={() => setEditingResource(null)}
          onSubmit={handleUpdate}
          isLoading={updateResource.isPending}
          resource={editingResource}
          mode="edit"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deletingResources.length > 0}
        onClose={() => setDeletingResources([])}
        onConfirm={handleDelete}
        title="Delete Resources"
        message={`Are you sure you want to delete ${deletingResources.length} resource(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteResource.isPending}
      />
    </div>
  )
}
