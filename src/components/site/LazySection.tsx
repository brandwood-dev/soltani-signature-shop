import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  /** Estimated section height to reserve — prevents CLS before mount. */
  minHeight?: number | string;
  /** Distance (px) before viewport at which to mount. */
  rootMargin?: string;
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Defers mounting children until the placeholder scrolls near the viewport.
 * Reduces initial JS work and image requests on the home page.
 */
export function LazySection({
  minHeight = 400,
  rootMargin = "400px 0px",
  fallback = null,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? <Suspense fallback={fallback}>{children}</Suspense> : null}
    </div>
  );
}
