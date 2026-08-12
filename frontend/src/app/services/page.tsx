"use client";

import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Code2,
  Database,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";

import CTA from "@/components/home/CTA";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

import { getServices } from "@/lib/services";

import type { Service } from "@/types/api";


const iconMap = {
  "ai-solutions": BrainCircuit,
  "ai-chatbot-development": Bot,
  "web-application-development": Code2,
  "business-process-automation": Workflow,
  "cybersecurity-solutions": ShieldCheck,
  "systems-integration": Database,
};


export default function ServicesPage() {
  const [services, setServices] =
    useState<Service[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadServices() {
      try {
        const data =
          await getServices();

        setServices(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load services"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadServices();
  }, []);


  return (
    <>
      <Navbar />

      <main>

        <section className="page-hero">
          <div className="axion-container">

            <span className="section-label">
              AXION Services
            </span>

            <h1>
              Everything technology.
              <br />

              <span className="gradient-text">
                Built intelligently.
              </span>
            </h1>

            <p>
              From artificial intelligence and
              automation to cybersecurity and
              complete software systems, AXION
              builds practical technology around
              real business requirements.
            </p>

          </div>
        </section>


        <section className="axion-container services-page-section">

          {loading && (
            <p className="detail-status">
              Loading services...
            </p>
          )}

          {error && (
            <p className="detail-status detail-error">
              {error}
            </p>
          )}

          {!loading &&
            !error && (
              <div className="services-page-grid">

                {services.map(
                  (service) => {
                    const Icon =
                      iconMap[
                        service.slug as keyof typeof iconMap
                      ] ??
                      BrainCircuit;

                    return (
                      <article
                        className="services-page-card glass-card"
                        key={service.id}
                      >
                        <div className="card-light" />

                        <div className="services-page-icon">
                          <Icon
                            size={27}
                            strokeWidth={1.4}
                          />
                        </div>

                        <div className="services-page-content">

                          <h3>
                            {service.name}
                          </h3>

                          <p>
                            {
                              service.description
                            }
                          </p>

                        </div>

                        <Link
                          href={`/services/${service.slug}`}
                          className="detail-card-button"
                        >
                          Explore Service

                          <ArrowUpRight
                            size={16}
                          />
                        </Link>

                      </article>
                    );
                  }
                )}

              </div>
            )}

        </section>

        <CTA />

      </main>

      <Footer />


      <style jsx global>{`
        .services-page-section {
          padding-bottom: 120px;
        }

        .detail-status {
          color: #77737f;
          font-size: 14px;
        }

        .detail-error {
          color: #ff7b8d;
        }

        .services-page-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .services-page-card {
          position: relative;
          min-width: 0;
          min-height: 390px;
          padding: 30px;

          display: flex;
          flex-direction: column;

          overflow: hidden;
          border-radius: 28px;

          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .services-page-card:hover {
          transform: translateY(-6px);

          border-color:
            rgba(139, 92, 246, 0.32);

          box-shadow:
            0 20px 60px
            rgba(0, 0, 0, 0.22);
        }

        .services-page-icon {
          position: relative;
          z-index: 2;

          width: 58px;
          height: 58px;

          display: grid;
          place-items: center;

          flex-shrink: 0;

          border-radius: 18px;

          color: #b497ff;

          background:
            rgba(108, 51, 255, 0.1);

          border:
            1px solid
            rgba(139, 92, 246, 0.18);
        }

        .services-page-content {
          position: relative;
          z-index: 2;

          margin-top: 38px;
        }

        .services-page-content h3 {
          margin: 0;

          font-size: 23px;
          line-height: 1.2;

          letter-spacing: -0.035em;
        }

        .services-page-content p {
          margin-top: 14px;

          color: var(--text-secondary);

          font-size: 13px;
          line-height: 1.75;
        }

        .detail-card-button {
          position: relative;
          z-index: 2;

          width: fit-content;

          margin-top: auto;
          padding: 11px 15px;

          display: inline-flex;
          align-items: center;
          gap: 8px;

          border-radius: 12px;

          color: #c3afff;

          background:
            rgba(108, 51, 255, 0.08);

          border:
            1px solid
            rgba(139, 92, 246, 0.18);

          font-size: 11px;
          font-weight: 650;

          transition:
            gap 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .detail-card-button:hover {
          gap: 11px;

          transform:
            translateY(-2px);

          background:
            rgba(108, 51, 255, 0.14);

          border-color:
            rgba(139, 92, 246, 0.32);
        }

        @media (max-width: 1000px) {
          .services-page-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .services-page-section {
            padding-bottom: 85px;
          }

          .services-page-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .services-page-card {
            min-height: 340px;
            padding: 25px;
            border-radius: 24px;
          }
        }
      `}</style>
    </>
  );
}