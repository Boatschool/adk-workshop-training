/**
 * Admin Templates Tab
 * Agent template management for the admin console
 * Includes approval workflow, CRUD operations, and featuring
 */

import { useState, useCallback, useMemo } from 'react'
import {
  useAdminTemplates,
  usePendingTemplates,
  useApproveTemplate,
  useRejectTemplate,
  useDeleteTemplate,
  useSetTemplateFeatured,
} from '@hooks/useAdminTemplates'
import {
  DataTable,
  type Column,
  ConfirmModal,
  BulkActionsBar,
  SearchInput,
  StatusBadge,
} from '@components/admin'
import { Button } from '@components/common'
import { formatDate } from '@utils/format'
import type { AgentTemplateDetail, TemplateStatus, TemplateCategory, TemplateDifficulty } from '@/types'
import { showToast } from '@stores/uiStore'
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from '@services/templates'

type SortDirection = 'asc' | 'desc'
type ViewMode = 'all' | 'pending'

// Helper to get status variant
function getStatusVariant(status: TemplateStatus): 'neutral' | 'info' | 'success' | 'error' {
  switch (status) {
    case 'draft':
      return 'neutral'
    case 'pending_review':
      return 'info'
    case 'approved':
      return 'success'
    case 'rejected':
      return 'error'
    default:
      return 'neutral'
  }
}

