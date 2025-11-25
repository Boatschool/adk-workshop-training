# Task #002e: Frontend Authentication UI with Google OAuth

## Task Information

- **Task Number**: 002e
- **Parent Task**: 002 (Phase 3 - FastAPI Implementation)
- **Task Name**: Frontend Authentication UI with Google OAuth
- **Priority**: HIGH
- **Estimated Effort**: 12-16 hours
- **Assigned To**: Claude Code
- **Created Date**: 2025-11-24
- **Due Date**: TBD
- **Status**: 🔄 IN PROGRESS (Phase 1 Complete)
- **Dependencies**: Task 002d (Authentication Hardening) - ✅ Complete

## Description

Build a production-ready authentication UI for the frontend that connects to the existing backend authentication system. The UI will support both traditional email/password authentication and Google OAuth sign-in, providing users with flexible authentication options.

**Business Value:** Provides a seamless, professional authentication experience with modern OAuth integration, reducing friction for new users and improving security through Google's authentication infrastructure.

**Scope:** Frontend authentication UI, Google OAuth integration (frontend + backend), tenant management, and complete auth flow. Does not include other OAuth providers (can be added later).

## Current State Assessment

### Backend Status ✅

The backend authentication from Task 002d is **fully functional**:

| Feature | Status | Endpoint |
|---------|--------|----------|
| User Registration | ✅ Working | `POST /api/v1/users/register` |
| User Login | ✅ Working | `POST /api/v1/users/login` |
| JWT Access Tokens | ✅ Working | 60-minute expiry |
| Refresh Tokens | ✅ Working | 7-day expiry with rotation |
| Password Reset | ✅ Working | `POST /api/v1/auth/forgot-password` |
| Change Password | ✅ Working | `POST /api/v1/auth/change-password` |
| Account Lockout | ✅ Working | 5 failed attempts, 15-min lockout |
| Rate Limiting | ✅ Working | 60 req/min general, 10 req/min auth |

**Test Results:**
```bash
# Successful login returns:
{
  "access_token": "eyJhbGc...",
  "refresh_token": "xwdake...",
  "token_type": "bearer",
  "expires_in": 3600,
  "email": "test@example.com",
  "full_name": "Test User",
  "role": "participant",
  "id": "2c2e6887-fc81-40d5-a783-1e3a8fa80038",
  ...
}
```

### Frontend Status ❌

The frontend has infrastructure but no UI:

| Component | Status | Location |
|-----------|--------|----------|
| Auth Service | ✅ Exists | `frontend/src/services/auth.ts` |
| Auth Context | ✅ Exists | `frontend/src/contexts/AuthContext.tsx` |
| API Client | ✅ Configured | `frontend/src/services/api.ts` |
| Storage Utils | ⚠️ Partial | `frontend/src/utils/storage.ts` (missing refresh token) |
| Login Page | ❌ Placeholder | `frontend/src/App.tsx` (lines 40-61) |
| Register Page | ❌ Missing | N/A |
| Tenant Management | ❌ Missing | N/A |

**Current Login Page:**
```tsx
function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-center text-gray-500">
        Login form coming soon...
      </p>
    </div>
  )
}
```

## Implementation Plan

### Phase 1: Core Authentication UI (6-8 hours)

**Objective:** Build functional login and registration pages with email/password authentication.

#### 1.1 Create Login Page Component

**New file:** `frontend/src/pages/auth/LoginPage.tsx`

**Features:**
- Email and password input fields with validation
- "Remember me" checkbox
- "Forgot password?" link
- Error message display
- Loading states
- Responsive design (mobile-first)
- Dark mode support
- Accessibility (ARIA labels, keyboard navigation)

**Design:**
- Clean, modern design matching existing UI
- Vibrant gradient accents
- Smooth animations and transitions
- Form validation with helpful error messages

#### 1.2 Create Registration Page Component

**New file:** `frontend/src/pages/auth/RegisterPage.tsx`

**Features:**
- Email, password, confirm password, full name fields
- Password strength indicator
- Terms of service checkbox
- Email validation
- Password requirements display
- Link to login page

#### 1.3 Update Storage Utilities

**File to modify:** `frontend/src/utils/storage.ts`

