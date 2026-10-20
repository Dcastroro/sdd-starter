import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkRepository } from "../src/spec-check.mjs";
import { initializeWorkspace, workspaceStatus } from "../src/workspace.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
function temp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-guidance-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function draft(t, id = "010-example") {
  const dir = temp(t);
  initializeWorkspace(dir);
  const r = spawnSync(
    process.execPath,
    [path.join(root, "scripts/new-spec.mjs"), id, dir],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 0, r.stderr);
  return dir;
}
function update(dir, change) {
  const file = path.join(dir, "specs/010-example/traceability.json");
  const m = JSON.parse(fs.readFileSync(file));
  change(m);
  fs.writeFileSync(file, JSON.stringify(m));
}
test("missing workspace recommends initialization without modifying files", (t) => {
  const dir = temp(t);
  const report = workspaceStatus(dir);
  assert.equal(report.ok, false);
  assert.equal(report.issues[0].code, "SPEC_DIRECTORY");
  assert.equal(report.issues[0].reason, "MISSING");
  assert.equal(report.nextActions[0].action, "initialize");
  assert.deepEqual(fs.readdirSync(dir), []);
});
test("initialized empty workspace recommends the first feature instead of reinitialization", (t) => {
  const dir = temp(t);
  initializeWorkspace(dir);
  const report = workspaceStatus(dir);
  assert.equal(report.issues[0].reason, "EMPTY");
  assert.equal(report.nextActions[0].command, "/sdd:specify");
});
test("missing document diagnostics identify a safe relative file", (t) => {
  const dir = draft(t);
  fs.unlinkSync(path.join(dir, "specs/010-example/design.md"));
  const issue = checkRepository(dir).issues.find(
    (x) => x.code === "SPEC_DOCUMENT",
  );
  assert.equal(issue.reason, "MISSING");
  assert.equal(issue.file, "specs/010-example/design.md");
  assert(issue.hint.length > 0);
  assert(!JSON.stringify(issue).includes(dir));
});
test("malformed manifest reports a fixed reason without echoing its contents", (t) => {
  const dir = draft(t);
  fs.writeFileSync(
    path.join(dir, "specs/010-example/traceability.json"),
    "SYNTHETIC_CONFIDENTIAL_INVALID",
  );
  const report = workspaceStatus(dir);
  assert.equal(
    report.issues.find((x) => x.code === "MANIFEST_READ").reason,
    "INVALID_JSON",
  );
  assert(!JSON.stringify(report).includes("SYNTHETIC_CONFIDENTIAL_INVALID"));
  assert(!JSON.stringify(report).includes(dir));
});
test("one invalid feature preserves valid summaries while overall validation still fails", (t) => {
  const dir = draft(t);
  fs.mkdirSync(path.join(dir, "specs/011-broken"));
  const report = workspaceStatus(dir);
  assert.equal(report.ok, false);
  assert.deepEqual(
    report.features.map((x) => x.id),
    ["010-example"],
  );
  assert.equal(report.summary.totalFeatures, 2);
  assert.equal(report.summary.validFeatures, 1);
  assert.equal(report.summary.invalidFeatures, 1);
});
test("ready feature with an active task recommends implementation and exposes only its ID", (t) => {
  const dir = draft(t);
  update(dir, (m) => {
    m.status = "ready";
    m.tasks[0].status = "doing";
    m.tasks[0].summary = "SYNTHETIC_PRIVATE_TASK_DESCRIPTION";
  });
  const report = workspaceStatus(dir);
  assert.equal(report.features[0].doingTasks, 1);
  assert.equal(report.features[0].nextTask, "TASK-001");
  assert.equal(report.nextActions[0].command, "/sdd:implement");
  assert(
    !JSON.stringify(report).includes("SYNTHETIC_PRIVATE_TASK_DESCRIPTION"),
  );
});
test("ready feature with completed tasks recommends verification without promoting its state", (t) => {
  const dir = draft(t);
  update(dir, (m) => {
    m.status = "ready";
    m.tasks[0].status = "done";
  });
  const before = fs.readFileSync(
    path.join(dir, "specs/010-example/traceability.json"),
  );
  const report = workspaceStatus(dir);
  assert.equal(report.nextActions[0].command, "/sdd:verify");
  assert.equal(report.features[0].status, "ready");
  assert.deepEqual(
    fs.readFileSync(path.join(dir, "specs/010-example/traceability.json")),
    before,
  );
});
test("draft and implemented features recommend design and review respectively", (t) => {
  const dir = draft(t);
  assert.equal(workspaceStatus(dir).nextActions[0].command, "/sdd:design");
  update(dir, (m) => {
    m.status = "implemented";
    m.tasks[0].status = "done";
  });
  assert.equal(workspaceStatus(dir).nextActions[0].command, "/sdd:review");
});
test("directory limit is distinguished from an empty workspace", (t) => {
  const dir = temp(t);
  fs.mkdirSync(path.join(dir, "specs"));
  for (let n = 0; n < 101; n++)
    fs.mkdirSync(
      path.join(dir, "specs", String(n).padStart(3, "0") + "-feature"),
    );
  const report = workspaceStatus(dir);
  assert.equal(report.ok, false);
  assert.equal(report.issues[0].reason, "ENTRY_LIMIT");
  assert.equal(report.summary.validFeatures, 0);
  assert.equal(report.nextActions[0].action, "review-layout");
});
