# Validation

## Actionable status update — starter 0.2.1 / plugin 0.1.1

Nine new regressions fail before the implementation change and pass afterward. The full suite passes 34/34 on Linux (Node.js 26.3.0); Windows (Node.js 24.20.0) passes 31 with three symlink cases skipped for unavailable privileges, covered on Linux. Diagnostics and recommendations remain content-free and read-only.

Strict Claude Code 2.1.286 validation and an isolated install pass. The public CI configuration now covers Windows/Linux with Node 22/24, retains read-only permissions and verified action pins, and passes actionlint/ShellCheck. Hosted results are verified independently after push; private CI is unchanged. See specs/003-actionable-status/verification.md and docs/diagnostics.md for limits and report semantics.

## Claude SDD plugin update — 0.2.0

On 20 October 2026, the full helper suite passes with 25/25 tests on Linux (Node.js 26.3.0). On Windows (Node.js 24.20.0), 22 pass and 3 symlink cases are skipped for unavailable symlink privileges; those cases pass on Linux.

Claude Code 2.1.286 accepts the plugin and marketplace with strict validation and no warnings. An isolated local marketplace/install smoke test lists all seven skills and no agents, hooks, MCP or LSP servers. This test uses a temporary configuration and makes no model calls; it does not install the plugin into the real user's settings or evaluate model-generated work. See specs/002-claude-sdd-plugin/verification.md for scope and limitations.

## Initial starter — 0.1.0

On 20 October 2026:

- Windows, Node.js 24.20.0: `npm ci --ignore-scripts` succeeds with zero dependencies and no reported vulnerabilities. `npm run check` passes; 16 tests pass and the symlink test is skipped because Windows symlink creation is unavailable to this process.
- Linux, Node.js 26.3.0: `npm run check` passes all 17 tests, including the symlink rejection test; no skips.
- The GitHub Actions workflow passes actionlint 1.7.12 with ShellCheck 0.11.0. Checkout and setup-node commit pins were checked against the official v7.0.0 tag refs.
- The complete initial file set was reviewed for scope, private content and common credential/private-key patterns before publication. This is not a claim of complete secret detection.

The exact published commit, file hashes and command output are retained in the owner's private publication record. Hosted CI results are available in GitHub Actions after push. These local results do not imply hosted CI has passed.

Tests cover traceability, malformed manifests, completion state, bounded input, safe diagnostics, unsafe evidence paths, symlinks and refusing draft overwrite/traversal. They do not establish semantic acceptance coverage or approval. No model APIs, credentials or paid services were used.
