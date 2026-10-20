# Traceability manifest version 1

The complete example lives in specs/001-spec-validation/traceability.json. All fields are required; unknown fields fail validation.

Top level: schemaVersion (1), id (same as the feature directory), status (draft, ready or implemented), requirements, decisions, tasks, checks.

- Requirement: id (REQ-001 style), statement, acceptance (one or more nonempty strings).
- Decision: id (ADR-001 style), summary, requirements (one or more requirement IDs).
- Task: id (TASK-001 style), summary, requirements, status (todo, doing or done).
- Check: id (CHECK-001 style), summary, requirements, kind (test, review or manual), path (repository-relative regular file).

IDs are unique within each collection and feature. Every requirement needs coverage in each of decisions, tasks and checks. Each reference must resolve. Implemented features cannot contain unfinished tasks. A manual or review check points to a file recording that evidence; existence is the only evidence-path check, not proof of approval or execution.

Limits: 100 feature directories; 1–500 records per collection; 100 references/acceptance items per record; 4,000 characters per text field; 256 KiB per manifest or Markdown document; 80 characters per feature directory name. Feature directories use three digits and lowercase hyphenated names, such as 002-export-reports.

Path references cannot be absolute, traverse parents, contain Windows drive prefixes or pass through symlinks. Concurrent edits to an untrusted filesystem are outside the safety model. The checker is synchronous, read-only and does not execute evidence files.
