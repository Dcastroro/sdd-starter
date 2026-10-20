# SDD Starter

**Define behavior before implementation. Keep requirements, design, tasks and verification connected.**

A dependency-free, local-first starter for Spec-Driven Development. Use it for a CLI, API, web app or library, with or without a coding agent. This repository is a reusable template, not a package published to npm.

## Try it

Requires Node.js 22 or newer. Clone this repository or choose **Use this template** on GitHub:

```sh
npm ci --ignore-scripts
npm run check
npm run spec:new -- 002-your-feature
```

The last command creates a draft under `specs/002-your-feature/`. Replace the draft text with your actual problem, constraints, acceptance criteria, decisions and tasks. Then run `npm run spec:check`.

## The working loop

1. **Specify:** record the problem, users, scope, exclusions and observable acceptance criteria.
2. **Design:** choose contracts, data flow, tradeoffs and failure behavior; link decisions to requirements.
3. **Plan:** create small tasks and map every requirement to implementation and verification.
4. **Implement:** write the smallest change and tests that satisfy the agreed scope.
5. **Verify:** run the checks and behavioral tests, record the commit and results, and update the specification when reality changes.

Start with [the completed example](specs/001-spec-validation/requirements.md), [workflow guide](docs/workflow.md) and [constitution](docs/constitution.md).

## What is checked

Each feature has four Markdown documents and a `traceability.json` manifest. The local validator checks unique IDs, required fields, requirement coverage across design decisions/tasks/checks, existing evidence paths, and completion of tasks for implemented features. It rejects traversal and symlink evidence paths and bounds manifest/document size.

```sh
node scripts/spec-check.mjs --json
node scripts/spec-check.mjs /path/to/your-repository --json
```

Exit codes: **0** valid, **1** failed validation, **2** invalid CLI arguments. Diagnostics contain feature IDs and issue codes, not document contents. JSON output is versioned at schema version 1.

These checks validate structure and references. They do **not** prove that a test covers a requirement, establish approval, scan every kind of secret, or replace runtime tests and review. `ready` and `implemented` are declarations by the contributor; CI validates consistency rather than deciding whether a design is sound. See [the manifest contract](docs/manifest.md).

## CI and security

Pushes and pull requests run `npm run check` on standard Linux GitHub-hosted runners with read-only repository permissions. Action versions are pinned to verified commit hashes. There are no model calls, tokens to configure, deployment steps or third-party runtime dependencies. Local checks work without network access after Node.js is installed.

GitHub currently provides standard hosted Actions without a minutes charge for public repositories; private repositories have plan-specific quotas and potential usage charges. See [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions). This template does not change spending limits or provision services.

Never commit real environment files, credentials, customer data or private specifications. Examples are synthetic. See [SECURITY.md](SECURITY.md). The path checks are validation safeguards, not a sandbox against concurrent filesystem changes.

## Adapt it

- Copy `templates/feature/` or use `spec:new` for a new feature.
- Add your language-specific implementation and test commands to `check` and CI.
- Keep repository-specific policy in `docs/constitution.md`; retain portable requirements and explicit contracts.
- Use [AGENTS.md](AGENTS.md) to keep agent-assisted work inside the same process.

This is an independent implementation inspired by the broad Spec-Driven Development workflow described in [GitHub Spec Kit](https://github.com/github/spec-kit). It is not an official standard, a Spec Kit distribution or a compatible implementation of its CLI. No Spec Kit code or templates are vendored here.

MIT. Built by David Castro with AI assistance.
