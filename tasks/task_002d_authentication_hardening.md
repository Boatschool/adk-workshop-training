# Task #002d: Authentication System Hardening & Security Gaps

## Task Information

- **Task Number**: 002d
- **Parent Task**: 002 (Phase 3 - FastAPI Implementation)
- **Task Name**: Authentication System Hardening & Security Gaps
- **Priority**: CRITICAL
- **Estimated Effort**: 16-24 hours
- **Assigned To**: Claude Code
- **Created Date**: 2025-11-24
- **Due Date**: TBD
- **Status**: 🚧 IN PROGRESS (Phases 1-3 Complete)
- **Completion Date**: -
- **Actual Effort**: ~8 hours (Phase 1: ~3h, Phase 2: ~3h, Phase 3: ~2h)

## Description

The current authentication system has a solid foundation with JWT tokens, bcrypt password hashing, and role-based access control, but is missing critical security features required for production deployment. This task addresses security vulnerabilities and implements missing authentication features.

**Business Value:** Enables secure production deployment, prevents account takeover attacks, provides proper user account management, and meets enterprise security requirements for healthcare organizations.

**Scope:** Authentication hardening, security fixes, and missing auth features. Does not include OAuth/SSO integration (separate task).

## Implementation Progress

| Phase | Description | Status | Effort | Commit |
|-------|-------------|--------|--------|--------|
| **Phase 1** | Critical Security Fixes | ✅ Complete | ~3h | `e7b6f45`, `bd4a2b6` |
| **Phase 2** | Refresh Tokens | ✅ Complete | ~3h | `54cabd6` |
| **Phase 3** | Password Reset Flow | ✅ Complete | ~2h | (pending) |
| **Phase 4** | Logout & Token Revocation | 📋 Planned | 2-4h | - |
| **Phase 5** | Change Password | 📋 Planned | 2-4h | - |

### Phase 1 Completed ✅

**Security Fixes Implemented:**
- Fixed privilege escalation: Registration now forces PARTICIPANT role
- Added admin-only `POST /api/v1/users/create` for elevated roles
- Account lockout after 5 failed attempts (15 min lockout)
- Rate limiting: 60 req/min general, 10 req/min for auth endpoints

**Files Created:**
- `src/api/middleware/rate_limit.py`
- `src/db/migrations/versions/69b9c231e4cb_add_account_lockout_fields_to_users.py`

**Files Modified:**
- `src/api/schemas/user.py` - Split UserCreate/UserCreateAdmin
- `src/services/user_service.py` - Lockout logic, dual create methods
- `src/api/routes/users.py` - New admin endpoint, handle AccountLockedError
- `src/core/config.py` - MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES, rate limit settings
- `src/core/exceptions.py` - AccountLockedError
- `src/db/models/user.py` - failed_login_attempts, locked_until fields
- `src/api/main.py` - Rate limiting middleware

### Phase 2 Completed ✅

**Refresh Token Support:**
- RefreshToken model with secure token storage
- 7-day refresh tokens (configurable via REFRESH_TOKEN_EXPIRE_DAYS)
- Token rotation on refresh (old token revoked, new pair issued)
- Updated login returns both access + refresh tokens
- New `POST /api/v1/auth/refresh` endpoint

**Files Created:**
- `src/db/models/refresh_token.py`
- `src/services/refresh_token_service.py`
- `src/api/routes/auth.py`
- `src/db/migrations/versions/eef9007a89c5_add_refresh_tokens_table.py`

**Files Modified:**
- `src/db/models/user.py` - refresh_tokens relationship
- `src/db/models/__init__.py` - export RefreshToken
- `src/api/schemas/user.py` - TokenResponse, updated UserWithToken
- `src/api/routes/users.py` - login returns both tokens
- `src/api/main.py` - added auth router
- `src/core/config.py` - REFRESH_TOKEN_EXPIRE_DAYS

### Phase 3 Completed ✅

