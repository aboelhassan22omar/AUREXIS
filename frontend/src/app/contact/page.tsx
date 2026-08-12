"use client";

import {
  ArrowRight,
  BrainCircuit,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  FormEvent,
  useState,
} from "react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

import { apiRequest } from "@/lib/api";

import type {
  ContactResponse,
} from "@/types/api";


export default function ContactPage() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [company, setCompany] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await apiRequest<ContactResponse>(
        "/contact",
        {
          method: "POST",

          body: JSON.stringify({
            name,
            email,
            company:
              company.trim() ||
              undefined,
            message,
          }),
        }
      );

      setSuccess(
        "Your inquiry was sent successfully. AXION will contact you soon."
      );

      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send your inquiry"
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <>
      <Navbar />

      <main>
        <section className="page-hero">
          <div className="axion-container">
            <span className="section-label">
              Contact AXION
            </span>

            <h1>
              What are we
              <br />

              <span className="gradient-text">
                building?
              </span>
            </h1>

            <p>
              Tell us the problem, idea or opportunity.
              We&apos;ll help define the technology
              behind it.
            </p>
          </div>
        </section>


        <section className="axion-container inner-grid">

          <div className="contact-grid">

            <div className="info-card glass-card">

              <span className="section-label">
                Start a conversation
              </span>

              <h2
                style={{
                  marginTop: 18,
                  fontSize: 38,
                  letterSpacing:
                    "-0.045em",
                }}
              >
                Build something
                <br />

                <span className="gradient-text">
                  worth using.
                </span>
              </h2>

              <p className="section-subtitle">
                Whether it&apos;s an AI assistant,
                security platform, automation system
                or completely new software product,
                AXION can engineer the solution.
              </p>


              <div
                style={{
                  marginTop: 40,
                  display: "grid",
                  gap: 14,
                }}
              >
                {[
                  BrainCircuit,
                  ShieldCheck,
                  Sparkles,
                ].map(
                  (Icon, index) => (
                    <div
                      key={index}
                      style={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        gap: 13,

                        color:
                          "#aaa6b2",

                        fontSize:
                          14,
                      }}
                    >
                      <div className="service-icon">
                        <Icon
                          size={20}
                        />
                      </div>

                      {index === 0 &&
                        "AI & intelligent systems"}

                      {index === 1 &&
                        "Cybersecurity solutions"}

                      {index === 2 &&
                        "Custom software & automation"}
                    </div>
                  )
                )}
              </div>
            </div>


            <form
              className="form-card glass-card"
              onSubmit={
                handleSubmit
              }
            >
              <div className="form-group">
                <label>Name</label>

                <input
                  className="form-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  minLength={2}
                  required
                />
              </div>


              <div className="form-group">
                <label>Email</label>

                <input
                  className="form-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  required
                />
              </div>


              <div className="form-group">
                <label>Company</label>

                <input
                  className="form-input"
                  placeholder="Company name"
                  value={company}
                  onChange={(event) =>
                    setCompany(
                      event.target.value
                    )
                  }
                />
              </div>


              <div className="form-group">
                <label>
                  Tell us about the project
                </label>

                <textarea
                  className="form-input"
                  placeholder="What would you like AXION to build?"
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  minLength={10}
                  required
                />
              </div>


              {error && (
                <p
                  style={{
                    marginBottom:
                      16,

                    color:
                      "#ff7b8d",

                    fontSize:
                      13,
                  }}
                >
                  {error}
                </p>
              )}


              {success && (
                <p
                  style={{
                    marginBottom:
                      16,

                    color:
                      "#70e29c",

                    fontSize:
                      13,

                    lineHeight:
                      1.6,
                  }}
                >
                  {success}
                </p>
              )}


              <button
                className="primary-button"
                type="submit"
                disabled={loading}
                style={{
                  opacity:
                    loading
                      ? 0.7
                      : 1,
                }}
              >
                {loading
                  ? "Sending..."
                  : "Send inquiry"}

                {!loading && (
                  <ArrowRight
                    size={17}
                  />
                )}
              </button>


              <p className="form-note">
                <Mail
                  size={13}
                  style={{
                    display:
                      "inline",

                    marginRight:
                      6,
                  }}
                />

                Your request is sent securely to AXION.
              </p>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}