# Task #007b: Admin Content Management

## Task Information

- **Task Number**: 007b
- **Original Task Number**: 007
- **Task Name**: Admin Content Management
- **Priority**: HIGH
- **Estimated Effort**: 6-8 hours
- **Assigned To**: Claude Code
- **Created Date**: 2025-12-03
- **Due Date**: TBD
- **Status**: ✅ COMPLETED
- **Completion Date**: 2025-12-03
- **Actual Effort**: ~4 hours

## Description

Add content management capabilities to the Admin Dashboard for managing Library resources and Guides. Currently, the admin dashboard only supports User and Tenant management. This task extends the admin capabilities to include full CRUD operations for platform content.

## Current State Assessment

### Admin Dashboard Capabilities

| Feature | Status | Location |
|---------|--------|----------|
| User Management | ✅ Complete | `/admin/users` - `AdminUsersPage.tsx` |
| Tenant Management | ✅ Complete | `/admin/tenants` - `AdminTenantsPage.tsx` |
| Library Management | ❌ Missing | Backend API exists, no UI |
| Guides Management | ❌ Missing | No backend, no UI, hardcoded in frontend |

### Library Resources

**Current State**: Database-backed with full API

- **Storage**: `adk_platform_shared.library_resources` table
- **API**: Full CRUD at `/api/v1/library/` (requires `super_admin` role)
- **Admin UI**: None - must use API directly

**Existing API Endpoints**:
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/library/` | List resources (with filters) |
| POST | `/api/v1/library/` | Create resource (super_admin) |
| GET | `/api/v1/library/{id}` | Get resource by ID |
| PATCH | `/api/v1/library/{id}` | Update resource (super_admin) |
| DELETE | `/api/v1/library/{id}` | Delete resource (super_admin) |

### Guides

**Current State**: 100% hardcoded in frontend

- **Storage**: Mock data object in `frontend/src/pages/guides/GuidePage.tsx`
- **API**: None
- **Database**: None
- **Admin UI**: None

**Hardcoded Guides**:
1. `visual-agent-builder-guide` - Extensive ADK Visual Builder documentation
2. `quickstart-guide` - Getting started guide
3. `cheat-sheet` - Quick reference
4. `troubleshooting-guide` - Common issues and solutions
5. `getting-started` - Introduction

## Implementation Plan

### Phase 1: Library Admin Page (Frontend Only)

Backend API already exists - only need to build admin UI.

#### 1.1 Create AdminLibraryPage Component
**File**: `frontend/src/pages/admin/AdminLibraryPage.tsx`

Features:
- [ ] DataTable displaying all library resources
- [ ] Columns: Title, Type, Source, Difficulty, Topics, Featured, Created
- [ ] Search by title/description
- [ ] Filter by type, difficulty, featured status
- [ ] Sort by any column
- [ ] Row selection for bulk actions
- [ ] Pagination

#### 1.2 Create LibraryResourceForm Component
**File**: `frontend/src/components/admin/LibraryResourceForm.tsx`

Features:
- [ ] Form fields for all resource properties:
  - Title (required)
  - Description (required, textarea)
  - Resource Type (select: article, video, pdf, tool, course, documentation)
  - Source (select: external, embedded)
  - External URL (shown when source=external)
  - Content HTML (shown when source=embedded, rich textarea)
  - Topics (multi-select chips)
  - Difficulty (select: beginner, intermediate, advanced)
  - Author (optional)
  - Estimated Minutes (optional number)
  - Thumbnail URL (optional)
  - Featured (checkbox)
- [ ] Validation (title required, URL format, etc.)
- [ ] Create and Edit modes
- [ ] Preview panel for embedded content

#### 1.3 Create Admin Library Hooks
**File**: `frontend/src/hooks/useAdminLibrary.ts`

- [ ] `useAdminLibraryList()` - Fetch all resources (admin view)
- [ ] `useCreateLibraryResource()` - Create mutation
- [ ] `useUpdateLibraryResource()` - Update mutation
- [ ] `useDeleteLibraryResource()` - Delete mutation

#### 1.4 Add Route and Navigation
- [ ] Add route `/admin/library` to `App.tsx`
- [ ] Add "Library" link to admin sidebar navigation
- [ ] Restrict to `super_admin` role

---

### Phase 2: Guides Database & API (Backend)

Move guides from hardcoded frontend to database-backed API.

#### 2.1 Create Guide Database Model
**File**: `src/db/models/guide.py`

```python
class Guide(BaseModel):
    __tablename__ = "guides"
    __table_args__ = {"schema": "adk_platform_shared"}

    id: Mapped[uuid.UUID] = primary key
    slug: Mapped[str] = unique, String(100)
    title: Mapped[str] = String(255)
    description: Mapped[str] = Text
    content_html: Mapped[str] = Text
    icon: Mapped[str] = String(50)  # book, rocket, terminal, wrench, play
    display_order: Mapped[int] = Integer, default=0
    published: Mapped[bool] = Boolean, default=False
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime]
```

#### 2.2 Create Database Migration
**File**: `src/db/migrations/versions/003_add_guides_table.py`

- [ ] Create `adk_platform_shared.guides` table
- [ ] Add unique constraint on slug

#### 2.3 Create Guide Schemas
**File**: `src/api/schemas/guide.py`

- [ ] `GuideBase` - shared fields
- [ ] `GuideCreate` - create request
- [ ] `GuideUpdate` - update request (all optional)
- [ ] `GuideResponse` - API response
- [ ] `GuideListResponse` - paginated list

#### 2.4 Create Guide Service
**File**: `src/services/guide_service.py`

- [ ] `get_guides()` - list all (optionally filter by published)
- [ ] `get_guide_by_slug()` - get single guide
- [ ] `create_guide()` - create new guide
- [ ] `update_guide()` - update existing
- [ ] `delete_guide()` - delete guide

#### 2.5 Create Guide API Routes
**File**: `src/api/routes/guides.py`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/guides/` | List guides | Public |
| GET | `/api/v1/guides/{slug}` | Get guide by slug | Public |
| POST | `/api/v1/guides/` | Create guide | super_admin |
| PATCH | `/api/v1/guides/{slug}` | Update guide | super_admin |
| DELETE | `/api/v1/guides/{slug}` | Delete guide | super_admin |

