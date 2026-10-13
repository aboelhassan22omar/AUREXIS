"use client";

import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  CircleUserRound,
  FolderKanban,
  LogOut,
  Mail,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Reveal from "@/components/motion/Reveal";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/hooks/useAuth";

type Action = {
  href: string;
  title: string;
  body: string;
  cta: string;
  Icon: LucideIcon;
};

const ACTIONS: Action[] = [
  {
    href: "/chat",
    title: "Aurexis AI workspace",
    body: "Saved conversations with Aurexis AI about your organization and ideas.",
    cta: "Open workspace",
    Icon: MessageSquareText,
  },
  {
    href: "/services",
    title: "Explore services",
    body: "AI, software, automation and security systems services.",
    cta: "Explore",
    Icon: Bot,
  },
  {
    href: "/projects",
    title: "View projects",
    body: "Systems, platforms and intelligent solutions built by Aurexis.",
    cta: "View projects",
    Icon: FolderKanban,
  },
  {
    href: "/contact",
    title: "Start a project",
    body: "Tell Aurexis what you want to build and start a new conversation.",
    cta: "Start request",
    Icon: Sparkles,
  },
  {
    href: "/contact",
    title: "Contact Aurexis",
    body: "Reach the team about your account, a project or a new idea.",
    cta: "Contact team",
    Icon: Mail,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, authenticated, logout } = useAuth();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/login");
    }
  }, [authenticated, loading, router]);

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  if (loading || !authenticated || !user) {
    return (
      <main className="ax-loading-screen">
        <Logo size={36} showText={false} />
        <span className="ax-spinner" />
        Loading your workspace…
      </main>
    );
  }

  const firstName = user.full_name.trim().split(" ")[0];
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const actions = user.is_admin
    ? [
        ...ACTIONS,
        {
          href: "/admin",
          title: "Admin console",
          body: "Manage services, projects, leads and users.",
          cta: "Open admin",
          Icon: ShieldCheck,
        },
      ]
    : ACTIONS;

  return (
    <>
      <Navbar />

      <main id="main" className="ax-dash">
        <div className="container">
          <Reveal className="ax-dash__head">
            <div>
              <span className="ax-eyebrow">Aurexis workspace</span>
              <h1 className="ax-h1 mt-5">
                <span className="ax-lit">Welcome, </span>
                <span className="ax-muted-words">{firstName}.</span>
              </h1>
              <p className="ax-lead mt-4">
                Your Aurexis account, services and project requests in one secure workspace.
              </p>
            </div>
            <button type="button" className="ax-btn ax-btn--glass" onClick={handleLogout}>
              <LogOut size={16} />
              Sign out
            </button>
          </Reveal>

          <div className="row g-4 mt-2">
            <Reveal className="col-12 col-lg-8">
              <article className="ax-dash__card ax-glass">
                <div className="ax-dash__identity">
                  <span className="ax-dash__avatar">{user.full_name.charAt(0).toUpperCase()}</span>
                  <div>
                    <span className="ax-mono ax-dim">Account</span>
                    <h2 className="ax-h3 mt-1">{user.full_name}</h2>
                    <p className="ax-small">{user.email}</p>
                  </div>
                </div>

                <dl className="ax-dash__facts">
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <span className={user.is_active ? "ax-tag ax-tag--success" : "ax-tag"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>
                      <span className={user.is_admin ? "ax-tag ax-tag--accent" : "ax-tag"}>
                        {user.is_admin ? <ShieldCheck size={13} /> : <CircleUserRound size={13} />}
                        {user.is_admin ? "Administrator" : "Member"}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>Account</dt>
                    <dd className="ax-mono">#{user.id}</dd>
                  </div>
                </dl>
              </article>
            </Reveal>

            <Reveal className="col-12 col-lg-4" delay={0.08}>
              <article className="ax-dash__card ax-dash__since ax-glass">
                <span className="ax-icon-tile ax-icon-tile--sm">
                  <CalendarDays size={18} />
                </span>
                <div>
                  <span className="ax-mono ax-dim">Member since</span>
                  <p className="ax-h3 mt-2">{memberSince}</p>
                </div>
              </article>
            </Reveal>
          </div>

          <section className="mt-9" aria-labelledby="quick-actions">
            <span className="ax-eyebrow" id="quick-actions">Quick actions</span>
            <div className="row g-4 mt-4">
              {actions.map((action, index) => (
                <Reveal className="col-12 col-sm-6 col-lg-4" key={action.title} delay={(index % 3) * 0.06}>
                  <Link href={action.href} className="ax-dash__action ax-glass ax-glass--interactive ax-spot">
                    <span className="ax-icon-tile">
                      <action.Icon size={21} strokeWidth={1.6} />
                    </span>
                    <div>
                      <h3 className="ax-h3">{action.title}</h3>
                      <p className="ax-body mt-2">{action.body}</p>
                    </div>
                    <span className="ax-cap__more">
                      {action.cta}
                      <ArrowUpRight size={15} />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
