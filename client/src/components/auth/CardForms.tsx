import SignInForm from "./SigninForm";
import SignupForm from "./SignupForm";

interface CardFormsProps {
  view: "signin" | "signup";
  toggleView: () => void
}

const CardForms = ({ view, toggleView }: CardFormsProps) => {
  return (
    <div className="auth-forms" data-view={view}>
      {/* Both stay mounted so field values survive switching tabs */}
      <SignInForm toggleView={toggleView} active={view === "signin"} />
      <SignupForm toggleView={toggleView} active={view === "signup"} />
    </div>
  );
};

export default CardForms;
