"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Rail from "@/components/motion/Rail";
import Reveal from "@/components/motion/Reveal";
import SplitText from "@/components/motion/SplitText";
import type { StageSignals } from "@/components/stage/stage.types";
import Unit from "@/components/stage/Unit";
import { STORY_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";
import { stackLayers } from "@/lib/content";
import { EASE_OUT } from "@/lib/motion";

const AurexisStage = dynamic(
  () => import("@/components/stage/AurexisStage"),
  { ssr: false }
);

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type Layer = (typeof stackLayers)[number];

function LayerCard({ layer, compact = false }: { layer: Layer; compact?: boolean }) {
  const Icon = layer.icon;

  return (
    <div className={`ax-layer__card ax-glass${compact ? " ax-layer__card--compact" : ""}`}>
      <div className="ax-layer__top">
        <span className="ax-icon-tile ax-icon-tile--sm">
          <Icon size={18} strokeWidth={1.6} />
        </span>
        <span className="ax-layer__name">{layer.name}</span>
        <span className="ax-mono ax-layer__index">{layer.index}</span>
      </div>
      <h3 className="ax-h3 ax-layer__title">{layer.title}</h3>
      <p className="ax-body">{layer.body}</p>
      <div className="ax-layer__tags">
        {layer.tags.map((tag) => (
          <span className="ax-tag" key={tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

export default function HomeStory() {
  const reduced = useReducedMotion();
  const storyMode = useMediaQuery(STORY_QUERY);
  const storyRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const layerRefs = useRef<(HTMLElement | null)[]>([]);
  const signals = useRef<StageSignals>({
    progress: 0,
    layer: -1,
    hover: false,
    pulseAt: -10,
    pulseId: 0,
    visible: true,
  });

  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [activateCount, setActivateCount] = useState(0);
  const [activeLayer, setActiveLayer] = useState(-1);

  // Desktop/landscape gets the scroll story; phones and portrait tablets get
  // the compact composition. SSR renders the story markup by default.
  const story = storyMode !== false;

  useEffect(() => {
    setWebgl(supportsWebGL());
  }, []);

  // Scroll → story progress + active layer (single rAF-throttled listener).
  useEffect(() => {
    if (!story) {
      signals.current.layer = -1;
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      const element = storyRef.current;

      if (!element) {
        return;
      }

      const vh = window.innerHeight;
      const rect = element.getBoundingClientRect();
      const span = Math.max(1, rect.height - vh);
      signals.current.progress = Math.min(1, Math.max(0, -rect.top / span));

      const focus = vh * 0.55;
      let next = -1;

      layerRefs.current.forEach((item, index) => {
        if (!item) {
          return;
        }

        const box = item.getBoundingClientRect();

        if (box.top <= focus && box.bottom >= focus) {
          next = index;
        }
      });

      signals.current.layer = next;
      setActiveLayer((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [story]);

  // The unit's own interaction: a wave and a pulse of light through the stack.
  const activateUnit = useCallback(() => {
    signals.current.pulseId += 1;
    setActivateCount((count) => count + 1);
  }, []);

  // Hero copy recedes into depth as the stage takes over (story mode only).
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const copyBlur = useTransform(scrollYProgress, [0, 0.7], ["blur(0px)", "blur(10px)"]);
  const recede = storyMode === true && !reduced;

  return (
    <div className={`ax-story ${story ? "is-story" : "is-compact"}`} ref={storyRef}>
      {/* ---------- Sticky stage (desktop / landscape only) ---------- */}
      {story && (
        <div className="ax-story__track">
          <div className="ax-story__stage">
            <div className="ax-story__poster" aria-hidden="true">
              <div className="ax-story__horizon" />
            </div>

            {webgl && storyMode && (
              <div className={`ax-story__canvas${ready ? " is-ready" : ""}`}>
                <AurexisStage
                  signals={signals}
                  observe={storyRef}
                  activateSignal={activateCount}
                  onActivate={activateUnit}
                  onReady={() => setReady(true)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- Hero ---------- */}
      <section className="ax-hero" ref={heroRef} aria-labelledby="hero-lead">
        <div className="container ax-hero__container">
          <div className="row">
            <motion.div
              className="col-12 ax-hero__copy"
              style={recede ? { opacity: copyOpacity, y: copyY, filter: copyBlur } : undefined}
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.1 }}
              >
                <span className="ax-chip">
                  <span className="ax-chip__dot" />
                  Intelligence · Software · Solutions
                </span>
              </motion.div>

              <SplitText
                as="h1"
                immediate
                delay={0.25}
                className="ax-display ax-hero__title"
                lines={[
                  { text: "Powerful software,", className: "ax-lit" },
                  { text: "precisely engineered.", className: "ax-muted-words" },
                ]}
              />

              <motion.p
                id="hero-lead"
                className="ax-lead ax-hero__lead"
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.75 }}
              >
                Aurexis designs and builds AI agents, intelligent platforms,
                automation and security systems for organizations that need
                technology to perform — reliably, securely and at scale.
              </motion.p>

              <motion.div
                className="ax-hero__actions"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: EASE_OUT, delay: 0.95 }}
              >
                <Link href="/contact" className="ax-btn ax-btn--primary ax-btn--lg">
                  Start a project
                  <ArrowRight size={18} className="ax-arrow" />
                </Link>
                <a href="#platform" className="ax-btn ax-btn--glass ax-btn--lg">
                  Explore the platform
                </a>
              </motion.div>
            </motion.div>
          </div>

          {/* Compact composition: the unit stands in the hero itself. */}
          {storyMode === false && (
            <motion.div
              className="ax-hero__unit"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.5 }}
            >
              <Unit intro="home" />
            </motion.div>
          )}
        </div>

        {story && (
          <motion.div
            className="ax-hero__foot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.4 }}
          >
            <a href="#platform" className="ax-scroll-cue">
              <span className="ax-scroll-cue__track" />
              <span className="ax-mono">Scroll</span>
              <ArrowDown size={13} />
            </a>
          </motion.div>
        )}
      </section>

      {/* ---------- The Aurexis stack ---------- */}
      <section className="ax-stack" id="platform" aria-labelledby="stack-title">
        <div className="container">
          <div className="row">
            <div className={story ? "col-12 col-lg-6 col-xl-5" : "col-12"}>
              <header className="ax-stack__head">
                <span className="ax-eyebrow">The Aurexis stack</span>
                <SplitText
                  as="h2"
                  className="ax-h2 ax-stack__title"
                  lines={[
                    { text: "One system.", className: "ax-lit" },
                    { text: "Four layers.", className: "ax-muted-words" },
                  ]}
                />
                <p id="stack-title" className="ax-lead">
                  Every Aurexis solution is engineered as a complete system —
                  from the interface people touch to the security that protects it.
                </p>
              </header>

              {story ? (
                <ol className="ax-layers">
                  {stackLayers.map((layer, index) => (
                    <li
                      key={layer.name}
                      ref={(element) => {
                        layerRefs.current[index] = element;
                      }}
                      className={`ax-layer${activeLayer === index ? " is-active" : ""}`}
                    >
                      <LayerCard layer={layer} />
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="ax-layers-compact">
                  <Rail label="The Aurexis stack">
                    {stackLayers.map((layer, index) => (
                      <Reveal className="col-12 col-md-6" key={layer.name} delay={(index % 2) * 0.08}>
                        <LayerCard layer={layer} compact />
                      </Reveal>
                    ))}
                  </Rail>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
