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
import { useRouter } from "next/navigation";
import { useState } from "react";

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


export default function Navbar() {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const {
    user,
    loading,
    authenticated,
    logout,
  } = useAuth();


  async function handleLogout() {
    await logout();

    setOpen(false);

    router.push("/");
    router.refresh();
  }


  return (
    <>
      <header className="site-header">
        <div className="axion-container navbar-inner">

          <Link
            href="/"
            onClick={() =>
              setOpen(false)
            }
          >
            <Logo />
          </Link>


          <nav className="desktop-nav">
            {navigation.map(
              (item) => (
                <Link
                  href={item.href}
                  key={item.name}
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>


          <div className="nav-actions">

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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#bdb9c6",
                      fontSize: 12,
                    }}
                  >
                    <UserRound
                      size={15}
                      color="#a985ff"
                    />

                    <span>
                      {user.full_name}
                    </span>
                  </div>


                  <Link
                    href="/dashboard"
                    className="nav-signin"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <LayoutDashboard
                      size={15}
                    />

                    Dashboard
                  </Link>


                  {user.is_admin && (
                    <Link
                      href="/admin"
                      className="nav-signin"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: "#b99aff",
                      }}
                    >
                      <ShieldCheck
                        size={15}
                      />

                      Admin
                    </Link>
                  )}


                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#c8c3cf",
                      background:
                        "transparent",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
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
        <div className="mobile-menu">

          {navigation.map(
            (item) => (
              <Link
                href={item.href}
                key={item.name}
                onClick={() =>
                  setOpen(false)
                }
              >
                {item.name}
              </Link>
            )
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
                <div
                  style={{
                    padding:
                      "15px 3px",
                    color:
                      "#a985ff",
                    fontSize:
                      13,
                  }}
                >
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
                    style={{
                      color:
                        "#b99aff",
                    }}
                  >
                    Admin
                  </Link>
                )}


                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  style={{
                    padding:
                      "15px 3px",
                    textAlign:
                      "left",
                    color:
                      "#d2d0d7",
                    background:
                      "transparent",
                    cursor:
                      "pointer",
                    borderBottom:
                      "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  Logout
                </button>
              </>
            )}
        </div>
      )}
    </>
  );
}