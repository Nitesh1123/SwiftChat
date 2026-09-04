import type { CSSProperties } from "react";
import "@/styles.css";
import NavButton from "./NavButton";

interface CardNavProps {
    view: "signup" | "signin";
    toggleView: () => void;
}
const navButtons = [
  { name: "signin", label: "Sign In", icon: "check" },
  { name: "signup", label: "Sign Up", icon: "add" },
] as const;

const CardNav = ({view, toggleView}: CardNavProps) => {
  return (
    <ul
      className="card-nav"
      style={{ "--bar-position": view === "signin" ? 0 : 1 } as CSSProperties}
    >
    <li>
      <span className="active-bar" aria-hidden="true" />
    </li>
    {navButtons.map((btn) => (
      <li key={btn.name}>
        <NavButton
          icon={btn.icon}
          label={btn.label}
          isActive={view === btn.name}
          onClick={toggleView}
        />
      </li>
    ))}
  </ul>
  )
}

export default CardNav
