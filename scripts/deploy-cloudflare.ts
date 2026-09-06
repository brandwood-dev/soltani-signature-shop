import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function getCommitSha() {
  const configuredSha = process.env.GITHUB_SHA ?? process.env.GIT_COMMIT_SHA;
  if (configuredSha) return configuredSha.trim();

  return execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
}

const commitSha = getCommitSha();
if (!/^[0-9a-f]{40}$/i.test(commitSha)) {
  throw new Error(`Invalid Git commit SHA: ${commitSha || "empty"}`);
}

execFileSync(
  process.execPath,
  [
    fileURLToPath(new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url)),
    "deploy",
    "--config",
    "wrangler.jsonc",
    "--var",
    `CF_VERSION_SHA:${commitSha}`,
  ],
  { stdio: "inherit" },
);