**Password Reset Flow:**
- PasswordResetToken model for secure token storage
- 1-hour token expiry (configurable via PASSWORD_RESET_TOKEN_EXPIRE_HOURS)
- Single-use tokens (marked as used after reset)
- All refresh tokens revoked on password reset (force re-login)
- Email enumeration protection (always returns success)
- Integrates with existing email service

**Files Created:**
- `src/db/models/password_reset_token.py`
- `src/services/password_reset_service.py`
- `src/db/migrations/versions/06da01720794_add_password_reset_tokens_table.py`

**Files Modified:**
- `src/db/models/user.py` - password_reset_tokens relationship
- `src/db/models/__init__.py` - export PasswordResetToken
- `src/api/routes/auth.py` - forgot-password and reset-password endpoints
- `src/core/config.py` - PASSWORD_RESET_TOKEN_EXPIRE_HOURS, FRONTEND_URL

**Endpoints Added:**
- `POST /api/v1/auth/forgot-password` - Request password reset email
- `POST /api/v1/auth/reset-password` - Reset password with token

## Current State Assessment

### What's Working ✅

| Component | File | Status |
|-----------|------|--------|
| Password hashing (bcrypt) | `src/core/security.py` | ✅ Complete |
| JWT token creation | `src/core/security.py:47-68` | ✅ Complete |
| JWT token validation | `src/core/security.py:71-93` | ✅ Complete |
| Login endpoint | `src/api/routes/users.py:55-98` | ✅ Complete |
| Registration endpoint | `src/api/routes/users.py:26-52` | ✅ Complete |
| `get_current_user()` dependency | `src/api/dependencies.py:43-96` | ✅ Complete |
| Role-based access control | `src/api/dependencies.py:98-139` | ✅ Complete |
| Tenant context isolation | `src/core/tenancy.py` | ✅ Complete |
| Tenant middleware | `src/api/middleware/tenant.py` | ✅ Complete |
| User model with roles | `src/db/models/user.py` | ✅ Complete |

### Current Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CURRENT AUTH FLOW (Working)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  REGISTRATION                      LOGIN                                    │
│  ─────────────                     ─────                                    │
│  POST /api/v1/users/register       POST /api/v1/users/login                 │
│         │                                  │                                │
│         ▼                                  ▼                                │
│  ┌─────────────────┐              ┌─────────────────┐                       │
│  │ Hash password   │              │ Find user by    │                       │
│  │ with bcrypt     │              │ email           │                       │
│  └────────┬────────┘              └────────┬────────┘                       │
│           │                                │                                │
│           ▼                                ▼                                │
│  ┌─────────────────┐              ┌─────────────────┐                       │
│  │ Create User in  │              │ Verify password │                       │
│  │ tenant schema   │              │ bcrypt.checkpw  │                       │
│  └────────┬────────┘              └────────┬────────┘                       │
│           │                                │                                │
│           ▼                                ▼                                │
│  ┌─────────────────┐              ┌─────────────────┐                       │
│  │ Return user     │              │ Create JWT      │                       │
│  │ (NO token)      │              │ (60 min expiry) │                       │
│  └─────────────────┘              └────────┬────────┘                       │
│                                            │                                │
│                                            ▼                                │
│                                   ┌─────────────────┐                       │
│                                   │ Return token +  │                       │
│                                   │ user data       │                       │
│                                   └─────────────────┘                       │
│                                                                             │
│  PROTECTED ENDPOINT ACCESS                                                  │
│  ─────────────────────────                                                  │
│  Authorization: Bearer <token>                                              │
│  X-Tenant-ID: <tenant_id>                                                   │
│         │                                                                   │
│         ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ get_current_user() dependency                                   │        │
│  │  1. Extract Bearer token                                        │        │
│  │  2. Decode & validate JWT (signature + expiry)                  │        │
│  │  3. Verify token tenant_id == X-Tenant-ID header                │        │
│  │  4. Set TenantContext                                           │        │
│  │  5. Fetch user from DB, verify is_active                        │        │
│  │  6. Return User object                                          │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Security Gaps Identified

### Critical Severity 🚨

