import fs from "node:fs";
import path from "node:path";

const MAX_BYTES = 256 * 1024;
const FEATURE_ID = /^\d{3}-[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export const isFeatureId = (value) =>
  typeof value === "string" && FEATURE_ID.test(value) && value.length <= 80;

export function regularPath(root, relative, directory = false) {
  if (
    typeof relative !== "string" ||
    !relative ||
    relative.includes("\\") ||
    relative.includes(":") ||
    relative.includes("\0") ||
    path.posix.isAbsolute(relative)
  )
    throw Error("UNSAFE_PATH");
  const parts = relative.split("/");
  if (parts.some((p) => !p || p === "." || p === ".."))
    throw Error("UNSAFE_PATH");
  let target = fs.realpathSync(root);
  for (const [index, part] of parts.entries()) {
    target = path.join(target, part);
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink()) throw Error("SYMLINK");
    const last = index === parts.length - 1;
    if (!last || directory ? !stat.isDirectory() : !stat.isFile())
      throw Error("NOT_REGULAR");
  }
  return target;
}

function read(root, relative) {
  const target = regularPath(root, relative);
  if (fs.statSync(target).size > MAX_BYTES) throw Error("FILE_LIMIT");
  const text = fs.readFileSync(target, "utf8");
  if (!text.trim() || Buffer.byteLength(text) > MAX_BYTES)
    throw Error("EMPTY_OR_LARGE");
  return text;
}

const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const text = (x) =>
  typeof x === "string" && x.trim().length > 0 && x.length <= 4000;
const refs = (x) =>
  Array.isArray(x) &&
  x.length > 0 &&
  x.length <= 100 &&
  new Set(x).size === x.length &&
  x.every(text);
const fields = (x, names) =>
  object(x) &&
  Object.keys(x).every((k) => names.includes(k)) &&
  names.every((k) => Object.hasOwn(x, k));

export function validateManifest(manifest, exists = () => true) {
  const errors = new Set();
  const fail = (code) => errors.add(code);
  if (
    !fields(manifest, [
      "schemaVersion",
      "id",
      "status",
      "requirements",
      "decisions",
      "tasks",
      "checks",
    ]) ||
    manifest.schemaVersion !== 1 ||
    !isFeatureId(manifest.id) ||
    !["draft", "ready", "implemented"].includes(manifest.status)
  )
    return ["MANIFEST_SHAPE"];
  const ids = {};
  for (const [collection, prefix] of [
    ["requirements", "REQ"],
    ["decisions", "ADR"],
    ["tasks", "TASK"],
    ["checks", "CHECK"],
  ]) {
    const rows = manifest[collection];
    if (!Array.isArray(rows) || rows.length < 1 || rows.length > 500)
      return ["COLLECTION_SIZE"];
    ids[collection] = new Set();
    for (const row of rows) {
      if (
        !object(row) ||
        typeof row.id !== "string" ||
        !new RegExp(`^${prefix}-[0-9]{3}$`).test(row.id)
      ) {
        fail("INVALID_ID");
        continue;
      }
      if (ids[collection].has(row.id)) fail("DUPLICATE_ID");
      ids[collection].add(row.id);
      const expected =
        collection === "requirements"
          ? ["id", "statement", "acceptance"]
          : collection === "tasks"
            ? ["id", "summary", "requirements", "status"]
            : collection === "checks"
              ? ["id", "summary", "requirements", "kind", "path"]
              : ["id", "summary", "requirements"];
      if (!fields(row, expected)) fail("RECORD_SHAPE");
      if (!text(row.statement ?? row.summary)) fail("EMPTY_TEXT");
      if (
        collection === "requirements"
          ? !refs(row.acceptance)
          : !refs(row.requirements)
      )
        fail("INVALID_REFERENCES_OR_ACCEPTANCE");
      if (
        collection === "tasks" &&
        !["todo", "doing", "done"].includes(row.status)
      )
        fail("TASK_STATUS");
      if (collection === "checks") {
        if (!["test", "review", "manual"].includes(row.kind))
          fail("CHECK_KIND");
        try {
          if (!text(row.path) || !exists(row.path)) fail("CHECK_PATH");
        } catch {
          fail("CHECK_PATH");
        }
      }
    }
  }
  for (const collection of ["decisions", "tasks", "checks"]) {
    const coverage = new Set();
    for (const row of manifest[collection]) {
      for (const ref of Array.isArray(row?.requirements)
        ? row.requirements
        : []) {
        if (!ids.requirements.has(ref)) fail("UNKNOWN_REQUIREMENT");
        coverage.add(ref);
      }
    }
    for (const requirement of ids.requirements)
      if (!coverage.has(requirement))
        fail(`UNCOVERED_${collection.toUpperCase()}`);
  }
  if (
    manifest.status === "implemented" &&
    manifest.tasks.some((t) => t?.status !== "done")
  )
    fail("UNFINISHED_IMPLEMENTATION");
  return [...errors].sort();
}