#### 2.6 Seed Existing Guides
**File**: `src/db/seeds/guides.py`

- [ ] Migrate hardcoded guide content from `GuidePage.tsx` to seed data
- [ ] Preserve all existing content (especially visual-agent-builder-guide)

---

### Phase 3: Guides Admin Page (Frontend)

#### 3.1 Update GuidePage to Use API
**File**: `frontend/src/pages/guides/GuidePage.tsx`

- [ ] Replace mock data with API fetch
- [ ] Create `useGuides()` hook
- [ ] Create guides service functions
- [ ] Handle loading/error states

#### 3.2 Create AdminGuidesPage Component
**File**: `frontend/src/pages/admin/AdminGuidesPage.tsx`

Features:
- [ ] DataTable displaying all guides
- [ ] Columns: Title, Slug, Icon, Order, Published, Updated
- [ ] Row selection for bulk actions
- [ ] Reorder functionality (drag-and-drop or order input)

#### 3.3 Create GuideForm Component
**File**: `frontend/src/components/admin/GuideForm.tsx`

Features:
- [ ] Form fields:
  - Title (required)
  - Slug (auto-generated from title, editable)
  - Description (textarea)
  - Content HTML (rich text editor or markdown)
  - Icon (select: book, rocket, terminal, wrench, play)
  - Display Order (number)
  - Published (checkbox)
- [ ] Create and Edit modes
- [ ] Preview panel
- [ ] HTML/Markdown editor with syntax highlighting

#### 3.4 Add Route and Navigation
- [ ] Add route `/admin/guides` to `App.tsx`
- [ ] Add "Guides" link to admin sidebar navigation
- [ ] Restrict to `super_admin` role

---

### Phase 4: Future Enhancements (Not in Scope)

- [ ] Rich text editor (TipTap, Lexical, or similar)
- [ ] Image upload capability (currently URL-only)
- [ ] Draft/publish workflow with scheduling
- [ ] Version history
- [ ] Bulk operations (feature multiple, delete multiple)
- [ ] Content analytics dashboard
- [ ] Import/export functionality

