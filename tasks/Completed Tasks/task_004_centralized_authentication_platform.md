# Task #004: Centralized Authentication Platform for GraymatterLab Applications

## Task Information

- **Task Number**: 004
- **Task Name**: Centralized Authentication Platform for GraymatterLab Applications
- **Priority**: HIGH
- **Estimated Effort**: 3-4 weeks (phased rollout)
- **Assigned To**: TBD
- **Created Date**: 2025-11-27
- **Due Date**: TBD
- **Status**: PLANNING

## Executive Summary

Implement a centralized Single Sign-On (SSO) authentication system for the GraymatterLab application suite. This will enable users to authenticate once and access all GraymatterLab applications seamlessly while maintaining security best practices.

## Business Context

### Current State
- **GraymatterLab Studio** (`build.graymatterlab.ai`) - Has mature auth system with JWT, refresh tokens, MFA, API keys
- **ADK Workshop** (`learn.graymatterlab.ai`) - Has JWT auth but isolated from Studio
- **Agent Architect** (`design.graymatterlab.ai`) - Planned, no auth yet

### User Journey Progression
```
learn.graymatterlab.ai → design.graymatterlab.ai → build.graymatterlab.ai
      (Learn)                  (Design)                  (Build)
   ADK Workshop            Agent Architect            Agent Studio
```
- **Main Website** (`www.graymatterlab.ai`) - Marketing site, no auth

### Desired State
- Single login experience across all applications
- Consistent branding (matching current GraymatterStudio login UI)
- Centralized user management
- Users enter through main website for marketing purposes
- Seamless navigation between applications without re-authentication

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           www.graymatterlab.ai                                  │
│                         (Marketing Website - Public)                            │
│                                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│   │  Products   │  │   Pricing   │  │    About    │  │   Contact   │           │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘           │
│                                                                                 │
│   Product Cards linking to (user journey: learn → design → build):             │
│   • ADK Workshop         → learn.graymatterlab.ai                               │
│   • Agent Architect      → design.graymatterlab.ai                              │
│   • Agent Studio         → build.graymatterlab.ai                               │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         auth.graymatterlab.ai                                   │
│                    (Centralized Authentication Service)                          │
│                                                                                 │
│   Leverages GraymatterLab Studio's existing auth:                               │
│   • AuthenticationFacadeService (login/logout flows)                            │
│   • UnifiedAuthService (token validation)                                       │
│   • JWT + Refresh Tokens                                                        │
│   • MFA Support                                                                 │
│   • API Key Management                                                          │
│   • Device Tracking & Suspicious Login Detection                                │
│                                                                                 │
│   Endpoints:                                                                    │
│   • GET  /login?redirect={app_url}      - Login page with redirect              │
│   • POST /api/auth/login                - Authenticate credentials              │
│   • POST /api/auth/logout               - End session                           │
│   • POST /api/auth/refresh              - Refresh access token                  │
│   • GET  /api/auth/validate             - Validate token (for apps)             │
│   • GET  /api/auth/user                 - Get current user info                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
              ┌─────────────────────────┼─────────────────────────┐
              ▼                         ▼                         ▼
┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐
│   learn.graymatterlab   │  │  design.graymatterlab   │  │  build.graymatterlab    │
│        .ai              │  │        .ai              │  │        .ai              │
│                         │  │                         │  │                         │
│   ADK Workshop          │  │   Agent Architect       │  │   Agent Studio          │
│   (1) LEARN             │  │   (2) DESIGN            │  │   (3) BUILD             │
│                         │  │                         │  │                         │
│   Status: DEPLOYED      │  │   Status: PLANNED       │  │   Status: DEPLOYED      │
│   Timeline: NOW         │  │   Timeline: Q1 2026     │  │   Timeline: NOW         │
│                         │  │                         │  │                         │
│   Auth: Validates JWT   │  │   Auth: Validates JWT   │  │   Auth: Full system     │
│   from auth.gml.ai      │  │   from auth.gml.ai      │  │   (source of truth)     │
└─────────────────────────┘  └─────────────────────────┘  └─────────────────────────┘
```

## Token Architecture

### JWT Token Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  Access Token (JWT)                                             │
│  ─────────────────────────────────────────────────────────────  │
│  Header: { "alg": "RS256", "typ": "JWT" }                       │
│  Payload: {                                                     │
│    "sub": "user-uuid",                                          │
│    "email": "user@example.com",                                 │
│    "name": "User Name",                                         │
│    "iss": "auth.graymatterlab.ai",                              │
│    "aud": ["*.graymatterlab.ai"],      // All subdomains        │
│    "iat": 1700000000,                                           │
│    "exp": 1700003600,                  // 1 hour                │
│    "permissions": ["workshop:read", "studio:full"],             │
│    "tenant_id": "org-uuid"             // Multi-tenant support  │
│  }                                                              │
│  Signature: RS256 signed                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Refresh Token                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  • Stored in HttpOnly cookie (domain: .graymatterlab.ai)        │
│  • 7-day expiration                                             │
│  • Rotated on each use                                          │
│  • Stored in database for revocation                            │
└─────────────────────────────────────────────────────────────────┘
```

### Cross-Domain Cookie Strategy

```
Cookie Configuration:
─────────────────────
Name: gml_refresh_token
Domain: .graymatterlab.ai        // Available to all subdomains
Path: /
HttpOnly: true                   // Not accessible via JavaScript
Secure: true                     // HTTPS only
SameSite: Lax                    // Allow cross-subdomain requests
MaxAge: 604800                   // 7 days
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal: Extract and deploy auth service from GraymatterLab Studio**

#### 1.1 Create Auth Service Project
```bash
# New project structure
auth.graymatterlab.ai/
├── src/
│   ├── services/
│   │   ├── AuthenticationFacadeService.ts   # From Studio
│   │   ├── UnifiedAuthService.ts            # From Studio
│   │   ├── TokenService.ts                  # JWT management
│   │   └── SessionService.ts                # Session tracking
│   ├── routes/
│   │   ├── auth.routes.ts                   # Login/logout endpoints
│   │   └── validate.routes.ts               # Token validation
│   ├── middleware/
│   │   └── cors.middleware.ts               # Cross-origin config
│   └── pages/
│       ├── login.tsx                        # Login UI (from Studio)
│       ├── register.tsx                     # Registration UI
│       └── forgot-password.tsx              # Password reset
├── prisma/
│   └── schema.prisma                        # User, Session, RefreshToken
└── Dockerfile
```

#### 1.2 Database Schema (Shared Auth DB)
```sql
-- Users (source of truth)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'  -- active, suspended, deleted
);

-- Refresh Tokens (for revocation)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    revoked_at TIMESTAMP
);

-- Sessions (active logins)
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    ip_address VARCHAR(45),
    last_active_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

-- Application Permissions
CREATE TABLE user_app_permissions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    app_name VARCHAR(50) NOT NULL,      -- workshop, design, studio
    permissions JSONB NOT NULL,         -- ["read", "write", "admin"]
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by UUID REFERENCES users(id)
);
```

#### 1.3 Deploy Auth Service
- Deploy to Cloud Run as `auth.graymatterlab.ai`
- Configure DNS CNAME record
- Set up SSL certificate
- Configure CORS for `*.graymatterlab.ai`

### Phase 2: Integrate Workshop Application (Week 2)
**Goal: Workshop uses centralized auth**

#### 2.1 Update Workshop Frontend
```typescript
// frontend/src/services/authService.ts

const AUTH_BASE_URL = 'https://auth.graymatterlab.ai';

