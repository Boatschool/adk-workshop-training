# ADR 002: FastAPI over Flask

## Status

**Accepted** - 2025-11-20

## Context

The original ADK Training Portal was built with Flask for rapid prototyping of workshop materials. For the production multi-tenant platform, we needed to evaluate whether to continue with Flask or migrate to a different framework.

Requirements:
- High performance for concurrent API requests
- Built-in request/response validation
- Modern async/await support for database operations
- Auto-generated API documentation
- Type safety and IDE support
- Active community and long-term maintenance

## Decision

We chose **FastAPI** as the web framework for the production platform.

## Rationale

### Performance

FastAPI is one of the fastest Python web frameworks:
- Based on Starlette (ASGI) rather than WSGI
- Native async/await support
- 3-5x faster than Flask in benchmarks

### Developer Experience

```python
# FastAPI - Types, validation, docs generated automatically
@router.post("/workshops/", response_model=WorkshopResponse)
async def create_workshop(
    workshop: WorkshopCreate,  # Pydantic validates request body
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkshopResponse:
    ...

# Flask - Manual validation, manual docs
@app.route("/workshops/", methods=["POST"])
def create_workshop():
    data = request.get_json()
    # Manual validation...
    # Manual documentation...
```

### Async Database Operations

FastAPI's native async support integrates cleanly with SQLAlchemy 2.0:

```python
async with get_db() as session:
    result = await session.execute(select(Workshop))
    workshops = result.scalars().all()
```

### Auto-Generated Documentation

FastAPI generates OpenAPI (Swagger) documentation automatically:
- `/docs` - Swagger UI
- `/redoc` - ReDoc
- `/openapi.json` - OpenAPI schema

No additional packages or configuration required.

### Type Safety

- Pydantic models for request/response validation
- Full type hints throughout
- MyPy compatibility
- Excellent IDE autocomplete

## Consequences

### Positive

- **Better performance**: 3-5x improvement in request throughput
- **Less boilerplate**: Validation and docs are automatic
- **Type safety**: Catches bugs at development time
- **Modern Python**: async/await, type hints, dataclasses
- **API documentation**: Always up-to-date with code

### Negative

- **Learning curve**: Team needs to learn async patterns
- **Flask ecosystem**: Some Flask extensions don't have FastAPI equivalents
- **Migration effort**: Existing Flask code needed rewriting

### Trade-offs

- Chose Pydantic over Marshmallow (Flask ecosystem)
- Chose SQLAlchemy async over sync
- Chose ASGI over WSGI

## Alternatives Considered

### Keep Flask

**Pros:**
- No migration effort
- Team already familiar
- Large ecosystem

**Cons:**
- No native async support (Flask-Async is a workaround)
- No built-in validation or documentation
- Performance limitations

### Django REST Framework

**Pros:**
- Batteries included
- Mature ecosystem
- Built-in admin

**Cons:**
- Heavyweight for API-only service
- Django ORM doesn't match our async requirements
- Slower than FastAPI

### Litestar (formerly Starlite)

**Pros:**
- Modern, FastAPI-like
- Good performance

**Cons:**
- Smaller community
- Less mature
- Fewer learning resources

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TechEmpower Benchmarks](https://www.techempower.com/benchmarks/)
- Implementation: `src/api/main.py`
