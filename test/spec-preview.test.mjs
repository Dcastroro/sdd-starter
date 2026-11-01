import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(
  new URL("../scripts/new-spec.mjs", import.meta.url),
);
const id = "005-preview-example";
const files = [
  "requirements.md",
  "design.md",
  "tasks.md",
  "verification.md",
  "traceability.json",
];
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-private-preview-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "specs"));
  fs.writeFileSync(path.join(root, "manual.txt"), "synthetic private content");
  return root;
}
const run = (args, cwd) =>
  spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });

test("dry-run lists only safe planned paths and writes nothing, then real creation matches", (t) => {
  const root = fixture(t),
    cwd = fixture(t);
  const result = run([id, root, "--dry-run"], cwd);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report, {
    schemaVersion: 1,
    ok: true,
    dryRun: true,
    feature: id,
    planned: [`specs/${id}/`, ...files.map((f) => `specs/${id}/${f}`)],
  });
  assert(!result.stdout.includes(root));
  assert(!result.stdout.includes("synthetic private content"));
  assert.deepEqual(fs.readdirSync(path.join(root, "specs")), []);
  assert.deepEqual(fs.readdirSync(path.join(cwd, "specs")), []);
  const real = run([id, root], cwd);
  assert.equal(real.status, 0, real.stderr);
  assert.deepEqual(
    fs.readdirSync(path.join(root, "specs", id)).sort(),
    files.slice().sort(),
  );
  assert.equal(
    JSON.parse(
      fs.readFileSync(path.join(root, "specs", id, "traceability.json")),
    ).id,
    id,
  );
  assert.equal(
    fs.readFileSync(path.join(root, "manual.txt"), "utf8"),
    "synthetic private content",
  );
});
test("dry-run also works before the feature ID using the current directory", (t) => {
  const root = fixture(t);
  const result = run(["--dry-run", id], root);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).feature, id);
  assert.deepEqual(fs.readdirSync(path.join(root, "specs")), []);
});
for (const kind of ["directory", "file"])
  test(`dry-run refuses an existing ${kind} without altering it`, (t) => {
    const root = fixture(t),
      target = path.join(root, "specs", id);
    if (kind === "directory") fs.mkdirSync(target);
    else fs.writeFileSync(target, "KEEP");
    const result = run([id, root, "--dry-run"], root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Cannot create specification/);
    if (kind === "file") assert.equal(fs.readFileSync(target, "utf8"), "KEEP");
    else assert.deepEqual(fs.readdirSync(target), []);
  });
test("dry-run refuses a missing specs directory without initializing it", (t) => {
  const root = fixture(t);
  fs.rmdirSync(path.join(root, "specs"));
  const result = run([id, root, "--dry-run"], root);
  assert.equal(result.status, 1);
  assert(!fs.existsSync(path.join(root, "specs")));
});
for (const args of [
  [id, "--dry-run", "--dry-run"],
  [id, "--unknown"],
  ["../escape", "--dry-run"],
  ["--dry-run"],
  ["--help", id],
])
  test(`invalid preview arguments are rejected: ${args.join(" ")}`, (t) => {
    const root = fixture(t),
      result = run(args, root);
    assert.equal(result.status, 2);
    assert.deepEqual(fs.readdirSync(path.join(root, "specs")), []);
  });
test("help is read-only and documents preview", (t) => {
  const root = fixture(t),
    result = run(["--help"], root);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /--dry-run/);
  assert.deepEqual(fs.readdirSync(path.join(root, "specs")), []);
});
for (const kind of ["parent", "dangling-target"])
  test(`dry-run refuses a symlinked ${kind}`, (t) => {
    const root = fixture(t),
      outside = fixture(t);
    const destination =
      kind === "parent"
        ? path.join(root, "specs")
        : path.join(root, "specs", id);
    if (kind === "parent") fs.rmdirSync(destination);
    try {
      fs.symlinkSync(
        kind === "parent"
          ? path.join(outside, "specs")
          : path.join(outside, "missing"),
        destination,
        "dir",
      );
    } catch (error) {
      if (error.code === "EPERM") {
        t.skip("Symlink creation unavailable");
        return;
      }
      throw error;
    }
    const result = run([id, root, "--dry-run"], root);
    assert.equal(result.status, 1);
    assert.deepEqual(fs.readdirSync(path.join(outside, "specs")), []);
    assert(!fs.existsSync(path.join(outside, "missing")));
    assert(fs.lstatSync(destination).isSymbolicLink());
  });