function failureReason(error) {
  if (error instanceof SyntaxError) return "INVALID_JSON";
  if (error?.code === "ENOENT") return "MISSING";
  if (
    ["UNSAFE_PATH", "SYMLINK", "NOT_REGULAR"].includes(error?.message) ||
    error?.code === "ENOTDIR"
  )
    return "UNSAFE";
  if (error?.message === "FILE_LIMIT") return "OVERSIZED";
  if (error?.message === "EMPTY_OR_LARGE") return "EMPTY_OR_LARGE";
  if (["EMPTY", "ENTRY_LIMIT"].includes(error?.message)) return error.message;
  return "UNREADABLE";
}

function hint(code, reason) {
  if (code === "SPEC_DIRECTORY") {
    if (reason === "MISSING")
      return "Initialize the selected repository before creating a feature.";
    if (reason === "EMPTY") return "Create the first feature specification.";
    if (reason === "ENTRY_LIMIT")
      return "Reduce the specs layout to at most 100 entries before validation.";
    return "Check access and ensure specs is a regular directory without symlinks.";
  }
  return (
    {
      FEATURE_DIRECTORY:
        "Use regular NNN-feature-name directories inside specs.",
      SPEC_DOCUMENT:
        "Restore the required nonempty bounded specification document.",
      MANIFEST_READ:
        "Restore a readable bounded manifest containing valid JSON.",
      FEATURE_ID_MISMATCH: "Match the manifest feature ID to its directory.",
      CHECK_PATH:
        "Reference an existing repository-relative regular evidence file.",
      UNKNOWN_REQUIREMENT:
        "Resolve every referenced requirement ID in this feature.",
      UNFINISHED_IMPLEMENTATION:
        "Complete pending tasks or retain a non-implemented feature state.",
    }[code] ?? "Correct the manifest fields, IDs and requirement coverage."
  );
}

// Return only validated identifiers/counts alongside diagnostics; no manifest content escapes.
export function inspectRepository(root) {
  const issues = [];
  const featureSummaries = [];
  const add = (feature, code, extra = {}) =>
    issues.push({ feature, code, ...extra, hint: hint(code, extra.reason) });
  let features;
  try {
    const folder = regularPath(root, "specs", true);
    const directory = fs.opendirSync(folder);
    features = [];
    try {
      let entry;
      while ((entry = directory.readSync()) !== null) {
        features.push(entry);
        if (features.length > 100) throw Error("ENTRY_LIMIT");
      }
    } finally {
      directory.closeSync();
    }
    if (!features.length) throw Error("EMPTY");
    features.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  } catch (error) {
    add(null, "SPEC_DIRECTORY", {
      reason: failureReason(error),
      file: "specs/",
    });
    return {
      ok: false,
      features: 0,
      featureSummaries,
      issues,
    };
  }
  for (const feature of features) {
    const id = feature.name;
    if (
      !isFeatureId(id) ||
      !feature.isDirectory() ||
      feature.isSymbolicLink()
    ) {
      add(null, "FEATURE_DIRECTORY");
      continue;
    }
    const issueCount = issues.length;
    for (const file of [
      "requirements.md",
      "design.md",
      "tasks.md",
      "verification.md",
    ]) {
      try {
        read(root, `specs/${id}/${file}`);
      } catch (error) {
        add(id, "SPEC_DOCUMENT", {
          reason: failureReason(error),
          file: `specs/${id}/${file}`,
        });
      }
    }
    try {
      const manifest = JSON.parse(read(root, `specs/${id}/traceability.json`));
      if (manifest?.id !== id)
        add(id, "FEATURE_ID_MISMATCH", {
          file: `specs/${id}/traceability.json`,
        });
      const errors = validateManifest(manifest, (relative) =>
        Boolean(regularPath(root, relative)),
      );
      for (const code of errors)
        add(id, code, { file: `specs/${id}/traceability.json` });
      if (issues.length === issueCount) {
        const doing = manifest.tasks.filter((x) => x.status === "doing");
        const todo = manifest.tasks.filter((x) => x.status === "todo");
        featureSummaries.push({
          id,
          status: manifest.status,
          requirements: manifest.requirements.length,
          tasks: manifest.tasks.length,
          completedTasks: manifest.tasks.filter((x) => x.status === "done")
            .length,
          doingTasks: doing.length,
          todoTasks: todo.length,
          nextTask: (doing[0] ?? todo[0])?.id ?? null,
          checks: manifest.checks.length,
        });
      }
    } catch (error) {
      add(id, "MANIFEST_READ", {
        reason: failureReason(error),
        file: `specs/${id}/traceability.json`,
      });
    }
  }
  return {
    ok: issues.length === 0,
    features: features.length,
    featureSummaries,
    issues,
  };
}

export function checkRepository(root) {
  const { ok, features, issues } = inspectRepository(root);
  return { ok, features, issues };
}