| Gap | Location | Impact | OWASP Category |
|-----|----------|--------|----------------|
| **Privilege escalation on registration** | `src/api/routes/users.py:48` | Any user can register as SUPER_ADMIN | A01:2021 Broken Access Control |
| **No password reset flow** | N/A | Users cannot recover accounts | A07:2021 Identification and Auth Failures |
| **No brute force protection** | N/A | Unlimited login attempts | A07:2021 Identification and Auth Failures |
| **No rate limiting** | N/A | DoS and credential stuffing | A07:2021 Identification and Auth Failures |

### High Severity ⚠️

| Gap | Location | Impact |
|-----|----------|--------|
| **No refresh tokens** | N/A | Users must re-login every 60 minutes |
| **No logout/token revocation** | N/A | Compromised tokens valid until expiry |
| **No account lockout** | N/A | No protection after failed attempts |

### Medium Severity 📝

| Gap | Location | Impact |
|-----|----------|--------|
| **No change password endpoint** | N/A | Users cannot update passwords |
| **No email verification** | N/A | Registration accepts any email |
| **No 2FA/MFA support** | N/A | Single factor only |
| **Subdomain tenant not implemented** | `src/api/middleware/tenant.py:34-40` | Only header-based tenant ID works |

## Detailed Gap Analysis

### 1. Privilege Escalation Bug (CRITICAL)

**Current Code** (`src/api/routes/users.py:26-52`):
```python
@router.post("/register", response_model=UserResponse)
async def register_user(...):
    # ...
    user = await user_service.create_user(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        role=user_data.role,  # ❌ No validation - accepts SUPER_ADMIN
    )
```

**Problem:** The `UserCreate` schema allows any role to be specified, including `SUPER_ADMIN`.

**Fix Required:**
- Restrict registration to `PARTICIPANT` role only
- Create separate admin endpoint for elevated role creation

### 2. No Refresh Token Support

**Current Behavior:**
- Access tokens expire in 60 minutes
- No refresh token issued at login
- Users must re-authenticate after expiry

**Impact:**
- Poor UX (frequent re-logins)
- Mobile apps cannot maintain sessions

**Fix Required:**
- Add `RefreshToken` model
- Issue refresh token at login (7-30 day expiry)
- Add `POST /api/v1/auth/refresh` endpoint
- Implement token rotation on refresh

### 3. No Password Reset Flow

**Current State:**
- Email template exists in `src/services/email_service.py:111-147`
- Helper function exists: `send_password_reset_email()` (lines 490-516)
- **No backend endpoints or token generation**

**Fix Required:**
- Add `PasswordResetToken` model
- Add `POST /api/v1/auth/forgot-password` endpoint
- Add `POST /api/v1/auth/reset-password` endpoint
- Implement secure token generation with expiry

### 4. No Brute Force Protection

**Current Behavior:**
- Unlimited login attempts allowed
- No failed attempt tracking
- No account lockout

**Fix Required:**
- Track failed login attempts per user
- Lock account after N failures (configurable, default: 5)
- Implement lockout duration (configurable, default: 15 minutes)
- Add IP-based rate limiting

### 5. No Token Revocation / Logout

**Current Behavior:**
- No logout endpoint
- Tokens valid until natural expiry
- Cannot invalidate compromised tokens

**Fix Required:**
- Add token blacklist (Redis or DB table)
- Add `POST /api/v1/auth/logout` endpoint
- Check blacklist in `get_current_user()`

## Implementation Plan

### Phase 1: Critical Security Fixes (4-6 hours)

**Objective:** Fix vulnerabilities that could lead to immediate compromise.

#### 1.1 Fix Registration Role Validation

**Files to modify:**
- `src/api/routes/users.py`
- `src/api/schemas/user.py`

**Changes:**
```python
# src/api/routes/users.py
@router.post("/register", response_model=UserResponse)
async def register_user(...):
    # Force PARTICIPANT role for self-registration
    user = await user_service.create_user(
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name,
        role=UserRole.PARTICIPANT,  # Always PARTICIPANT
    )

# New admin-only endpoint for elevated roles
@router.post("/create", response_model=UserResponse)
async def create_user(
    user_data: UserCreateAdmin,  # Schema with role field
    current_user: User = Depends(require_admin),
    ...
):
    # Admins can specify any role
    ...
```

