import SignInForm from "./SigninForm";
import SignupForm from "./SignupForm";
// import SignUpForm from "./SignUpForm";

interface CardFormsProps {
  view: "signin" | "signup";
  toggleView: () => void
}

const CardForms = ({ view, toggleView }: CardFormsProps) => {
  return (
    <div className="card-form">
      <div
        className="forms"
        data-view={view}
        style={{
          top: view === "signin" ? "0%" : "-100%",
        }}
      >
        {/* Sign In */}
        <SignInForm toggleView={toggleView}/>

        {/* Sign Up */}
        <SignupForm toggleView={toggleView}/>
      </div>
    </div>
  );
};

export default CardForms;
