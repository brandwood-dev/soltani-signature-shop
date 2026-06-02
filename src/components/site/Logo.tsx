import { Link } from "@tanstack/react-router";

const LOGO_SRC = "https://res.cloudinary.com/dxkxiy900/image/upload/v1780366931/LOGO_NOIR_n5ezqa.png";

interface LogoProps {
  className?: string;
  height?: number;
  footer?: boolean;
}

export function Logo({ className = "", height = 42, footer = false }: LogoProps) {
  return (
    <Link to="/" className={`shrink-0 inline-flex items-center transition-opacity duration-300 hover:opacity-80 ${className}`}>
      <img
        src={LOGO_SRC}
        alt="Soltani Signature"
        className="object-contain"
        style={{ height, maxHeight: height, maxWidth: footer ? height * 5 : height * 5, width: "auto" }}
        loading="eager"
      />
    </Link>
  );
}
