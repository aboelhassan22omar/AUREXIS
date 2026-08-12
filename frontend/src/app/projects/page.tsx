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

          <div className="axion-container">

            <span className="section-label">
              AXION Projects
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


        <section className="axion-container projects-page-section">

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
          color: #77737f;

          font-size: 14px;
        }


        .detail-error {
          color: #ff7b8d;
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
              rgba(
                108,
                51,
                255,
                0.17
              ),
              transparent 36%
            ),
            linear-gradient(
              145deg,
              rgba(
                255,
                255,
                255,
                0.045
              ),
              rgba(
                255,
                255,
                255,
                0.015
              )
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
            rgba(
              139,
              92,
              246,
              0.32
            );

          box-shadow:
            0 22px 65px
            rgba(
              0,
              0,
              0,
              0.24
            );
        }


        .projects-page-art {
          width: 100%;

          height: 225px;

          display: grid;

          place-items: center;

          flex-shrink: 0;

          border-radius: 24px;

          color: #b99aff;

          background:
            linear-gradient(
              145deg,
              rgba(
                139,
                92,
                246,
                0.2
              ),
              rgba(
                6,
                6,
                9,
                0.2
              )
            );

          border:
            1px solid
            rgba(
              160,
              121,
              255,
              0.2
            );

          box-shadow:
            inset 0 0 70px
            rgba(
              108,
              51,
              255,
              0.07
            );
        }


        .projects-page-info {
          margin-top: 26px;

          display: flex;

          flex-direction: column;

          flex: 1;

          min-width: 0;
        }


        .projects-page-category {
          color: #a786ff;

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
              --text-secondary
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

          color: #c3afff;

          background:
            rgba(
              108,
              51,
              255,
              0.08
            );

          border:
            1px solid
            rgba(
              139,
              92,
              246,
              0.18
            );

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

          color: #d4c4ff;

          background:
            rgba(
              108,
              51,
              255,
              0.14
            );

          border-color:
            rgba(
              139,
              92,
              246,
              0.32
            );
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