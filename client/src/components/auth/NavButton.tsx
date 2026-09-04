import '@/styles.css'
interface NavButtonProps{
    label: string;
    isActive: boolean;
    icon: string;
    onClick: () => void;

}

const NavButton = ({ onClick, isActive, label, icon }: NavButtonProps) => {
  return (
    <button
    type="button"
    className={`${isActive ? "active" : ""} `}
    onClick={onClick}
  >
    <i className={`ai-person-${icon}`} />
    <span>{label}</span>
  </button>
  )
}

export default NavButton
