# Claude Code SDD plugin

## Problem and users

A developer using this starter needs an installable Claude Code workflow that carries a feature from requirements through implementation and verification, while preserving the project's existing permissions and private-data boundaries.

## Scope

- REQ-001: provide explicitly invoked skills for specify, design, plan, implement, verify, review and status.
- REQ-002: initialize a selected existing repository and create feature drafts without overwriting existing files or following symlink destinations.
- REQ-003: report SDD state using identifiers, counts and diagnostic codes without echoing specification content or executing commands from it.

## Acceptance criteria

The official local Claude Code validator accepts plugin and marketplace metadata. Every documented skill exists and is explicitly invoked by the user; no allowed-tools grant, hook, MCP server or credential is added. Initialization is idempotent, supports dry run, preserves existing files and rejects symlink boundaries. Draft creation supports an explicit target repository. Status output is deterministic, bounded by the existing specification checker, and fails on invalid specifications. Local regression tests pass; installation is exercised in an isolated Claude configuration without a model call.

## Exclusions

No modification of Claude's model, limits, authentication, global user settings or permissions. No paid model evaluation, automatic commits/publication, background hooks, provider connection or live MCP execution. Skills guide Claude's work; static validation and local installation do not prove the quality of model-generated implementation.
