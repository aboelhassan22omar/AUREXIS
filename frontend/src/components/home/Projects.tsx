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
  motion,
} from "motion/react";

import {
  useEffect,
  useState,
} from "react";

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


export default function Projects() {
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
          await getProjects(true);

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
    <section className="axion-section">
      <div className="axion-container">

        <div className="projects-heading-row">

          <div>
            <span className="section-label">
              Selected capabilities
            </span>

            <h2 className="section-title">
              Built for the
              <br />

              <span className="gradient-text">
                real world.
              </span>
            </h2>
          </div>


          <Link
            href="/projects"
            className="secondary-button"
          >
            View capabilities

            <ArrowUpRight
              size={17}
            />
          </Link>

        </div>


        {loading && (
          <p
            style={{
              marginTop: 55,
              color: "#77737f",
            }}
          >
            Loading projects...
          </p>
        )}


        {error && (
          <p
            style={{
              marginTop: 55,
              color: "#ff7b8d",
            }}
          >
            {error}
          </p>
        )}


        {!loading &&
          !error && (
            <div className="projects-grid">

              {projects.map(
                (
                  project,
                  index
                ) => {
                  const Icon =
                    iconMap[
                      project.category as keyof typeof iconMap
                    ] ??
                    BrainCircuit;

                  return (
                    <motion.article
                      className="project-card glass-card"
                      key={
                        project.id
                      }
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
                      }}
                      transition={{
                        delay:
                          index *
                          0.07,
                      }}
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
                            project.short_description
                          }
                        </p>

                      </div>
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