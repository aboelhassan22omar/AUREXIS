"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Cpu,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import Link from "next/link";

import {
  useParams,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

import {
  getServiceBySlug,
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


export default function ServiceDetailsPage() {
  const params =
    useParams<{
      slug: string;
    }>();

  const slug = params.slug;

  const [
    service,
    setService,
  ] = useState<Service | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    async function loadService() {
      try {
        const data =
          await getServiceBySlug(
            slug
          );

        setService(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load service"
        );
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      void loadService();
    }
  }, [slug]);


  if (loading) {
    return (
      <>
        <Navbar />

        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#817c89",
            }}
          >
            <LoaderCircle
              size={22}
              style={{
                animation:
                  "spin .8s linear infinite",
              }}
            />

            Loading service...
          </div>

          <style jsx>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </main>
      </>
    );
  }


  if (
    error ||
    !service
  ) {
    return (
      <>
        <Navbar />

        <main
          style={{
            minHeight: "80vh",
            display: "grid",
            placeItems: "center",
            padding: "120px 20px",
          }}
        >
          <div
            style={{
              maxWidth: 600,
              textAlign: "center",
            }}
          >
            <span className="section-label">
              Service unavailable
            </span>

            <h1
              style={{
                marginTop: 14,
                fontSize:
                  "clamp(2.5rem,6vw,5rem)",
                letterSpacing: "-.06em",
              }}
            >
              Service{" "}

              <span className="gradient-text">
                not found.
              </span>
            </h1>

            <p
              style={{
                marginTop: 18,
                color: "#817c89",
                lineHeight: 1.7,
              }}
            >
              {error ||
                "This service is currently unavailable."}
            </p>

            <Link
              href="/services"
              className="primary-button"
              style={{
                marginTop: 30,
                display: "inline-flex",
              }}
            >
              <ArrowLeft size={17} />

              Back to Services
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }


  const Icon =
    iconMap[
      service.slug as keyof typeof iconMap
    ] ??
    BrainCircuit;


  return (
    <>
      <Navbar />


      <main>

        <section
          style={{
            paddingTop: 115,
            paddingBottom: 55,
            background:
              "radial-gradient(circle at 68% 30%, rgba(108,51,255,.12), transparent 32%)",
          }}
        >
          <div
            className="axion-container service-detail-hero"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0,1.15fr) minmax(300px,.85fr)",
              gap: 48,
              alignItems: "center",
            }}
          >

            <div>

              <Link
                href="/services"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 22,
                  padding: "9px 13px",
                  borderRadius: 12,
                  color: "#aaa4b1",
                  background:
                    "rgba(255,255,255,.025)",
                  border:
                    "1px solid rgba(255,255,255,.07)",
                  fontSize: 11,
                  transition:
                    "all .2s ease",
                }}
              >
                <ArrowLeft size={14} />

                All Services
              </Link>


              <span
                className="section-label"
                style={{
                  display: "block",
                }}
              >
                AXION Service
              </span>


              <h1
                style={{
                  marginTop: 13,
                  maxWidth: 760,
                  fontSize:
                    "clamp(3rem,5.6vw,5.8rem)",
                  lineHeight: .95,
                  letterSpacing: "-.06em",
                }}
              >
                {service.name}
              </h1>


              <p
                style={{
                  maxWidth: 620,
                  marginTop: 22,
                  color: "#9c96a3",
                  fontSize:
                    "clamp(.98rem,1.4vw,1.1rem)",
                  lineHeight: 1.75,
                }}
              >
                {
                  service.short_description
                }
              </p>


              <div
                style={{
                  marginTop: 28,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <Link
                  href="/contact"
                  className="primary-button"
                >
                  Start a Project

                  <ArrowRight size={17} />
                </Link>


                <Link
                  href="/projects"
                  className="secondary-button"
                >
                  View Projects
                </Link>
              </div>

            </div>


            <div
              className="glass-card"
              style={{
                minHeight: 300,
                display: "grid",
                placeItems: "center",
                borderRadius: 30,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  background:
                    "rgba(108,51,255,.14)",
                  filter: "blur(65px)",
                }}
              />


              <div
                style={{
                  width: 118,
                  height: 118,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 30,
                  color: "#bda4ff",
                  background:
                    "linear-gradient(135deg,rgba(108,51,255,.20),rgba(153,95,255,.06))",
                  border:
                    "1px solid rgba(139,92,246,.22)",
                  boxShadow:
                    "0 24px 60px rgba(74,30,190,.16)",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <Icon
                  size={54}
                  strokeWidth={1.15}
                />
              </div>
            </div>

          </div>
        </section>


        <section
          className="axion-container service-detail-content"
          style={{
            paddingTop: 48,
            paddingBottom: 90,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0,.7fr) minmax(0,1.3fr)",
              gap: 52,
            }}
          >

            <div>
              <span className="section-label">
                What we deliver
              </span>

              <h2
                style={{
                  marginTop: 12,
                  fontSize:
                    "clamp(2rem,3.6vw,3.6rem)",
                  lineHeight: 1,
                  letterSpacing: "-.05em",
                }}
              >
                Built around
                <br />

                <span className="gradient-text">
                  your business.
                </span>
              </h2>
            </div>


            <div>
              <p
                style={{
                  color: "#99939f",
                  fontSize: 15,
                  lineHeight: 1.85,
                }}
              >
                {
                  service.description
                }
              </p>


              <div
                style={{
                  marginTop: 28,
                  display: "grid",
                  gap: 11,
                }}
              >
                {[
                  "Designed around real business requirements",
                  "Built for secure and scalable operation",
                  "Integrated with existing systems and workflows",
                  "Engineered for measurable operational value",
                ].map(
                  (item) => (
                    <div
                      key={item}
                      className="glass-card"
                      style={{
                        padding:
                          "15px 17px",
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        borderRadius: 14,
                        color: "#a9a4af",
                        fontSize: 12,
                      }}
                    >
                      <CheckCircle2
                        size={17}
                        color="#8c68eb"
                      />

                      {item}
                    </div>
                  )
                )}
              </div>

            </div>

          </div>


          <div
            className="glass-card"
            style={{
              marginTop: 70,
              padding:
                "42px clamp(24px,5vw,60px)",
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: 28,
              flexWrap: "wrap",
              background:
                "radial-gradient(circle at 80% 50%, rgba(108,51,255,.10), transparent 35%)",
            }}
          >
            <div>
              <Sparkles
                size={23}
                color="#a985ff"
              />


              <h2
                style={{
                  marginTop: 15,
                  fontSize:
                    "clamp(2rem,3.6vw,3.6rem)",
                  letterSpacing: "-.05em",
                }}
              >
                Ready to build?
              </h2>


              <p
                style={{
                  marginTop: 9,
                  color: "#817c89",
                }}
              >
                Tell AXION what you
                need and we&apos;ll
                engineer the solution.
              </p>
            </div>


            <Link
              href="/contact"
              className="primary-button"
            >
              Talk to AXION

              <ArrowRight size={17} />
            </Link>
          </div>
        </section>

      </main>


      <Footer />


      <style jsx>{`
        @media (max-width: 900px) {
          .service-detail-hero,
          .service-detail-content > div {
            grid-template-columns:
              1fr !important;
          }

          .service-detail-hero {
            gap: 32px !important;
          }
        }

        @media (max-width: 600px) {
          .service-detail-hero {
            padding-left: 2px;
            padding-right: 2px;
          }
        }
      `}</style>
    </>
  );
}