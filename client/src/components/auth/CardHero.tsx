import type { CSSProperties } from "react";
import "@/styles.css";

interface CardHeroProps {
  view: "signin" | "signup";
}

const copy = {
  signin: { title: "Welcome back.", sub: "Your conversations kept their place." },
  signup: { title: "Join the crowd.", sub: "One account, every conversation, in real time." },
};

const CardHero = ({ view }: CardHeroProps) => (
  <div key={view} className="mt-7 mb-6">
    <h2 className="reveal font-display text-[2.1rem] leading-none tracking-tight">
      {copy[view].title}
    </h2>
    <p className="reveal mt-2 text-sm text-paper-dim" style={{ "--i": 1 } as CSSProperties}>
      {copy[view].sub}
    </p>
  </div>
);

export default CardHero;
