"use client";

import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Code2,
  Cpu,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import CTA from "@/components/home/CTA";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

import {
  getServices,
} from "@/lib/services";

import type {
  Service,
} from "@/types/api";


const iconMap = {
  "artificial-intelligence": BrainCircuit,
  cybersecurity: ShieldCheck,
  "ai-chatbots": Bot,
  "business-automation": Workflow,
  "custom-software": Code2,
  "ai-integration": Cpu,
};


export default function ServicesPage() {
  const [
    services,
    setServices,
  ] = useState<Service[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


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
              From AI and cybersecurity
              to complete custom software
              systems, AXION builds the
              technology required to move
              businesses forward.
            </p>

          </div>
        </section>


        <section className="axion-container inner-grid">

          {loading && (
            <p
              style={{
                color: "#77737f",
              }}
            >
              Loading services...
            </p>
          )}


          {error && (
            <p
              style={{
                color: "#ff7b8d",
              }}
            >
              {error}
            </p>
          )}


          {!loading &&
            !error && (
              <div className="services-grid">

                {services.map(
                  (service) => {
                    const Icon =
                      iconMap[
                        service.slug as keyof typeof iconMap
                      ] ??
                      BrainCircuit;

                    return (
                      <article
                        className="service-card glass-card service-half"
                        key={
                          service.id
                        }
                        style={{
                          display:
                            "flex",

                          flexDirection:
                            "column",
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
                            service.description
                          }
                        </p>


                        <Link
                          href={`/services/${service.slug}`}
                          style={{
                            marginTop:
                              "auto",

                            paddingTop:
                              22,

                            display:
                              "inline-flex",

                            alignItems:
                              "center",

                            gap: 7,

                            width:
                              "fit-content",

                            color:
                              "#a98cff",

                            fontSize:
                              11,

                            fontWeight:
                              600,

                            letterSpacing:
                              ".02em",
                          }}
                        >
                          View Service

                          <ArrowUpRight
                            size={15}
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
    </>
  );
}