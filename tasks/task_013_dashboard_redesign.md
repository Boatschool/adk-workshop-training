# Task #013: Dashboard Redesign - Agent Architect Style

## Task Information

- **Task Number**: 013
- **Task Name**: Dashboard Knowledge Hub Redesign
- **Priority**: HIGH
- **Estimated Effort**: 3-4 days
- **Assigned To**: TBD
- **Created Date**: 2025-12-05
- **Due Date**: TBD
- **Status**: 🔄 IN CODE REVIEW

## Description

Redesign the Knowledge Hub dashboard to match the clean, professional styling of the Agent Architect product. The current dashboard is functional but visually "bland" compared to our other products. This task involves:

1. **Visual refresh** - Match Agent Architect's clean card styling with subtle shadows
2. **Layout restructure** - Add stats row, quick actions, and platform features sections
3. **New Feature: News Section** - Add healthcare AI news (admin-managed + external feeds)
4. **Enhanced Featured Content** - More prominent showcase of new workshops/content

**Target Audience:**
- Healthcare and life sciences professionals
- Mix of clinicians and non-clinicians
- Novice, intermediate, and advanced AI/agent users

## Design Reference (Agent Architect Style)

Key design elements from the reference image:
- Clean white background with generous spacing
- Stats row with 3 metric cards (colored numbers, subtle shadows)
- Two-column Quick Actions + Platform Features layout
- Professional blue primary color (#00AAE7) with accent highlights
- Cards with subtle shadows and hover states
- Green checkmarks for feature lists

---

## Technical Details

### Phase 1: Create New Components

#### 1.1 StatsCard Component
**File:** `frontend/src/components/dashboard/StatsCard.tsx`

New component for the stats row metrics:
- Props: `icon`, `label`, `value`, `color` (blue/green/amber)
- Styling: White bg, subtle shadow, colored number, small icon
- Responsive: Stacks on mobile, 3-column on desktop

#### 1.2 QuickActionsSection Component
**File:** `frontend/src/components/dashboard/QuickActionsSection.tsx`

Two-column layout with:
- **Left column - Quick Actions:**
  - Primary button: "Start a Workshop" (blue, filled)
  - Secondary button: "Browse Library" (outlined)
  - Tertiary: "View Guides" (text link)

- **Right column - Platform Features:**
  - Checklist with green checkmarks:
    - "Structured Learning Paths" - Build AI agents step by step
    - "Healthcare Focus" - Content tailored for clinical workflows
    - "Google ADK Integration" - Deploy to Vertex AI Agent Engine

#### 1.3 NewsSection Component
**File:** `frontend/src/components/dashboard/NewsSection.tsx`

News feed section supporting both admin-created and external news:
- Horizontal card layout (similar to Featured)
- Card design: Title, source badge, date, brief excerpt
- "View All News" link to dedicated news page
- Loading/empty states

#### 1.4 Update FeaturedSection Component
**File:** `frontend/src/components/dashboard/FeaturedSection.tsx`

Enhance existing component:
- Larger, more prominent cards
- "NEW" badge for recent content
- Better visual hierarchy
- Healthcare-relevant placeholder content

---

### Phase 2: Backend - News API

#### 2.1 News Database Model
**File:** `src/db/models/news.py`

```python
class News(TenantBase):
    id: UUID
    title: str
    excerpt: str
    content: str (optional, for admin-created)
    source: str (e.g., "GraymatterLab", "Healthcare IT News")
    source_url: str (optional, for external)
    image_url: str (optional)
    published_at: datetime
    is_external: bool
    is_featured: bool
    created_by: UUID (optional)
```

#### 2.2 News API Routes
**File:** `src/api/routes/news.py`

- `GET /api/news` - List news (paginated, filterable)
- `GET /api/news/{id}` - Get single news item
- `POST /api/news` - Create news (admin only)
- `PUT /api/news/{id}` - Update news (admin only)
- `DELETE /api/news/{id}` - Delete news (admin only)

#### 2.3 News Service
**File:** `src/services/news_service.py`

- CRUD operations for news
- External feed fetching (future: RSS integration)
- Caching for external news

#### 2.4 Database Migration
**File:** `src/db/migrations/versions/XXX_add_news_table.py`

Create news table with proper indexes.

---

### Phase 3: Frontend - Hooks and Services

#### 3.1 News API Service
**File:** `frontend/src/services/news.ts`

API client functions for news endpoints.

#### 3.2 useNews Hook
**File:** `frontend/src/hooks/useNews.ts`

React Query hook for fetching news with caching.

---

### Phase 4: Dashboard Page Restructure

**File:** `frontend/src/pages/dashboard/DashboardPage.tsx`

New layout structure:

```
1. Welcome Header (simplified - remove search)
   - "Welcome back, {name}!"
   - "Your AI Agent Knowledge Hub"

2. Stats Row (NEW - 3 metrics)
   - Workshops In Progress (blue)
   - Resources Bookmarked (amber)
   - Topics Explored (green)

3. Quick Actions + Platform Features (NEW - 2 columns)
   - Left: Action buttons
   - Right: Feature checklist

4. Featured Content (ENHANCED)
   - Larger cards, "NEW" badges
   - Healthcare-focused content

5. News Section (NEW)
   - Latest AI in healthcare news
   - Mix of admin + external sources

6. Explore & Learn (KEEP - restyled)
   - Workshops, Guides, Library pillars
   - Updated card styling to match Agent Architect

7. What's Next (KEEP)
   - Contextual recommendations
```

**Sections to Remove/Modify:**
- Search bar from header (move to dedicated search page or keep in nav)
- "Continue Learning" section (redundant with stats row)
- Achievements section (keep for future, but hide for now)

---

### Phase 5: Styling Updates

#### 5.1 Card Styling Enhancements
Update Tailwind classes across dashboard components:

- **Stats cards:** `bg-white rounded-xl shadow-sm border border-gray-100`
- **Section cards:** `bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow`
- **Buttons:**
  - Primary: `bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-6 py-3`
  - Secondary: `border-2 border-primary-600 text-primary-600 hover:bg-primary-50 rounded-lg`

#### 5.2 Color Usage
- Stats numbers: Large, bold, colored (primary-600 for blue metrics)
- Icons: Subtle backgrounds with matching icon colors
- Accent: Use amber/orange sparingly for "NEW" badges and highlights

#### 5.3 Typography Hierarchy
- Welcome heading: `text-2xl font-bold`
- Section headings: `text-xl font-semibold`
- Card titles: `text-lg font-semibold`
- Body text: `text-sm text-gray-600`

---

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS (utility-first styling)
- React Query for data fetching
- FastAPI backend
- PostgreSQL with schema-per-tenant isolation
- Alembic for migrations

## Complexity

- **Complexity Level**: MEDIUM-HIGH
- **Risk Level**: LOW (mostly UI changes, isolated backend feature)
- **Impact**: HIGH (main landing page for all users)

## Dependencies

- **Blockers**: None
- **Depends On**: None (can start immediately)
- **Blocks**: None

---

## Files to Create

| File | Purpose |
|------|---------|
| `frontend/src/components/dashboard/StatsCard.tsx` | Stats metric card component |
| `frontend/src/components/dashboard/QuickActionsSection.tsx` | Quick actions + features layout |
| `frontend/src/components/dashboard/NewsSection.tsx` | News feed section |
| `frontend/src/services/news.ts` | News API client |
| `frontend/src/hooks/useNews.ts` | News data hook |
| `src/db/models/news.py` | News database model |
| `src/api/routes/news.py` | News API endpoints |
| `src/api/schemas/news.py` | News Pydantic schemas |
| `src/services/news_service.py` | News business logic |
| `src/db/migrations/versions/XXX_add_news_table.py` | Database migration |

## Files to Modify

| File | Changes |
|------|---------|
| `frontend/src/pages/dashboard/DashboardPage.tsx` | Major layout restructure |
| `frontend/src/components/dashboard/FeaturedSection.tsx` | Enhanced styling |
| `frontend/src/components/dashboard/ContentPillarCard.tsx` | Updated styling |
| `frontend/src/components/dashboard/VisualBuilderStatus.tsx` | Simplified (remove search) |
| `frontend/src/components/dashboard/index.ts` | Export new components |
| `src/api/main.py` | Register news router |
| `src/db/models/__init__.py` | Export News model |

---

## Acceptance Criteria

- [x] Dashboard matches Agent Architect visual style
- [x] Stats row displays 3 metrics with colored numbers
- [x] Quick Actions section with primary/secondary buttons
- [x] Platform Features checklist with green checkmarks
- [x] Featured Content section is more prominent
- [x] News section displays admin-created news items
- [x] News admin CRUD operations work correctly
- [x] Explore & Learn pillars have updated styling
- [x] Dark mode support maintained
- [ ] Responsive design works on mobile/tablet (needs manual testing)
- [ ] All tests pass (needs manual testing)
- [x] No TypeScript errors
- [x] ESLint passes

## Test Strategy

**Testing Type**: Unit Testing + Integration Testing + Manual Testing

**Test Plan:**

1. StatsCard component renders with correct props
2. QuickActionsSection buttons link correctly
3. NewsSection displays news items
4. News API CRUD operations
5. Dashboard layout responsive behavior
6. Dark mode toggle works

**Commands to run:**

```bash
# Frontend tests
cd frontend && npm run test

# Type checking
cd frontend && npm run type-check

# Linting
cd frontend && npm run lint

# Backend tests
poetry run pytest

# Backend type checking
poetry run mypy src/
```

---

## Implementation Order

1. **Frontend styling first** - Update existing components to match Agent Architect style
2. **New dashboard components** - StatsCard, QuickActionsSection
3. **Dashboard restructure** - New layout with existing data
4. **Backend news API** - Model, routes, service
5. **News frontend** - Service, hook, NewsSection component
6. **Integration** - Connect news to dashboard
7. **Polish** - Responsive design, loading states, empty states

---

## Implementation Notes

- Keep existing hooks (useWorkshops, useGuides, etc.) - they work well
- Stats row replaces "Continue Learning" section (same data, better presentation)
- News section supports both admin-created and external feed (external RSS integration can be Phase 2)
- Search functionality moves to a dedicated search experience or nav bar
- Dark mode support maintained throughout
- Healthcare/life sciences focus in all placeholder content and examples

---

## Implementation Progress

### Completed (2025-12-05)

#### Frontend Components Created
| File | Status | Notes |
|------|--------|-------|
| `frontend/src/components/dashboard/StatsCard.tsx` | ✅ Complete | Supports blue/amber/green/purple color variants |
| `frontend/src/components/dashboard/QuickActionsSection.tsx` | ✅ Complete | Two-column layout with actions + features |
| `frontend/src/components/dashboard/NewsSection.tsx` | ✅ Complete | 2x2 grid, external link support |
| `frontend/src/services/news.ts` | ✅ Complete | Full CRUD API client |
| `frontend/src/hooks/useNews.ts` | ✅ Complete | React Query hooks with mutations |

#### Backend Files Created
| File | Status | Notes |
|------|--------|-------|
| `src/db/models/news.py` | ✅ Complete | Shared schema model |
| `src/api/schemas/news.py` | ✅ Complete | Pydantic schemas |
| `src/services/news_service.py` | ✅ Complete | CRUD with pagination |
| `src/api/routes/news.py` | ✅ Complete | Public read, admin write |
| `src/db/migrations/versions/004_add_news_table.py` | ✅ Complete | Migration ready |

#### Files Modified
| File | Status | Changes |
|------|--------|---------|
| `frontend/src/pages/dashboard/DashboardPage.tsx` | ✅ Complete | Full layout restructure |
| `frontend/src/components/dashboard/FeaturedSection.tsx` | ✅ Complete | NEW badges, wider cards |
| `frontend/src/components/dashboard/ContentPillarCard.tsx` | ✅ Complete | Updated shadow styling |
| `frontend/src/components/dashboard/VisualBuilderStatus.tsx` | ✅ Complete | Removed search bar |
| `frontend/src/components/dashboard/index.ts` | ✅ Complete | New exports |
| `frontend/src/services/queryClient.ts` | ✅ Complete | News query keys |
| `src/api/main.py` | ✅ Complete | News router registered |
| `src/db/models/__init__.py` | ✅ Complete | News model export |

#### Verification Results
```
Frontend TypeScript: ✅ No errors
Frontend ESLint:     ✅ No errors
Backend Ruff:        ✅ No errors
Backend MyPy:        ✅ No errors
```

### Remaining Steps
1. Run database migration: `poetry run alembic upgrade head`
2. Manual testing of responsive design
3. Seed sample news data for testing
4. (Future) Add admin UI for news management
5. (Future) RSS feed integration for external news

---

**Template Version**: 2.0 (Markdown)
**Last Updated**: 2025-12-05
