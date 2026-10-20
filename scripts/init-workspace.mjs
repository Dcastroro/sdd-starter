import path from "node:path";
import { initializeWorkspace } from "../src/workspace.mjs";
const args = process.argv.slice(2);
const positional = args.filter((x) => !x.startsWith("--"));
if (args.length === 1 && args[0] === "--help") {
  console.log(
    "Usage: node scripts/init-workspace.mjs [repository] [--dry-run]",
  );
} else if (
  positional.length > 1 ||
  args.some((x) => x.startsWith("--") && x !== "--dry-run") ||
  args.filter((x) => x === "--dry-run").length > 1
) {
  console.error("Invalid arguments. Use --help.");
  process.exitCode = 2;
} else {
  try {
    console.log(
      JSON.stringify(
        initializeWorkspace(path.resolve(positional[0] ?? "."), {
          dryRun: args.includes("--dry-run"),
        }),
      ),
    );
  } catch {
    console.log(
      JSON.stringify({
        schemaVersion: 1,
        ok: false,
        code: "INITIALIZATION_FAILED",
      }),
    );
    process.exitCode = 1;
  }
}
