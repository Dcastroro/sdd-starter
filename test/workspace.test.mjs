import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { initializeWorkspace, workspaceStatus } from "../src/workspace.mjs";
const root = fileURLToPath(new URL("../", import.meta.url));
function temp(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-workspace-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function linkOrSkip(t, target, destination, type) {
  try {
    fs.symlinkSync(target, destination, type);
    return true;
  } catch (error) {
    if (error.code === "EPERM") {
      t.skip("Symlink creation unavailable");
      return false;
    }
    throw error;
  }
}
test("initialization dry-run writes nothing and reports planned relative paths", (t) => {
  const dir = temp(t);
  const r = initializeWorkspace(dir, { dryRun: true });
  assert.equal(r.dryRun, true);
  assert.deepEqual(r.created, []);
  assert(r.planned.includes(".sdd/constitution.md"));
  assert.deepEqual(fs.readdirSync(dir), []);
});
test("initialization is idempotent and preserves manual instructions and constitution", (t) => {
  const dir = temp(t);
  fs.writeFileSync(path.join(dir, "CLAUDE.md"), "MANUAL INSTRUCTIONS");
  initializeWorkspace(dir);
  fs.writeFileSync(path.join(dir, ".sdd/constitution.md"), "MANUAL POLICY");
  const result = initializeWorkspace(dir);
  assert.deepEqual(result.created, []);
  assert.equal(
    fs.readFileSync(path.join(dir, ".sdd/constitution.md"), "utf8"),
    "MANUAL POLICY",
  );
  assert.equal(
    fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf8"),
    "MANUAL INSTRUCTIONS",
  );
});
test("initializer preflight refuses a symlinked specs directory before writing policy", (t) => {
  const dir = temp(t),
    outside = temp(t);
  if (!linkOrSkip(t, outside, path.join(dir, "specs"), "dir")) return;
  assert.throws(() => initializeWorkspace(dir));
  assert(!fs.existsSync(path.join(dir, ".sdd")));
  assert.deepEqual(fs.readdirSync(outside), []);
});
test("initializer refuses a symlinked constitution without following it", (t) => {
  const dir = temp(t),
    outside = temp(t);
  fs.mkdirSync(path.join(dir, ".sdd"));
  const file = path.join(outside, "policy.md");
  fs.writeFileSync(file, "KEEP");
  if (!linkOrSkip(t, file, path.join(dir, ".sdd/constitution.md"), "file"))
    return;
  assert.throws(() => initializeWorkspace(dir));
  assert.equal(fs.readFileSync(file, "utf8"), "KEEP");
  assert(!fs.existsSync(path.join(dir, "specs")));
});
test("draft generator accepts an explicit target repository and leaves its cwd untouched", (t) => {
  const target = temp(t),
    cwd = temp(t);
  initializeWorkspace(target);
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts/new-spec.mjs"), "003-target-feature", target],
    { cwd, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(fs.readdirSync(cwd), []);
  const status = workspaceStatus(target);
  assert.equal(status.ok, true);
  assert.deepEqual(
    status.features.map((x) => ({ id: x.id, status: x.status })),
    [{ id: "003-target-feature", status: "draft" }],
  );
});
test("status returns deterministic identifiers and counts without document text", (t) => {
  const dir = temp(t);
  initializeWorkspace(dir);
  assert.equal(
    spawnSync(process.execPath, [
      path.join(root, "scripts/new-spec.mjs"),
      "003-private-feature",
      dir,
    ]).status,
    0,
  );
  const file = path.join(dir, "specs/003-private-feature/traceability.json");
  const m = JSON.parse(fs.readFileSync(file));
  m.requirements[0].statement = "SYNTHETIC_CONFIDENTIAL_STATEMENT";
  fs.writeFileSync(file, JSON.stringify(m));
  const a = workspaceStatus(dir),
    b = workspaceStatus(dir);
  assert.deepEqual(a, b);
  assert.equal(a.features[0].completedTasks, 0);
  assert(!JSON.stringify(a).includes("SYNTHETIC_CONFIDENTIAL_STATEMENT"));
});
test("status CLI fails invalid specs without echoing content or absolute paths", (t) => {
  const dir = temp(t);
  initializeWorkspace(dir);
  fs.mkdirSync(path.join(dir, "specs/003-invalid"));
  fs.writeFileSync(
    path.join(dir, "specs/003-invalid/traceability.json"),
    "SYNTHETIC_PRIVATE_INVALID",
  );
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts/sdd-status.mjs"), dir],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 1);
  assert(!result.stdout.includes("SYNTHETIC_PRIVATE_INVALID"));
  assert(!result.stdout.includes(dir));
  assert.equal(JSON.parse(result.stdout).ok, false);
});
test("plugin and marketplace expose seven user-invoked skills without side-effect components", () => {
  const plugin = JSON.parse(
      fs.readFileSync(path.join(root, ".claude-plugin/plugin.json")),
    ),
    market = JSON.parse(
      fs.readFileSync(path.join(root, ".claude-plugin/marketplace.json")),
    );
  assert.equal(plugin.name, "sdd");
  assert.equal(market.plugins[0].name, plugin.name);
  assert.equal(market.plugins[0].version, plugin.version);
  assert.equal(market.plugins[0].source, "./");
  for (const field of ["hooks", "mcpServers", "agents"])
    assert(!Object.hasOwn(plugin, field));
  assert(!fs.existsSync(path.join(root, "hooks")));
  assert(!fs.existsSync(path.join(root, ".mcp.json")));
  const names = [
    "design",
    "implement",
    "plan",
    "review",
    "specify",
    "status",
    "verify",
  ];
  assert.deepEqual(fs.readdirSync(path.join(root, "skills")).sort(), names);
  for (const name of names) {
    const body = fs.readFileSync(
      path.join(root, "skills", name, "SKILL.md"),
      "utf8",
    );
    assert(body.startsWith("---\n"));
    assert(body.includes("disable-model-invocation: true"));
    assert(!body.includes("allowed-tools:"));
    assert(body.includes("${CLAUDE_PLUGIN_ROOT}/docs/claude-workflow.md"));
    assert(!/^!`/m.test(body));
  }
});
