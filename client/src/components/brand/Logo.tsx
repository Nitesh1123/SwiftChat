import { useId, type CSSProperties } from "react";

interface LogoProps {
  size?: number;
  animate?: boolean;
  delay?: number;
  className?: string;
}

/**
 * SwiftChat mark: two chat bubbles whose tails meet on the diagonal,
 * tracing an S. Same geometry as public/logo.svg.
 */
const Logo = ({ size = 40, animate = false, delay = 0, className = "" }: LogoProps) => {
  const gradientId = useId();
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      className={`logo-mark ${animate ? "stamp" : ""} ${className}`}
      style={{ "--base": `${delay}ms` } as CSSProperties}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EE6A45" />
          <stop offset="1" stopColor="#C9461F" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${gradientId})`} />
      <g fill="#14141B">
        <rect x="8" y="8" width="26" height="13" rx="6.5" />
        <path d="M11 19 L23.5 26 L19 19 Z" />
        <rect x="14" y="27" width="26" height="13" rx="6.5" />
        <path d="M37 29 L24.5 22 L29 29 Z" />
      </g>
      <g fill="#E3582F">
        <circle cx="15.5" cy="14.5" r="1.6" />
        <circle cx="21" cy="14.5" r="1.6" />
        <circle cx="26.5" cy="14.5" r="1.6" />
      </g>
    </svg>
  );
};

export default Logo;
