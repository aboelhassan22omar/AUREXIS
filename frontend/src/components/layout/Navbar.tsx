"use client";

import {
  ArrowUpRight,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import Logo from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";
import { navigation } from "@/lib/content";
import { EASE_OUT } from "@/lib/motion";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, authenticated, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [indicator, setIndicator] = useState({ x: 0, w: 0, visible: false });
  const linksRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // The bar stays put; it only condenses into glass once the page moves.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    document.documentElement.classList.toggle("ax-menu-open", open);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const desktop = window.matchMedia("(min-width: 1080px)");
    const onDesktop = () => desktop.matches && setOpen(false);

    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);

    return () => {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("ax-menu-open");
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  function moveIndicator(target: HTMLElement) {
    const container = linksRef.current;

    if (!container) {
      return;
    }

    const box = container.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    setIndicator({ x: rect.left - box.left, w: rect.width, visible: true });
  }

  async function handleLogout() {
    await logout();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  const solid = scrolled || open || pathname !== "/";

  return (
    <>
      <header
        className={[
          "ax-nav",
          scrolled ? "is-scrolled" : "",
          solid ? "is-solid" : "",
          open ? "is-open" : "",
        ].join(" ")}
      >
        <div className="ax-nav__bar">
          <Link href="/" className="ax-nav__brand" aria-label="AUREXIS home">
            <Logo size={26} />
          </Link>

          <nav aria-label="Primary">
            <div
              className="ax-nav__links"
              ref={linksRef}
              onMouseLeave={() => setIndicator((current) => ({ ...current, visible: false }))}
            >
              <span
                className="ax-nav__indicator"
                style={{
                  width: indicator.w,
                  transform: `translateX(${indicator.x}px)`,
                  opacity: indicator.visible ? 1 : 0,
                }}
                aria-hidden="true"
              />
              {navigation.map((item) => {
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`ax-nav__link${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                    onMouseEnter={(event) => moveIndicator(event.currentTarget)}
                    onFocus={(event) => moveIndicator(event.currentTarget)}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="ax-nav__actions">
            {!loading && !authenticated && (
              <>
                <Link href="/login" className="ax-nav__signin">
                  Sign in
                </Link>
                <Link href="/register" className="ax-btn ax-btn--primary ax-btn--sm ax-nav__cta">
                  Sign up
                </Link>
              </>
            )}

            {!loading && authenticated && user && (
              <>
                {user.is_admin && (
                  <Link href="/admin" className="ax-nav__signin">
                    <ShieldCheck size={15} />
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="ax-btn ax-btn--primary ax-btn--sm ax-nav__cta">
                  <LayoutDashboard size={15} />
                  Workspace
                </Link>
              </>
            )}

            <button
              type="button"
              className="ax-nav__toggle"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="ax-mobile-menu"
            >
              <span className="ax-burger" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="ax-mobile-menu"
            className="ax-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <div className="ax-menu__links">
              {[{ name: "Home", href: "/" }, ...navigation].map((item, index) => {
                const active = item.href === "/" ? pathname === "/" : isActivePath(pathname, item.href);

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.08 + index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`ax-menu__link${active ? " is-active" : ""}`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                    >
                      {item.name}
                      <small>{String(index + 1).padStart(2, "0")}</small>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              className="ax-menu__foot"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.4 }}
            >
              {!loading && !authenticated && (
                <>
                  <Link href="/register" className="ax-btn ax-btn--primary ax-btn--lg ax-btn--block" onClick={() => setOpen(false)}>
                    Sign up
                    <ArrowUpRight size={18} />
                  </Link>
                  <Link href="/login" className="ax-btn ax-btn--glass ax-btn--lg ax-btn--block" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </>
              )}

              {!loading && authenticated && user && (
                <>
                  <p className="ax-menu__account">Signed in as {user.full_name}</p>
                  <Link href="/dashboard" className="ax-btn ax-btn--glass ax-btn--block" onClick={() => setOpen(false)}>
                    <LayoutDashboard size={16} />
                    Workspace
                  </Link>
                  {user.is_admin && (
                    <Link href="/admin" className="ax-btn ax-btn--glass ax-btn--block" onClick={() => setOpen(false)}>
                      <ShieldCheck size={16} />
                      Admin
                    </Link>
                  )}
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--block" onClick={handleLogout}>
                    <LogOut size={16} />
                    Sign out
                  </button>
                </>
              )}
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