**Changes:**
```typescript
// Add refresh token storage
const REFRESH_TOKEN_KEY = 'adk_refresh_token'

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setStoredRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function removeStoredRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Update clearAuthStorage
export function clearAuthStorage(): void {
  removeStoredToken()
  removeStoredRefreshToken()
  removeStoredTenantId()
}
```

#### 1.4 Update Auth Context

**File to modify:** `frontend/src/contexts/AuthContext.tsx`

**Changes:**
- Store refresh token on login
- Add automatic token refresh logic
- Handle token expiration gracefully

#### 1.5 Add Tenant Initialization

**Approach:** Default tenant with setup wizard option

**New file:** `frontend/src/pages/auth/TenantSetup.tsx`

**Features:**
- First-time setup wizard
- Tenant creation form
- Tenant selection (if multiple exist)
- Store tenant ID in localStorage

**Acceptance Criteria - Phase 1:**
- [ ] Login page with email/password works end-to-end
- [ ] Registration page creates new users successfully
- [ ] Refresh tokens are stored and used
- [ ] Tenant ID is properly initialized
- [ ] Error messages are user-friendly
- [ ] Forms have proper validation
- [ ] UI is responsive on mobile and desktop
- [ ] Dark mode works correctly

---

### Phase 2: Google OAuth Integration (4-6 hours)

**Objective:** Add Google Sign-In as an authentication option.

#### 2.1 Backend OAuth Setup

**New file:** `src/api/routes/oauth.py`

**Endpoints:**
```python
@router.get("/google/authorize")
async def google_authorize():
    """Redirect to Google OAuth consent screen"""
    
@router.get("/google/callback")
async def google_callback(code: str):
    """Handle Google OAuth callback, create/login user"""
```

**New file:** `src/services/oauth_service.py`

**Features:**
- Google OAuth token exchange
- User creation from Google profile
- Link Google account to existing user
- Store Google ID for future logins

**Environment Variables:**
```bash
GOOGLE_OAUTH_CLIENT_ID=your-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:4000/auth/google/callback
```

#### 2.2 Frontend Google Sign-In Button

**Install dependency:**
```bash
npm install @react-oauth/google
```

**Update Login/Register Pages:**
- Add Google Sign-In button
- Handle OAuth redirect flow
- Display loading state during OAuth
- Handle OAuth errors

**Design:**
- Official Google Sign-In button styling
- "Or continue with" divider
- Seamless integration with existing form

#### 2.3 OAuth Flow Implementation

