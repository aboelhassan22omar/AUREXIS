"use client";

import {
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import ThemeToggle from "@/components/theme/ThemeToggle";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  {
    name: "Services",
    href: "/services",
  },
  {
    name: "Solutions",
    href: "/solutions",
  },
  {
    name: "Projects",
    href: "/projects",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];

function isActivePath(
  pathname: string,
  href: string
) {
  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] =
    useState(false);

  const {
    user,
    loading,
    authenticated,
    logout,
  } = useAuth();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const body = document.body;

    body.classList.toggle(
      "mobile-nav-open",
      open
    );

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const desktopQuery =
      window.matchMedia(
        "(min-width: 1024px)"
      );
    const handleDesktopChange = () => {
      if (desktopQuery.matches) {
        setOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );
    desktopQuery.addEventListener(
      "change",
      handleDesktopChange
    );

    return () => {
      body.classList.remove(
        "mobile-nav-open"
      );
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
      desktopQuery.removeEventListener(
        "change",
        handleDesktopChange
      );
    };
  }, [open]);

  async function handleLogout() {
    await logout();

    setOpen(false);

    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="site-header">
        <div className="aurexis-container navbar-inner">
          <Link
            href="/"
            onClick={() =>
              setOpen(false)
            }
          >
            <Logo />
          </Link>

          <nav
            className="desktop-nav"
            aria-label="Primary navigation"
          >
            {navigation.map(
              (item) => {
                const active =
                  isActivePath(
                    pathname,
                    item.href
                  );

                return (
                  <Link
                    href={item.href}
                    key={item.name}
                    className={
                      active
                        ? "is-active"
                        : undefined
                    }
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                  >
                    {item.name}
                  </Link>
                );
              }
            )}
          </nav>

          <div className="nav-actions">
            <ThemeToggle />

            {!loading &&
              !authenticated && (
                <>
                  <Link
                    href="/login"
                    className="nav-signin"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/register"
                    className="nav-cta"
                  >
                    Get Started
                  </Link>
                </>
              )}

            {!loading &&
              authenticated &&
              user && (
                <>
                  <div className="nav-user-summary">
                    <UserRound
                      size={15}
                    />

                    <span>
                      {user.full_name}
                    </span>
                  </div>

                  <Link
                    href="/dashboard"
                    className="nav-signin nav-inline-action"
                  >
                    <LayoutDashboard
                      size={15}
                    />
                    Dashboard
                  </Link>

                  {user.is_admin && (
                    <Link
                      href="/admin"
                      className="nav-signin nav-inline-action nav-admin-link"
                    >
                      <ShieldCheck
                        size={15}
                      />
                      Admin
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="nav-logout"
                  >
                    <LogOut
                      size={15}
                    />
                    Logout
                  </button>
                </>
              )}
          </div>

          <button
            type="button"
            className="mobile-nav-button"
            onClick={() =>
              setOpen(
                (value) =>
                  !value
              )
            }
            aria-label="Toggle navigation"
            aria-expanded={open}
            aria-controls="aurexis-mobile-navigation"
          >
            {open ? (
              <X size={25} />
            ) : (
              <Menu size={25} />
            )}
          </button>
        </div>
      </header>

      {open && (
        <nav
          id="aurexis-mobile-navigation"
          className="mobile-menu"
          aria-label="Mobile navigation"
        >
          <div className="mobile-theme-row">
            <span>Appearance</span>
            <ThemeToggle />
          </div>

          {navigation.map(
            (item) => {
              const active =
                isActivePath(
                  pathname,
                  item.href
                );

              return (
                <Link
                  href={item.href}
                  key={item.name}
                  onClick={() =>
                    setOpen(false)
                  }
                  className={
                    active
                      ? "is-active"
                      : undefined
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                >
                  {item.name}
                </Link>
              );
            }
          )}

          {!loading &&
            !authenticated && (
              <>
                <Link
                  href="/login"
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  Get Started
                </Link>
              </>
            )}

          {!loading &&
            authenticated &&
            user && (
              <>
                <div className="mobile-user-summary">
                  Signed in as{" "}
                  {user.full_name}
                </div>

                <Link
                  href="/dashboard"
                  onClick={() =>
                    setOpen(false)
                  }
                >
                  Dashboard
                </Link>

                {user.is_admin && (
                  <Link
                    href="/admin"
                    onClick={() =>
                      setOpen(false)
                    }
                    className="mobile-admin-link"
                  >
                    Admin
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mobile-logout"
                >
                  Logout
                </button>
              </>
            )}
        </nav>
      )}
    </>
  );
}
