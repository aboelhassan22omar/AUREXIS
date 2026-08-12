"use client";

import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import type {
  ReactNode,
} from "react";

import Logo from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";


type AdminShellProps = {
  children: ReactNode;
};


const links = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Leads",
    href: "/admin/leads",
    icon: Mail,
  },
  {
    name: "Services",
    href: "/admin/services",
    icon: Settings,
  },
  {
    name: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
];


export default function AdminShell({
  children,
}: AdminShellProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    user,
    logout,
  } = useAuth();


  async function handleLogout() {
    await logout();

    router.push("/");
    router.refresh();
  }


  function isActive(
    href: string
  ): boolean {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(
      href
    );
  }


  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">

        <Link
          href="/"
          className="admin-logo-link"
        >
          <Logo />
        </Link>


        <div className="admin-badge">
          <ShieldCheck
            size={14}
          />

          Administrator
        </div>


        <nav className="admin-navigation">

          {links.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.href
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className={
                    active
                      ? "admin-nav-item active"
                      : "admin-nav-item"
                  }
                >
                  <Icon
                    size={18}
                  />

                  <span>
                    {item.name}
                  </span>
                </Link>
              );
            }
          )}

        </nav>


        <div className="admin-sidebar-bottom">

          {user && (
            <div className="admin-user">

              <div className="admin-avatar">
                {user.full_name
                  .charAt(0)
                  .toUpperCase()}
              </div>


              <div>
                <strong>
                  {user.full_name}
                </strong>

                <span>
                  {user.email}
                </span>
              </div>

            </div>
          )}


          <button
            type="button"
            className="admin-logout"
            onClick={
              handleLogout
            }
          >
            <LogOut
              size={17}
            />

            Logout
          </button>

        </div>

      </aside>


      <main className="admin-main">
        {children}
      </main>

    </div>
  );
}