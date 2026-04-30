import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function rmIfExists(p) {
  try {
    fs.rmSync(p, { force: true });
  } catch {
    // ignore
  }
}

rmIfExists(path.join(root, "package-lock.json"));
rmIfExists(path.join(root, "yarn.lock"));

const ua = process.env.npm_config_user_agent ?? "";
if (!ua.startsWith("pnpm/")) {
  console.error("Use pnpm instead.");
  process.exit(1);
}

