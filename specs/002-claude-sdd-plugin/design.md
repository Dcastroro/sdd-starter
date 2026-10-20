# Design

ADR-001 covers REQ-001, REQ-002 and REQ-003. Package the optional plugin at the existing repository root, alongside the generic SDD tooling, and expose it through a local-source marketplace. Seven concise skills share a workflow reference. They are user-invoked and inherit session permissions rather than granting tools or running hooks.

Keep deterministic filesystem operations in local Node.js helpers. Initialization writes only a specs directory and an optional .sdd/constitution.md in a selected existing repository, preserves existing files and rejects symlinks in those destinations. Feature creation remains exclusive and can target a repository explicitly. Status uses the existing bounded validator and reports identifiers and counts only.

Inputs and skill arguments remain data. Do not interpolate raw arguments into shell commands. A skill must locate the selected workspace and governing instructions, preserve user work, use properly quoted literal arguments and record actual test results. No private workspace content is copied into this public plugin.

Use a temporary CLAUDE_CONFIG_DIR for local marketplace/install smoke checks; never read or rewrite the real Claude configuration. Do not run model evaluations or provider calls. Record static validation, install discovery, local tests and untested model behavior separately.
