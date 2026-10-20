# Verification

Validated on 20 October 2026:

- Windows, Node.js 24.20.0: npm run check passes 22 tests; 3 symlink cases are skipped because this process cannot create Windows symlinks.
- Linux, Node.js 26.3.0: npm run check passes all 25 tests with no skips, including symlink refusal.
- Claude Code 2.1.286: strict official validation of the plugin and marketplace passes without warnings.
- A local marketplace/install smoke test in a new temporary CLAUDE_CONFIG_DIR succeeds. The official component inventory lists seven skills and zero agents, hooks, MCP servers or LSP servers. The real user configuration was not modified and no model call was made.

The exact published commit, file hashes and output are retained in the owner's private publication record. Hosted CI is verified separately after push. The manifest task/status declarations reflect these bounded implementation and validation results, not authenticated approval or a model quality evaluation.

No model-backed skill evaluation, real provider call, deployment, public PR or user-level Claude installation is included. Avoid claims that static metadata or installation checks prove model behavior or semantic test coverage.
