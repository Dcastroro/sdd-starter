import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const run = (script, args) =>
  spawnSync(process.execPath, [path.join(root, "scripts", script), ...args], {
    encoding: "utf8",
  });
const tempDir = (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-cli-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
};

test("spec-check CLI passes the bundled example and prints help", () => {
  const pass = run("spec-check.mjs", [root]);
  assert.equal(pass.status, 0);
  assert.match(pass.stdout, /^PASS: \d+ specification\(s\) validated\./);
  const help = run("spec-check.mjs", ["--help"]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /^Usage:/);
});

test("spec-check CLI reports each failure code once and exits 1", (t) => {
  const dir = tempDir(t);
  fs.mkdirSync(path.join(dir, "specs"));
  for (const name of ["bad_one", "bad_two"])
    fs.mkdirSync(path.join(dir, "specs", name));
  const result = run("spec-check.mjs", [dir]);
  assert.equal(result.status, 1);
  assert.equal(result.stdout.trim(), "FAIL: FEATURE_DIRECTORY");
});

test("CLIs reject invalid arguments with exit 2", () => {
  assert.equal(run("spec-check.mjs", ["--bogus"]).status, 2);
  assert.equal(run("spec-check.mjs", ["a", "b"]).status, 2);
  assert.equal(run("spec-check.mjs", ["--json", "--json"]).status, 2);
  assert.equal(run("init-workspace.mjs", ["--bogus"]).status, 2);
  assert.equal(run("init-workspace.mjs", ["a", "b"]).status, 2);
  assert.equal(run("sdd-status.mjs", ["--bogus"]).status, 2);
});
