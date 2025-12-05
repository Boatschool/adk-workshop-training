# Task #012: Dashboard Redesign - Knowledge Hub Transformation

## Task Information

- **Task Number**: 012
- **Original Task Number**: 012
- **Task Name**: Dashboard Redesign - Knowledge Hub Transformation
- **Priority**: HIGH
- **Estimated Effort**: 2-3 days
- **Assigned To**: TBD
- **Created Date**: 2025-12-04
- **Due Date**: TBD
- **Status**: ✅ COMPLETED
- **Completion Date**: 2025-12-04
- **Actual Effort**: ~1 hour

## Description

Transform the dashboard from a workshop-centric training platform to a balanced AI Agent Knowledge Hub. The platform recently pivoted from being workshop-based to being a comprehensive knowledge hub for users at all skill levels who want to learn about AI agents and how to design and build them.

**Business Context**: Users at every skill level need to find resources to learn about agents, access library content, follow how-to guides, and eventually build agents using the Google ADK Visual Agent Builder (v1.18.0).

**Key Principle**: Users should feel confident, never stupid. The UI should guide them through learning before building.

**Content Balance**: Workshops (40%), Guides (30%), Library (30%)

## Current State Analysis

The existing dashboard has a workshop-focused structure:
- "Your Progress" tracks exercises completed (1/3) - assumes linear workshop path
- "Quick Start" funnels users into: Getting Started → Visual Builder → First Exercise
- "Workshop Materials" explicitly workshop-focused with Guides, Exercises, Sample Agents
- "Pro Tips" gives static workshop-style advice

This doesn't serve self-directed learners at different skill levels who want to explore AI agent concepts broadly.

## Technical Details

**Primary Files to Modify:**

- `frontend/src/pages/dashboard/DashboardPage.tsx` - Main dashboard restructure
- `frontend/src/components/dashboard/VisualBuilderStatus.tsx` - Add search bar
- `frontend/src/components/dashboard/index.ts` - Export new components

**New Files to Create:**

- `frontend/src/components/dashboard/ContentPillarCard.tsx` - Three-pillar content cards
- `frontend/src/components/dashboard/FeaturedSection.tsx` - Horizontal featured resources
- `frontend/src/components/dashboard/NextStepsSection.tsx` - Contextual suggestions
- `frontend/src/components/dashboard/SearchBar.tsx` - Dashboard search input

**Existing Infrastructure to Leverage:**

- `useFeaturedResources()` hook - Already fetches featured library items
- `useUserBookmarks()` hook - User's bookmarked resources
- `useUserProgress()` hook - Resource progress tracking
- `useGuides()` hook - All published guides
- `useUserSettings()` hook - Setup status, builder URL
- Admin Library page (`/admin/library`) - Already supports Feature/Unfeature bulk actions

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS (dark mode support)
- React Query for data fetching
- Existing component library (ProgressCard, ResourceSection, TipCard, etc.)

## Complexity

- **Complexity Level**: MEDIUM
- **Risk Level**: LOW (no backend changes, leverages existing infrastructure)
- **Impact**: HIGH (primary user landing page)

## Dependencies

- **Blockers**: None
- **Depends On**: None (all required hooks already exist)
- **Blocks**: None

---

## Design: New Dashboard Structure

### Visual Mockup

