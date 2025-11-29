# ADR 004: JWT Authentication over Firebase Auth

## Status

**Accepted** - 2025-11-21

## Context

The platform requires user authentication for the multi-tenant API. We evaluated two primary approaches:

1. **Firebase Authentication**: Google's managed auth service
2. **Custom JWT**: Self-managed JWT token generation and validation

The original architecture document suggested Firebase Auth, but during implementation we reassessed based on:
- Development velocity requirements
- MVP scope constraints
- Integration complexity
- Cost considerations

## Decision

We chose **custom JWT authentication** for the MVP, with Firebase Auth as a future enhancement.

## Rationale

### MVP Velocity

Custom JWT implementation was faster to deliver:

```python
# Our implementation - straightforward
from jose import jwt

def create_access_token(user_id: str, tenant_id: str) -> str:
    payload = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "exp": datetime.utcnow() + timedelta(minutes=60),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
```

Firebase Auth would require:
- Firebase project setup
- SDK integration
- Token verification middleware
- User sync between Firebase and our database
- Multi-tenant Firebase configuration

### Control Over User Data

With custom auth, user data lives entirely in our PostgreSQL database:
- User records in tenant schema
- Password hashes stored with bcrypt
- No external dependencies for user queries
- Full control over user attributes

### Cost

- **Custom JWT**: No additional cost
- **Firebase Auth**: Free tier, then $0.0055/MAU after 50K

While Firebase's free tier is generous, custom JWT has zero marginal cost.

### Sufficient for MVP

Our authentication needs are straightforward:
- Email/password login
- JWT tokens with 1-hour expiration
- Role-based access control (4 roles)
- Tenant-scoped authorization

Firebase Auth's advanced features (social login, MFA, phone auth) aren't MVP requirements.

## Implementation

### Token Structure

```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "role": "instructor",
  "exp": 1700000000,
  "iat": 1699996400
}
```

### Security Measures

1. **Strong secret key**: 256-bit key from Secret Manager
2. **Short expiration**: 60-minute token lifetime
3. **Password hashing**: bcrypt with cost factor 12
4. **HTTPS only**: TLS enforced by Cloud Run

### Code Location

- Token generation: `src/core/security.py`
- Token validation: `src/api/dependencies.py`
- User service: `src/services/user_service.py`

## Consequences

### Positive

- **Faster MVP delivery**: Implemented in hours, not days
- **Simpler architecture**: No external auth dependency
- **Full data control**: Users fully in our database
- **No vendor lock-in**: Can migrate to any auth provider later
- **Easier testing**: No Firebase emulator needed

### Negative

- **No social login**: Users must create password accounts
- **No built-in MFA**: Would need to implement ourselves
- **Password reset**: Must implement email-based reset flow
- **Session management**: No centralized session revocation

### Technical Debt

This decision creates some technical debt:
- Need to implement password reset (email service exists)
- Need to implement email verification
- Future MFA implementation if required

### Migration Path

If we need Firebase Auth later:
1. Create Firebase project and configure multi-tenancy
2. Add Firebase Admin SDK
3. Create migration script to sync existing users
4. Update auth middleware to validate Firebase tokens
5. Deprecate custom JWT endpoints

## Alternatives Considered

### Firebase Authentication

**Pros:**
- Managed service, less code to maintain
- Social login (Google, GitHub, etc.)
- Built-in MFA
- Password reset handled
- Firebase UI components

**Cons:**
- Additional dependency
- Integration complexity for multi-tenant
- User data split between systems
- Slower MVP timeline

### Auth0

**Pros:**
- Enterprise features (SSO, SAML)
- Better multi-tenant support
- Comprehensive dashboard

**Cons:**
- Cost at scale ($23/month minimum for M2M)
- External dependency
- More complex integration

### Keycloak (Self-Hosted)

**Pros:**
- Full control
- Enterprise features
- Open source

**Cons:**
- Significant operational overhead
- Another service to maintain
- Overkill for MVP

## Future Considerations

### When to Migrate to Firebase Auth

- Social login becomes a requirement
- MFA required for compliance
- Significant user scale (>10K MAU)
- Need for advanced identity features

### Hybrid Approach

We could support both:
1. Keep custom JWT for API access
2. Add Firebase Auth for web UI
3. Link Firebase users to our database users

## References

- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Firebase Auth Multi-Tenancy](https://firebase.google.com/docs/auth/admin/manage-tenants)
- Implementation: `src/core/security.py`, `src/api/dependencies.py`
