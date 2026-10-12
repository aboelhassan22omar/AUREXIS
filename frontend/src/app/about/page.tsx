import { Orbit } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import {
  CapabilityMarquee,
  ClosingCTA,
  Manifesto,
} from "@/components/sections/HomeSections";
import PageHero from "@/components/sections/PageHero";
import { capabilities } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "AUREXIS is a technology company engineering AI, software, automation and intelligent security systems around real-world problems.",
};

const focus = [
  {
    title: "Artificial intelligence",
    body: "Agents, chatbots and decision-support systems that understand information and act on it.",
  },
  {
    title: "Software engineering",
    body: "Secure, scalable web platforms and management systems built around real workflows.",
  },
  {
    title: "Automation & integration",
    body: "Connected applications, APIs and data that let organizations operate as one system.",
  },
  {
    title: "Security systems",
    body: "Smart surveillance, AI video analytics and access control that protect people, sites and assets.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main id="main">
        <PageHero
          eyebrow="About Aurexis"
          icon={<Orbit size={84} strokeWidth={1.1} />}
          title={["Engineering the", "next advantage."]}
          lead="AUREXIS is a technology company focused on artificial intelligence, software engineering, automation and intelligent security systems — building around real-world problems."
        />

        <CapabilityMarquee />

        <Manifesto />

        <section className="ax-section ax-section--tight">
          <div className="container">
            <div className="ax-section-head ax-section-head--split">
              <div>
                <span className="ax-eyebrow">What defines us</span>
                <SplitText
                  as="h2"
                  className="ax-h2 mt-5"
                  lines={[
                    { text: "Technology should create", className: "ax-lit" },
                    { text: "measurable impact.", className: "ax-muted-words" },
                  ]}
                />
              </div>
              <Reveal delay={0.1}>
                <p className="ax-lead">
                  We do not build technology simply because it is new. Aurexis
                  combines the right tools, architecture and intelligence to make
                  organizations faster, smarter, safer and more capable.
                </p>
              </Reveal>
            </div>

            <div className="row g-4">
              {focus.map((item, index) => (
                <Reveal className="col-12 col-sm-6 col-lg-3" key={item.title} delay={index * 0.07}>
                  <article className="ax-usecase ax-usecase--tall ax-glass ax-spot">
                    <span className="ax-mono ax-dim">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="ax-h3 mb-3">{item.title}</h3>
                      <p className="ax-body">{item.body}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-8">
              <p className="ax-footer__heading">Areas of work</p>
              <div className="d-flex flex-wrap gap-2">
                {capabilities.map((item) => (
                  <Link href={item.href} className="ax-tag ax-tag--link" key={item.name}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <ClosingCTA />
      </main>

      <Footer />
    </>
  );
}
