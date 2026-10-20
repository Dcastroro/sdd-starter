# Initial validation

On 20 October 2026:

- Windows, Node.js 24.20.0: `npm ci --ignore-scripts` succeeds with zero dependencies and no reported vulnerabilities. `npm run check` passes; 16 tests pass and the symlink test is skipped because Windows symlink creation is unavailable to this process.
- Linux, Node.js 26.3.0: `npm run check` passes all 17 tests, including the symlink rejection test; no skips.
- The GitHub Actions workflow passes actionlint 1.7.12 with ShellCheck 0.11.0. Checkout and setup-node commit pins were checked against the official v7.0.0 tag refs.
- The complete initial file set was reviewed for scope, private content and common credential/private-key patterns before publication. This is not a claim of complete secret detection.

The exact published commit, file hashes and command output are retained in the owner's private publication record. Hosted CI results are available in GitHub Actions after push. These local results do not imply hosted CI has passed.

Tests cover traceability, malformed manifests, completion state, bounded input, safe diagnostics, unsafe evidence paths, symlinks and refusing draft overwrite/traversal. They do not establish semantic acceptance coverage or approval. No model APIs, credentials or paid services were used.
