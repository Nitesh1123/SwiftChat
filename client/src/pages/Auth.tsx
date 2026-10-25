import { useState, type CSSProperties } from "react";
import CardForms from "@/components/auth/CardForms";
import "@/styles.css";
import CardNav from "@/components/auth/CardNav";
import CardHero from "@/components/auth/CardHero";
import Logo from "@/components/brand/Logo";

const at = (i: number, base = 0) => ({ "--i": i, "--base": `${base}ms` }) as CSSProperties;

const Auth = () => {
  const [view, setView] = useState<"signin" | "signup">("signin");

  const toggleView = () =>
    setView((prev) => (prev === "signin" ? "signup" : "signin"));

  return (
    <section className="auth-page atmosphere">
      {/* Brand column */}
      <aside className="relative flex flex-col justify-between gap-8 px-5 pt-6 pb-2 sm:px-10 lg:px-16 lg:py-12">
        <div className="flex items-center gap-3">
          <Logo size={38} animate />
          <span className="reveal text-lg font-semibold tracking-tight" style={at(1, 200)}>
            SwiftChat
          </span>
          <span className="reveal eyebrow ml-auto hidden sm:inline-flex items-center gap-2" style={at(2, 200)}>
            <span className="online-dot" /> lines open
          </span>
        </div>

        <div className="max-w-2xl">
          <p className="reveal eyebrow mb-5 hidden lg:block" style={at(0, 350)}>
            No. 01 — real-time messaging
          </p>
          <h1 className="auth-headline">
            <span className="reveal" style={at(1, 350)}>Say it</span>
            <span className="reveal italic text-shu" style={at(2, 350)}>the moment</span>
            <span className="reveal" style={at(3, 350)}>you think it.</span>
          </h1>
          <div className="ink-rule mt-8 hidden max-w-sm lg:block" style={at(0, 900)} />
          <p className="reveal mt-6 hidden max-w-md text-[15px] leading-relaxed text-paper-dim lg:block" style={at(5, 350)}>
            Conversations that land the instant they're sent, with presence you
            can actually trust. No refreshing, no waiting.
          </p>
        </div>

        {/* Live transcript vignette */}
        <div className="hidden max-w-md flex-col gap-2.5 lg:flex" aria-hidden="true">
          <div className="reveal demo-bubble bubble-other self-start" style={at(0, 1200)}>
            are you seeing this live?
          </div>
          <div className="reveal demo-bubble bubble-own self-end" style={at(1, 1350)}>
            already replied before you finished typing
          </div>
          <div className="reveal flex items-center gap-3 self-start" style={at(2, 1500)}>
            <span className="demo-bubble bubble-other typing-dots inline-flex gap-1 !py-3.5">
              <span /> <span /> <span />
            </span>
            <span className="eyebrow">mika is typing</span>
          </div>
        </div>
      </aside>

      {/* Form column */}
      <main className="flex items-start justify-center px-4 pb-10 pt-6 sm:px-6 lg:items-center lg:border-l lg:border-paper/[0.06] lg:bg-ink-0/30 lg:py-12">
        <div className="auth-card reveal p-5 sm:p-7" style={at(0, 500)}>
          <CardNav view={view} toggleView={toggleView} />
          <CardHero view={view} />
          <CardForms view={view} toggleView={toggleView} />
        </div>
      </main>
    </section>
  );
};

export default Auth;
