# Task #011: Login Page Redesign for GraymatterLab Agent Hub

## Task Information

- **Task Number**: 011
- **Task Name**: Login Page Redesign for GraymatterLab Agent Hub
- **Priority**: MEDIUM
- **Estimated Effort**: 4-6 hours
- **Assigned To**: TBD
- **Created Date**: 2025-12-04
- **Due Date**: TBD
- **Status**: ✅ COMPLETED
- **Completion Date**: 2025-12-04

## Description

Redesign the login page to match the split-panel layout used in other GraymatterLab applications (e.g., GraymatterStudio). The new design should feature:

1. **Two-column layout**:
   - Left panel: Marketing/branding content with gradient or hero section
   - Right panel: Login form

2. **Branding updates**:
   - Replace generic "ADK Platform" branding with "GraymatterLab Agent Hub"
   - Add GraymatterLab logo to the sign-in page
   - Update marketing copy to reflect Agent Hub value proposition

3. **Design elements from reference** (GraymatterStudio login):
   - Time-based greeting (e.g., "Good morning, Healthcare Hero")
   - Bold typography with gradient text for key messaging
   - Trust badges/certifications display
   - Clean, minimal form design on right panel
   - Development mode test credentials box (for dev environment only)

## Technical Details

**Primary Files:**

- `frontend/src/pages/auth/LoginPage.tsx` - Main login page component
- `frontend/src/assets/` - Add GraymatterLab logo assets
- `frontend/public/` - Alternative location for logo if static assets preferred

**Key Changes Required:**

1. **Layout restructure**:
   - Convert from single-centered card to two-column split layout
   - Left panel (50-60% width): Marketing hero section
   - Right panel (40-50% width): Login form

2. **Left panel content**:
   - Add time-based greeting function
   - Hero headline: "Build AI That Transforms [Healthcare/Your Business]" or similar
   - Subheadline with value proposition for Agent Hub
   - Trust indicators (if applicable)
   - Gradient text styling for emphasis

3. **Right panel updates**:
   - "Welcome back" header with "Sign in to continue building" subtext
   - Development mode credentials box (conditionally rendered)
   - Simplified form (consider removing "Remember me" checkbox)
   - Clean form styling matching reference design

4. **Logo integration**:
   - Add GraymatterLab logo to the page (likely in left panel header or form header)
   - Create/obtain logo asset in appropriate formats (SVG preferred, PNG fallback)

5. **Responsive design**:
   - Stack panels vertically on mobile/tablet
   - Hide or minimize left panel content on small screens
   - Ensure form remains fully functional at all breakpoints

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Existing AuthContext for authentication

## Complexity

- **Complexity Level**: MEDIUM
- **Risk Level**: LOW
- **Impact**: MEDIUM (User-facing improvement, no functionality changes)

## Dependencies

- **Blockers**: None
- **Depends On**: None
- **Blocks**: None

## Acceptance Criteria

- [x] Two-column layout matches reference design pattern
- [x] GraymatterLab logo is displayed on the login page
- [x] Marketing content reflects "Agent Hub" product messaging
- [x] Time-based greeting displays correctly (morning/afternoon/evening)
- [x] Development mode credentials box shown only in development environment
- [x] Responsive design works on mobile, tablet, and desktop
- [x] All existing login functionality preserved (auth flow, error handling, redirect)
- [x] Dark mode support maintained
- [ ] All tests pass
- [x] No TypeScript errors
- [x] ESLint passes

## Test Strategy

**Testing Type**: Manual Testing + Unit Testing

**Test Plan:**

1. Visual verification of layout at multiple breakpoints (320px, 768px, 1024px, 1440px)
2. Login flow testing - successful login redirects correctly
3. Login flow testing - error states display properly
4. Development credentials visibility only in dev mode
5. Time-based greeting displays correct message
6. Dark mode toggle preserves styling

**Commands to run:**

```bash
# Type checking
npm run type-check

# Lint
npm run lint

# Run existing tests
npm test -- --testPathPattern=LoginPage

# Manual testing
npm run dev
```

## Implementation Notes

### Logo Assets Available

Logo files are located in `workspace/` directory:

- **graymatterlab_agent_hub.png** - "GraymatterLab" with "Agent Hub" subtitle (RECOMMENDED for login page)
- **graymatterlab_logo_1.png** - Full logo with brain/circuit icon + "GraymatterLab" text
- **graymatterlab_logo_blue.png** - Text only with "Lab" in blue accent
- **graymatterlab_logo_white.png** - White version for dark backgrounds

**Implementation:**
1. Copy selected logo(s) to `frontend/src/assets/` or `frontend/public/`
2. Import and use in LoginPage component

**Placement options**:
  - Option A: Top of left marketing panel (graymatterlab_logo_1.png with icon)
  - Option B: Above "Welcome back" on right panel (graymatterlab_agent_hub.png)
  - Option C: Both locations

### Content Suggestions

**Left Panel Copy (draft):**
- Greeting: "Good [morning/afternoon/evening], Agent Builder"
- Headline: "Build AI Agents That Transform Healthcare" (or more general)
- Subheadline: "Join healthcare professionals using GraymatterLab Agent Hub to create intelligent automation workflows that save time and improve outcomes."

**Right Panel:**
- Header: "Welcome back"
- Subheader: "Sign in to continue building"

### Environment Detection

```typescript
// For dev credentials box
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'
```

### Time-based Greeting

```typescript
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
```

## Design Reference

The target design follows the GraymatterStudio login pattern:
- Split screen with left marketing panel and right form panel
- Clean, professional aesthetic with gradient accents
- Trust indicators and value proposition prominently displayed
- Minimal, focused form design

## Related Issues

- Related to Task #007: Agent Hub Rebrand & Library (branding consistency)

---

**Template Version**: 2.0 (Markdown)
**Last Updated**: 2025-12-04
