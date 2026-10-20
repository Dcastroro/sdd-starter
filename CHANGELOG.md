# Changes

## Starter 0.2.1 / Claude plugin 0.1.1

- Distinguish missing, empty, unsafe and oversized layouts or malformed input through fixed diagnostic reasons, safe relative locations and repair hints.
- Keep valid feature summaries visible when another feature fails, while preserving the failed overall result.
- Add declared-state/task counts, pending task IDs and non-executing next-step suggestions to status reports.
- Inspect manifests once and bound layout enumeration before processing more than 100 entries.
- Exercise the public project on Windows/Linux with Node 22/24, retaining existing security controls.

## Starter 0.2.0 / Claude plugin 0.1.0

- Add the optional seven-command Claude Code plugin and installable marketplace.
- Add safe workspace initialization, explicit-target draft generation and read-only status helpers.
- Validate with local tests and isolated local/GitHub installation checks, without model calls or global configuration changes during tests.

## Starter 0.1.0

- Introduce requirements, design, tasks, verification and machine-readable traceability.
- Add bounded local validation, draft generation, synthetic examples and deterministic tests.