## Technical Decisions

### Why Guides in Shared Schema?

Guides are platform-wide documentation, not tenant-specific content. All tenants should see the same guides. This matches the pattern used for library resources.

### HTML vs Markdown for Content

The existing guides use raw HTML. Options:
1. **Keep HTML**: Simple, no conversion needed, full formatting control
2. **Convert to Markdown**: Cleaner to edit, requires markdown renderer

**Recommendation**: Keep HTML for now, add markdown support later if needed.

### Admin Component Reuse

Leverage existing admin components:
- `DataTable` - sortable, selectable tables
- `Modal` - create/edit dialogs
- `SearchInput` - search functionality
- `StatusBadge` - status indicators
- `BulkActionsBar` - bulk operations
- `ConfirmModal` - delete confirmation

## Files to Create

### Backend
| File | Purpose |
|------|---------|
| `src/db/models/guide.py` | Guide SQLAlchemy model |
| `src/api/schemas/guide.py` | Pydantic schemas |
| `src/services/guide_service.py` | Business logic |
| `src/api/routes/guides.py` | API endpoints |
| `src/db/migrations/versions/003_add_guides_table.py` | Database migration |
| `src/db/seeds/guides.py` | Seed data with existing content |

### Frontend
| File | Purpose |
|------|---------|
| `frontend/src/pages/admin/AdminLibraryPage.tsx` | Library admin page |
| `frontend/src/pages/admin/AdminGuidesPage.tsx` | Guides admin page |
| `frontend/src/components/admin/LibraryResourceForm.tsx` | Library create/edit form |
| `frontend/src/components/admin/GuideForm.tsx` | Guide create/edit form |
| `frontend/src/hooks/useAdminLibrary.ts` | Admin library hooks |
| `frontend/src/hooks/useGuides.ts` | Guides hooks |
| `frontend/src/services/guides.ts` | Guides API service |

## Files to Modify

### Backend
| File | Changes |
|------|---------|
| `src/db/models/__init__.py` | Export Guide model |
| `src/api/main.py` | Register guides router |

### Frontend
| File | Changes |
|------|---------|
| `frontend/src/App.tsx` | Add admin routes |
| `frontend/src/pages/guides/GuidePage.tsx` | Replace mock data with API |
| `frontend/src/components/layout/AdminSidebar.tsx` | Add Library/Guides links |
| `frontend/src/types/models.ts` | Add Guide types |

## Acceptance Criteria

### Phase 1: Library Admin - COMPLETED (2025-12-03)
- [x] Admin can view all library resources in a table
- [x] Admin can create new library resources
- [x] Admin can edit existing library resources
- [x] Admin can delete library resources
- [x] Admin can toggle featured status (bulk actions)
- [x] Search and filter functionality works
- [x] Only super_admin role can access

### Phase 2: Guides Backend - COMPLETED (2025-12-03)
- [x] Guides stored in database
- [x] API endpoints functional
- [x] Existing guide content preserved (seed script)
- [x] Public GET endpoints work without auth
- [x] Admin endpoints require super_admin

### Phase 3: Guides Admin - COMPLETED (2025-12-03)
- [x] Admin can view all guides in a table
- [x] Admin can create new guides
- [x] Admin can edit existing guides
- [x] Admin can delete guides
- [x] Admin can reorder guides (via display order field)
- [x] Admin can publish/unpublish guides
- [x] GuidePage fetches from API instead of mock data

## Related Issues

- Depends on Task #007a (Library Enhancements) - COMPLETED
- Part of Agent Hub platform evolution
- Enables non-technical content management

---

## Implementation Results

### Phase 1: Library Admin Page (Completed 2025-12-03)

**Files Created:**
| File | Purpose |
|------|---------|
| `frontend/src/hooks/useAdminLibrary.ts` | CRUD mutation hooks for library resources |
| `frontend/src/components/admin/LibraryResourceForm.tsx` | Create/edit form component |
| `frontend/src/pages/admin/AdminLibraryPage.tsx` | Admin page with DataTable |