```
┌─────────────────────────────────────────────────────────────┐
│                    Google OAuth Flow                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User clicks "Sign in with Google"                       │
│     ↓                                                        │
│  2. Frontend redirects to /api/v1/oauth/google/authorize    │
│     ↓                                                        │
│  3. Backend redirects to Google OAuth consent screen        │
│     ↓                                                        │
│  4. User grants permission                                  │
│     ↓                                                        │
│  5. Google redirects to /api/v1/oauth/google/callback       │
│     ↓                                                        │
│  6. Backend exchanges code for tokens                       │
│     ↓                                                        │
│  7. Backend fetches user profile from Google                │
│     ↓                                                        │
│  8. Backend creates/finds user in database                  │
│     ↓                                                        │
│  9. Backend creates JWT tokens                              │
│     ↓                                                        │
│  10. Backend redirects to frontend with tokens              │
│     ↓                                                        │
│  11. Frontend stores tokens and redirects to dashboard      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 2.4 Database Schema Updates

**File to modify:** `src/db/tenant_schema.py`

**Changes to users table:**
```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(50) DEFAULT 'email';
ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR(500);
```

**Migration file:** `src/db/migrations/versions/xxx_add_oauth_fields.py`

**Acceptance Criteria - Phase 2:**
- [ ] Google Sign-In button appears on login/register pages
- [ ] OAuth flow completes successfully
- [ ] New users can sign up with Google
- [ ] Existing users can link Google account
- [ ] Google profile picture is stored and displayed
- [ ] Users can sign in with Google on subsequent visits
- [ ] OAuth errors are handled gracefully

---

### Phase 3: Enhanced UX & Polish (2-4 hours)

**Objective:** Add professional touches and improve user experience.

#### 3.1 Password Reset Flow UI

**New file:** `frontend/src/pages/auth/ForgotPasswordPage.tsx`

**Features:**
- Email input form
- Success message
- Link back to login

**New file:** `frontend/src/pages/auth/ResetPasswordPage.tsx`

**Features:**
- New password form
- Token validation
- Success/error handling
- Redirect to login

#### 3.2 Form Enhancements

**Add to all auth forms:**
- Real-time validation feedback
- Password visibility toggle
- Auto-focus on first field
- Enter key submission
- Loading spinners
- Success animations
- Error shake animations

#### 3.3 Social Proof & Trust Indicators

**Add to auth pages:**
- User testimonials (optional)
- Security badges
- Privacy policy link
- Terms of service link
- "Trusted by X users" counter

#### 3.4 Onboarding Flow

**New file:** `frontend/src/pages/auth/WelcomePage.tsx`

**Features:**
- Welcome message for new users
- Quick tour of features
- Profile completion prompt
- Skip option

**Acceptance Criteria - Phase 3:**
- [ ] Password reset flow works end-to-end
- [ ] All forms have smooth animations
- [ ] Error messages are helpful and specific
- [ ] Success states are celebratory
- [ ] New users see welcome flow
- [ ] UI feels polished and professional

---

## Technical Specifications

### Frontend Stack

- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom design system
- **Forms**: React Hook Form with Zod validation
- **OAuth**: @react-oauth/google
- **State**: React Context API (existing AuthContext)
- **Routing**: React Router v6

### Backend Stack

- **Framework**: FastAPI
- **OAuth Library**: authlib or httpx (for Google API calls)
- **Token Storage**: PostgreSQL (existing refresh_tokens table)
- **Security**: PKCE flow for OAuth (recommended)

### Security Considerations

1. **CSRF Protection**: Use state parameter in OAuth flow
2. **Token Security**: HttpOnly cookies for refresh tokens (optional enhancement)
3. **Rate Limiting**: Already implemented in backend
4. **Input Validation**: Both frontend and backend validation
5. **XSS Prevention**: React's built-in escaping + CSP headers
6. **Password Requirements**: Min 8 chars, complexity rules

### Design System

**Colors:**
- Primary: Vibrant blue gradient (#3B82F6 → #8B5CF6)
- Success: Green (#10B981)
- Error: Red (#EF4444)
- Background: Light (#F9FAFB) / Dark (#111827)

**Typography:**
- Headings: Inter Bold
- Body: Inter Regular
- Monospace: JetBrains Mono

**Spacing:**
- Form fields: 1rem gap
- Sections: 2rem gap
- Page padding: 2rem

## File Inventory

### Files to Create

**Frontend:**
- `frontend/src/pages/auth/LoginPage.tsx`
- `frontend/src/pages/auth/RegisterPage.tsx`
- `frontend/src/pages/auth/ForgotPasswordPage.tsx`
- `frontend/src/pages/auth/ResetPasswordPage.tsx`
- `frontend/src/pages/auth/TenantSetup.tsx`
- `frontend/src/pages/auth/WelcomePage.tsx`
- `frontend/src/pages/auth/index.ts` (exports)
- `frontend/src/components/auth/GoogleSignInButton.tsx`
- `frontend/src/components/auth/PasswordStrengthIndicator.tsx`
- `frontend/src/components/auth/AuthDivider.tsx`
- `frontend/src/hooks/useGoogleAuth.ts`

**Backend:**
- `src/api/routes/oauth.py`
- `src/services/oauth_service.py`
- `src/api/schemas/oauth.py`
- `src/db/migrations/versions/xxx_add_oauth_fields.py`

### Files to Modify

**Frontend:**
- `frontend/src/App.tsx` - Update routes
- `frontend/src/utils/storage.ts` - Add refresh token storage
- `frontend/src/contexts/AuthContext.tsx` - Add OAuth support
- `frontend/src/services/auth.ts` - Add OAuth methods
- `frontend/src/types/models.ts` - Add OAuth user fields

**Backend:**
- `src/api/main.py` - Add oauth router
- `src/core/config.py` - Add OAuth settings
- `src/db/models/user.py` - Add OAuth fields
- `src/db/tenant_schema.py` - Add OAuth columns
- `src/services/user_service.py` - Add OAuth user creation

## Testing Strategy

### Unit Tests

**Frontend:**
```bash
npm run test -- auth
```

**Tests:**
- Form validation logic
- OAuth token handling
- Storage utilities
- Auth context state management

**Backend:**
```bash
poetry run pytest tests/unit/test_oauth.py -v
```

**Tests:**
- OAuth token exchange
- User creation from Google profile
- Token validation

### Integration Tests

**Frontend:**
```bash
npm run test:e2e
```

**Tests:**
- Complete login flow
- Complete registration flow
- OAuth flow (with mocked Google)
- Password reset flow

**Backend:**
```bash
poetry run pytest tests/integration/test_oauth_flow.py -v
```

**Tests:**
- Full OAuth flow with test credentials
- User linking
- Token refresh

### Manual Testing Checklist

- [ ] Login with email/password
- [ ] Register new user with email/password
- [ ] Login with Google (new user)
- [ ] Login with Google (existing user)
- [ ] Forgot password flow
- [ ] Reset password flow
- [ ] Token refresh on expiry
- [ ] Logout
- [ ] Mobile responsive design
- [ ] Dark mode
- [ ] Accessibility (screen reader, keyboard nav)

## Google OAuth Setup Guide

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "ADK Workshop Training"
3. Enable Google+ API or People API

### 2. Configure OAuth Consent Screen

1. Navigate to "OAuth consent screen"
2. Choose "External" user type
3. Fill in application details:
   - App name: "ADK Workshop Training"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `openid`
   - `email`
   - `profile`

### 3. Create OAuth Credentials

1. Navigate to "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Authorized redirect URIs:
   - `http://localhost:4000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)
