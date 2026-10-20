# 001 — Local specification validation

## Problem

Specifications drift when requirements, design decisions, tasks and verification references are maintained independently. Users need a local consistency gate that does not execute instructions or disclose their documents.

## Scope

REQ-001: validate unique IDs, known references, coverage and implemented-task completion.
REQ-002: keep all reads bounded and local, reject unsafe evidence paths, provide content-free diagnostics and create drafts without overwriting manual work.

## Acceptance

Every invalid reference/coverage/state boundary fails with exit 1; malformed CLI usage exits 2. Existing evidence files are required. Traversal and symlink references fail. Oversized/malformed data is not echoed. A generated draft passes structure validation and never overwrites an existing feature.

## Exclusions

No semantic proof of test coverage, authenticated approval, full secret scanning, runtime application validation or release automation. No commands from specs are executed.