**Files Modified:**
| File | Changes |
|------|---------|
| `frontend/src/services/library.ts` | Added admin CRUD functions |
| `frontend/src/hooks/index.ts` | Exported admin library hooks |
| `frontend/src/components/admin/index.ts` | Exported LibraryResourceForm |
| `frontend/src/pages/admin/index.ts` | Exported AdminLibraryPage |
| `frontend/src/App.tsx` | Added `/admin/library` route |
| `frontend/src/components/layout/Header.tsx` | Added admin navigation menu |

**Features Implemented:**
- DataTable with sortable columns (Title, Type, Source, Difficulty, Featured, Created)
- Search by title/description
- Filter by type, difficulty, and featured status
- Create new resources with full form
- Edit existing resources
- Delete resources (single and bulk)
- Bulk actions: Feature/Unfeature/Delete
- Proper role-based access (super_admin only)

**Validation:**
- TypeScript: Pass
- ESLint: Pass
- Build: Pass

---

### Phase 2: Guides Backend (Completed 2025-12-03)

**Files Created:**
| File | Purpose |
|------|---------|
| `src/db/models/guide.py` | Guide SQLAlchemy model |
| `src/db/migrations/versions/003_add_guides_table.py` | Database migration |
| `src/api/schemas/guide.py` | Pydantic schemas for guides |
| `src/services/guide_service.py` | Guide CRUD service |
| `src/api/routes/guides.py` | API endpoints |
| `src/db/seeds/seed_guides.py` | Seed script with existing content |

**Files Modified:**
| File | Changes |
|------|---------|
| `src/db/models/__init__.py` | Exported Guide model |
| `src/core/constants.py` | Added GuideIcon enum |
| `src/core/exceptions.py` | Added ConflictError |
| `src/api/dependencies.py` | Added get_shared_db_dependency |
| `src/api/main.py` | Registered guides router |

**API Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/guides/` | Public | List guides |
| GET | `/api/v1/guides/{slug}` | Public | Get guide by slug |
| POST | `/api/v1/guides/` | super_admin | Create guide |
| PATCH | `/api/v1/guides/{slug}` | super_admin | Update guide |
| DELETE | `/api/v1/guides/{slug}` | super_admin | Delete guide |

**Seeded Content:**
- getting-started (order: 1)
- quickstart-guide (order: 2)
- visual-agent-builder-guide (order: 3)
- cheat-sheet (order: 4)
- troubleshooting-guide (order: 5)

**Validation:**
- Ruff: Pass
- MyPy: Pass (for new files)

---

### Phase 3: Guides Admin Page (Completed 2025-12-03)

**Files Created:**
| File | Purpose |
|------|---------|
| `frontend/src/types/models.ts` | Added Guide types (GuideListItem, Guide, ApiGuide) |
| `frontend/src/services/guides.ts` | Guides API service with CRUD functions |
| `frontend/src/hooks/useGuides.ts` | React Query hooks for guides (public + admin) |
| `frontend/src/components/admin/GuideForm.tsx` | Create/edit form component |
| `frontend/src/pages/admin/AdminGuidesPage.tsx` | Admin page with DataTable |

**Files Modified:**
| File | Changes |
|------|---------|
| `frontend/src/services/queryClient.ts` | Added guides query keys |
| `frontend/src/hooks/index.ts` | Exported guides hooks |
| `frontend/src/components/admin/index.ts` | Exported GuideForm |
| `frontend/src/pages/admin/index.ts` | Exported AdminGuidesPage |
| `frontend/src/pages/guides/GuidePage.tsx` | Replaced mock data with API fetch |
| `frontend/src/App.tsx` | Added `/admin/guides` route |
| `frontend/src/components/layout/Header.tsx` | Added Guides link to admin menu |

**Features Implemented:**
- DataTable with sortable columns (Title, Description, Order, Status, Updated)
- Search by title/slug/description
- Filter by published status
- Create new guides with full form (title, slug, description, content, icon, order, published)
- Edit existing guides (fetches full content from API)
- Delete guides (single and bulk)
- Bulk actions: Publish/Unpublish/Delete
- Proper role-based access (super_admin only)
- Auto-generate slug from title in create mode

**Validation:**
- TypeScript: Pass
- ESLint: Pass
- Build: Pass

---

**Template Version**: 2.0 (Markdown)
**Last Updated**: 2025-12-03
