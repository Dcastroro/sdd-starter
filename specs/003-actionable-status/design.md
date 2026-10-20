# Design

ADR-001 covers REQ-001, REQ-002 and REQ-003. Preserve the version-1 validation/report fields and issue codes; add fixed reason/file/hint fields and status summary/nextActions fields. Keep human guidance deterministic and content-free. A partial feature list never changes an overall failed validation into success.

Enumerate at most 101 entries through a directory handle to detect the 100-entry limit, then sort accepted entries deterministically. Analyze each feature once, construct sanitized counts from its validated manifest and expose those summaries to status. Recommendations refer only to existing explicit SDD commands or a bundled initialization helper and are never executed by the status path.

Retain read-only permissions and verified action pins. A bounded four-job public CI matrix covers standard Windows/Linux runners with Node 22/24. The private workspace workflow is unchanged.
