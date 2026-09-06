import { createFileRoute } from "@tanstack/react-router";

type CloudflareRuntimeEnv = {
  CF_VERSION_SHA?: string;
};

function getVersionCommit() {
  const runtimeEnv = (globalThis as typeof globalThis & { __env__?: CloudflareRuntimeEnv }).__env__;
  return (
    runtimeEnv?.CF_VERSION_SHA ??
    process.env.CF_VERSION_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.GITHUB_SHA ??
    "local"
  );
}

export const Route = createFileRoute("/version.json")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          {
            service: "soltani-signature-shop",
            commit: getVersionCommit(),
          },
          { headers: { "Cache-Control": "private, no-store, max-age=0" } },
        ),
    },
  },
});
