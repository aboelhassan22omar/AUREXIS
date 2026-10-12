"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import Unit from "@/components/stage/Unit";
import Logo from "@/components/ui/Logo";
import { EASE_OUT } from "@/lib/motion";

const TABS = [
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Create account" },
];

/**
 * Persistent frame for /login and /register. It lives in the (auth) layout,
 * so the Aurexis Unit and the glass panel stay mounted while only the form
 * transitions — and the unit waves each time you switch.
 */
export default function AuthFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const first = useRef(true);
  const [wave, setWave] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    setWave((count) => count + 1);
  }, [pathname]);

  return (
    <main id="main" className="ax-auth">
      <aside className="ax-auth__visual">
        <div className="ax-auth__light" aria-hidden="true" />
        <Unit className="ax-auth__unit" waveSignal={wave} framing="tall" />
        <p className="ax-auth__quote" aria-hidden="true">
          <span className="ax-lit">Intelligence.</span>{" "}
          <span className="ax-muted-words">Software. Solutions.</span>
        </p>
      </aside>

      <section className="ax-auth__panel">
        <Link href="/" className="ax-auth__logo" aria-label="AUREXIS home">
          <Logo size={28} />
        </Link>

        <div className="ax-auth__card ax-glass">
          <nav className="ax-segment" aria-label="Account">
            {TABS.map((tab) => {
              const active = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`ax-segment__item${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="ax-auth-tab"
                      className="ax-segment__thumb"
                      transition={{ duration: 0.5, ease: EASE_OUT }}
                    />
                  )}
                  <span className="ax-segment__label">{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {children}
        </div>

        <p className="ax-auth__legal">© {new Date().getFullYear()} AUREXIS</p>
      </section>
    </main>
  );
}

export function AuthHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <header className="ax-auth__heading" data-eyebrow={eyebrow}>
      <h1 className="ax-auth__title">{title}</h1>
      <p className="ax-body">{lead}</p>
    </header>
  );
}
