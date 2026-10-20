# Diagnostics and status

The version-1 JSON reports retain their existing fields and issue codes. Consumers must tolerate additive fields; do not reject reports merely because new metadata is present.

## Diagnostic locations

Issues contain a fixed `code` and may add `reason`, `file` and `hint`. File locations are generated repository-relative paths using validated feature IDs and known document names. Hints and reasons are fixed strings; raw exceptions, input text and absolute paths are not included.

| Code / reason                         | Meaning                                           | Next step                                             |
| ------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| SPEC_DIRECTORY / MISSING              | No specs directory exists                         | Initialize the selected project                       |
| SPEC_DIRECTORY / EMPTY                | Initialized directory has no features             | Create a feature with `/sdd:specify`                  |
| SPEC_DIRECTORY / ENTRY_LIMIT          | More than 100 entries                             | Review and reduce the layout                          |
| SPEC_DIRECTORY / UNSAFE or UNREADABLE | Directory is not safely accessible                | Check the path and access; do not bypass the boundary |
| SPEC_DOCUMENT / MISSING               | A required document is absent                     | Restore the reported relative file                    |
| MANIFEST_READ / INVALID_JSON          | Manifest cannot be parsed                         | Correct its JSON without publishing its contents      |
| MANIFEST_READ / OVERSIZED             | Manifest exceeds 256 KiB                          | Reduce it within the existing bound                   |
| CHECK_PATH                            | Evidence reference is absent or unsafe            | Correct the relative reference                        |
| UNFINISHED_IMPLEMENTATION             | Implemented declaration contains unfinished tasks | Finish them or retain the appropriate earlier state   |

Other fixed reasons include EMPTY_OR_LARGE and UNREADABLE. A check-path diagnostic points to the manifest; it does not echo the potentially sensitive or unsafe value of the reference.

## Status summary and recommendations

`sdd-status.mjs` returns validated feature summaries even when other features fail. The overall `ok` flag and exit code remain failures in that case. Summaries contain IDs, declared states, task/check counts and the next unfinished task ID, preferring a doing task over a todo task. They contain no task descriptions or requirement text.

The aggregate `summary` counts valid candidates and pending tasks. Counts for invalid candidates and total candidates are `null` when a layout error prevents complete enumeration; they must not be interpreted as zero. Enumeration reads at most 101 entries from a bounded directory iterator to detect the 100-entry limit, and status uses the same validated manifest inspection rather than reopening each manifest.

`nextActions` are deterministic suggestions, never executable instructions or authorization:

- Missing directory: initialize using the bundled helper.
- Empty directory: `/sdd:specify`.
- Invalid specification/layout: repair the reported issue; no automatic repair command is emitted.
- Draft feature: `/sdd:design`.
- Ready feature with unfinished tasks: `/sdd:implement`.
- Ready feature with completed tasks: `/sdd:verify`.
- Implemented feature: `/sdd:review`.

Declarations and structural checks do not prove approval, test execution or semantic coverage. Recommendations do not change files or promote a feature's state.