#### 1.2 Add Account Lockout

**Files to modify:**
- `src/db/models/user.py`
- `src/services/user_service.py`
- New migration file

**User model additions:**
```python
class User(TenantBase):
    # ... existing fields ...
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
```

**Service logic:**
```python
async def authenticate_user(self, email: str, password: str) -> User:
    user = await self.get_by_email(email)

    # Check if account is locked
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        raise AccountLockedError(f"Account locked until {user.locked_until}")

    if not verify_password(password, user.hashed_password):
        # Increment failed attempts
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.MAX_LOGIN_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=settings.LOCKOUT_DURATION_MINUTES)
        await self.db.commit()
        raise AuthenticationError("Invalid credentials")

    # Reset on successful login
    user.failed_login_attempts = 0
    user.locked_until = None
    await self.db.commit()
    return user
```

#### 1.3 Add Rate Limiting Middleware

**New files:**
- `src/api/middleware/rate_limit.py`

**Implementation:**
```python
from fastapi import Request, HTTPException
from collections import defaultdict
import time

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)

    async def __call__(self, request: Request, call_next):
        client_ip = request.client.host
        now = time.time()

        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if now - req_time < 60
        ]

        if len(self.requests[client_ip]) >= self.requests_per_minute:
            raise HTTPException(status_code=429, detail="Too many requests")

        self.requests[client_ip].append(now)
        return await call_next(request)
```

**Acceptance Criteria - Phase 1:**
- [ ] Registration only allows PARTICIPANT role
- [ ] Admin endpoint exists for creating elevated roles
- [ ] Account locks after 5 failed login attempts
- [ ] Account unlocks after 15 minutes
- [ ] Rate limiting active on /login and /register (60 req/min)
- [ ] All existing tests pass
- [ ] New tests for lockout and rate limiting

---

### Phase 2: Refresh Tokens (4-6 hours)

**Objective:** Improve session management and UX.

#### 2.1 Create RefreshToken Model

**New file:** `src/db/models/refresh_token.py`

```python
class RefreshToken(TenantBase):
    __tablename__ = "refresh_tokens"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user: Mapped["User"] = relationship(back_populates="refresh_tokens")
```

#### 2.2 Update Login Response

**Files to modify:**
- `src/api/schemas/user.py`
- `src/api/routes/users.py`
- `src/core/security.py`

```python
# Schema
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds until access token expiry

# Login returns both tokens
@router.post("/login", response_model=TokenResponse)
async def login(...):
    user = await user_service.authenticate_user(...)
    access_token = create_access_token(...)
    refresh_token = await create_refresh_token(user.id, tenant_id, db)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
```

#### 2.3 Add Refresh Endpoint

**New route:** `POST /api/v1/auth/refresh`

```python
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str = Body(...),
    tenant_id: str = Depends(get_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    # Validate refresh token
    token_record = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token == refresh_token,
            RefreshToken.revoked_at.is_(None),
            RefreshToken.expires_at > datetime.now(timezone.utc)
        )
    )
    token_record = token_record.scalar_one_or_none()

    if not token_record:
        raise HTTPException(401, "Invalid or expired refresh token")

    # Rotate: revoke old, issue new
    token_record.revoked_at = datetime.now(timezone.utc)

    new_access = create_access_token(token_record.user_id, tenant_id, token_record.user.role)
    new_refresh = await create_refresh_token(token_record.user_id, tenant_id, db)

    return TokenResponse(...)
```

**Acceptance Criteria - Phase 2:**
- [ ] RefreshToken model created with migration
- [ ] Login returns both access and refresh tokens
- [ ] `POST /api/v1/auth/refresh` endpoint works
- [ ] Refresh tokens rotate on use (old revoked, new issued)
- [ ] Refresh tokens have 7-day expiry
- [ ] Tests for refresh flow

---

### Phase 3: Password Reset (4-6 hours)

