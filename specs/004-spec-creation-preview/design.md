# Design

Parse one optional --dry-run flag independently of one feature ID and optional repository. Reject unknown/duplicate flags with exit 2. Validate the existing specs path through regularPath; lstat the prospective target, rejecting any existing entry without following it. Dry-run emits schemaVersion 1 JSON with feature, dryRun and six planned relative paths. Normal creation retains exclusive mkdir and wx file writes. Errors remain fixed, content-free diagnostics (exit 1). Help exits 0 without filesystem access. No dependency or plugin permission changes.
