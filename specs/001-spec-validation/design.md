# Design

ADR-001 covers REQ-001 and REQ-002. Use a versioned JSON manifest and human-readable Markdown reasoning. Keep a strict field contract and validate references in two passes. All reads are bounded to 256 KiB and paths must traverse regular directories/files without symlinks. Diagnostics are fixed codes; document text is never included.

The CLI checks structure and evidence paths only. It does not execute evidence, authenticate approval or prove acceptance criteria. Synchronous local checks favor predictable behavior over concurrent scanning. An actively mutating hostile filesystem remains outside the safety model.
