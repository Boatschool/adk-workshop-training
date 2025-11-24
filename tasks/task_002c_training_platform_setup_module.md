# Task #002c: Training Platform Setup Module & GraymatterLab Ecosystem Navigation

## Task Information

- **Task Number**: 002c
- **Parent Task**: 002 (Phase 5 - Frontend)
- **Task Name**: Training Platform Setup Module & GraymatterLab Ecosystem Navigation
- **Priority**: HIGH
- **Estimated Effort**: 8-12 hours
- **Assigned To**: TBD
- **Created Date**: 2025-11-24
- **Due Date**: TBD
- **Status**: 🚧 IN PROGRESS (Phase 1 Complete)
- **Completion Date**: -
- **Actual Effort**: ~1 hour (Phase 1)

## Description

Build the onboarding experience for new users joining the ADK Training Platform, including:
1. Setup module for configuring local ADK Visual Builder
2. User-specific builder URL configuration
3. Navigation to GraymatterStudio (production agent platform)
4. Clear product journey through the GraymatterLab ecosystem

**Business Value:** Creates a seamless learning-to-production pipeline where users learn with ADK, practice with Visual Builder, and graduate to GraymatterStudio for production agent development. This positions GraymatterLab as a complete AI agent education and tooling provider.

**Scope:** Onboarding flow, user settings, header navigation, and setup verification.

