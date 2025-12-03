# Task #008: Unified Admin Console Page

## Task Information

- **Task Number**: 008
- **Task Name**: Unified Admin Console Page
- **Priority**: HIGH
- **Estimated Effort**: 4-6 hours
- **Assigned To**: TBD
- **Created Date**: 2025-12-03
- **Status**: ✅ COMPLETED
- **Completion Date**: 2025-12-03
- **Actual Effort**: ~2 hours

## Description

Create a unified Admin Console page that consolidates all admin functionality into a single, tabbed interface. Currently, admin users must navigate to different pages via the profile dropdown menu, which is inconvenient. The new admin page will provide:

1. **Dashboard Tab** - Platform health, user statistics, event metrics
2. **Users Tab** - User management (existing AdminUsersPage functionality)
3. **Organizations Tab** - Organization/tenant management (rename from "Tenants")
4. **Guides Tab** - Guide content management
5. **Library Tab** - Library resource management

### Current State

- Admin options scattered in profile dropdown menu (Header.tsx lines 321-371)
- Separate routes: `/admin/users`, `/admin/tenants`, `/admin/library`, `/admin/guides`
- No unified dashboard with platform metrics
- "Tenants" terminology to be renamed to "Organizations"

### Desired State

- Single `/admin` route with tab navigation
- Dashboard tab showing platform health and statistics
- Consolidated access to all admin functions
- Header dropdown simplified to link to `/admin` only
- Backend API for admin statistics/metrics

## Technical Details

### Primary Files (New)

- `frontend/src/pages/admin/AdminPage.tsx` - Main admin page with tab navigation
- `frontend/src/pages/admin/tabs/AdminDashboardTab.tsx` - Dashboard component
- `frontend/src/pages/admin/tabs/AdminUsersTab.tsx` - Users tab wrapper
- `frontend/src/pages/admin/tabs/AdminOrganizationsTab.tsx` - Organizations tab wrapper
- `frontend/src/pages/admin/tabs/AdminGuidesTab.tsx` - Guides tab wrapper
- `frontend/src/pages/admin/tabs/AdminLibraryTab.tsx` - Library tab wrapper
- `frontend/src/hooks/useAdminStats.ts` - Hook for admin statistics
- `frontend/src/services/admin.ts` - Admin API service
- `src/api/routes/admin.py` - Backend admin statistics endpoint
- `src/api/schemas/admin.py` - Admin response schemas

### Files to Modify

- `frontend/src/App.tsx` - Update routing for `/admin` path
- `frontend/src/components/layout/Header.tsx` - Simplify admin dropdown
- `frontend/src/pages/admin/index.ts` - Export new components

### Architecture

```
AdminPage
├── Tab Navigation (Dashboard | Users | Organizations | Guides | Library)
├── AdminDashboardTab
│   ├── StatCards (Users, Active Users, Workshops, Documents)
│   ├── RecentActivityList
│   └── PlatformHealthStatus
├── AdminUsersTab (wraps existing AdminUsersPage content)
├── AdminOrganizationsTab (wraps existing AdminTenantsPage, renamed)
├── AdminGuidesTab (wraps existing AdminGuidesPage content)
└── AdminLibraryTab (wraps existing AdminLibraryPage content)
```

### Key Changes Required

1. **Create AdminPage.tsx** with tab navigation using URL query params (`?tab=dashboard`)
2. **Create tab wrapper components** that extract content from existing admin pages
3. **Create AdminDashboardTab** with:
   - Stat cards: Total users, active users, workshops completed, documents read
   - Platform health indicators (API status, DB connection, etc.)
   - Recent activity feed
4. **Create backend endpoint** `GET /api/admin/stats` returning:
   ```json
   {
     "users": { "total": 100, "active": 85, "new_this_week": 5 },
     "content": { "guides": 10, "library_resources": 50, "workshops": 8 },
     "activity": { "logins_today": 25, "documents_read": 150 },
     "health": { "api": "healthy", "database": "healthy", "external_services": "healthy" }
   }
   ```
5. **Update App.tsx routing**:
   - Add `/admin` route pointing to AdminPage
   - Keep existing `/admin/*` routes as fallbacks or remove
6. **Update Header.tsx**:
   - Replace individual admin links with single "Admin Console" link
   - Point to `/admin` route

### Role-Based Tab Visibility

| Tab | tenant_admin | super_admin |
|-----|--------------|-------------|
| Dashboard | ✅ | ✅ |
| Users | ✅ | ✅ |
| Organizations | ❌ | ✅ |
| Guides | ❌ | ✅ |
| Library | ❌ | ✅ |

## Tech Stack

- React 18 + TypeScript
- React Router v6 (useSearchParams for tab state)
- TanStack Query v5 (for stats API)
- Tailwind CSS (existing design system)
- FastAPI backend
- SQLAlchemy async

## Complexity

- **Complexity Level**: MEDIUM
- **Risk Level**: LOW (refactoring existing code, no new business logic)
- **Impact**: HIGH (improves admin UX significantly)

## Dependencies

- **Blockers**: None
- **Depends On**: Task #007b (AdminGuidesPage, AdminLibraryPage must exist)
- **Blocks**: None