// Helper to get difficulty variant
function getDifficultyVariant(difficulty: TemplateDifficulty): 'success' | 'warning' | 'error' {
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

// Status labels
const STATUS_LABELS: Record<TemplateStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function AdminTemplatesTab() {
  // View mode (all templates or pending only)
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Filters & pagination
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | ''>('')
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | ''>('')
  const [difficultyFilter, setDifficultyFilter] = useState<TemplateDifficulty | ''>('')
  const [sortColumn, setSortColumn] = useState<string>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modals
  const [deletingTemplates, setDeletingTemplates] = useState<string[]>([])
  const [rejectingTemplate, setRejectingTemplate] = useState<AgentTemplateDetail | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // Queries & mutations
  const {
    data: allTemplates = [],
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useAdminTemplates({
    search: search || undefined,
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
  })

  const {
    data: pendingTemplates = [],
    isLoading: isLoadingPending,
    refetch: refetchPending,
  } = usePendingTemplates()

  const approveTemplate = useApproveTemplate()
  const rejectTemplate = useRejectTemplate()
  const deleteTemplate = useDeleteTemplate()
  const setFeatured = useSetTemplateFeatured()

  // Determine which templates to display
  const templates = viewMode === 'pending' ? pendingTemplates : allTemplates
  const isLoading = viewMode === 'pending' ? isLoadingPending : isLoadingAll
  const refetch = viewMode === 'pending' ? refetchPending : refetchAll

  // Sort templates
  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortColumn]
      const bVal = (b as unknown as Record<string, unknown>)[sortColumn]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = String(aVal).localeCompare(String(bVal))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [templates, sortColumn, sortDirection])

  const handleSort = useCallback(
    (column: string) => {
      if (sortColumn === column) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortColumn(column)
        setSortDirection('asc')
      }
    },
    [sortColumn]
  )

  // Action handlers (defined before columns so they can be used in render)
  const handleApprove = useCallback(async (id: string) => {
    try {
      await approveTemplate.mutateAsync(id)
      showToast('Template approved successfully', 'success')
    } catch {
      showToast('Failed to approve template', 'error')
    }
  }, [approveTemplate])

  const handleReject = useCallback(async () => {
    if (!rejectingTemplate) return
    try {
      await rejectTemplate.mutateAsync({ id: rejectingTemplate.id, reason: rejectReason })
      showToast('Template rejected', 'success')
      setRejectingTemplate(null)
      setRejectReason('')
    } catch {
      showToast('Failed to reject template', 'error')
    }
  }, [rejectingTemplate, rejectReason, rejectTemplate])

  const handleToggleFeatured = useCallback(async (template: AgentTemplateDetail) => {
    try {
      await setFeatured.mutateAsync({ id: template.id, featured: !template.featured })
      showToast(
        template.featured ? 'Removed from featured' : 'Added to featured',
        'success'
      )
    } catch {
      showToast('Failed to update featured status', 'error')
    }
  }, [setFeatured])

  const handleDelete = useCallback(async () => {
    const promises = deletingTemplates.map((id) => deleteTemplate.mutateAsync(id))
    try {
      await Promise.all(promises)
      showToast(`${deletingTemplates.length} template(s) deleted`, 'success')
      setDeletingTemplates([])
      setSelectedIds(new Set())
    } catch {
      showToast('Failed to delete templates', 'error')
    }
  }, [deletingTemplates, deleteTemplate])

  // Table columns
  const columns: Column<AgentTemplateDetail>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Template',
        sortable: true,
        render: (template) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {template.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {template.description.slice(0, 60)}...
            </div>
          </div>
        ),
      },
      {
        key: 'authorName',
        header: 'Author',
        sortable: true,
        width: '120px',
        render: (template) => (
          <span className="text-gray-700 dark:text-gray-300">{template.authorName}</span>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        sortable: true,
        width: '140px',
        render: (template) => (
          <span className="text-gray-700 dark:text-gray-300">
            {CATEGORY_LABELS[template.category]}
          </span>
        ),
      },
      {
        key: 'difficulty',
        header: 'Difficulty',
        sortable: true,
        width: '120px',
        render: (template) => (
          <StatusBadge
            label={DIFFICULTY_LABELS[template.difficulty]}
            variant={getDifficultyVariant(template.difficulty)}
          />
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        width: '130px',
        render: (template) => (
          <StatusBadge
            label={STATUS_LABELS[template.status]}
            variant={getStatusVariant(template.status)}
          />
        ),
      },
      {
        key: 'featured',
        header: 'Featured',
        sortable: true,
        width: '100px',
        render: (template) =>
          template.featured ? (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Yes
            </span>
          ) : (
            <span className="text-gray-400">No</span>
          ),
      },
      {
        key: 'downloadCount',
        header: 'Downloads',
        sortable: true,
        width: '100px',
        render: (template) => (
          <span className="text-gray-600 dark:text-gray-400">
            {template.downloadCount.toLocaleString()}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created',
        sortable: true,
        width: '120px',
        render: (template) => (
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {formatDate(template.createdAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: '140px',
        render: (template) => (
          <div className="flex justify-end gap-1">
            {template.status === 'pending_review' && (
              <>
                <button
                  onClick={() => handleApprove(template.id)}
                  className="p-1 text-green-600 hover:text-green-800 transition-colors"
                  title="Approve"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setRejectingTemplate(template)
                    setRejectReason('')
                  }}
                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                  title="Reject"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </>
            )}
            {template.status === 'approved' && (
              <button
                onClick={() => handleToggleFeatured(template)}
                className={`p-1 transition-colors ${
                  template.featured
                    ? 'text-amber-500 hover:text-amber-700'
                    : 'text-gray-400 hover:text-amber-500'
                }`}
                title={template.featured ? 'Remove from featured' : 'Add to featured'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setDeletingTemplates([template.id])}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete template"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ),
      },
    ],
    [handleApprove, handleToggleFeatured]
  )

  // Bulk actions
  const bulkActions = useMemo(
    () => [
      {
        label: 'Approve',
        onClick: async () => {
          const pending = Array.from(selectedIds).filter((id) => {
            const t = templates.find((t) => t.id === id)
            return t?.status === 'pending_review'
          })
          if (pending.length === 0) {
            showToast('No pending templates selected', 'warning')
            return
          }
          try {
            await Promise.all(pending.map((id) => approveTemplate.mutateAsync(id)))
            showToast(`${pending.length} template(s) approved`, 'success')
            setSelectedIds(new Set())
          } catch {
            showToast('Failed to approve templates', 'error')
          }
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      },
      {
        label: 'Feature',
        onClick: async () => {
          const approved = Array.from(selectedIds).filter((id) => {
            const t = templates.find((t) => t.id === id)
            return t?.status === 'approved' && !t.featured
          })
          if (approved.length === 0) {
            showToast('No approved unfeatured templates selected', 'warning')
            return
          }
          try {
            await Promise.all(approved.map((id) => setFeatured.mutateAsync({ id, featured: true })))
            showToast(`${approved.length} template(s) featured`, 'success')
            setSelectedIds(new Set())
          } catch {
            showToast('Failed to feature templates', 'error')
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
          const featured = Array.from(selectedIds).filter((id) => {
            const t = templates.find((t) => t.id === id)
            return t?.featured
          })
          if (featured.length === 0) {
            showToast('No featured templates selected', 'warning')
            return
          }
          try {
            await Promise.all(featured.map((id) => setFeatured.mutateAsync({ id, featured: false })))
            showToast(`${featured.length} template(s) unfeatured`, 'success')
            setSelectedIds(new Set())
          } catch {
            showToast('Failed to unfeature templates', 'error')
          }
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ),
      },
      {
        label: 'Delete',
        onClick: () => setDeletingTemplates(Array.from(selectedIds)),
        variant: 'danger' as const,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        ),
      },
    ],
    [selectedIds, templates, approveTemplate, setFeatured]
  )

  // Stats
  const pendingCount = pendingTemplates.length
  const approvedCount = allTemplates.filter((t) => t.status === 'approved').length
  const featuredCount = allTemplates.filter((t) => t.featured).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Template Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review, approve, and manage agent templates
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{featuredCount}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Featured</p>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'all'
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          All Templates
        </button>
        <button
          onClick={() => setViewMode('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            viewMode === 'pending'
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Pending Review
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters (only for all templates view) */}
      {viewMode === 'all' && (
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search templates..."
            className="w-64"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TemplateCategory | '')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TemplateStatus | '')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as TemplateDifficulty | '')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Difficulties</option>
            {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        actions={bulkActions}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Data Table */}
      <DataTable
        data={sortedTemplates}
        columns={columns}
        keyExtractor={(template) => template.id}
        isLoading={isLoading}
        emptyMessage={
          viewMode === 'pending'
            ? 'No templates pending review'
            : 'No templates found'
        }
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deletingTemplates.length > 0}
        onClose={() => setDeletingTemplates([])}
        onConfirm={handleDelete}
        title="Delete Templates"
        message={`Are you sure you want to delete ${deletingTemplates.length} template(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteTemplate.isPending}
      />

      {/* Reject Modal */}
      {rejectingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reject Template
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Rejecting: <strong>{rejectingTemplate.name}</strong>
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setRejectingTemplate(null)
                  setRejectReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!rejectReason.trim() || rejectTemplate.isPending}
              >
                {rejectTemplate.isPending ? 'Rejecting...' : 'Reject Template'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
