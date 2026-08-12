"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  FolderKanban,
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
  getProjectBySlug,
} from "@/lib/projects";

import type {
  Project,
} from "@/types/api";


const iconMap = {
  "Conversational AI": Bot,
  Cybersecurity: ShieldCheck,
  Automation: Workflow,
  "Custom AI": BrainCircuit,
};


export default function ProjectDetailsPage() {
  const params =
    useParams<{
      slug: string;
    }>();

  const slug = params.slug;

  const [
    project,
    setProject,
  ] = useState<Project | null>(
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
    async function loadProject() {
      try {
        const data =
          await getProjectBySlug(
            slug
          );

        setProject(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load project"
        );
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      void loadProject();
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

            Loading project...
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
    !project
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
              Project unavailable
            </span>

            <h1
              style={{
                marginTop: 14,
                fontSize:
                  "clamp(2.5rem,6vw,5rem)",
                letterSpacing: "-.06em",
              }}
            >
              Project{" "}

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
                "This project is currently unavailable."}
            </p>

            <Link
              href="/projects"
              className="primary-button"
              style={{
                marginTop: 30,
                display: "inline-flex",
              }}
            >
              <ArrowLeft size={17} />

              Back to Projects
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }


  const Icon =
    iconMap[
      project.category as keyof typeof iconMap
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
            className="axion-container project-detail-hero"
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
                href="/projects"
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

                All Projects
              </Link>


              <span className="section-label">
                {project.category}
              </span>


              <h1
                style={{
                  marginTop: 13,
                  maxWidth: 800,
                  fontSize:
                    "clamp(3rem,5.6vw,5.8rem)",
                  lineHeight: .95,
                  letterSpacing: "-.06em",
                }}
              >
                {project.title}
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
                  project.short_description
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
                  Build Something Similar

                  <ArrowRight size={17} />
                </Link>


                <Link
                  href="/services"
                  className="secondary-button"
                >
                  Explore Services
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
                  width: 225,
                  height: 225,
                  borderRadius: "50%",
                  background:
                    "rgba(108,51,255,.14)",
                  filter: "blur(68px)",
                }}
              />


              <div
                style={{
                  width: 120,
                  height: 120,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 31,
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
                  size={56}
                  strokeWidth={1.1}
                />
              </div>
            </div>

          </div>
        </section>


        <section
          className="axion-container project-detail-content"
          style={{
            paddingTop: 48,
            paddingBottom: 95,
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
                Project Overview
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
                Engineering
                <br />

                <span className="gradient-text">
                  intelligence.
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
                  project.description
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
                  "Business-focused architecture",
                  "Modern software engineering",
                  "Scalable infrastructure",
                  "Security-first implementation",
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
                        color: "#aaa5b0",
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
              <FolderKanban
                size={24}
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
                Have a project in mind?
              </h2>


              <p
                style={{
                  marginTop: 9,
                  color: "#817c89",
                }}
              >
                AXION can design,
                engineer and deploy
                the system around your
                requirements.
              </p>
            </div>


            <Link
              href="/contact"
              className="primary-button"
            >
              Start Your Project

              <Sparkles size={17} />
            </Link>
          </div>
        </section>

      </main>


      <Footer />


      <style jsx>{`
        @media (max-width: 900px) {
          .project-detail-hero,
          .project-detail-content > div {
            grid-template-columns:
              1fr !important;
          }

          .project-detail-hero {
            gap: 32px !important;
          }
        }

        @media (max-width: 600px) {
          .project-detail-hero {
            padding-left: 2px;
            padding-right: 2px;
          }
        }
      `}</style>
    </>
  );
}