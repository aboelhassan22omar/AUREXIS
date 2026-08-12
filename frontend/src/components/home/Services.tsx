"use client";

import {
  Bot,
  BrainCircuit,
  Code2,
  Database,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

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


export default function Services() {
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

        setServices(
          data.slice(0, 4)
        );
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
    <section
      className="axion-section"
      id="services"
    >
      <div className="axion-container">

        <div className="services-header">

          <span className="section-label">
            What we build
          </span>

          <h2 className="section-title">
            Technology that
            <br />

            <span className="gradient-text">
              actually works.
            </span>
          </h2>

          <p className="section-subtitle">
            AXION combines software engineering,
            artificial intelligence and cybersecurity
            to build complete digital solutions.
          </p>

        </div>


        {loading && (
          <p className="home-section-status">
            Loading AXION services...
          </p>
        )}


        {error && (
          <p className="home-section-status home-section-error">
            {error}
          </p>
        )}


        {!loading &&
          !error && (
            <>
              <div className="home-services-grid">

                {services.map(
                  (
                    service,
                    index
                  ) => {
                    const Icon =
                      iconMap[
                        service.slug as keyof typeof iconMap
                      ] ??
                      BrainCircuit;

                    return (
                      <motion.article
                        key={service.id}
                        className="home-service-card glass-card"
                        initial={{
                          opacity: 0,
                          y: 30,
                        }}
                        whileInView={{
                          opacity: 1,
                          y: 0,
                        }}
                        viewport={{
                          once: true,
                          amount: 0.15,
                        }}
                        transition={{
                          duration: 0.5,
                          delay:
                            index * 0.06,
                        }}
                      >

                        <div className="home-service-glow" />


                        <div className="home-service-top">

                          <div className="home-service-icon">
                            <Icon
                              size={28}
                              strokeWidth={1.4}
                            />
                          </div>


                          <span className="home-service-number">
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>

                        </div>


                        <div className="home-service-content">

                          <h3>
                            {service.name}
                          </h3>

                          <p>
                            {
                              service.short_description
                            }
                          </p>

                        </div>


                        <Link
                          href={`/services/${service.slug}`}
                          className="home-service-link"
                        >
                          Learn more
                          <span>→</span>
                        </Link>

                      </motion.article>
                    );
                  }
                )}

              </div>


              <div className="home-services-action">

                <Link
                  href="/services"
                  className="secondary-button"
                >
                  View all services
                </Link>

              </div>
            </>
          )}

      </div>
    </section>
  );
}