**Objective:** Enable account recovery.

#### 3.1 Create PasswordResetToken Model

**New file:** `src/db/models/password_reset_token.py`

```python
class PasswordResetToken(TenantBase):
    __tablename__ = "password_reset_tokens"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    token: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
```

#### 3.2 Add Password Reset Endpoints

**New routes:**

```python
# POST /api/v1/auth/forgot-password
@router.post("/forgot-password")
async def forgot_password(
    email: EmailStr = Body(..., embed=True),
    tenant_id: str = Depends(get_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    user = await user_service.get_by_email(email)
    if user:  # Don't reveal if user exists
        token = secrets.token_urlsafe(32)
        reset_token = PasswordResetToken(
            token=token,
            user_id=user.id,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        db.add(reset_token)
        await db.commit()
        await send_password_reset_email(user.email, token)

    return {"message": "If the email exists, a reset link has been sent"}

# POST /api/v1/auth/reset-password
@router.post("/reset-password")
async def reset_password(
    token: str = Body(...),
    new_password: str = Body(..., min_length=8),
    tenant_id: str = Depends(get_tenant_id),
    db: AsyncSession = Depends(get_db),
):
    reset_token = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token == token,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > datetime.now(timezone.utc)
        )
    )
    reset_token = reset_token.scalar_one_or_none()

    if not reset_token:
        raise HTTPException(400, "Invalid or expired reset token")

    # Update password
    user = await user_service.get_by_id(reset_token.user_id)
    user.hashed_password = hash_password(new_password)
    reset_token.used_at = datetime.now(timezone.utc)

    # Invalidate all refresh tokens (force re-login)
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user.id)
        .values(revoked_at=datetime.now(timezone.utc))
    )

    await db.commit()
    return {"message": "Password reset successful"}
```

**Acceptance Criteria - Phase 3:**
- [ ] PasswordResetToken model created with migration
- [ ] `POST /api/v1/auth/forgot-password` endpoint works
- [ ] `POST /api/v1/auth/reset-password` endpoint works
- [ ] Reset tokens expire after 1 hour
- [ ] Reset tokens single-use (marked used after reset)
- [ ] All refresh tokens revoked on password reset
- [ ] Email sent using existing email service
- [ ] Tests for password reset flow

---

### Phase 4: Logout & Token Revocation (2-4 hours)

**Objective:** Allow users to invalidate sessions.

#### 4.1 Add Logout Endpoint

```python
@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Revoke all refresh tokens for this user
    await db.execute(
        update(RefreshToken)
        .where(
            RefreshToken.user_id == current_user.id,
            RefreshToken.revoked_at.is_(None)
        )
        .values(revoked_at=datetime.now(timezone.utc))
    )
    await db.commit()
    return {"message": "Logged out successfully"}
```

#### 4.2 Optional: Access Token Blacklist

For immediate access token invalidation (optional, requires Redis):

```python
# In-memory for MVP, Redis for production
class TokenBlacklist:
    def __init__(self):
        self.blacklist: set[str] = set()

    def add(self, token_jti: str, expires_at: datetime):
        self.blacklist.add(token_jti)
        # Schedule cleanup after expiry

    def is_blacklisted(self, token_jti: str) -> bool:
        return token_jti in self.blacklist
```

**Acceptance Criteria - Phase 4:**
- [ ] `POST /api/v1/auth/logout` endpoint works
- [ ] All refresh tokens revoked on logout
- [ ] Tests for logout flow

---

### Phase 5: Additional Security Endpoints (2-4 hours)

#### 5.1 Change Password Endpoint

```python
@router.post("/change-password")
async def change_password(
    current_password: str = Body(...),
    new_password: str = Body(..., min_length=8),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(400, "Current password is incorrect")

    current_user.hashed_password = hash_password(new_password)
    await db.commit()
    return {"message": "Password changed successfully"}
```

#### 5.2 Email Verification (Optional)

Lower priority - can be deferred.

