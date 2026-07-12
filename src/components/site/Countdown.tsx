import { useEffect, useState } from "react";

/**
 * Stable per-day deadline so SSR & client share the same target,
 * avoiding hydration mismatches. The countdown ticks only after mount.
 */
export function useStableDeadline(daysAhead = 3, hoursAhead = 8) {
  // Compute a deadline anchored to the start of "today" (UTC) so SSR
  // and the first client render produce the same number.
  const day = Math.floor(Date.now() / 86400000) * 86400000;
  return day + daysAhead * 86400000 + hoursAhead * 3600000;
}

export function useCountdown(target: number, onExpire?: () => void) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max((target - (now ?? target)), 0);
  useEffect(() => {
    if (now !== null && target <= now) onExpire?.();
  }, [now, onExpire, target]);
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
    ready: now !== null,
  };
}

export function CountdownInline({ target, className = "", onExpire }: { target: number; className?: string; onExpire?: () => void }) {
  const { d, h, m, s } = useCountdown(target, onExpire);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className={`tabular-nums ${className}`}>
      Fin dans <strong className="text-gold">{pad(d)}j {pad(h)}h {pad(m)}m {pad(s)}s</strong>
    </span>
  );
}

export function CountdownCells({ target, onExpire }: { target: number; onExpire?: () => void }) {
  const { d, h, m, s } = useCountdown(target, onExpire);
  const cells = [
    { v: d, l: "Jours" },
    { v: h, l: "Heures" },
    { v: m, l: "Minutes" },
    { v: s, l: "Secondes" },
  ];
  return (
    <div className="grid grid-cols-4 gap-3 md:gap-5">
      {cells.map((c) => (
        <div key={c.l} className="aspect-square bg-ink/80 border border-gold/30 backdrop-blur flex flex-col items-center justify-center rounded-sm">
          <span className="font-display text-4xl md:text-6xl font-bold text-gold tabular-nums">
            {String(c.v).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-[0.25em] text-cream/70 mt-2">{c.l}</span>
        </div>
      ))}
    </div>
  );
}
