# Verification

Run npm run check and record exact results for each revision. CHECK-001 points to test/spec-check.test.mjs. The initial publication result and tested commit are recorded in VALIDATION.md; subsequent changes should update evidence in the same PR.

The automated checks verify manifest consistency, CLI behavior and filesystem/input boundaries. Test-file existence alone is not semantic coverage. No real credentials, external models, hosted artifact transport or deployment are exercised.
