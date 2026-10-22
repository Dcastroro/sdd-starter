import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isFeatureId, regularPath } from "../src/spec-check.mjs";

const args = process.argv.slice(2);
const positional = args.filter((arg) => !arg.startsWith("--"));
const usage =
  "Usage: npm run spec:new -- 002-feature-name [repository] [--dry-run]";
if (args.length === 1 && args[0] === "--help") {
  console.log(usage);
} else if (
  positional.length < 1 ||
  positional.length > 2 ||
  !isFeatureId(positional[0]) ||
  args.some((arg) => arg.startsWith("--") && arg !== "--dry-run") ||
  args.filter((arg) => arg === "--dry-run").length > 1
) {
  console.error(usage);
  process.exitCode = 2;
} else {
  try {
    const feature = positional[0];
    const root = path.resolve(positional[1] ?? process.cwd());
    const parent = regularPath(root, "specs", true);
    const target = path.join(parent, feature);
    let occupied = true;
    try {
      fs.lstatSync(target);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      occupied = false;
    }
    if (occupied) throw Error("DESTINATION_EXISTS");
    const files = [
      "requirements.md",
      "design.md",
      "tasks.md",
      "verification.md",
      "traceability.json",
    ];
    if (args.includes("--dry-run")) {
      console.log(
        JSON.stringify({
          schemaVersion: 1,
          ok: true,
          dryRun: true,
          feature,
          planned: [
            `specs/${feature}/`,
            ...files.map((file) => `specs/${feature}/${file}`),
          ],
        }),
      );
    } else {
      // Exclusive mkdir still protects creation if the destination appeared after preflight.
      fs.mkdirSync(target);
      const template = fileURLToPath(
        new URL("../templates/feature/", import.meta.url),
      );
      for (const file of files) {
        fs.writeFileSync(
          path.join(target, file),
          fs
            .readFileSync(path.join(template, file), "utf8")
            .replaceAll("000-feature-name", feature),
          { flag: "wx" },
        );
      }
      console.log(
        "Created draft specification. Resolve its scope and acceptance criteria before implementation.",
      );
    }
  } catch {
    console.error(
      "Cannot create specification. Check the specs directory and choose an unused ID. Existing files are not overwritten.",
    );
    process.exitCode = 1;
  }
}
