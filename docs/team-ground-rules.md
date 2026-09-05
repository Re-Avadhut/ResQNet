# ResQNet Team Ground Rules

These rules apply to every contributor, regardless of role or experience level.

## Protect the Repository

1. Never commit passwords, API keys, private keys, real `.env` files, personal data, or production database files.
2. Do not force-push `main` or rewrite shared history without explicit team agreement.
3. Keep `main` deployable. Work on a feature branch and use a pull request.
4. Do not delete or rename shared branches without telling the team first.
5. Treat emergency and location data as sensitive even when it is test data.

## Make Changes Reviewable

1. Keep one change focused on one problem.
2. Explain the behavior change in the pull request description.
3. Add or update a test for backend behavior and validation.
4. Manually test frontend changes in a browser and describe what you checked.
5. If a feature is incomplete, label it clearly as a TODO rather than presenting a stub as production behavior.
6. Update the relevant documentation when commands, API contracts, or architecture change.

## Use Branches Consistently

```text
main                       reviewed shared baseline
merge-ready                integration candidate
feature/<short-name>       individual work
fix/<short-name>           bug fix
```

Before opening a pull request:

```bash
git fetch origin
git status
git diff origin/main...HEAD
python -m pytest -q
```

Resolve conflicts locally, review the resulting diff, and never commit generated virtual environments, build directories, or editor metadata.

## Communicate Clearly

- State what you changed, what you tested, and what remains unfinished.
- Call out database migrations, API changes, firmware flashing requirements, and deployment effects.
- Ask before changing shared contracts such as endpoint paths, JSON fields, capability names, or message formats.
- Prefer evidence from tests, logs, and reproducible steps over assumptions.
- If you discover a security or data-loss risk, report it immediately and pause related deployment work.

## Coding Conventions

- Python: small functions, type-aware models, explicit database dependencies, and tests for error cases.
- JavaScript: preserve the existing module style and keep API calls separate from DOM rendering where practical.
- C/ESP-IDF: check return codes, document hardware assumptions, and test on the intended board before claiming success.
- Use descriptive names. Avoid unrelated formatting churn.
- Keep secrets and environment-specific values in ignored configuration files.

## Definition of Done

A change is ready when:

- The intended behavior is implemented rather than only stubbed.
- Tests pass in a clean documented environment.
- Relevant manual checks are complete.
- Documentation and API contracts match the code.
- No secrets or generated artifacts are included.
- A teammate can understand the change from the commit and pull request.
