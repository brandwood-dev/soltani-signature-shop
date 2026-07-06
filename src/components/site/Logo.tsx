import { Link } from "@tanstack/react-router";

const LOGO_SRC = "https://res.cloudinary.com/dxkxiy900/image/upload/v1780366931/LOGO_NOIR_n5ezqa.png";

interface LogoProps {
  className?: string;
  height?: number;
  footer?: boolean;
}

export function Logo({ className = "", height = 42, footer = false }: LogoProps) {
  // Reduce logo automatically on mobile for a cleaner header
  const mobileHeight = Math.round(height * 0.68);
  return (
    <Link to="/" className={`shrink-0 inline-flex items-center transition-opacity duration-300 hover:opacity-80 ${className}`}>
      <img
        src={LOGO_SRC}
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
