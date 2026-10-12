"use client";

import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Link from "next/link";
import { useRef } from "react";

import Rail from "@/components/motion/Rail";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import ProjectArt, { SceneArt, sceneForService } from "@/components/sections/ProjectArt";
import Unit from "@/components/stage/Unit";
import { useApiData } from "@/hooks/useApiData";
import {
  capabilities,
  getProjectIcon,
  getServiceIcon,
  principles,
  process,
} from "@/lib/content";
import { EASE_OUT } from "@/lib/motion";
import { getProjects } from "@/lib/projects";
import { getServices } from "@/lib/services";

/* =========================================================================
   CAPABILITY MARQUEE
   ========================================================================= */
export function CapabilityMarquee() {
  const items = [...capabilities, ...capabilities];

  return (
    <div className="ax-marquee" aria-label="Aurexis capabilities">
      <div className="ax-marquee__track">
        {items.map((item, index) => {
          const duplicate = index >= capabilities.length;

          return (
            <Link
              href={item.href}
              className="ax-marquee__item"
              key={`${item.name}-${index}`}
              aria-hidden={duplicate}
              tabIndex={duplicate ? -1 : undefined}
            >
              {item.name}
              <i aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   CAPABILITIES (services)
   ========================================================================= */
const BENTO = [
  "col-12 col-md-6 col-lg-8",
  "col-12 col-md-6 col-lg-4",
  "col-12 col-md-6 col-lg-4",
  "col-12 col-md-6 col-lg-8",
  "col-12 col-md-6 col-lg-6",
  "col-12 col-md-6 col-lg-6",
];

export function Capabilities() {
  const { data, loading, error } = useApiData(getServices, "services");

  return (
    <section className="ax-section" id="capabilities" aria-labelledby="capabilities-title">
      <div className="container">
        <div className="ax-section-head ax-section-head--split">
          <div>
            <Reveal>
              <span className="ax-eyebrow">Capabilities</span>
            </Reveal>
            <SplitText
              as="h2"
              className="ax-h2 mt-5"
              lines={[
                { text: "Technology that", className: "ax-lit" },
                { text: "actually works.", className: "ax-muted-words" },
              ]}
            />
          </div>
          <Reveal delay={0.1}>
            <p id="capabilities-title" className="ax-lead">
              Software engineering, artificial intelligence and security systems —
              combined into complete digital systems.
            </p>
          </Reveal>
        </div>

        {loading && (
          <div className="row g-4">
            {BENTO.map((cols, index) => (
              <div className={cols} key={index}>
                <div className="ax-skeleton" style={{ height: 300 }} />
              </div>
            ))}
          </div>
        )}

        {error && <p className="ax-state">{error}</p>}

        {data && (
          <Rail className="g-4" label="Capabilities">
            {data.slice(0, 6).map((service, index) => {
              const Icon = getServiceIcon(service.slug);
              const wide = index === 0 || index === 3;

              return (
                <Reveal className={BENTO[index] ?? "col-12 col-md-6"} key={service.id} delay={(index % 3) * 0.08}>
                  <Link
                    href={`/services/${service.slug}`}
                    className={`ax-cap ax-glass ax-glass--interactive ax-spot${wide ? " ax-cap--wide" : ""}`}
                  >
                    <div className="ax-cap__top">
                      <span className="ax-icon-tile">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                      <span className="ax-mono ax-dim">{String(index + 1).padStart(2, "0")}</span>
                    </div>

                    <SceneArt kind={sceneForService(service.slug)} compact />

                    <div className="ax-cap__body">
                      <h3 className="ax-h3">{service.name}</h3>
                      <p className="ax-body">{wide ? service.description : service.short_description}</p>
                    </div>

                    <span className="ax-cap__more">
                      Explore
                      <ArrowUpRight size={16} />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </Rail>
        )}

        <Reveal className="ax-center-action">
          <Link href="/services" className="ax-btn ax-btn--glass">
            View all services
            <ArrowUpRight size={16} className="ax-arrow" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* =========================================================================
   PROCESS
   ========================================================================= */
export function Process() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 60%"],
  });
  const fill = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className="ax-section ax-process" ref={ref} aria-labelledby="process-title">
      <div className="container">
        <div className="ax-section-head ax-section-head--split">
          <div>
            <Reveal>
              <span className="ax-eyebrow">How we work</span>
            </Reveal>
            <SplitText
              as="h2"
              className="ax-h2 mt-5"
              lines={[
                { text: "Intelligence", className: "ax-lit" },
                { text: "without complexity.", className: "ax-muted-words" },
              ]}
            />
          </div>
          <Reveal delay={0.1}>
            <p id="process-title" className="ax-lead">
              Powerful technology should make your organization simpler to run —
              not harder. Every engagement follows the same disciplined path.
            </p>
          </Reveal>
        </div>

        <div className="ax-process__rail" aria-hidden="true">
          <motion.span style={{ scaleX: fill }} />
        </div>

        <ol className="row g-4 ax-process__list">
          {process.map((step, index) => (
            <Reveal as="li" className="col-12 col-md-6 col-lg-3" key={step.index} delay={index * 0.08}>
              <ProcessStep index={index} progress={fill} title={step.title} body={step.body} label={step.index} />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ProcessStep({
  index,
  progress,
  title,
  body,
  label,
}: {
  index: number;
  progress: MotionValue<number>;
  title: string;
  body: string;
  label: string;
}) {
  const start = index / 4;
  const glow = useTransform(progress, [start, start + 0.18], [0.25, 1]);

  return (
    <div className="ax-step">
      <motion.span className="ax-step__node" style={{ opacity: glow }} />
      <span className="ax-mono ax-step__index">{label}</span>
      <h3 className="ax-h3 ax-step__title">{title}</h3>
      <p className="ax-body">{body}</p>
    </div>
  );
}

/* =========================================================================
   SELECTED WORK
   ========================================================================= */
export function SelectedWork() {
  const { data, loading, error } = useApiData(() => getProjects(), "projects");

  return (
    <section className="ax-section" id="work" aria-labelledby="work-title">
      <div className="container">
        <div className="ax-section-head ax-section-head--split">
          <div>
            <Reveal>
              <span className="ax-eyebrow">Selected work</span>
            </Reveal>
            <SplitText
              as="h2"
              className="ax-h2 mt-5"
              lines={[
                { text: "Built for", className: "ax-lit" },
                { text: "real requirements.", className: "ax-muted-words" },
              ]}
            />
          </div>
          <Reveal delay={0.1} className="ax-head-aside">
            <p id="work-title" className="ax-lead">
              Systems, platforms and intelligent products engineered around how
              organizations actually operate.
            </p>
            <Link href="/projects" className="ax-link mt-5">
              All projects
              <ArrowUpRight size={16} />
            </Link>
          </Reveal>
        </div>

        {loading && (
          <div className="row g-4">
            {[0, 1, 2, 3].map((index) => (
              <div className="col-12 col-md-6" key={index}>
                <div className="ax-skeleton" style={{ height: 460 }} />
              </div>
            ))}
          </div>
        )}

        {error && <p className="ax-state">{error}</p>}

        {data && (
          <Rail className="g-4" label="Selected work">
            {data.slice(0, 4).map((project, index) => (
              <Reveal className="col-12 col-md-6" key={project.id} delay={(index % 2) * 0.1}>
                <WorkCard
                  href={`/projects/${project.slug}`}
                  category={project.category}
                  title={project.title}
                  summary={project.short_description}
                  index={index}
                />
              </Reveal>
            ))}
          </Rail>
        )}
      </div>
    </section>
  );
}

export function WorkCard({
  href,
  category,
  title,
  summary,
  index,
}: {
  href: string;
  category: string;
  title: string;
  summary: string;
  index: number;
}) {
  const Icon = getProjectIcon(category);

  return (
    <Link href={href} className="ax-work ax-glass ax-glass--interactive ax-spot">
      <ProjectArt category={category} Icon={Icon} variant={index} />
      <div className="ax-work__body">
        <div className="ax-work__meta">
          <span className="ax-tag ax-tag--accent">{category}</span>
          <span className="ax-work__arrow">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <h3 className="ax-h3">{title}</h3>
        <p className="ax-body">{summary}</p>
      </div>
    </Link>
  );
}

/* =========================================================================
   MANIFESTO — words light up as they are read
   ========================================================================= */
const MANIFESTO =
  "We don't sell AI. We build solutions. Technology matters only when it solves something — Aurexis exists to turn ambitious ideas and difficult problems into intelligent, secure and usable products.";

export function Manifesto() {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 45%"],
  });
  const words = MANIFESTO.split(" ");

  return (
    <section className="ax-section ax-manifesto" aria-label="Why Aurexis">
      <div className="container">
        <Reveal>
          <span className="ax-eyebrow">Why Aurexis</span>
        </Reveal>

        <p className="ax-manifesto__text" ref={ref}>
          {words.map((word, index) => (
            <ManifestoWord
              key={`${word}-${index}`}
              word={word}
              progress={scrollYProgress}
              range={[index / words.length, (index + 1) / words.length]}
              reduced={Boolean(reduced)}
              strong={index < 7}
            />
          ))}
        </p>

        <div className="row g-4 ax-principles">
          {principles.map((item, index) => (
            <Reveal className="col-12 col-md-4" key={item.name} delay={index * 0.08}>
              <div className="ax-principle">
                <span className="ax-principle__line" />
                <span className="ax-mono ax-principle__name">{item.name}</span>
                <p className="ax-body">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ManifestoWord({
  word,
  progress,
  range,
  reduced,
  strong,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  reduced: boolean;
  strong: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);

  return (
    <motion.span
      className={strong ? "is-strong" : undefined}
      style={{ opacity: reduced ? 1 : opacity }}
    >
      {word}{" "}
    </motion.span>
  );
}

/* =========================================================================
   CLOSING CTA
   ========================================================================= */
export function ClosingCTA({
  eyebrow = "Build with Aurexis",
  title = ["Have an idea?", "Make it intelligent."],
  body = "Tell us what you want to build, automate, protect or improve. We'll engineer the technology behind it.",
}: {
  eyebrow?: string;
  title?: [string, string];
  body?: string;
}) {
  return (
    <section className="ax-section ax-section--tight" aria-labelledby="cta-title">
      <div className="container">
        <div className="ax-cta ax-glass">
          <div className="ax-cta__light" aria-hidden="true" />

          <div className="row align-items-center g-6">
            <div className="col-12 col-lg-7">
              <Reveal>
                <span className="ax-eyebrow">{eyebrow}</span>
              </Reveal>
              <SplitText
                as="h2"
                className="ax-h2 mt-5"
                lines={[
                  { text: title[0], className: "ax-lit" },
                  { text: title[1], className: "ax-muted-words" },
                ]}
              />
              <Reveal delay={0.1}>
                <p id="cta-title" className="ax-lead mt-5">{body}</p>
              </Reveal>
              <Reveal delay={0.18} className="ax-cta__actions">
                <Link href="/contact" className="ax-btn ax-btn--primary ax-btn--lg">
                  Start your project
                  <ArrowUpRight size={18} className="ax-arrow" />
                </Link>
                <Link href="/services" className="ax-btn ax-btn--ghost">
                  Browse capabilities
                </Link>
              </Reveal>
            </div>

            <div className="col-12 col-lg-5">
              <Reveal className="ax-cta__visual" y={40}>
                <Unit framing="tall" />
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
