import "@/styles.css";

interface CardHeroProps {
  view: "signin" | "signup";
}

const CardHero = ({ view }: CardHeroProps) => (
  <div className={`card-hero`}>
    <div
      className="card-hero-inner"
      style={{ top: view === "signin" ? 0 : "-100%" }}
    >
      <div className="card-hero-content welcome-panel signin">
        <div className="text absolute top-20 flex-col items-start z-10">
          <h2 className="text-3xl pl-3">Welcome Back.</h2>
          <h3 className="tracking-tight self-end">Please enter your credentials.</h3>
        </div>
      </div>
      <div className="card-hero-content welcome-panel signup">
        <div className="text absolute bottom-20 flex-col items-start z-10">
        <h2 className="text-3xl pl-3">Join The Crowd.</h2>
        <h3 className="tracking-tight">Sign up now and get started today.</h3>
        </div>
      </div>
    </div>
  </div>
);

export default CardHero;
