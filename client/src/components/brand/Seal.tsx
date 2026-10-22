import type { CSSProperties } from "react";

interface SealProps {
  size?: number;
  animate?: boolean;
  delay?: number;
  className?: string;
}

/** Vermilion hanko stamp bearing 速 ("swift"). */
const Seal = ({ size = 40, animate = false, delay = 0, className = "" }: SealProps) => (
  <span
    aria-hidden="true"
    className={`seal font-seal ${animate ? "stamp" : ""} ${className}`}
    style={
      {
        width: size,
        height: size,
        fontSize: size * 0.58,
        "--base": `${delay}ms`,
      } as CSSProperties
    }
  >
    速
  </span>
);

export default Seal;
