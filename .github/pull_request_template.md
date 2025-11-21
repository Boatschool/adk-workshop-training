# Summary

Concise explanation of the change and why it’s needed.


# Type of Change

- [ ] feat: new feature
- [ ] fix: bug fix
- [ ] docs: documentation only
- [ ] refactor: code change that neither fixes a bug nor adds a feature
- [ ] perf: performance improvement
- [ ] test: add or fix tests
- [ ] chore/build: tooling, CI, deps


# Linked Issues

Closes #


# How to Test

- Steps:
  1.
  2.
  3.

- Key commands:
```bash
poetry run pytest -q
poetry run ruff check . && poetry run black --check . && poetry run mypy src/
```


# Screenshots / Logs (if UI/UX)

Before:
After:


# Checklist

- [ ] Tests added/updated
- [ ] Lint, format, and type checks pass
- [ ] Docs updated (README/AGENTS/CHANGELOG if applicable)
- [ ] DB migration added and applied locally (if schema changed)
- [ ] Security reviewed (secrets, PII, auth)
- [ ] No breaking changes, or migration path documented
