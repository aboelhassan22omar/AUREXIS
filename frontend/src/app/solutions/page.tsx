import { Workflow } from "lucide-react";
import type { Metadata } from "next";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import {
  ClosingCTA,
  Process,
} from "@/components/sections/HomeSections";
import PageHero from "@/components/sections/PageHero";
import { stackLayers } from "@/lib/content";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "How Aurexis combines artificial intelligence, automation, security systems and software engineering into complete systems that solve complex business problems.",
};

const phases = [
  {
    index: "01",
    name: "Understand",
    body: "We start with the business problem, workflows, risks and desired outcome before choosing any technology.",
  },
  {
    index: "02",
    name: "Engineer",
    body: "We design the software, intelligence, infrastructure and security architecture as one complete system.",
  },
  {
    index: "03",
    name: "Deliver",
    body: "The result is a usable, maintainable and scalable solution designed around real operational requirements.",
  },
];

export default function SolutionsPage() {
  return (
    <>
      <Navbar />

      <main id="main">
        <PageHero
          eyebrow="Solutions"
          icon={<Workflow size={84} strokeWidth={1.1} />}
          title={["Complex problems.", "Clear solutions."]}
          lead="Aurexis selects and engineers technology around the problem itself — combining AI, software, automation and security systems where they create real operational value."
        />

        <section className="ax-section ax-section--tight pt-0">
          <div className="container">
            <div className="row g-7 align-items-center">
              <div className="col-12 col-lg-6 order-lg-2">
                <Reveal className="ax-stack-diagram">
                  <div className="ax-stack-diagram__plates" aria-hidden="true">
                    {[0, 1, 2, 3].map((i) => (
                      <span className="ax-stack-diagram__plate" key={i} style={{ ["--i" as string]: i }} />
                    ))}
                  </div>
                </Reveal>
              </div>
              <div className="col-12 col-lg-6">
                <span className="ax-eyebrow">The Aurexis stack</span>
                <SplitText
                  as="h2"
                  className="ax-h2 mt-5 mb-7"
                  lines={[
                    { text: "Four layers.", className: "ax-lit" },
                    { text: "One accountable team.", className: "ax-muted-words" },
                  ]}
                />
                <div>
                  {stackLayers.map((layer, index) => (
                    <Reveal className="ax-layer-row" key={layer.name} delay={index * 0.06} y={16}>
                      <span className="ax-mono ax-dim">{layer.index}</span>
                      <div>
                        <h3>{layer.name}</h3>
                        <p className="ax-body">{layer.body}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Process />

        <section className="ax-section ax-section--tight">
          <div className="container">
            <div className="ax-section-head">
              <span className="ax-eyebrow">Delivery model</span>
              <SplitText
                as="h2"
                className="ax-h2"
                lines={[
                  { text: "From first question", className: "ax-lit" },
                  { text: "to production.", className: "ax-muted-words" },
                ]}
              />
            </div>
            <div className="row g-4">
              {phases.map((phase, index) => (
                <Reveal className="col-12 col-md-4" key={phase.name} delay={index * 0.08}>
                  <article className="ax-usecase ax-usecase--tall ax-glass ax-spot">
                    <span className="ax-mono ax-accent-text">{phase.index}</span>
                    <div>
                      <h3 className="ax-h3 mb-3">{phase.name}</h3>
                      <p className="ax-body">{phase.body}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <ClosingCTA />
      </main>

      <Footer />
    </>
  );
}