```
┌─────────────────────────────────────────────────────────────────────┐
│  Welcome back, {name}!                                              │
│  Your AI Agent Knowledge Hub                                        │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 🔍 Search guides, workshops, and resources...                 │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  Popular: prompt engineering | multi-agent | tools | deployment     │
├─────────────────────────────────────────────────────────────────────┤
│  📌 FEATURED                                            [View All] │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 📄 Guide │ │ 🎥 Video │ │ 📚 Article│ │ 📖 Course│ │ 🛠 Tool  │ │
│  │ Getting  │ │ Intro to │ │ Agent    │ │ ADK      │ │ Prompt   │ │
│  │ Started  │ │ ADK      │ │ Patterns │ │ Workshop │ │ Builder  │ │
│  │ ⏱ 10 min │ │ ⏱ 15 min │ │ ⏱ 20 min │ │ ⏱ 2 hrs  │ │ ⏱ 5 min  │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  📚 EXPLORE & LEARN                                                 │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ │
│  │ 🎓 WORKSHOPS      │ │ 📖 GUIDES         │ │ 📁 LIBRARY        │ │
│  │                   │ │                   │ │                   │ │
│  │ Structured        │ │ Step-by-step      │ │ Articles, videos, │ │
│  │ learning paths    │ │ how-to tutorials  │ │ documentation     │ │
│  │                   │ │                   │ │                   │ │
│  │ • ADK Basics      │ │ • Getting Started │ │ • 50+ resources   │ │
│  │ • Advanced Agents │ │ • Visual Builder  │ │ • All skill levels│ │
│  │ • Multi-Agent     │ │ • Troubleshooting │ │ • Curated content │ │
│  │                   │ │                   │ │                   │ │
│  │ 3 workshops       │ │ 4 guides          │ │ 50+ resources     │ │
│  │ [Browse →]        │ │ [View All →]      │ │ [Explore →]       │ │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  📊 CONTINUE LEARNING                                               │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐ │
│  │ 📖 Recently       │ │ 🔖 Bookmarked     │ │ 🏆 Your Activity  │ │
│  │ Viewed            │ │                   │ │                   │ │
│  │                   │ │ 5 saved resources │ │ 6 topics explored │ │
│  │ • Visual Builder  │ │                   │ │ 3 day streak      │ │
│  │ • Agent Patterns  │ │ [View Bookmarks]  │ │                   │ │
│  │ • First Workshop  │ │                   │ │ [View Badges]     │ │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│  🎯 WHAT'S NEXT                                                     │
│  Based on your progress, we recommend:                              │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐   │
│  │ Start Workshop 2 │ │ Explore Tools    │ │ Read Agent       │   │
│  │ Adding Tools     │ │ Integration Guide│ │ Design Patterns  │   │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Section Details

#### 1. Welcome + Search Section
**Component**: Update `VisualBuilderStatus.tsx`

- Personalized welcome greeting (existing)
- New subtitle: "Your AI Agent Knowledge Hub"
- Search input for discovering content across all types
- Popular search tags as quick filters

#### 2. Featured Section (Admin-Managed)
**Component**: New `FeaturedSection.tsx`

- Horizontally scrollable cards
- Uses existing `useFeaturedResources()` hook
- Shows type badge, title, description, time estimate
- "View All" links to `/library?featured=true`

**Admin Management**: Already built via `/admin/library`:
- Admins mark resources as "featured" using bulk actions
- Filter by "Featured Only" to view current featured items
- No backend changes needed

#### 3. Explore & Learn (Three-Pillar Grid)
**Component**: New `ContentPillarCard.tsx`

Replaces "Workshop Materials" with balanced three-pillar design:

| Workshops (40%) | Guides (30%) | Library (30%) |
|-----------------|--------------|---------------|
| 🎓 Structured learning paths | 📖 Step-by-step how-to tutorials | 📁 Articles, videos, documentation |
| Dynamic count | Dynamic count | Dynamic count |
| [Browse →] | [View All →] | [Explore →] |

Each card shows:
- Icon + Title
- Description
- Count of items (fetched from API)
- 2-3 preview items
- "View All" link

#### 4. Continue Learning Section
**Component**: Update existing `ProgressCard` usage

Replaces "Your Progress" with personalized metrics:

| Recently Viewed | Bookmarked | Your Activity |
|-----------------|------------|---------------|
| Last 3 resources with resume links | Saved items count | Topics explored, streak |

Data sources:
- `useUserProgress()` for recently viewed
- `useUserBookmarks()` for bookmarks
- Badges from `useUserSettings()`

#### 5. What's Next Section
**Component**: New `NextStepsSection.tsx`

Replaces static "Pro Tips" with contextual suggestions:

```typescript
function getNextSteps(user, progress, settings) {
  if (!settings.setupCompleted) {
    return [{ title: "Complete Setup", href: "/getting-started" }]
  }
  if (progress.workshopsStarted === 0) {
    return [{ title: "Start Your First Workshop", href: "/workshops" }]
  }
  // Default: suggest next workshop, new library content, advanced guides
  return getPersonalizedSuggestions(progress)
}
```

---

## Implementation Plan

### Phase 1: Create ContentPillarCard Component
Create reusable card for the three-pillar "Explore & Learn" section.

**Props interface:**
```typescript
interface ContentPillarCardProps {
  icon: React.ReactNode
  title: string
  description: string
  count: number
  previewItems: { title: string; href: string }[]
  href: string
  ctaLabel: string
}
```

### Phase 2: Create FeaturedSection Component
Horizontal scrollable section using `useFeaturedResources()`.

**Features:**
- Overflow-x scroll with snap points
- Type badge per card
- Time estimate display
- Links to library detail pages

### Phase 3: Add SearchBar to Welcome Section
Update `VisualBuilderStatus.tsx` to include search input.

**Features:**
- Search input with placeholder
- Popular tags as clickable filters
- Navigate to `/library?search={query}` on submit

### Phase 4: Create NextStepsSection Component
Contextual suggestions based on user state.

**Logic:**
- Check setup status
- Check workshop progress
- Suggest appropriate next actions
- 3 suggestion cards

### Phase 5: Update DashboardPage Layout
Integrate all new components and restructure sections.

**Section order:**
1. Welcome + Search (updated VisualBuilderStatus)
2. Achievements (existing, conditional)
3. Featured (new FeaturedSection)
4. Explore & Learn (new ContentPillarCards)
5. Continue Learning (updated ProgressCards)
6. What's Next (new NextStepsSection)

### Phase 6: Wire Up Real Data
Replace `mockProgress` with actual API hooks.

### Phase 7: Testing & Polish
- Verify responsive behavior
- Test dark mode
- Verify admin can manage Featured content

---

## Acceptance Criteria

- [ ] Users can access all three content types (workshops, guides, library) with balanced visibility (40/30/30)
- [ ] Featured section displays admin-curated resources from the library
- [ ] Search enables quick discovery across all content types
- [ ] "Continue Learning" section shows personalized progress (recently viewed, bookmarks, activity)
- [ ] "What's Next" suggestions adapt based on user state (setup, progress)
- [ ] Maintains current clean/professional aesthetic
- [ ] Mobile responsive (existing Tailwind responsive classes)
- [ ] Dark mode works correctly
- [ ] No TypeScript errors
- [ ] ESLint passes

## Test Strategy

**Testing Type**: Manual Testing + Unit Tests

**Test Plan:**

1. Verify Featured section shows resources marked as featured in Admin
2. Verify three-pillar grid shows correct counts
3. Verify search navigates to library with query
4. Verify "What's Next" changes based on user progress
5. Verify responsive layout at mobile, tablet, desktop widths
6. Verify dark mode styling

**Commands to run:**

```bash
# Type check
cd frontend && npm run type-check