**Acceptance Criteria - Phase 5:**
- [ ] `POST /api/v1/auth/change-password` endpoint works
- [ ] Requires current password verification
- [ ] Tests for change password flow

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL with SQLAlchemy 2.0 async
- **Security**: bcrypt, PyJWT
- **Email**: Existing email service (`src/services/email_service.py`)
- **Rate Limiting**: In-memory (MVP) or Redis (production)
- **Testing**: pytest, pytest-asyncio

## Complexity

- **Complexity Level**: HIGH
- **Risk Level**: HIGH (security-critical changes)
- **Impact**: HIGH (affects all authenticated endpoints)

## Dependencies

- **Blockers**: None
- **Depends On**: Task 002 Phase 3 (FastAPI implementation) - ✅ Complete
- **Blocks**: Production deployment, Task 003 (Pre-deployment validation)

## Acceptance Criteria

### Phase 1 (Critical)
- [ ] Registration restricted to PARTICIPANT role
- [ ] Admin endpoint for elevated role creation
- [ ] Account lockout after 5 failed attempts
- [ ] Rate limiting on auth endpoints

### Phase 2 (Refresh Tokens)
- [ ] RefreshToken model with migration
- [ ] Login returns access + refresh tokens
- [ ] Refresh endpoint with token rotation

### Phase 3 (Password Reset)
- [ ] PasswordResetToken model with migration
- [ ] Forgot password endpoint
- [ ] Reset password endpoint
- [ ] Email integration

### Phase 4 (Logout)
- [ ] Logout endpoint revokes refresh tokens

### Phase 5 (Additional)
- [ ] Change password endpoint

### All Phases
- [ ] All existing tests pass
- [ ] New tests for each feature (>80% coverage)
- [ ] No TypeScript errors (frontend if affected)
- [ ] API documentation updated (OpenAPI)
- [ ] Security review completed

## Test Strategy

**Testing Type**: Unit Testing + Integration Testing

**Test Plan:**

1. **Unit Tests** (`tests/unit/`)
   - `test_security.py` - Password hashing, JWT functions
   - `test_rate_limit.py` - Rate limiter logic
   - `test_auth_service.py` - Lockout logic

2. **Integration Tests** (`tests/integration/`)
   - `test_auth_endpoints.py` - Full auth flow
   - `test_refresh_tokens.py` - Refresh flow
   - `test_password_reset.py` - Reset flow

**Commands to run:**

```bash
# Run all tests
poetry run pytest

# Run auth-specific tests
poetry run pytest tests/ -k "auth" -v

# Run with coverage
poetry run pytest --cov=src --cov-report=html

# Type checking
poetry run mypy src/

# Lint
poetry run ruff check .
```

## Implementation Notes

- **Backwards Compatibility**: Existing login response changes (adds refresh_token) - update frontend
- **Database Migrations**: 3 new migrations (user fields, refresh_tokens, password_reset_tokens)
- **Configuration**: Add new settings (MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS)
- **Email Service**: Already exists, just needs to be called
- **Frontend Impact**: Login response schema changes, need to store refresh token

## File Inventory

### Files to Create
- `src/db/models/refresh_token.py`
- `src/db/models/password_reset_token.py`
- `src/api/middleware/rate_limit.py`
- `src/api/routes/auth.py` (new auth-specific routes)
- `tests/unit/test_rate_limit.py`
- `tests/integration/test_auth_endpoints.py`
- Migration files (auto-generated)

### Files to Modify
- `src/db/models/user.py` - Add lockout fields
- `src/db/models/__init__.py` - Export new models
- `src/api/routes/users.py` - Fix registration, add admin create
- `src/api/schemas/user.py` - Update response schemas
- `src/services/user_service.py` - Add lockout logic
- `src/api/main.py` - Add rate limiting middleware, new routes
- `src/core/config.py` - Add new settings
- `src/core/exceptions.py` - Add AccountLockedError

## Related Issues

- Part of: Task #002 (Production Architecture)
- Related: Task #003 (Pre-deployment Testing)
- Security audit finding: Registration role vulnerability

---

**Template Version**: 2.0 (Markdown)
**Last Updated**: 2025-11-24
