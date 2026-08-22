"use client";

import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Code2,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";

import CTA from "@/components/home/CTA";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

import { getProjects } from "@/lib/projects";

import type { Project } from "@/types/api";


const iconMap = {
  "Artificial Intelligence": Bot,
  "Web Development": Code2,
  Automation: Workflow,
  Cybersecurity: ShieldCheck,
  "Custom AI": BrainCircuit,
};


export default function ProjectsPage() {
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

          <div className="aurexis-container">

            <span className="section-label">
              AUREXIS Projects
            </span>


            <h1>
              Ideas become
              <br />

              <span className="gradient-text">
                working systems.
              </span>
            </h1>


            <p>
              Explore practical artificial
              intelligence, software,
              automation and cybersecurity
              solutions designed around real
              operational requirements.
            </p>

          </div>

        </section>


        <section className="aurexis-container projects-page-section">

          {loading && (
            <p className="detail-status">
              Loading projects...
            </p>
          )}


          {error && (
            <p className="detail-status detail-error">
              {error}
            </p>
          )}


          {!loading &&
            !error && (
              <div className="projects-page-grid">

                {projects.map(
                  (project) => {
                    const Icon =
                      iconMap[
                        project.category as keyof typeof iconMap
                      ] ??
                      BrainCircuit;

                    return (
                      <article
                        key={project.id}
                        className="projects-page-card glass-card"
                      >

                        <div className="projects-page-art">

                          <Icon
                            size={62}
                            strokeWidth={1}
                          />

                        </div>


                        <div className="projects-page-info">

                          <span className="projects-page-category">
                            {project.category}
                          </span>


                          <h3>
                            {project.title}
                          </h3>


                          <p>
                            {
                              project.description
                            }
                          </p>


                          <Link
                            href={`/projects/${project.slug}`}
                            className="project-card-button"
                          >
                            Explore Project

                            <ArrowUpRight
                              size={16}
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


      <style jsx global>{`

        .projects-page-section {
          padding-bottom: 120px;
        }


        .detail-status {
          color: var(--color-text-muted);

          font-size: 14px;
        }


        .detail-error {
          color: var(--color-danger);
        }


        .projects-page-grid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 18px;
        }


        .projects-page-card {
          position: relative;

          min-width: 0;

          min-height: 500px;

          padding: 30px;

          display: flex;

          flex-direction: column;

          overflow: hidden;

          border-radius: 30px;

          background:
            radial-gradient(
              circle at 78% 15%,
              var(--color-accent-soft),
              transparent 36%
            ),
            linear-gradient(
              145deg,
              var(--color-border),
              var(--color-border)
            );

          transition:
            transform 0.3s ease,
            border-color 0.3s ease,
            box-shadow 0.3s ease;
        }


        .projects-page-card:hover {
          transform:
            translateY(-6px);

          border-color:
            var(--color-accent-medium);

          box-shadow:
            0 22px 65px
            var(--color-overlay);
        }


        .projects-page-art {
          width: 100%;

          height: 225px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 24px;

          color: var(--color-accent);

          background:
            linear-gradient(
              145deg,
              var(--color-accent-soft),
              var(--color-overlay)
            );

          border:
            1px solid
            var(--color-accent-soft);

          box-shadow:
            inset 0 0 70px
            var(--color-accent-soft);
        }


        .projects-page-info {
          margin-top: 26px;

          display: flex;

          flex-direction: column;

          flex: 1;

          min-width: 0;
        }


        .projects-page-category {
          color: var(--color-accent);

          font-size: 10px;

          font-weight: 700;

          text-transform:
            uppercase;

          letter-spacing: 0.15em;
        }


        .projects-page-info h3 {
          margin-top: 9px;

          font-size: 25px;

          line-height: 1.2;

          letter-spacing:
            -0.035em;
        }


        .projects-page-info p {
          margin-top: 12px;

          color:
            var(
              --color-text-secondary
            );

          font-size: 13px;

          line-height: 1.7;
        }


        .project-card-button {
          width: fit-content;

          margin-top: auto;

          padding: 11px 15px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          border-radius: 12px;

          color: var(--color-accent);

          background:
            var(--color-accent-soft);

          border:
            1px solid
            var(--color-accent-soft);

          font-size: 11px;

          font-weight: 650;

          line-height: 1;

          letter-spacing:
            0.01em;

          transition:
            gap 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }


        .project-card-button svg {
          flex-shrink: 0;
        }


        .project-card-button:hover {
          gap: 11px;

          transform:
            translateY(-2px);

          color: var(--color-accent);

          background:
            var(--color-accent-soft);

          border-color:
            var(--color-accent-medium);
        }


        @media (max-width: 850px) {

          .projects-page-grid {
            grid-template-columns:
              1fr;
          }

        }


        @media (max-width: 650px) {

          .projects-page-section {
            padding-bottom: 85px;
          }


          .projects-page-card {
            min-height: auto;

            padding: 23px;

            border-radius: 24px;
          }


          .projects-page-art {
            height: 185px;
          }


          .projects-page-info h3 {
            font-size: 22px;
          }


          .project-card-button {
            margin-top: 24px;
          }

        }

      `}</style>
    </>
  );
}