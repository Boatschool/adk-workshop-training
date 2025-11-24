/**
 * Admin Tenants Page
 * Tenant management with table, filtering, and provisioning
 */

import { useState, useCallback, useMemo } from 'react'
import { useTenants, useCreateTenant, useUpdateTenant } from '@hooks/useTenants'
import { useAuth } from '@hooks/index'
import {
  DataTable,
  type Column,
  Modal,
  SearchInput,
  StatusBadge,
  getStatusVariant,
} from '@components/admin'
import { Button } from '@components/common'
import { formatDate } from '@utils/format'
import type { Tenant, TenantStatus } from '@/types'
import { showToast } from '@stores/uiStore'

type SortDirection = 'asc' | 'desc'

export function AdminTenantsPage() {
  const { user: currentUser } = useAuth()

  // Filters & pagination
  const [search, setSearch] = useState('')
  const [page] = useState(1)
  const [sortColumn, setSortColumn] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)

  // Queries & mutations
  const { data: tenants = [], isLoading, refetch } = useTenants({
    skip: (page - 1) * 20,
    limit: 20,
  })
  const createTenant = useCreateTenant()
  const updateTenant = useUpdateTenant()

  // Filter tenants by search (client-side)
  const filteredTenants = useMemo(() => {
    if (!search) return tenants
    const searchLower = search.toLowerCase()
    return tenants.filter(
      (t) =>
        t.name.toLowerCase().includes(searchLower) ||
        t.slug.toLowerCase().includes(searchLower)
    )
  }, [tenants, search])

  // Sort tenants
  const sortedTenants = useMemo(() => {
    return [...filteredTenants].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortColumn]
      const bVal = (b as unknown as Record<string, unknown>)[sortColumn]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = String(aVal).localeCompare(String(bVal))
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredTenants, sortColumn, sortDirection])

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }, [sortColumn])

  // Table columns
  const columns: Column<Tenant>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Tenant',
        sortable: true,
        render: (tenant) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {tenant.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {tenant.slug}
            </div>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        width: '120px',
        render: (tenant) => (
          <StatusBadge
            label={tenant.status}
            variant={getStatusVariant(tenant.status)}
            dot
          />
        ),
      },
      {
        key: 'subscription_tier',
        header: 'Tier',
        sortable: true,
        width: '120px',
        render: (tenant) => (
          <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
            {tenant.subscription_tier}
          </span>
        ),
      },
      {
        key: 'database_schema',
        header: 'Schema',
        width: '200px',
        render: (tenant) => (
          <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {tenant.database_schema}
          </code>
        ),
      },
      {
        key: 'created_at',
        header: 'Created',
        sortable: true,
        width: '150px',
        render: (tenant) => (
          <span className="text-gray-500 dark:text-gray-400">
            {formatDate(tenant.created_at)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        width: '100px',
        render: (tenant) => (
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditingTenant(tenant)}
              className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
              title="Edit tenant"
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

  // Check if current user is super admin
  const isSuperAdmin = currentUser?.role === 'super_admin'

  if (!isSuperAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
            Access Denied
          </h2>
          <p className="mt-2 text-red-600 dark:text-red-300">
            Only super admins can manage tenants.
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
            Tenant Management
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Manage multi-tenant organizations
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Tenant
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or slug..."
          className="w-64"
        />
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

      {/* Data Table */}
      <DataTable
        data={sortedTenants}
        columns={columns}
        keyExtractor={(tenant) => tenant.id}
        isLoading={isLoading}
        emptyMessage="No tenants found"
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Create Tenant Modal */}
      <CreateTenantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={async (data) => {
          await createTenant.mutateAsync(data)
          showToast('Tenant created and provisioned successfully', 'success')
          setIsCreateModalOpen(false)
        }}
        isLoading={createTenant.isPending}
      />

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <EditTenantModal
          tenant={editingTenant}
          isOpen={!!editingTenant}
          onClose={() => setEditingTenant(null)}
          onSubmit={async (data) => {
            await updateTenant.mutateAsync({ tenantId: editingTenant.id, data })
            showToast('Tenant updated successfully', 'success')
            setEditingTenant(null)
          }}
          isLoading={updateTenant.isPending}
        />
      )}
    </div>
  )
}

// Create Tenant Modal Component
interface CreateTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    slug: string
    google_api_key?: string
    subscription_tier?: string
  }) => Promise<void>
  isLoading: boolean
}

function CreateTenantModal({ isOpen, onClose, onSubmit, isLoading }: CreateTenantModalProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [googleApiKey, setGoogleApiKey] = useState('')
  const [subscriptionTier, setSubscriptionTier] = useState('trial')

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name,
      slug,
      google_api_key: googleApiKey || undefined,
      subscription_tier: subscriptionTier,
    })
    // Reset form
    setName('')
    setSlug('')
    setGoogleApiKey('')
    setSubscriptionTier('trial')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Tenant"
      description="Provision a new tenant organization"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            Create & Provision
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tenant Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            placeholder="Acme Healthcare"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Slug *
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            required
            pattern="^[a-z0-9-]+$"
            placeholder="acme-healthcare"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
          />
          <p className="mt-1 text-xs text-gray-500">
            URL-friendly identifier (lowercase, numbers, hyphens only)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Google API Key
          </label>
          <input
            type="password"
            value={googleApiKey}
            onChange={(e) => setGoogleApiKey(e.target.value)}
            placeholder="AIza..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
          />
          <p className="mt-1 text-xs text-gray-500">
            Required for ADK agent execution
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subscription Tier
          </label>
          <select
            value={subscriptionTier}
            onChange={(e) => setSubscriptionTier(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="trial">Trial</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> Creating a tenant will provision a new database schema
            (<code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
              adk_platform_tenant_{slug || 'slug'}
            </code>)
          </p>
        </div>
      </form>
    </Modal>
  )
}

// Edit Tenant Modal Component
interface EditTenantModalProps {
  tenant: Tenant
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    name?: string
    status?: TenantStatus
    subscription_tier?: string
    google_api_key?: string
  }) => Promise<void>
  isLoading: boolean
}

function EditTenantModal({ tenant, isOpen, onClose, onSubmit, isLoading }: EditTenantModalProps) {
  const [name, setName] = useState(tenant.name)
  const [status, setStatus] = useState<TenantStatus>(tenant.status)
  const [subscriptionTier, setSubscriptionTier] = useState(tenant.subscription_tier)
  const [googleApiKey, setGoogleApiKey] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name: name !== tenant.name ? name : undefined,
      status: status !== tenant.status ? status : undefined,
      subscription_tier: subscriptionTier !== tenant.subscription_tier ? subscriptionTier : undefined,
      google_api_key: googleApiKey || undefined,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Tenant"
      description={tenant.slug}
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
            Tenant Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TenantStatus)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="trial">Trial</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Subscription Tier
          </label>
          <select
            value={subscriptionTier}
            onChange={(e) => setSubscriptionTier(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="trial">Trial</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Update Google API Key
          </label>
          <input
            type="password"
            value={googleApiKey}
            onChange={(e) => setGoogleApiKey(e.target.value)}
            placeholder="Leave blank to keep existing"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-1">
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Schema: </span>
            <code className="text-gray-900 dark:text-white">{tenant.database_schema}</code>
          </div>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Created: </span>
            <span className="text-gray-900 dark:text-white">{formatDate(tenant.created_at)}</span>
          </div>
        </div>
      </form>
    </Modal>
  )
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
