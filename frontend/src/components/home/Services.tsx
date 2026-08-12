"use client";

import {
  Bot,
  BrainCircuit,
  Code2,
  Cpu,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import { getServices } from "@/lib/services";

import type { Service } from "@/types/api";


const iconMap = {
  "artificial-intelligence": BrainCircuit,
  cybersecurity: ShieldCheck,
  "ai-chatbots": Bot,
  "business-automation": Workflow,
  "custom-software": Code2,
  "ai-integration": Cpu,
};


const layoutClasses = [
  "service-large",
  "service-small",
  "service-half",
  "service-half",
  "service-small",
  "service-large",
];


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
          <div
            style={{
              marginTop: 60,
              color: "#77737f",
              fontSize: 14,
            }}
          >
            Loading AXION services...
          </div>
        )}


        {error && (
          <div
            style={{
              marginTop: 60,
              color: "#ff7b8d",
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}


        {!loading &&
          !error && (
            <div className="services-grid">

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

                  const layout =
                    layoutClasses[
                      index %
                        layoutClasses.length
                    ];

                  return (
                    <motion.article
                      key={
                        service.id
                      }
                      className={`service-card glass-card ${layout}`}
                      initial={{
                        opacity: 0,
                        y: 35,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.2,
                      }}
                      transition={{
                        duration: 0.55,
                        delay:
                          index *
                          0.05,
                      }}
                    >
                      <div className="card-light" />

                      <div className="service-icon">
                        <Icon
                          size={25}
                          strokeWidth={
                            1.5
                          }
                        />
                      </div>

                      <h3>
                        {
                          service.name
                        }
                      </h3>

                      <p>
                        {
                          service.short_description
                        }
                      </p>
                    </motion.article>
                  );
                }
              )}

            </div>
          )}
      </div>
    </section>
  );
}