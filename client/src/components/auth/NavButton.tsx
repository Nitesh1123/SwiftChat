import '@/styles.css'
import { LogIn, UserPlus } from "lucide-react";

interface NavButtonProps{
    label: string;
    isActive: boolean;
    icon: "check" | "add";
    onClick: () => void;

}

const icons = { check: LogIn, add: UserPlus };

const NavButton = ({ onClick, isActive, label, icon }: NavButtonProps) => {
  const Icon = icons[icon];
  return (
    <button
    type="button"
    className={`${isActive ? "active" : ""} `}
    onClick={onClick}
    aria-pressed={isActive}
  >
    <Icon size={15} strokeWidth={2.2} />
    <span>{label}</span>
  </button>
  )
}

export default NavButton