## GraymatterLab Ecosystem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       GraymatterLab Ecosystem                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   1. LEARN                    2. PRACTICE                3. BUILD           │
│   ─────────────────          ─────────────────          ─────────────────   │
│   ADK Training Portal   →    ADK Visual Builder    →    GraymatterStudio    │
│   (This Platform)            (Google's Tool)            (Production)        │
│                                                                              │
│   • Courses                  • Local sandbox            • Multi-tenant      │
│   • Exercises                • Experiment               • Production agents │
│   • Progress tracking        • Learn by doing           • Enterprise features│
│   • Certificates             • Export configs           • Team collaboration │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## User Scenarios

### Scenario 1: GraymatterLab Instructor-Led Training
- **Setup**: GraymatterLab hosts full stack including Visual Builder
- **Flow**: Instructor demos on shared Visual Builder, students follow locally
- **Navigation**: Quick access to all three platforms from header

### Scenario 2: Self-Paced Remote Learning
- **Setup**: User accesses cloud-hosted training, runs Visual Builder locally
- **Onboarding**: Guided setup module walks through local installation
- **Flow**: Complete courses → Practice locally → Graduate to GraymatterStudio

### Scenario 3: Enterprise Team Training
- **Setup**: Organization has GraymatterStudio subscription
- **Flow**: Team members learn on training platform, build in Studio
- **Integration**: SSO, team progress dashboards, shared agent templates

## Implementation Phases

### Phase 1: Header Navigation Update (2 hours)

**Objective:** Add GraymatterStudio navigation and ecosystem awareness to header.

#### 1.1 Update Header Component

- [x] Add "Products" or "Ecosystem" dropdown to header
- [x] Include navigation items:
  - ADK Training (current - highlighted)
  - ADK Visual Builder (local/external link)
  - GraymatterStudio (external link with "Production" badge)
- [x] Add visual indicator for current platform
- [x] Style with GraymatterLab branding

#### 1.2 GraymatterStudio Link Configuration

- [x] Add `GRAYMATTER_STUDIO_URL` to environment config
- [x] Default to placeholder URL (e.g., `https://studio.graymatterlab.ai`)
- [ ] Add "Coming Soon" or "Get Access" state if URL not configured (deferred)

#### 1.3 Mobile Navigation

- [x] Update mobile menu with ecosystem links
- [x] Ensure proper touch targets and spacing

### Phase 2: User Settings for Local Builder (2 hours)

**Objective:** Allow users to configure their local Visual Builder URL.

#### 2.1 User Settings Page

- [ ] Create `/profile/settings` page (or add to existing profile)
- [ ] Add "Development Environment" section
- [ ] Fields:
  - Local Visual Builder URL (default: `http://localhost:8000`)
  - Auto-detect local builder (checkbox)
  - Google API Key status (configured/not configured - local check)

#### 2.2 Update VisualBuilderStatus Component

- [ ] Read user's configured URL from settings/localStorage
- [ ] Fall back to default `http://localhost:8000`
- [ ] Show "Configure" link if using default
- [ ] Add tooltip explaining local vs hosted builder

#### 2.3 Persist Settings

- [ ] Store in localStorage for immediate use
- [ ] Sync to backend user profile (optional, for cross-device)
- [ ] Add to user preferences API schema

### Phase 3: Onboarding Setup Module (4 hours)

**Objective:** Create guided setup experience for new users.

#### 3.1 Create "Getting Started" Course

- [ ] Course: "Setting Up Your Development Environment"
- [ ] Module structure:
  1. Welcome & Overview (what you'll learn)
  2. Prerequisites (Python 3.11+, pip, terminal basics)
  3. Installing Google ADK
  4. Getting Your Google API Key
  5. Running the Visual Builder
  6. Verification Exercise
  7. Troubleshooting Guide

#### 3.2 Interactive Setup Wizard

- [ ] Step-by-step wizard component
- [ ] Platform detection (macOS, Windows, Linux)
- [ ] Copy-to-clipboard for commands
- [ ] Verification checkpoints:
  - [ ] Python version check
  - [ ] ADK installation check
  - [ ] API key validation
  - [ ] Visual Builder connection test

#### 3.3 Verification Exercise

- [ ] Exercise: "Connect Your Local Visual Builder"
- [ ] Auto-detect when user's local builder is running
- [ ] Mark exercise complete when verified
- [ ] Award "Environment Setup" badge

### Phase 4: Progress & Certification (2 hours)

**Objective:** Track setup completion and course progress.

#### 4.1 Setup Completion Tracking

- [ ] Track which setup steps user has completed
- [ ] Show progress indicator in dashboard
- [ ] Prompt incomplete users to finish setup

#### 4.2 Course Completion Certificates

- [ ] Design certificate template
- [ ] Generate PDF certificate on course completion
- [ ] Include: User name, course name, date, certificate ID
- [ ] Add to user profile "Achievements" section

#### 4.3 Dashboard Enhancements

- [ ] Show "Getting Started" progress prominently for new users
- [ ] Quick link to GraymatterStudio when ready
- [ ] "Next Steps" recommendations based on progress

### Phase 5: Documentation & Content (2 hours)

#### 5.1 Setup Guide Content

- [ ] Write detailed installation instructions per platform
- [ ] Create troubleshooting FAQ
- [ ] Add video tutorials (placeholder/future)

#### 5.2 Update Existing Documentation

- [ ] Update README with ecosystem overview
- [ ] Update CLAUDE.md with new navigation structure
- [ ] Create `docs/ecosystem.md` explaining the three platforms

## Technical Specifications

### New Environment Variables

```bash
# GraymatterLab Ecosystem
GRAYMATTER_STUDIO_URL=https://studio.graymatterlab.ai
GRAYMATTER_STUDIO_ENABLED=true

# Default Visual Builder (for hosted instances)
DEFAULT_VISUAL_BUILDER_URL=http://localhost:8000
```

### New API Endpoints

```
# User Settings
GET    /api/v1/users/me/settings           # Get user settings
PATCH  /api/v1/users/me/settings           # Update user settings

# Setup Verification
POST   /api/v1/setup/verify-python         # Check Python version
POST   /api/v1/setup/verify-adk            # Check ADK installation
POST   /api/v1/setup/verify-builder        # Check Visual Builder connection
POST   /api/v1/setup/complete              # Mark setup as complete
```

### New Frontend Routes

```
/getting-started                    # Setup wizard
/getting-started/install            # Installation step
/getting-started/api-key            # API key step
/getting-started/verify             # Verification step
/profile/settings                   # User settings
/certificates/:id                   # View certificate
```

### User Settings Schema

```typescript
interface UserSettings {
  // Development Environment
  localBuilderUrl: string;          // default: 'http://localhost:8000'
  autoDetectBuilder: boolean;       // default: true

  // Setup Progress
  setupCompleted: boolean;
  setupCompletedAt: string | null;

  // Preferences
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
}
```

### Header Navigation Structure

```typescript
const ecosystemNav = [
  {
    name: 'ADK Training',
    href: '/',
    current: true,
    description: 'Learn AI agent development',
    badge: null,
  },
  {
    name: 'Visual Builder',
    href: userSettings.localBuilderUrl + '/dev-ui',
    external: true,
    description: 'Practice building agents',
    badge: builderStatus, // 'online' | 'offline'
  },
  {
    name: 'GraymatterStudio',
    href: config.graymatterStudioUrl,
    external: true,
    description: 'Production agent platform',
    badge: 'Pro',
  },
];
```

## Acceptance Criteria

### Header Navigation
- [x] Ecosystem dropdown visible in header
- [x] All three platforms accessible
- [x] Current platform highlighted
- [x] External links open in new tab
- [x] Mobile menu includes ecosystem links
- [x] GraymatterStudio shows appropriate badge/state

### User Settings
- [ ] Users can configure local builder URL
- [ ] Settings persist across sessions
- [ ] VisualBuilderStatus uses configured URL
- [ ] Default URL works for new users

### Onboarding Module
- [ ] New users see "Getting Started" prominently
- [ ] Setup wizard guides through all steps
- [ ] Platform-specific instructions shown
- [ ] Verification exercise auto-completes on success
- [ ] Progress tracked and displayed

### Integration
- [ ] Works with existing auth flow
- [ ] Multi-tenant aware (tenant-specific settings)
- [ ] No breaking changes to existing features

## Dependencies

- **Depends On**:
  - Task #002a (Frontend Modernization) - ✅ Complete
  - Task #002b (Visual Builder Integration) - ✅ Complete

- **Blocks**:
  - GraymatterStudio integration (future)
  - Enterprise SSO features (future)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| GraymatterStudio URL not ready | Low | Use placeholder, "Coming Soon" state |
| Local builder detection unreliable | Medium | Provide manual verification option |
| Cross-platform setup complexity | Medium | Platform-specific guides, video support |
| User confusion about three platforms | Medium | Clear visual hierarchy, tooltips |

## Future Enhancements

1. **SSO Integration**: Single sign-on across all three platforms
2. **Agent Sync**: Export agents from Visual Builder to GraymatterStudio
3. **Team Dashboards**: Instructor view of student progress
4. **Video Tutorials**: Embedded setup walkthrough videos
5. **Slack/Discord Integration**: Community support links

---

## Implementation Results

### Phase 1: Header Navigation ✅ COMPLETE (2025-11-24)

**Files Modified:**
- `frontend/src/components/layout/Header.tsx`

**Features Implemented:**
- "Products" dropdown with GraymatterLab Ecosystem branding
- Three products with icons, descriptions, and badges:
  - ADK Training [Current] - graduation cap icon
  - Visual Builder [Local] - blocks icon, external link
  - GraymatterStudio [Pro] - rocket icon, external link
- Desktop dropdown with hover states
- Mobile navigation with ecosystem section
- External link indicators for Visual Builder and GraymatterStudio

**URLs Configured:**
- ADK Training: `/` (internal)
- Visual Builder: `http://localhost:8000/dev-ui` (external)
- GraymatterStudio: `https://studio.graymatterlab.ai` (external placeholder)

**Testing Completed:**
- Desktop dropdown opens/closes correctly
- All links navigate to correct destinations
- Mobile menu displays ecosystem section
- TypeScript compilation passes
- No console errors

---

**Template Version**: 1.0
**Created**: 2025-11-24
**Last Updated**: 2025-11-24
