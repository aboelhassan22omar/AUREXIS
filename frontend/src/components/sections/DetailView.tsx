"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import { ClosingCTA } from "@/components/sections/HomeSections";
import PageHero from "@/components/sections/PageHero";
import type { Detail } from "@/lib/content";

type DetailViewProps = {
  kind: "Service" | "Project";
  backHref: string;
  backLabel: string;
  name: string;
  summary: string;
  Icon: LucideIcon;
  details: Detail;
  tags?: ReactNode;
  visual?: ReactNode;
  related?: { href: string; name: string; summary: string }[];
};

function splitTitle(name: string): [string, string] {
  const words = name.split(" ");

  if (words.length < 2) {
    return [name, ""];
  }

  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

export default function DetailView({
  kind,
  backHref,
  backLabel,
  name,
  summary,
  Icon,
  details,
  tags,
  visual,
  related,
}: DetailViewProps) {
  return (
    <>
      <Navbar />

      <main id="main">
        <PageHero
          eyebrow={kind}
          title={splitTitle(name)}
          lead={summary}
          icon={visual ? undefined : <Icon size={84} strokeWidth={1.1} />}
          before={
            <nav className="ax-breadcrumb" aria-label="Breadcrumb">
              <Link href={backHref}>
                <ArrowLeft size={15} />
                {backLabel}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{name}</span>
            </nav>
          }
        >
          <span className="ax-icon-tile ax-detail-hero-icon">
            <Icon size={28} strokeWidth={1.5} />
          </span>
          {tags}
        </PageHero>

        {visual && (
          <section className="container" aria-hidden="true">
            <Reveal>{visual}</Reveal>
          </section>
        )}

        <section className="ax-section">
          <div className="container">
            <div className="row g-7">
              <div className="col-12 col-lg-6">
                <Reveal className="ax-detail-block">
                  <span className="ax-eyebrow">What it is</span>
                  <h2>{details.what}</h2>
                </Reveal>
              </div>
              <div className="col-12 col-lg-6">
                <Reveal className="ax-detail-block" delay={0.1}>
                  <span className="ax-eyebrow">What it does</span>
                  <h2 className="ax-dim">{details.does}</h2>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section className="ax-section ax-section--tight">
          <div className="container">
            <div className="row g-7 align-items-start">
              <div className="col-12 col-lg-5">
                <span className="ax-eyebrow">Benefits</span>
                <SplitText
                  as="h2"
                  className="ax-h2 mt-5"
                  lines={[
                    { text: "Why it", className: "ax-lit" },
                    { text: "matters.", className: "ax-muted-words" },
                  ]}
                />
              </div>
              <div className="col-12 col-lg-7">
                <ul className="ax-checklist">
                  {details.benefits.map((benefit, index) => (
                    <Reveal as="li" key={benefit} delay={index * 0.06} y={14} blur={false}>
                      <span className="ax-icon-tile ax-icon-tile--sm">
                        <Check size={16} />
                      </span>
                      {benefit}
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="ax-section ax-section--tight">
          <div className="container">
            <div className="ax-section-head">
              <span className="ax-eyebrow">Use cases</span>
              <SplitText
                as="h2"
                className="ax-h2"
                lines={[
                  { text: "Where it", className: "ax-lit" },
                  { text: "creates value.", className: "ax-muted-words" },
                ]}
              />
            </div>
            <div className="row g-4">
              {details.useCases.map((useCase, index) => (
                <Reveal className="col-12 col-sm-6 col-lg-3" key={useCase} delay={index * 0.07}>
                  <div className="ax-usecase ax-glass ax-spot">
                    <span className="ax-mono ax-dim">{String(index + 1).padStart(2, "0")}</span>
                    <strong>{useCase}</strong>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {related && related.length > 0 && (
          <section className="ax-section ax-section--tight">
            <div className="container">
              <div className="ax-section-head ax-section-head--split">
                <div>
                  <span className="ax-eyebrow">Continue exploring</span>
                  <h2 className="ax-h2 mt-5">
                    <span className="ax-lit">Related </span>
                    <span className="ax-muted-words">{kind === "Service" ? "services." : "projects."}</span>
                  </h2>
                </div>
              </div>
              <ol className="ax-index">
                {related.map((item, index) => (
                  <li key={item.href}>
                    <Link href={item.href} className="ax-index__row">
                      <span className="ax-mono ax-index__num">{String(index + 1).padStart(2, "0")}</span>
                      <div className="ax-index__main">
                        <span className="ax-index__title">{item.name}</span>
                        <p className="ax-body ax-index__desc">{item.summary}</p>
                      </div>
                      <span className="ax-index__go" aria-hidden="true">
                        <ArrowUpRight size={20} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        <ClosingCTA
          eyebrow={`Start with ${name}`}
          title={["Ready to build", "something real?"]}
          body="Tell us about your organization and what you need. We'll respond with a clear technical direction."
        />
      </main>

      <Footer />
    </>
  );
}

export function DetailLoading() {
  return (
    <>
      <Navbar />
      <main id="main" className="ax-loading-screen">
        <span className="ax-spinner" />
        Loading…
      </main>
    </>
  );
}

export function DetailMissing({
  kind,
  backHref,
  message,
}: {
  kind: string;
  backHref: string;
  message: string;
}) {
  return (
    <>
      <Navbar />
      <main id="main" className="ax-404">
        <div className="d-grid justify-items-center gap-5" style={{ justifyItems: "center" }}>
          <span className="ax-eyebrow ax-eyebrow--center">{kind} unavailable</span>
          <h1 className="ax-h1">
            <span className="ax-lit">Not found.</span>
          </h1>
          <p className="ax-lead">{message}</p>
          <Link href={backHref} className="ax-btn ax-btn--primary">
            <ArrowLeft size={17} />
            Back to {kind.toLowerCase()}s
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
