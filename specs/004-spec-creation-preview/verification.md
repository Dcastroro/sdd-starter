# Verification

Before implementation, Windows Node 24 runs 13 new cases: 6 fail because preview/help are unsupported, 5 argument cases pass, and 2 symlink cases skip because privileges are unavailable. Final validation will record actual platform results and limits. No hosted or model results are claimed.

Local complete checks: Windows Node 24.20.0 passes 42 tests, with 5 symlink cases skipped for unavailable creation privileges; WSL Linux Node 20.20.2 passes all 47 tests, including all symlink checks. Node 20 is below the supported minimum, so its run is supplemental compatibility evidence, not validation of the supported Linux runtime matrix. All four specifications validate. Hosted Linux/Windows Node 22/24 results remain pending publication. No dependencies, workflows, permissions, credentials or model calls changed. Plugin/model quality evaluation was not run because only the deterministic draft CLI changed.
