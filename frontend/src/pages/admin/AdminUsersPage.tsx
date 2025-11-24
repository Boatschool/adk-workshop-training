/**
 * Admin Users Page
 * User management with table, filtering, and CRUD operations
 */

import { useState, useCallback, useMemo } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useBulkUpdateUsers } from '@hooks/useUsers'
import { useAuth } from '@hooks/index'
import {
  DataTable,
  type Column,
  Modal,
  ConfirmModal,
  BulkActionsBar,
  SearchInput,
  StatusBadge,
  getStatusVariant,
  getRoleVariant,
} from '@components/admin'
import { Button } from '@components/common'
import { formatDate } from '@utils/format'
import type { User, UserRole } from '@/types'
import { showToast } from '@stores/uiStore'

type SortDirection = 'asc' | 'desc'

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()

  // Filters & pagination
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUsers, setDeletingUsers] = useState<string[]>([])

  // Queries & mutations
  const { data: users = [], isLoading, refetch } = useUsers({
    skip: (page - 1) * 20,
    limit: 20,
    is_active: activeFilter,
  })
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const bulkUpdate = useBulkUpdateUsers()

  // Filter users by search (client-side for now)
  const filteredUsers = useMemo(() => {
    if (!search) return users
    const searchLower = search.toLowerCase()
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(searchLower) ||
        u.full_name?.toLowerCase().includes(searchLower)
    )
  }, [users, search])

  // Sort users
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortColumn]
      const bVal = (b as unknown as Record<string, unknown>)[sortColumn]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = String(aVal).localeCompare(String(bVal))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredUsers, sortColumn, sortDirection])

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }, [sortColumn])

  // Table columns
  const columns: Column<User>[] = useMemo(
    () => [
      {
        key: 'email',
        header: 'Email',
        sortable: true,
        render: (user) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {user.email}
            </div>
            {user.full_name && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {user.full_name}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        sortable: true,
        width: '120px',
        render: (user) => (
          <StatusBadge
            label={user.role.replace('_', ' ')}
            variant={getRoleVariant(user.role)}
          />
        ),
      },
      {
        key: 'is_active',
        header: 'Status',
        sortable: true,
        width: '100px',
        render: (user) => (
          <StatusBadge
            label={user.is_active ? 'Active' : 'Inactive'}
            variant={getStatusVariant(user.is_active ? 'active' : 'inactive')}
            dot
          />
        ),
      },
      {
        key: 'created_at',
        header: 'Created',
        sortable: true,
        width: '150px',
        render: (user) => (
          <span className="text-gray-500 dark:text-gray-400">
            {formatDate(user.created_at)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: '100px',
        render: (user) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingUser(user)}
              className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
              title="Edit user"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
        onClick: () => {
          bulkUpdate.mutate(
            { userIds: Array.from(selectedIds), data: { is_active: true } },
            {
              onSuccess: () => {
                showToast(`${selectedIds.size} user(s) activated`, 'success')
                setSelectedIds(new Set())
              },
              onError: () => showToast('Failed to activate users', 'error'),
            }
          )
        },
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        label: 'Deactivate',
        onClick: () => setDeletingUsers(Array.from(selectedIds)),
        variant: 'danger' as const,
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ),
      },
    ],
    [selectedIds, bulkUpdate]
  )

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'tenant_admin'

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Access Denied
          </h2>
          <p className="mt-2 text-red-600 dark:text-red-300">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage users in your tenant
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by email or name..."
          className="w-64"
        />
        <select
          value={activeFilter === undefined ? 'all' : activeFilter ? 'active' : 'inactive'}
          onChange={(e) => {
            const val = e.target.value
            setActiveFilter(val === 'all' ? undefined : val === 'active')
            setPage(1)
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
        data={sortedUsers}
        columns={columns}
        keyExtractor={(user) => user.id}
        isLoading={isLoading}
        emptyMessage="No users found"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          await createUser.mutateAsync(data)
          showToast('User created successfully', 'success')
          setIsCreateModalOpen(false)
        }}
        isLoading={createUser.isPending}
      />

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={async (data) => {
            await updateUser.mutateAsync({ userId: editingUser.id, data })
            showToast('User updated successfully', 'success')
            setEditingUser(null)
          }}
          isLoading={updateUser.isPending}
        />
      )}

      {/* Deactivate Confirmation */}
      <ConfirmModal
        isOpen={deletingUsers.length > 0}
        onClose={() => setDeletingUsers([])}
        onConfirm={() => {
          bulkUpdate.mutate(
            { userIds: deletingUsers, data: { is_active: false } },
            {
              onSuccess: () => {
                showToast(`${deletingUsers.length} user(s) deactivated`, 'success')
                setDeletingUsers([])
                setSelectedIds(new Set())
              },
              onError: () => showToast('Failed to deactivate users', 'error'),
            }
          )
        }}
        title="Deactivate Users"
        message={`Are you sure you want to deactivate ${deletingUsers.length} user(s)? They will no longer be able to log in.`}
        confirmLabel="Deactivate"
        variant="danger"
        isLoading={bulkUpdate.isPending}
      />
    </div>
  )
}

// Create User Modal Component
interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { email: string; full_name?: string; password: string; role: UserRole }) => Promise<void>
  isLoading: boolean
}

function CreateUserModal({ isOpen, onClose, onSubmit, isLoading }: CreateUserModalProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('participant')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      email,
      full_name: fullName || undefined,
      password,
      role,
    })
    // Reset form
    setEmail('')
    setFullName('')
    setPassword('')
    setRole('participant')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create User"
      description="Add a new user to the system"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Create User
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="participant">Participant</option>
            <option value="instructor">Instructor</option>
            <option value="tenant_admin">Tenant Admin</option>
          </select>
        </div>
      </form>
    </Modal>
  )
}

// Edit User Modal Component
interface EditUserModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { full_name?: string; role?: UserRole; is_active?: boolean }) => Promise<void>
  isLoading: boolean
}

function EditUserModal({ user, isOpen, onClose, onSubmit, isLoading }: EditUserModalProps) {
  const [fullName, setFullName] = useState(user.full_name || '')
  const [role, setRole] = useState<UserRole>(user.role)
  const [isActive, setIsActive] = useState(user.is_active)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      full_name: fullName || undefined,
      role,
      is_active: isActive,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit User"
      description={user.email}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="participant">Participant</option>
            <option value="instructor">Instructor</option>
            <option value="tenant_admin">Tenant Admin</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active
            </span>
          </label>
        </div>
      </form>
    </Modal>
  )
}
