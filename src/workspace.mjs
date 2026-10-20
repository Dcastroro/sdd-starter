import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectRepository } from "./spec-check.mjs";

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
  const validation = inspectRepository(root);
  const features = validation.featureSummaries;
  const nextActions = [];
  const layout = validation.issues.find((x) => x.code === "SPEC_DIRECTORY");
  if (layout) {
    const action =
      layout.reason === "MISSING"
        ? "initialize"
        : layout.reason === "EMPTY"
          ? "create-feature"
          : "review-layout";
    nextActions.push({
      feature: null,
      action,
      command: layout.reason === "EMPTY" ? "/sdd:specify" : null,
      helper: layout.reason === "MISSING" ? "init-workspace.mjs" : null,
    });
  } else {
    for (const feature of [...new Set(validation.issues.map((x) => x.feature))])
      nextActions.push({
        feature,
        action: "repair-specification",
        command: null,
        helper: null,
      });
  }
  for (const feature of features) {
    const command =
      feature.status === "draft"
        ? "/sdd:design"
        : feature.status === "implemented"
          ? "/sdd:review"
          : feature.completedTasks === feature.tasks
            ? "/sdd:verify"
            : "/sdd:implement";
    nextActions.push({
      feature: feature.id,
      action: "continue-feature",
      command,
      helper: null,
    });
  }
  const completeLayout =
    !layout || ["MISSING", "EMPTY"].includes(layout.reason);
  const summary = {
    totalFeatures: completeLayout ? validation.features : null,
    validFeatures: features.length,
    invalidFeatures: completeLayout
      ? validation.features - features.length
      : null,
    draft: features.filter((x) => x.status === "draft").length,
    ready: features.filter((x) => x.status === "ready").length,
    implemented: features.filter((x) => x.status === "implemented").length,
    pendingTasks: features.reduce((n, x) => n + x.todoTasks + x.doingTasks, 0),
  };
  return {
    schemaVersion: 1,
    ok: validation.ok,
    features,
    issues: validation.issues,
    summary,
    nextActions,
  };
}
