import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isFeatureId, regularPath } from "../src/spec-check.mjs";

const args = process.argv.slice(2);
if (args.length !== 1 || !isFeatureId(args[0])) {
  console.error("Usage: npm run spec:new -- 002-feature-name");
  process.exitCode = 2;
} else {
  try {
    const root = process.cwd();
    const parent = regularPath(root, "specs", true);
    const target = path.join(parent, args[0]);
    // Exclusive mkdir refuses existing directories and symbolic links.
    fs.mkdirSync(target);
    const template = fileURLToPath(
      new URL("../templates/feature/", import.meta.url),
    );
    for (const file of [
      "requirements.md",
      "design.md",
      "tasks.md",
      "verification.md",
      "traceability.json",
    ]) {
      fs.writeFileSync(
        path.join(target, file),
        fs
          .readFileSync(path.join(template, file), "utf8")
          .replaceAll("000-feature-name", args[0]),
        { flag: "wx" },
      );
    }
    console.log(
      "Created draft specification. Resolve its scope and acceptance criteria before implementation.",
    );
  } catch {
    console.error(
      "Cannot create specification. Check the specs directory and choose an unused ID. Existing files are not overwritten.",
    );
    process.exitCode = 1;
  }
}