export const authService = {
  // Redirect to centralized login
  login(returnUrl?: string) {
    const redirect = returnUrl || window.location.href;
    window.location.href = `${AUTH_BASE_URL}/login?redirect=${encodeURIComponent(redirect)}`;
  },

  // Validate token with auth service
  async validateToken(token: string): Promise<User | null> {
    const response = await fetch(`${AUTH_BASE_URL}/api/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) return null;
    return response.json();
  },

  // Refresh token using HttpOnly cookie
  async refreshToken(): Promise<string | null> {
    const response = await fetch(`${AUTH_BASE_URL}/api/auth/refresh`, {
      credentials: 'include'  // Send cookies
    });
    if (!response.ok) return null;
    const { accessToken } = await response.json();
    return accessToken;
  },

  logout() {
    window.location.href = `${AUTH_BASE_URL}/logout?redirect=${window.location.origin}`;
  }
};
```

#### 2.2 Update Workshop Backend
```python
# src/core/security.py - Update to validate against auth service

import httpx
from functools import lru_cache

AUTH_SERVICE_URL = "https://auth.graymatterlab.ai"

async def validate_token_with_auth_service(token: str) -> dict | None:
    """Validate JWT with centralized auth service."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{AUTH_SERVICE_URL}/api/auth/validate",
            headers={"Authorization": f"Bearer {token}"}
        )
        if response.status_code == 200:
            return response.json()
    return None

# Alternative: Validate locally with shared public key
@lru_cache()
def get_auth_public_key() -> str:
    """Fetch public key from auth service for local validation."""
    response = httpx.get(f"{AUTH_SERVICE_URL}/.well-known/jwks.json")
    return response.json()
```

#### 2.3 Update Cloud Run Configuration
```yaml
# Allow unauthenticated access (app handles auth)
allow_unauthenticated_api = true

# Update CORS origins
static_cors_origins = [
  "https://auth.graymatterlab.ai",
  "https://www.graymatterlab.ai"
]
```

### Phase 3: Update Main Website (Week 2-3)
**Goal: Products page with app links and login state awareness**

#### 3.1 Add Products Section to www.graymatterlab.ai
```html
<!-- Products page or section -->
<section class="products">
  <h2>Our Platform</h2>

  <div class="product-cards">
    <!-- Workshop Card -->
    <div class="product-card">
      <div class="icon">📚</div>
      <h3>ADK Workshop</h3>
      <p>Learn to build AI agents with hands-on training</p>
      <ul>
        <li>Interactive tutorials</li>
        <li>Real-world exercises</li>
        <li>Progress tracking</li>
      </ul>
      <a href="https://workshop.graymatterlab.ai" class="btn">
        Start Learning →
      </a>
      <span class="status available">Available Now</span>
    </div>

    <!-- Agent Architect Card -->
    <div class="product-card">
      <div class="icon">🎨</div>
      <h3>Agent Architect</h3>
      <p>Design AI agents with our visual builder</p>
      <ul>
        <li>Drag-and-drop interface</li>
        <li>Template library</li>
        <li>One-click deployment</li>
      </ul>
      <a href="https://design.graymatterlab.ai" class="btn disabled">
        Coming Q1 2026
      </a>
      <span class="status coming-soon">Coming Soon</span>
    </div>

    <!-- Agent Studio Card -->
    <div class="product-card">
      <div class="icon">🚀</div>
      <h3>Agent Studio</h3>
      <p>Deploy and manage production AI agents</p>
      <ul>
        <li>Production-ready agents</li>
        <li>Monitoring & analytics</li>
        <li>Enterprise features</li>
      </ul>
      <a href="https://build.graymatterlab.ai" class="btn">
        Start Building →
      </a>
      <span class="status available">Available Now</span>
    </div>
  </div>
</section>
```

#### 3.2 Add Login State Awareness
```javascript
// Check if user is logged in (via auth service)
async function checkAuthState() {
  try {
    const response = await fetch('https://auth.graymatterlab.ai/api/auth/user', {
      credentials: 'include'
    });
    if (response.ok) {
      const user = await response.json();
      showLoggedInState(user);
    } else {
      showLoggedOutState();
    }
  } catch {
    showLoggedOutState();
  }
}

function showLoggedInState(user) {
  document.getElementById('auth-buttons').innerHTML = `
    <span>Welcome, ${user.name}</span>
    <a href="https://auth.graymatterlab.ai/logout" class="btn-secondary">Logout</a>
  `;
}

function showLoggedOutState() {
  document.getElementById('auth-buttons').innerHTML = `
    <a href="https://auth.graymatterlab.ai/login" class="btn-primary">Login</a>
    <a href="https://auth.graymatterlab.ai/register" class="btn-secondary">Sign Up</a>
  `;
}
```

### Phase 4: Integrate Studio at build.graymatterlab.ai (Week 3)
**Goal: Studio uses centralized auth and moves to build.graymatterlab.ai**

Since Studio already has the auth system, this phase is about:

1. **Extract auth to shared service** (if not already done)
2. **Configure Studio to use auth.graymatterlab.ai** for token validation
3. **Migrate user database** to shared auth DB
4. **Update Studio's login page** to redirect to auth subdomain
5. **Configure build.graymatterlab.ai domain** (replacing studio.graymatterlab.ai)

### Phase 5: Prepare for Agent Architect (Week 4+)
**Goal: Architecture ready for design.graymatterlab.ai**

#### 5.1 Document Integration Pattern
```typescript
// Standard integration pattern for new apps

// 1. Check auth on app load
async function initAuth() {
  const token = localStorage.getItem('gml_access_token');

  if (!token) {
    // No token, redirect to login
    redirectToLogin();
    return;
  }

  // Validate token
  const user = await authService.validateToken(token);
  if (!user) {
    // Token invalid, try refresh
    const newToken = await authService.refreshToken();
    if (!newToken) {
      redirectToLogin();
      return;
    }
    localStorage.setItem('gml_access_token', newToken);
  }

  // User authenticated, proceed
  initApp(user);
}

// 2. Redirect to centralized login
function redirectToLogin() {
  const returnUrl = window.location.href;
  window.location.href = `https://auth.graymatterlab.ai/login?redirect=${encodeURIComponent(returnUrl)}`;
}

// 3. Handle callback from auth service
function handleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    localStorage.setItem('gml_access_token', token);
    window.history.replaceState({}, '', window.location.pathname);
  }
}
```

## User Flows

### Flow 1: New User from Marketing Site
```
1. User visits www.graymatterlab.ai
2. User clicks "Workshop Platform" product card
3. Redirected to learn.graymatterlab.ai
4. Workshop detects no auth → redirects to auth.graymatterlab.ai/login?redirect=learn...
5. User sees login page (GraymatterStudio design)
6. User clicks "Create Account"
7. User completes registration
8. User redirected back to learn.graymatterlab.ai with token
9. Workshop validates token, shows dashboard
```

### Flow 2: Existing User Accessing Multiple Apps
```
1. User logged into build.graymatterlab.ai
2. User visits learn.graymatterlab.ai
3. Workshop checks auth → finds valid refresh token cookie
4. Workshop exchanges cookie for access token
5. User immediately sees workshop dashboard (no login required)
```

### Flow 3: Session Expiry
```
1. User's access token expires (1 hour)
2. Next API call fails with 401
3. Frontend automatically calls /api/auth/refresh
4. Auth service validates refresh token cookie
5. New access token returned
6. Original request retried with new token
```

## Security Considerations

### Token Security
- [ ] Access tokens: Short-lived (1 hour), stored in memory or localStorage
- [ ] Refresh tokens: HttpOnly cookies, 7-day expiry, rotated on use
- [ ] All tokens use RS256 (asymmetric) for validation across services
- [ ] Token blacklist for immediate revocation on logout

### CORS Configuration
```javascript
// auth.graymatterlab.ai CORS config
const corsOptions = {
  origin: [
    'https://www.graymatterlab.ai',
    'https://learn.graymatterlab.ai',
    'https://design.graymatterlab.ai',
    'https://build.graymatterlab.ai',
    // Development
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:4000'
  ],
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Rate Limiting
- Login attempts: 5 per minute per IP
- Token refresh: 60 per hour per user
- Registration: 3 per hour per IP

### Audit Logging
- All login attempts (success/failure)
- Token refresh events
- Session creation/termination
- Permission changes

## Acceptance Criteria

### Phase 1
- [ ] Auth service extracted from Studio codebase
- [ ] Auth service deployed to `auth.graymatterlab.ai`
- [ ] SSL certificate provisioned
- [ ] Login UI matches current GraymatterStudio design
- [ ] JWT tokens issued with `*.graymatterlab.ai` audience

### Phase 2
- [ ] Workshop frontend redirects to auth service for login
- [ ] Workshop backend validates tokens against auth service
- [ ] Users can log in via auth service and access workshop
- [ ] Session persists across page reloads

### Phase 3
- [ ] Main website has products section with app links
- [ ] Main website shows login state (logged in/out)
- [ ] Consistent navigation between marketing site and apps

### Phase 4
- [ ] Studio uses centralized auth service
- [ ] Existing Studio users migrated to shared auth DB
- [ ] SSO works between Studio and Workshop
- [ ] Studio accessible at `build.graymatterlab.ai`

### Phase 5
- [ ] Integration documentation complete
- [ ] Template/starter code for new apps
- [ ] Agent Architect can integrate when ready

## Infrastructure Requirements

### New Resources
| Resource | Purpose | Estimated Cost |
|----------|---------|----------------|
| Cloud Run (auth service) | Auth API + UI | ~$50/month |
| Cloud SQL (shared auth DB) | User/session data | Included in existing |
| Cloud DNS (auth.graymatterlab.ai) | CNAME record | Included |
| SSL Certificate | HTTPS | Free (managed) |

### DNS Records to Add
```
auth.graymatterlab.ai    CNAME    ghs.googlehosted.com
build.graymatterlab.ai   CNAME    ghs.googlehosted.com  (for Studio)
design.graymatterlab.ai  CNAME    ghs.googlehosted.com  (when ready)
```

### Existing DNS Records
```
learn.graymatterlab.ai   CNAME    ghs.googlehosted.com  (Workshop - DEPLOYED)
```

## Migration Strategy

### User Data Migration
1. **Export Studio users** to shared auth DB
2. **Keep Studio's existing tables** as reference during transition
3. **Update Studio** to read from shared auth DB
4. **Verify SSO works** between apps
5. **Deprecate Studio's local user tables** after 30-day validation

### Rollback Plan
- Auth service can be bypassed by reverting app configs
- Each app maintains ability to validate tokens locally
- Shared DB can be rolled back to app-specific DBs

## Dependencies

- **Depends On**:
  - GraymatterLab Studio auth codebase access
  - DNS control for graymatterlab.ai
  - www.graymatterlab.ai update access

- **Blocks**:
  - Agent Architect (design.graymatterlab.ai) launch
  - Any new GraymatterLab applications

## Timeline

| Phase | Duration | Target Completion |
|-------|----------|-------------------|
| Phase 1: Foundation | 1 week | Week 1 |
| Phase 2: Workshop Integration | 1 week | Week 2 |
| Phase 3: Website Updates | 0.5 week | Week 2-3 |
| Phase 4: Studio Integration | 1 week | Week 3 |
| Phase 5: Documentation | 0.5 week | Week 4 |
| Buffer/Testing | 1 week | Week 4-5 |

## Notes

- GraymatterLab Studio's auth architecture (AuthenticationFacadeService + UnifiedAuthService) is mature and battle-tested
- The login UI from Studio (shown in screenshots) should be reused for consistency
- Consider future OAuth2/OIDC provider functionality for enterprise customers
- MFA should be enabled by default for production environments

## References

- [GraymatterLab Studio Auth Architecture](../../../graymatterlab-studio/tasks/authentication/authentication_architecture.md)
- [Workshop Production Deployment](../docs/deployment/PRODUCTION_DEPLOYMENT.md)
- [Task 002d - Authentication Hardening](./task_002d_authentication_hardening.md)
