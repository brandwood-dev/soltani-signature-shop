import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/version.json")({
  server: {
    handlers: {
      GET: async () =>
        Response.json(
          {
            service: "soltani-signature-shop",
            commit:
              process.env.CF_VERSION_SHA ??
              process.env.VERCEL_GIT_COMMIT_SHA ??
              process.env.GITHUB_SHA ??
              "local",
          },
          { headers: { "Cache-Control": "private, no-store, max-age=0" } },
        ),
    },
  },
});
