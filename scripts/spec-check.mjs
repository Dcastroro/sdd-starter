import path from "node:path";
import { checkRepository } from "../src/spec-check.mjs";

const args = process.argv.slice(2);
if (args.length === 1 && args[0] === "--help") {
  console.log("Usage: node scripts/spec-check.mjs [repository] [--json]");
} else {
  const positional = args.filter((x) => !x.startsWith("--"));
  if (
    args.some((x) => x.startsWith("--") && x !== "--json") ||
    positional.length > 1 ||
    args.filter((x) => x === "--json").length > 1
  ) {
    console.error("Invalid arguments. Use --help.");
    process.exitCode = 2;
  } else {
    const result = checkRepository(path.resolve(positional[0] ?? "."));
    if (args.includes("--json"))
      console.log(JSON.stringify({ schemaVersion: 1, ...result }));
    else
      console.log(
        result.ok
          ? `PASS: ${result.features} specification(s) validated.`
          : `FAIL: ${result.issues.map((x) => x.code).join(", ")}`,
      );
    process.exitCode = result.ok ? 0 : 1;
  }
}
