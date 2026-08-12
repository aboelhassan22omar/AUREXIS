"use client";

import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
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
  getProjects,
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


export default function ProjectsPage() {
  const [
    projects,
    setProjects,
  ] = useState<Project[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    async function loadProjects() {
      try {
        const data =
          await getProjects();

        setProjects(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load projects"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();
  }, []);


  return (
    <>
      <Navbar />


      <main>

        <section className="page-hero">
          <div className="axion-container">

            <span className="section-label">
              AXION Capabilities
            </span>


            <h1>
              Ideas become
              <br />

              <span className="gradient-text">
                systems.
              </span>
            </h1>


            <p>
              Explore intelligent platforms,
              security systems, automation and
              software products built around
              real-world requirements.
            </p>

          </div>
        </section>


        <section className="axion-container inner-grid">

          {loading && (
            <p
              style={{
                color:
                  "#77737f",
              }}
            >
              Loading projects...
            </p>
          )}


          {error && (
            <p
              style={{
                color:
                  "#ff7b8d",
              }}
            >
              {error}
            </p>
          )}


          {!loading &&
            !error && (
              <div className="projects-grid">

                {projects.map(
                  (project) => {
                    const Icon =
                      iconMap[
                        project.category as keyof typeof iconMap
                      ] ??
                      BrainCircuit;

                    return (
                      <article
                        className="project-card glass-card"
                        key={
                          project.id
                        }
                      >

                        <div className="project-art">
                          <Icon
                            size={72}
                            strokeWidth={
                              1
                            }
                          />
                        </div>


                        <div className="project-info">

                          <span className="project-type">
                            {
                              project.category
                            }
                          </span>


                          <h3>
                            {
                              project.title
                            }
                          </h3>


                          <p>
                            {
                              project.description
                            }
                          </p>


                          <Link
                            href={`/projects/${project.slug}`}
                            style={{
                              marginTop:
                                20,

                              display:
                                "inline-flex",

                              alignItems:
                                "center",

                              gap: 7,

                              color:
                                "#a98cff",

                              fontSize:
                                11,

                              fontWeight:
                                600,
                            }}
                          >
                            View Project

                            <ArrowUpRight
                              size={15}
                            />
                          </Link>

                        </div>

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