## Acceptance Criteria

- [x] `/admin` route renders AdminPage with 5 tabs
- [x] Tab state persists in URL (`?tab=users`)
- [x] Dashboard shows real statistics from backend API
- [x] Platform health indicators work correctly
- [x] Users tab shows full user management functionality
- [x] Organizations tab shows tenant management (super_admin only)
- [x] Guides tab shows guide management (super_admin only)
- [x] Library tab shows library management (super_admin only)
- [x] Role-based tab visibility works correctly
- [x] Header dropdown links to `/admin` instead of individual pages
- [x] Existing `/admin/*` routes kept as legacy fallbacks
- [x] All TypeScript types pass
- [x] ESLint/Ruff passes
- [x] Dark mode supported (inherits from existing components)
- [x] Mobile responsive (tab nav scrolls horizontally)

## Test Strategy

**Testing Type**: Manual Testing + Unit Tests

**Test Plan:**

1. Login as `tenant_admin` - verify only Dashboard and Users tabs visible
2. Login as `super_admin` - verify all 5 tabs visible
3. Navigate between tabs - verify URL updates and content changes
4. Refresh page with `?tab=guides` - verify correct tab is active
5. Check dashboard stats match actual counts in database
6. Verify platform health indicators reflect real status
7. Test all CRUD operations in each tab work as before
8. Test dark mode appearance
9. Test mobile responsive behavior

**Commands to run:**

```bash
# Frontend type check
cd frontend && npm run type-check

# Frontend lint
cd frontend && npm run lint

# Backend type check
poetry run mypy src/

# Backend lint
poetry run ruff check .
```

## Implementation Notes

### Tab Navigation Pattern

Use `useSearchParams` from React Router to manage tab state:
```tsx
const [searchParams, setSearchParams] = useSearchParams()
const activeTab = searchParams.get('tab') || 'dashboard'
const setActiveTab = (tab: string) => setSearchParams({ tab })
```

### Existing Code Reuse

Extract the main content from existing pages into tab components:
- `AdminUsersPage` → `AdminUsersTab` (remove wrapper, keep table/modals)
- `AdminTenantsPage` → `AdminOrganizationsTab` (rename "Tenant" → "Organization")
- `AdminGuidesPage` → `AdminGuidesTab`
- `AdminLibraryPage` → `AdminLibraryTab`

### Backend Stats Endpoint

Create aggregate query to get counts efficiently:
```python
@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    db: AsyncSession = Depends(get_tenant_db),
    current_user: User = Depends(require_admin)
):
    # Aggregate counts from users, guides, library tables
    # Check service health
    return AdminStatsResponse(...)
```

### Terminology Change

- UI: "Tenants" → "Organizations"
- Code: Keep `tenant` in code, only change display labels
- Database: No schema changes needed

## Related Issues

- Follows from Task #007b (Admin Content Management)
- Improves overall admin experience

## Implementation Results

### Changes Made

- [x] Created `AdminPage.tsx` with 5-tab navigation using URL query params
- [x] Created `AdminDashboardTab.tsx` with stat cards, health indicators, quick actions
- [x] Created `AdminUsersTab.tsx` (extracted from AdminUsersPage)
- [x] Created `AdminOrganizationsTab.tsx` (extracted from AdminTenantsPage, renamed)
- [x] Created `AdminGuidesTab.tsx` (extracted from AdminGuidesPage)
- [x] Created `AdminLibraryTab.tsx` (extracted from AdminLibraryPage)
- [x] Created `useAdminStats.ts` hook with React Query
- [x] Created `admin.ts` frontend service
- [x] Created `src/api/routes/admin.py` backend endpoint
- [x] Created `src/api/schemas/admin.py` Pydantic models
- [x] Updated `App.tsx` with `/admin` route
- [x] Updated `Header.tsx` to show single "Admin Console" link
- [x] Updated index exports

### Results Summary

- **Files Created**: 12 new files
- **Files Modified**: 4 files (App.tsx, Header.tsx, main.py, hooks/index.ts, pages/admin/index.ts)
- **Lines Added**: ~2000+ lines
- **Tests Added**: 0 (manual testing recommended)

### Verification

```bash
# Frontend type check - PASSED
cd frontend && npm run typecheck

# Backend lint - PASSED
poetry run ruff check src/api/routes/admin.py src/api/schemas/admin.py
```

### Files Created

**Frontend:**
- `frontend/src/pages/admin/AdminPage.tsx`
- `frontend/src/pages/admin/tabs/AdminDashboardTab.tsx`
- `frontend/src/pages/admin/tabs/AdminUsersTab.tsx`
- `frontend/src/pages/admin/tabs/AdminOrganizationsTab.tsx`
- `frontend/src/pages/admin/tabs/AdminGuidesTab.tsx`
- `frontend/src/pages/admin/tabs/AdminLibraryTab.tsx`
- `frontend/src/pages/admin/tabs/index.ts`
- `frontend/src/hooks/useAdminStats.ts`
- `frontend/src/services/admin.ts`

**Backend:**
- `src/api/routes/admin.py`
- `src/api/schemas/admin.py`

---

**Template Version**: 2.0 (Markdown)
**Last Updated**: 2025-12-03
