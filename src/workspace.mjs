import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkRepository, regularPath } from "./spec-check.mjs";

function present(target, directory) {
  let stat;
  try {
    stat = fs.lstatSync(target);
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
  if (
    stat.isSymbolicLink() ||
    (directory ? !stat.isDirectory() : !stat.isFile())
  )
    throw Error("UNSAFE_DESTINATION");
  return true;
}

export function initializeWorkspace(root, { dryRun = false } = {}) {
  root = path.resolve(root);
  if (!present(root, true)) throw Error("REPOSITORY_REQUIRED");
  const specs = path.join(root, "specs");
  const policy = path.join(root, ".sdd");
  // Preflight every destination before any write; never inspect the contents of existing policy.
  const hasSpecs = present(specs, true);
  const hasPolicy = present(policy, true);
  const hasConstitution =
    hasPolicy && present(path.join(policy, "constitution.md"), false);
  const planned = [
    ...(!hasSpecs ? ["specs/"] : []),
    ...(!hasPolicy ? [".sdd/"] : []),
    ...(!hasConstitution ? [".sdd/constitution.md"] : []),
  ];
  if (!dryRun) {
    if (!hasSpecs) fs.mkdirSync(specs);
    if (!hasPolicy) fs.mkdirSync(policy);
    if (!hasConstitution) {
      const source = fileURLToPath(
        new URL("../docs/constitution.md", import.meta.url),
      );
      fs.writeFileSync(
        path.join(policy, "constitution.md"),
        fs.readFileSync(source),
        { flag: "wx" },
      );
    }
  }
  return {
    schemaVersion: 1,
    ok: true,
    dryRun,
    planned,
    created: dryRun ? [] : planned,
    preservedConstitution: Boolean(hasConstitution),
  };
}

export function workspaceStatus(root) {
  const validation = checkRepository(root);
  if (!validation.ok)
    return {
      schemaVersion: 1,
      ok: false,
      features: [],
      issues: validation.issues,
    };
  const specs = regularPath(root, "specs", true);
  const features = fs
    .readdirSync(specs)
    .sort()
    .map((id) => {
      const file = regularPath(root, `specs/${id}/traceability.json`);
      // checkRepository already enforces this bound; retain it here before the second read.
      if (fs.statSync(file).size > 262144) throw Error("FILE_LIMIT");
      const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
      return {
        id,
        status: manifest.status,
        requirements: manifest.requirements.length,
        tasks: manifest.tasks.length,
        completedTasks: manifest.tasks.filter((x) => x.status === "done")
          .length,
        checks: manifest.checks.length,
      };
    });
  return { schemaVersion: 1, ok: true, features, issues: [] };
}