5. Copy Client ID and Client Secret

### 4. Add to Environment Variables

**Backend `.env`:**
```bash
GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=your-client-secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:4000/auth/google/callback
```

**Frontend `.env`:**
```bash
VITE_GOOGLE_OAUTH_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Acceptance Criteria

### Phase 1 (Core UI) - ✅ COMPLETE
- [x] Login page with email/password works
- [x] Registration page creates users
- [x] Refresh tokens stored and used
- [x] Tenant ID initialized properly (requires X-Tenant-ID header)
- [x] Forms have validation
- [x] UI is responsive
- [x] Dark mode works
- [x] Password visibility toggle
- [x] Password strength indicator
- [x] Forgot password page
- [x] Reset password page

### Phase 2 (Google OAuth)
- [ ] Google Sign-In button works
- [ ] OAuth flow completes successfully
- [ ] New users can sign up with Google
- [ ] Existing users can link Google
- [ ] Profile pictures displayed
- [ ] Subsequent Google logins work

### Phase 3 (Polish)
- [x] Password reset flow works (UI complete)
- [x] Forms have smooth animations
- [x] Error messages are helpful
- [x] Success states are polished
- [ ] Welcome flow for new users

### All Phases
- [ ] All tests pass (unit + integration)
- [x] No console errors or warnings
- [ ] Accessibility audit passes
- [x] Mobile responsive on all screen sizes
- [ ] Works in Chrome, Firefox, Safari
- [ ] Documentation updated

## Complexity

- **Complexity Level**: HIGH
- **Risk Level**: MEDIUM (OAuth integration adds complexity)
- **Impact**: HIGH (critical user-facing feature)

## Dependencies

- **Blockers**: None
- **Depends On**: Task 002d (Authentication Hardening) - ✅ Complete
- **Blocks**: User onboarding, dashboard access

## Notes

- **OAuth Security**: Use PKCE flow for enhanced security
- **Token Storage**: Consider HttpOnly cookies for production
- **Multi-tenant**: Each tenant can have separate OAuth apps if needed
- **Future Enhancement**: Add Microsoft, GitHub OAuth providers
- **Accessibility**: Follow WCAG 2.1 AA standards
- **Performance**: Lazy load OAuth library to reduce initial bundle size

## Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Library](https://www.npmjs.com/package/@react-oauth/google)
- [FastAPI OAuth Guide](https://fastapi.tiangolo.com/advanced/security/oauth2-scopes/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetsecurity.com/cheatsheets/authentication)
