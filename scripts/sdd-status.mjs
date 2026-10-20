import path from "node:path";
import { workspaceStatus } from "../src/workspace.mjs";
const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--help") {
  console.log("Usage: node scripts/sdd-status.mjs [repository]");
} else if (args.length > 1 || args.some((x) => x.startsWith("--"))) {
  console.error("Invalid arguments. Use --help.");
  process.exitCode = 2;
} else {
  try {
    const result = workspaceStatus(path.resolve(args[0] ?? "."));
    console.log(JSON.stringify(result));
    process.exitCode = result.ok ? 0 : 1;
  } catch {
    console.log(
      JSON.stringify({
        schemaVersion: 1,
        ok: false,
        features: [],
        issues: [{ feature: null, code: "STATUS_READ" }],
      }),
    );
    process.exitCode = 1;
  }
}
