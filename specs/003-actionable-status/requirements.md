# Actionable and bounded SDD diagnostics

## Problem

Status currently treats a missing, empty or oversized specs directory as the same error and hides every feature when one is invalid. Users cannot distinguish initialization, first-feature creation and a repair. Status also rereads manifests after validating them.

## Requirements and acceptance

- REQ-001: keep the existing issue codes and exit behavior while adding fixed reason codes and safe relative file locations. Missing, empty and over-limit layouts and malformed JSON must be distinguishable without echoing content, raw exception messages or absolute paths.
- REQ-002: retain valid feature summaries when another feature fails. Provide declared-state/task counts and bounded next-step recommendations without executing them or changing approval/status. Invalid overall validation must remain a failure.
- REQ-003: bound feature enumeration before reading more than 100 entries and derive status summaries from the validated manifest rather than reopening it. Exercise supported Node versions and Windows/Linux behavior in CI.

## Exclusions

No new permissions, automatic repairs, provider/model calls, authenticated approval or proof of semantic test coverage. Recommendations are suggestions based on declarations and structural diagnostics. The path checker remains outside the scope of a hostile concurrently changing filesystem sandbox.
