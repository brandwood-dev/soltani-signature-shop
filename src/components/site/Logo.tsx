import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSiteMedia, type ContentImageUpload } from "@/lib/content-media-api";
import { ResponsiveImage } from "./ResponsiveImage";

const LOGO_FALLBACK = "/soltani-logo.svg";

interface LogoProps {
  className?: string;
  height?: number;
  footer?: boolean;
}

export function Logo({ className = "", height = 42, footer = false }: LogoProps) {
  const [logo, setLogo] = useState<ContentImageUpload | null>(null);

  useEffect(() => {
    let mounted = true;
    void getSiteMedia()
      .then((media) => {
        if (mounted) setLogo(media.logo);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  // Reduce logo automatically on mobile for a cleaner header
  const mobileHeight = Math.round(height * 0.68);
  return (
    <Link to="/" className={`shrink-0 inline-flex items-center transition-opacity duration-300 hover:opacity-80 ${className}`}>
      <ResponsiveImage
        src={logo?.url ?? LOGO_FALLBACK}
        sources={logo?.sources}
        alt="Soltani Signature"
        className="object-contain h-[var(--logo-h-m)] sm:h-[var(--logo-h)] w-auto"
        style={
          {
            "--logo-h": `${height}px`,
            "--logo-h-m": `${mobileHeight}px`,
            maxWidth: footer ? height * 5 : height * 5,
          } as React.CSSProperties
        }
        loading="eager"
      />
    </Link>
  );
}
