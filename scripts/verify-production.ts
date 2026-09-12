const frontendUrl = (process.env.FRONTEND_BASE_URL ?? "https://www.soltanisignature.com").replace(/\/$/, "");
const apiUrl = (process.env.API_BASE_URL ?? "https://soltani-signature-api.onrender.com").replace(/\/$/, "");
const expectedSha = process.env.EXPECTED_FRONTEND_SHA?.trim();

if (!expectedSha || !/^[0-9a-f]{40}$/i.test(expectedSha)) {
  throw new Error("EXPECTED_FRONTEND_SHA doit contenir un SHA Git de 40 caractères.");
}

async function fetchWithTimeout(url: string) {
  return fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    headers: { Accept: "application/json,text/html" },
  });
}

async function waitForFrontend() {
  for (let attempt = 1; attempt <= 40; attempt += 1) {
    try {
      const response = await fetchWithTimeout(`${frontendUrl}/version.json`);
      if (response.ok) {
        const version = (await response.json()) as { service?: string; commit?: string };
        if (version.service === "soltani-signature-shop" && version.commit?.toLowerCase() === expectedSha.toLowerCase()) {
          return;
        }
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 3_000));
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 3_000));
  }
  throw new Error(`Le SHA frontend ${expectedSha} n'est pas encore servi par ${frontendUrl}.`);
}

await waitForFrontend();

const home = await fetchWithTimeout(`${frontendUrl}/`);
if (!home.ok || !(await home.text()).toLowerCase().includes("soltani")) {
  throw new Error("Le smoke test homepage a échoué.");
}

const ready = await fetchWithTimeout(`${apiUrl}/api/v1/health/ready`);
if (!ready.ok) throw new Error(`La readiness API a répondu HTTP ${ready.status}.`);
const readiness = (await ready.json()) as { status?: string; database?: string };
if (readiness.status !== "ok" || readiness.database !== "ok") {
  throw new Error("La readiness API ou la connexion base de données est invalide.");
}

console.log(`Production validée : frontend ${expectedSha}, API et base de données OK.`);
