import { useState } from "react";
import CardForms from "@/components/auth/CardForms";
import "@/styles.css";
import CardNav from "@/components/auth/CardNav";
import CardHero from "@/components/auth/CardHero";

const Auth = () => {
  const [view, setView] = useState<"signin" | "signup">("signin");

  const toggleView = () =>
    setView((prev) => (prev === "signin" ? "signup" : "signin"));

  return (
    <section className="page login-2-page">
      <div className="login-2">
        <CardNav view={view} toggleView={toggleView} />
        <CardHero view={view}/>
        <CardForms view={view} toggleView={toggleView}/>
      </div>
    </section>
  );
};

export default Auth;
