import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

const LOGO_DARK = "https://res.cloudinary.com/dxkxiy900/image/upload/v1780366938/LOGO_BLANC_ipaevx.png";
const LOGO_LIGHT = "https://res.cloudinary.com/dxkxiy900/image/upload/v1780366931/LOGO_NOIR_n5ezqa.png";

function useIsDark() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return true;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(el.classList.contains("dark"));
    });
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

interface LogoProps {
  className?: string;
  height?: number;
  footer?: boolean;
}

export function Logo({ className = "", height = 42, footer = false }: LogoProps) {
  const isDark = useIsDark();
  const src = isDark ? LOGO_DARK : LOGO_LIGHT;

  return (
    <Link to="/" className={`shrink-0 inline-flex items-center transition-opacity duration-300 hover:opacity-80 ${className}`}>
      <img
        src={src}
        alt="Soltani Signature"
        className="object-contain transition-all duration-500 ease-in-out"
        style={{ height, maxHeight: height, maxWidth: footer ? height * 5 : height * 5, width: "auto" }}
        loading="eager"
      />
    </Link>
  );
}
