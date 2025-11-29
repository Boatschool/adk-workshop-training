# Task #005: Lightweight Standalone Authentication for ADK Workshop

## Task Information

- **Task Number**: 005
- **Task Name**: Lightweight Standalone Authentication for ADK Workshop
- **Priority**: HIGH
- **Estimated Effort**: 2-3 days
- **Created Date**: 2025-11-29
- **Status**: COMPLETED
- **Replaces**: Temporarily defers Task #004 (Centralized Authentication Platform)

## Executive Summary

Implement a lightweight, production-ready authentication system for the ADK Workshop application that can be deployed immediately. This approach leverages the existing authentication infrastructure already built into the application, requiring minimal changes while ensuring security best practices.

## Background

Task #004 planned a centralized SSO system across multiple GraymatterLab applications (learn, design, build). However, the other applications (Agent Architect, main website updates) are not ready for development. Rather than wait, we'll deploy the ADK Workshop with its own standalone auth system that:

1. Works immediately with the current codebase
2. Maintains security best practices
3. Can be migrated to centralized auth later (Task #004 design compatible)

## Current State Analysis

### What's Already Built

The application already has a robust authentication system:

**Backend (`src/`)**:
- JWT access tokens with HS256 signing (`src/core/security.py`)
- Refresh token rotation with hashed storage (`src/services/refresh_token_service.py`)
- Password hashing with bcrypt (`src/core/security.py`)
- Brute force protection with account lockout (`src/services/user_service.py`)
- Role-based access control (PARTICIPANT, INSTRUCTOR, TENANT_ADMIN, SUPER_ADMIN)
- Token refresh endpoint with rotation (`src/api/routes/auth.py`)
- Password reset flow (`src/services/password_reset_service.py`)
- Multi-tenant schema isolation

**Frontend (`frontend/src/`)**:
- React AuthContext with token management (`contexts/AuthContext.tsx`)
- Automatic token refresh before expiry (`contexts/AuthContext.tsx`)
- LocalStorage token persistence (`utils/storage.ts`)
- API interceptors for auth headers (`services/api.ts`)
- Login/Register pages (existing)

### What's Missing/Needs Attention

| Component | Status | Action Needed |
|-----------|--------|---------------|
| Registration returns tokens | Missing | Backend returns user only, not tokens |
| Email verification | Not implemented | Optional for MVP, add later |
| Rate limiting | Not enforced | Add middleware for auth endpoints |
| HTTPS enforcement | Config only | Ensure production CORS/cookies are secure |
| Password strength validation | Basic (8 char min) | Consider stronger rules |
| Session management UI | Missing | Users can't see/revoke sessions |
| Audit logging | Missing | Log auth events for security |

## Implementation Plan

### Phase 1: Backend Fixes (Day 1)

#### 1.1 Fix Registration to Return Tokens

Currently, `/users/register` returns only a `UserResponse`. It should return `UserWithToken` like login does, so users are automatically logged in after registration.

**File**: `src/api/routes/users.py`

Change the register endpoint to:
- Create JWT access token after user creation
- Create refresh token
- Return `UserWithToken` instead of `UserResponse`

#### 1.2 Add Rate Limiting Middleware

**New File**: `src/api/middleware/rate_limit.py`

Create an in-memory rate limiter for auth endpoints:
- 10 requests per minute for auth endpoints (login, register, password reset)
- 60 requests per minute for general API
- Key by IP address

#### 1.3 Add Security Headers Middleware

**Update**: `src/api/main.py`

Add security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (production only)

#### 1.4 Add Audit Logging for Auth Events

**New File**: `src/core/audit.py`

Log security-relevant events:
- LOGIN_SUCCESS, LOGIN_FAILURE
- LOGOUT, REGISTER
- PASSWORD_CHANGE, PASSWORD_RESET_REQUEST, PASSWORD_RESET_COMPLETE
- TOKEN_REFRESH, ACCOUNT_LOCKED

### Phase 2: Frontend Enhancements (Day 1-2)

#### 2.1 Verify Registration Flow

The frontend AuthContext already handles `UserWithToken` response - verify it works correctly after backend fix.

#### 2.2 Add Password Strength Indicator (Optional)

New component to show password strength during registration.

#### 2.3 Add Session Timeout Warning (Optional)

Warn user 5 minutes before token expires with option to extend.

### Phase 3: Production Security Config (Day 2)

#### 3.1 Environment Variables for Production

```bash
# Production security settings
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
RATE_LIMIT_AUTH_REQUESTS_PER_MINUTE=10

# CORS for production
CORS_ORIGINS=https://learn.graymatterlab.ai
```

#### 3.2 Update Cloud Run Configuration

- Ensure HTTPS-only traffic
- Set appropriate timeout for auth operations

#### 3.3 Database Security

- Verify `refresh_tokens` table has proper indexes
- Ensure password hashes use appropriate bcrypt cost factor

### Phase 4: Testing & Validation (Day 2-3)

#### 4.1 Unit Tests
- Rate limiting tests
- Token rotation tests
- Password validation tests
- Audit logging tests

#### 4.2 Integration Tests
- Full login/logout flow
- Registration with token return
- Refresh token rotation
- Account lockout after failed attempts

#### 4.3 Security Testing
- Verify tokens are properly invalidated on logout
- Test rate limiting effectiveness
- Verify brute force protection
- Check for token leakage in logs

## Future Migration Path (Task #004 Compatibility)

This lightweight auth is designed to migrate to centralized auth:

1. **JWT Claims**: Already include `tenant_id` and `role` - compatible with SSO token structure
2. **Token Storage**: Using localStorage now, can switch to HttpOnly cookies later
3. **API Structure**: `/api/v1/auth/*` endpoints match planned SSO patterns
4. **User Model**: Compatible with shared auth DB schema

When ready to implement Task #004:
1. Deploy auth.graymatterlab.ai service
2. Update frontend to redirect to auth service for login
3. Backend validates tokens from auth service (same JWT structure)
4. Migrate user data to shared auth DB

## Acceptance Criteria

### Must Have (MVP)
- [x] Registration returns access token and refresh token
- [x] Rate limiting on auth endpoints (10 req/min) - *already existed*
- [x] Security headers middleware
- [x] Audit logging for auth events (`src/core/audit.py`)
- [x] All existing auth tests pass (163 unit tests passed)
- [ ] Production deployment verified

### Should Have
- [ ] Password strength indicator in UI
- [ ] Session timeout warning
- [ ] Enhanced password validation (uppercase, number, special char)

### Nice to Have (Future)
- [ ] Session management UI (view/revoke sessions)
- [ ] Email verification flow
- [ ] "Remember me" functionality
- [ ] OAuth2 social login preparation

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Token theft via XSS | Medium | High | CSP headers, sanitize inputs |
| Brute force attacks | Medium | Medium | Rate limiting, account lockout (already implemented) |
| Session hijacking | Low | High | Short token expiry, refresh rotation |
| Migration complexity | Low | Medium | Compatible JWT structure |

## Dependencies

- No external dependencies required
- Uses existing bcrypt, PyJWT libraries
- Compatible with current PostgreSQL setup

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Backend Fixes | 1 day | Registration tokens, rate limiting, audit logging |
| Phase 2: Frontend Enhancements | 0.5 day | Password strength, session warning |
| Phase 3: Production Config | 0.5 day | Security hardening, environment setup |
| Phase 4: Testing | 1 day | Unit tests, integration tests, security validation |

**Total: 2-3 days**

## Notes

- This is a tactical solution to unblock deployment
- Task #004 remains the strategic goal for centralized auth
- All changes are additive - no breaking changes to existing API
- Frontend already handles the expected response formats
