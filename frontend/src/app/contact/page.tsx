"use client";

import {
  ArrowRight,
  BrainCircuit,
  Cctv,
  CheckCircle2,
  Code2,
  LockKeyhole,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import {
  useState,
  type FormEvent,
} from "react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Reveal from "@/components/motion/Reveal";
import PageHero from "@/components/sections/PageHero";
import Unit from "@/components/stage/Unit";
import { apiRequest } from "@/lib/api";
import { EASE_OUT } from "@/lib/motion";
import type { ContactResponse } from "@/types/api";

const TOPICS = [
  "AI agents & chatbots",
  "Web application",
  "Automation & integration",
  "Security systems",
  "Something else",
];

const POINTS = [
  { Icon: BrainCircuit, label: "AI & intelligent systems" },
  { Icon: Code2, label: "Custom software & platforms" },
  { Icon: Workflow, label: "Automation & integration" },
  { Icon: Cctv, label: "Security & surveillance systems" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function toggleTopic(topic: string) {
    setTopics((current) =>
      current.includes(topic) ? current.filter((item) => item !== topic) : [...current, topic]
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const body = topics.length > 0
      ? `Interested in: ${topics.join(", ")}\n\n${message}`
      : message;

    try {
      await apiRequest<ContactResponse>("/contact", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          company: company.trim() || undefined,
          message: body,
        }),
      });

      setSuccess(true);
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
      setTopics([]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send your inquiry");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main id="main">
        <PageHero
          eyebrow="Contact"
          title={["What are we", "building together?"]}
          lead="Tell us the problem, idea or opportunity. We'll help define the technology behind it — and respond with a clear direction."

        />

        <section className="ax-section ax-section--tight pt-0">
          <div className="container">
            <div className="row g-7">
              <div className="col-12 col-lg-5">
                <Reveal className="ax-contact-aside">
                  <Unit className="ax-contact-unit" />
                  <div>
                    <span className="ax-eyebrow">Start a conversation</span>
                    <h2 className="ax-h3 mt-5" style={{ fontSize: "clamp(1.6rem, 1.2rem + 1.4vw, 2.4rem)", letterSpacing: "-0.035em" }}>
                      <span className="ax-lit">Build something </span>
                      <span className="ax-muted-words">worth using.</span>
                    </h2>
                    <p className="ax-body mt-4">
                      Whether it&apos;s an AI assistant, a security platform, an
                      automation system or a completely new software product,
                      Aurexis can engineer the solution.
                    </p>
                  </div>

                  <ul className="ax-contact-points">
                    {POINTS.map(({ Icon, label }) => (
                      <li key={label}>
                        <span className="ax-icon-tile ax-icon-tile--sm">
                          <Icon size={17} strokeWidth={1.6} />
                        </span>
                        {label}
                      </li>
                    ))}
                  </ul>

                  <p className="ax-small d-flex align-items-center gap-2">
                    <LockKeyhole size={14} />
                    Your request is sent securely to the Aurexis team.
                  </p>
                </Reveal>
              </div>

              <div className="col-12 col-lg-7">
                <Reveal delay={0.1}>
                  <div className="ax-form-card ax-glass">
                    <AnimatePresence mode="wait" initial={false}>
                      {success ? (
                        <motion.div
                          key="done"
                          className="ax-state"
                          style={{ border: 0, padding: "4rem 1rem" }}
                          initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
                          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6, ease: EASE_OUT }}
                          role="status"
                        >
                          <span className="ax-icon-tile">
                            <CheckCircle2 size={24} />
                          </span>
                          <h3 className="ax-h3">Inquiry received.</h3>
                          <p className="ax-body" style={{ maxWidth: "26rem" }}>
                            Thank you — the Aurexis team will review your request and contact you soon.
                          </p>
                          <button type="button" className="ax-btn ax-btn--glass ax-btn--sm mt-3" onClick={() => setSuccess(false)}>
                            Send another
                          </button>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="form"
                          className="ax-form-grid"
                          onSubmit={handleSubmit}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="ax-field">
                            <span className="ax-label" id="topics-label">What are you interested in?</span>
                            <div className="ax-chips-select" role="group" aria-labelledby="topics-label">
                              {TOPICS.map((topic) => (
                                <button
                                  key={topic}
                                  type="button"
                                  aria-pressed={topics.includes(topic)}
                                  onClick={() => toggleTopic(topic)}
                                >
                                  {topic}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="ax-form-grid ax-form-grid--2">
                            <label className="ax-field">
                              <span className="ax-label">Name</span>
                              <input
                                className="ax-input"
                                placeholder="Your name"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                autoComplete="name"
                                minLength={2}
                                required
                              />
                            </label>

                            <label className="ax-field">
                              <span className="ax-label">Email</span>
                              <input
                                className="ax-input"
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email"
                                required
                              />
                            </label>
                          </div>

                          <label className="ax-field">
                            <span className="ax-label">Company <span className="ax-dim">(optional)</span></span>
                            <input
                              className="ax-input"
                              placeholder="Company name"
                              value={company}
                              onChange={(event) => setCompany(event.target.value)}
                              autoComplete="organization"
                            />
                          </label>

                          <label className="ax-field">
                            <span className="ax-label">Tell us about the project</span>
                            <textarea
                              className="ax-input"
                              placeholder="What would you like Aurexis to build, automate or protect?"
                              value={message}
                              onChange={(event) => setMessage(event.target.value)}
                              minLength={10}
                              required
                            />
                          </label>

                          {error && (
                            <p className="ax-form-status ax-form-status--error" role="alert">
                              {error}
                            </p>
                          )}

                          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                            <p className="ax-small">Share as much or as little detail as you like.</p>
                            <button className="ax-btn ax-btn--primary ax-btn--lg" type="submit" disabled={loading}>
                              {loading ? (
                                <>
                                  <span className="ax-spinner" style={{ width: 16, height: 16, borderTopColor: "#05070e" }} />
                                  Sending…
                                </>
                              ) : (
                                <>
                                  Send inquiry
                                  <ArrowRight size={18} className="ax-arrow" />
                                </>
                              )}
                            </button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
