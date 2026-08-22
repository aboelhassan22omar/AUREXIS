"use client";

import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Code2,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getProjects } from "@/lib/projects";

import type { Project } from "@/types/api";


const iconMap = {
  "Artificial Intelligence": Bot,
  "Web Development": Code2,
  Automation: Workflow,
  Cybersecurity: ShieldCheck,
  "Custom AI": BrainCircuit,
};


export default function Projects() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    async function loadProjects() {
      try {
        const data =
          await getProjects();

        setProjects(
          data.slice(0, 4)
        );
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
    <section
      className="aurexis-section"
      id="projects"
    >
      <div className="aurexis-container">

        <div className="projects-heading-row">

          <div>
            <span className="section-label">
              Selected projects
            </span>

            <h2 className="section-title">
              Built for
              <br />

              <span className="gradient-text">
                real requirements.
              </span>
            </h2>
          </div>


          <Link
            href="/projects"
            className="secondary-button"
          >
            View all projects

            <ArrowRight
              size={16}
            />
          </Link>

        </div>


        {loading && (
          <p className="home-section-status">
            Loading projects...
          </p>
        )}


        {error && (
          <p className="home-section-status home-section-error">
            {error}
          </p>
        )}


        {!loading &&
          !error && (
            <div className="home-projects-grid">

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
                      key={project.id}
                      className="home-project-card glass-card"
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

                      <div className="home-project-art">

                        <Icon
                          size={58}
                          strokeWidth={1}
                        />

                      </div>


                      <div className="home-project-info">

                        <span className="home-project-type">
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


                        <Link
                          href={`/projects/${project.slug}`}
                          className="home-project-link"
                        >
                          View project
                          <span>→</span>
                        </Link>

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