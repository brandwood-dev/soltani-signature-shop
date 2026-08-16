import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  target?: string;
  rel?: string;
};

export function SmartLink({ href, children, className, ariaLabel, target, rel }: Props) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link
        to={href as never}
        className={className}
        aria-label={ariaLabel}
        target={target}
        rel={rel}
      >
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} aria-label={ariaLabel} target={target} rel={rel}>
      {children}
    </a>
  );
}
