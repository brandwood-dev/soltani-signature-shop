const ADMIN_NAV_START = "admin-navigation-start";

export function markAdminNavigationStart(to: string) {
  if (typeof window === "undefined" || typeof performance === "undefined") return;

  try {
    sessionStorage.setItem(ADMIN_NAV_START, JSON.stringify({ to, at: performance.now() }));
    performance.mark(`admin-nav:${to}:click`);
  } catch {
    // Instrumentation must never affect navigation.
  }
}

export function markAdminRouteVisible(routeName: string) {
  if (typeof window === "undefined" || typeof performance === "undefined") return;

  try {
    const marker = `admin-route:${routeName}:visible`;
    performance.mark(marker);

    const rawStart = sessionStorage.getItem(ADMIN_NAV_START);
    if (!rawStart) return;

    const start = JSON.parse(rawStart) as { to?: string; at?: number };
    if (typeof start.at !== "number") return;

    const duration = Math.max(0, Math.round(performance.now() - start.at));
    performance.measure(`admin-route:${routeName}:click-to-visible`, {
      start: start.at,
      end: performance.now(),
    });

    console.info(
      `[admin-perf] route="${routeName}" target="${start.to ?? ""}" clickToVisibleMs=${duration}`,
    );
  } catch {
    // Instrumentation must stay silent if Performance API is unavailable.
  }
}
