interface Env {
  API_ORIGIN: string;
  MAIL_OUTBOX_CRON_SECRET: string;
}

async function processMailOutbox(env: Env) {
  const endpoint = new URL("/api/v1/cron/mail-outbox", env.API_ORIGIN);
  const response = await fetch(endpoint, {
    headers: {
      authorization: `Bearer ${env.MAIL_OUTBOX_CRON_SECRET}`,
      "user-agent": "soltani-signature-mail-cron/1.0",
    },
  });

  await response.body?.cancel();
  if (!response.ok) {
    console.error(JSON.stringify({ event: "mail_outbox_failed", status: response.status }));
    throw new Error(`Mail outbox returned HTTP ${response.status}`);
  }

  console.log(JSON.stringify({ event: "mail_outbox_processed", status: response.status }));
}

export default {
  scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(processMailOutbox(env));
  },
  fetch(request: Request) {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/health") {
      return Response.json({ status: "ok", service: "soltani-signature-mail-cron" });
    }
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
