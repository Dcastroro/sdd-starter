import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkRepository, validateManifest } from "../src/spec-check.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const example = JSON.parse(
  fs.readFileSync(
    path.join(root, "specs/001-spec-validation/traceability.json"),
    "utf8",
  ),
);
const copy = () => structuredClone(example);
function fixture(t) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-test-"));
  fs.mkdirSync(path.join(temp, "specs"));
  fs.cpSync(
    path.join(root, "specs/001-spec-validation"),
    path.join(temp, "specs/001-spec-validation"),
    { recursive: true },
  );
  fs.mkdirSync(path.join(temp, "test"));
  fs.writeFileSync(
    path.join(temp, "test/spec-check.test.mjs"),
    "// synthetic test reference",
  );
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  return temp;
}
test("completed example has full requirement/design/task/check coverage", () =>
  assert.deepEqual(validateManifest(copy()), []));
test("unknown requirement references fail", () => {
  const m = copy();
  m.checks[0].requirements.push("REQ-999");
  assert(validateManifest(m).includes("UNKNOWN_REQUIREMENT"));
});
test("every requirement needs a design decision", () => {
  const m = copy();
  m.decisions[0].requirements = ["REQ-001"];
  assert(validateManifest(m).includes("UNCOVERED_DECISIONS"));
});
test("duplicate IDs fail", () => {
  const m = copy();
  m.tasks.push(structuredClone(m.tasks[0]));
  assert(validateManifest(m).includes("DUPLICATE_ID"));
});
test("implemented features cannot have incomplete tasks", () => {
  const m = copy();
  m.tasks[0].status = "todo";
  assert(validateManifest(m).includes("UNFINISHED_IMPLEMENTATION"));
});
test("empty acceptance criteria fail", () => {
  const m = copy();
  m.requirements[0].acceptance = [];
  assert(validateManifest(m).includes("INVALID_REFERENCES_OR_ACCEPTANCE"));
});
test("malformed records return diagnostics without throwing", () => {
  for (const value of [null, 4, [], "data"]) {
    const m = copy();
    m.tasks[0] = value;
    assert(validateManifest(m).length > 0);
  }
});
test("unknown manifest fields fail instead of hiding misspellings", () => {
  const m = copy();
  m.staus = "implemented";
  assert.deepEqual(validateManifest(m), ["MANIFEST_SHAPE"]);
});
test("check references must exist", () =>
  assert(validateManifest(copy(), () => false).includes("CHECK_PATH")));
test("valid repository checks pass", (t) =>
  assert.equal(checkRepository(fixture(t)).ok, true));
test("directory traversal is rejected for evidence paths", (t) => {
  const temp = fixture(t);
  const m = copy();
  m.checks[0].path = "../outside.txt";
  fs.writeFileSync(
    path.join(temp, "specs/001-spec-validation/traceability.json"),
    JSON.stringify(m),
  );
  assert(checkRepository(temp).issues.some((x) => x.code === "CHECK_PATH"));
});
test("symlink evidence is rejected", (t) => {
  const temp = fixture(t);
  const dest = path.join(temp, "test/link.mjs");
  try {
    fs.symlinkSync(path.join(temp, "test/spec-check.test.mjs"), dest);
  } catch (e) {
    if (e.code === "EPERM") return t.skip("Symlink creation unavailable");
    throw e;
  }
  const m = copy();
  m.checks[0].path = "test/link.mjs";
  fs.writeFileSync(
    path.join(temp, "specs/001-spec-validation/traceability.json"),
    JSON.stringify(m),
  );
  assert.equal(checkRepository(temp).ok, false);
});
test("oversized manifests fail with a bounded diagnostic", (t) => {
  const temp = fixture(t);
  fs.writeFileSync(
    path.join(temp, "specs/001-spec-validation/traceability.json"),
    " ".repeat(262145),
  );
  assert(checkRepository(temp).issues.some((x) => x.code === "MANIFEST_READ"));
});
test("missing or empty feature documents fail", (t) => {
  const temp = fixture(t);
  fs.writeFileSync(path.join(temp, "specs/001-spec-validation/design.md"), "");
  assert.equal(checkRepository(temp).ok, false);
});
test("CLI never echoes invalid manifest contents", (t) => {
  const temp = fixture(t);
  const sentinel = "SYNTHETIC_PRIVATE_CONTENT_123";
  fs.writeFileSync(
    path.join(temp, "specs/001-spec-validation/traceability.json"),
    sentinel,
  );
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts/spec-check.mjs"), temp, "--json"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 1);
  assert(!result.stdout.includes(sentinel));
  assert(!result.stderr.includes(sentinel));
});
test("new-spec rejects traversal without creating a directory", (t) => {
  const temp = fixture(t);
  const result = spawnSync(
    process.execPath,
    [path.join(root, "scripts/new-spec.mjs"), "../escape"],
    { cwd: temp, encoding: "utf8" },
  );
  assert.equal(result.status, 2);
});
test("new-spec creates a valid draft and refuses overwrite", (t) => {
  const temp = fixture(t);
  const args = [path.join(root, "scripts/new-spec.mjs"), "002-local-example"];
  const first = spawnSync(process.execPath, args, {
    cwd: temp,
    encoding: "utf8",
  });
  assert.equal(first.status, 0, first.stderr);
  assert.equal(checkRepository(temp).ok, true);
  const target = path.join(temp, "specs/002-local-example/requirements.md");
  fs.writeFileSync(target, "KEEP MANUAL EDIT");
  assert.equal(spawnSync(process.execPath, args, { cwd: temp }).status, 1);
  assert.equal(fs.readFileSync(target, "utf8"), "KEEP MANUAL EDIT");
});
