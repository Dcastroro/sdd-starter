# Requirements

Users need to inspect the files a new feature draft would create before modifying a repository. Provide an explicit --dry-run mode and --help for spec:new. Preview reports only validated feature IDs and planned relative paths, and leaves both target and current directories unchanged. Refuse occupied targets (including dangling symlinks), unsafe specs parents and missing specs directories. Keep normal creation compatible and exclusive. No auto-initialization, approval, model calls or execution of manifest commands. Filesystem race protection is unchanged; this is not a sandbox.
