# Specification-driven workflow

Create a numbered feature directory using `npm run spec:new -- 002-short-name`. IDs are local to a feature, so REQ-001 in one feature is distinct from REQ-001 in another.

## Draft

Write requirements with observable acceptance criteria. Document scope, exclusions and unresolved questions. Make design alternatives, data contracts and failure paths explicit. The manifest must be structurally valid even while the feature is a draft; a newly generated draft is a scaffold, not a finished specification.

## Ready

Resolve blocking questions, select the design and agree on the requirements and task breakdown. Record the review evidence in verification.md. Set status to ready only when that reflects the actual project decision; the checker cannot authenticate or infer approval.

## Implemented

Implement the tasks, add behavioral tests and execute the relevant commands. Record the tested commit, commands, exit codes, failures and any checks still pending in verification.md. After all tasks are done, set status to implemented. Every requirement must still have a decision, task and check reference. An existing test file does not prove its assertions cover the requirement; inspect it during review.

## Changes and release

Update requirements, design and traceability in the same change when behavior changes. Keep migrations, rollbacks and compatibility decisions visible. A release needs the project's normal code review and release checks; this repository does not deploy or publish artifacts automatically.

## Files

- requirements.md: problem, users, scope, exclusions, requirements and acceptance criteria.
- design.md: architecture, interfaces, alternatives, failure modes and decisions.
- tasks.md: bounded implementation steps, ordering and requirement links.
- verification.md: evidence, executed checks, tested commit and limitations.
- traceability.json: machine-readable requirement/decision/task/check links.

Automated checks never execute commands from a specification or manifest.
