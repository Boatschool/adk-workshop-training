/**
 * Admin Announcements Tab
 * Manage What's New section content for the dashboard
 */

import { useState, useCallback, useMemo } from 'react'
import {
  useAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from '@hooks/useAnnouncements'
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
import type { Announcement, CreateAnnouncementData, UpdateAnnouncementData } from '@services/announcements'
import { showToast } from '@stores/uiStore'
import { AnnouncementForm } from '@components/admin/AnnouncementForm'

type SortDirection = 'asc' | 'desc'

// Badge color display
const badgeColorLabels: Record<string, string> = {
  blue: 'Blue',
  green: 'Green',
  amber: 'Amber',
  red: 'Red',
  purple: 'Purple',
}

// Type labels
const typeLabels: Record<string, string> = {
  workshop: 'Workshop',
  guide: 'Guide',
  library: 'Library',
  news: 'News',
  feature: 'Feature',
  general: 'General',
}

export function AdminAnnouncementsTab() {
  // Filters
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)
  const [sortColumn, setSortColumn] = useState<string>('displayOrder')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [deletingIds, setDeletingIds] = useState<string[]>([])

  // Queries & mutations
  const { data, isLoading, refetch } = useAnnouncements(true)
  const createAnnouncement = useCreateAnnouncement()
  const updateAnnouncement = useUpdateAnnouncement()
  const deleteAnnouncement = useDeleteAnnouncement()

  // Memoize announcements array to prevent useMemo dependency changes
  const announcements = useMemo(() => data?.items || [], [data?.items])

  // Filter and sort
  const filteredAnnouncements = useMemo(() => {
    let result = [...announcements]

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(searchLower) ||
          a.description.toLowerCase().includes(searchLower)
      )
    }

    // Filter by active status
    if (activeFilter !== undefined) {
      result = result.filter((a) => a.isActive === activeFilter)
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
  }, [announcements, search, activeFilter, sortColumn, sortDirection])

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }, [sortColumn])

  // Table columns
  const columns: Column<Announcement>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        sortable: true,
        render: (a) => (
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {a.title}
              </span>
              {a.badgeText && (
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium bg-${a.badgeColor}-100 text-${a.badgeColor}-700 dark:bg-${a.badgeColor}-900/30 dark:text-${a.badgeColor}-400`}>
                  {a.badgeText}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
              {a.description}
            </div>
          </div>
        ),
      },
      {
        key: 'announcementType',
        header: 'Type',
        sortable: true,
        width: '100px',
        render: (a) => (
          <span className="text-gray-600 dark:text-gray-400 text-sm">
            {typeLabels[a.announcementType] || a.announcementType}
          </span>
        ),
      },
      {
        key: 'displayOrder',
        header: 'Order',
        sortable: true,
        width: '80px',
        render: (a) => (
          <span className="text-gray-600 dark:text-gray-400">
            {a.displayOrder}
          </span>
        ),
      },
      {
        key: 'badgeColor',
        header: 'Badge',
        width: '100px',
        render: (a) => (
          a.badgeText ? (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {badgeColorLabels[a.badgeColor] || a.badgeColor}
            </span>
          ) : (
            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
          )
        ),
      },
      {
        key: 'isActive',
        header: 'Status',
        sortable: true,
        width: '100px',
        render: (a) => (
          <StatusBadge
            label={a.isActive ? 'Active' : 'Inactive'}
            variant={a.isActive ? 'success' : 'warning'}
          />
        ),
      },
      {
        key: 'updatedAt',
        header: 'Updated',
        sortable: true,
        width: '120px',
        render: (a) => (
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            {formatDate(a.updatedAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: '80px',
        render: (a) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingAnnouncement(a)}
              className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
              title="Edit announcement"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setDeletingIds([a.id])}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete announcement"
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
        label: 'Activate',
        onClick: async () => {
          const ids = Array.from(selectedIds)
          const promises = ids.map((id) =>
            updateAnnouncement.mutateAsync({ id, data: { isActive: true } })
          )
          try {
            await Promise.all(promises)
            showToast(`${ids.length} announcement(s) activated`, 'success')
            setSelectedIds(new Set())
          } catch {
            showToast('Failed to activate announcements', 'error')
          }
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      },
      {
        label: 'Deactivate',
        onClick: async () => {
          const ids = Array.from(selectedIds)
          const promises = ids.map((id) =>
            updateAnnouncement.mutateAsync({ id, data: { isActive: false } })
          )
          try {
            await Promise.all(promises)
            showToast(`${ids.length} announcement(s) deactivated`, 'success')
            setSelectedIds(new Set())
          } catch {
            showToast('Failed to deactivate announcements', 'error')
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
          setDeletingIds(Array.from(selectedIds))
        },
        variant: 'danger' as const,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
      },
    ],
    [selectedIds, updateAnnouncement]
  )

  const handleCreate = async (data: CreateAnnouncementData) => {
    await createAnnouncement.mutateAsync(data)
    showToast('Announcement created successfully', 'success')
    setIsCreateModalOpen(false)
  }

  const handleUpdate = async (data: UpdateAnnouncementData) => {
    if (!editingAnnouncement) return
    await updateAnnouncement.mutateAsync({ id: editingAnnouncement.id, data })
    showToast('Announcement updated successfully', 'success')
    setEditingAnnouncement(null)
  }

  const handleDelete = async () => {
    const promises = deletingIds.map((id) => deleteAnnouncement.mutateAsync(id))
    try {
      await Promise.all(promises)
      showToast(`${deletingIds.length} announcement(s) deleted`, 'success')
      setDeletingIds([])
      setSelectedIds(new Set())
    } catch {
      showToast('Failed to delete announcements', 'error')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            What's New Management
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage announcements displayed on the dashboard
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Announcement
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search announcements..."
          className="w-64"
        />
        <select
          value={activeFilter === undefined ? 'all' : activeFilter ? 'active' : 'inactive'}
          onChange={(e) => {
            const val = e.target.value
            setActiveFilter(val === 'all' ? undefined : val === 'active')
          }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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
        data={filteredAnnouncements}
        columns={columns}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        emptyMessage="No announcements found. Create one to get started."
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Create Announcement Modal */}
      <AnnouncementForm
        key="create-form"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        isLoading={createAnnouncement.isPending}
        mode="create"
      />

      {/* Edit Announcement Modal */}
      {editingAnnouncement && (
        <AnnouncementForm
          key={`edit-${editingAnnouncement.id}`}
          isOpen={!!editingAnnouncement}
          onClose={() => setEditingAnnouncement(null)}
          onSubmit={handleUpdate}
          isLoading={updateAnnouncement.isPending}
          announcement={editingAnnouncement}
          mode="edit"
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deletingIds.length > 0}
        onClose={() => setDeletingIds([])}
        onConfirm={handleDelete}
        title="Delete Announcements"
        message={`Are you sure you want to delete ${deletingIds.length} announcement(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteAnnouncement.isPending}
      />
    </div>
  )
}