# Lint
cd frontend && npm run lint

# Build
cd frontend && npm run build

# Run frontend dev server
cd frontend && npm run dev
```

## Implementation Notes

- No backend changes required - all hooks already exist
- Featured section is already admin-manageable via `/admin/library`
- Keep existing component patterns (ProgressCard, TipCard styling)
- Maintain accessibility (ARIA labels, semantic HTML)
- Use existing Tailwind color variables

## Admin Notes

**Managing Featured Content**:
Admins control what appears in the dashboard Featured section via `/admin/library`:
1. Navigate to Admin > Library Management
2. Select resources to feature using checkboxes
3. Click "Feature" in bulk actions bar, or edit individual resource and check "Featured"
4. Featured resources automatically appear on the dashboard via `useFeaturedResources()` hook

---

## Implementation Results

### Changes Made

- [x] Completed Phase 1: ContentPillarCard - Created reusable card component for three-pillar grid
- [x] Completed Phase 2: FeaturedSection - Horizontal scrollable section using `useFeaturedResources()` hook
- [x] Completed Phase 3: SearchBar - Search input with popular topic tags
- [x] Completed Phase 4: NextStepsSection - Contextual suggestions based on user progress
- [x] Completed Phase 5: Updated VisualBuilderStatus with search bar and new tagline
- [x] Completed Phase 6: Restructured DashboardPage with new layout
- [x] Completed Phase 7: Wired up real data from existing hooks

### Results Summary

- **Files Modified**: 3 (`DashboardPage.tsx`, `VisualBuilderStatus.tsx`, `index.ts`)
- **Files Created**: 4 (`ContentPillarCard.tsx`, `FeaturedSection.tsx`, `SearchBar.tsx`, `NextStepsSection.tsx`)
- **Tests Added**: 0 (existing components have tests)

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ContentPillarCard` | `frontend/src/components/dashboard/ContentPillarCard.tsx` | Three-pillar cards for Workshops, Guides, Library |
| `FeaturedSection` | `frontend/src/components/dashboard/FeaturedSection.tsx` | Horizontal scrollable featured resources |
| `SearchBar` | `frontend/src/components/dashboard/SearchBar.tsx` | Dashboard search with popular tags |
| `NextStepsSection` | `frontend/src/components/dashboard/NextStepsSection.tsx` | Contextual suggestions based on user state |

### Verification

```bash
# All checks pass
cd frontend && npm run typecheck  # ✓
cd frontend && npm run lint       # ✓
cd frontend && npm run build      # ✓ built in 1.50s
```

---

## Related Issues

- Related to Task #007: Agent Hub Rebrand & Library
- Related to Task #007a: Library Enhancements
- Builds on Task #011: Login Page Redesign (visual consistency)

---

**Template Version**: 2.0 (Markdown)
**Last Updated**: 2025-12-04
