"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  FolderKanban,
  Lightbulb,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

import { getProjectBySlug } from "@/lib/projects";

import type { Project } from "@/types/api";


const iconMap = {
  "Artificial Intelligence": Bot,
  "Web Development": Code2,
  Automation: Workflow,
  Cybersecurity: ShieldCheck,
  "Custom AI": BrainCircuit,
};


const projectDetails = {
  "ai-customer-support-chatbot": {
    what:
      "An AI Customer Support Chatbot is a conversational application that provides users with automated assistance through natural-language interaction.",

    does:
      "The system receives user questions, understands the request and provides relevant answers from connected information or business knowledge. It can handle common support requests without requiring a human operator for every conversation.",

    benefits: [
      "Faster responses to customer questions",
      "Reduced repetitive support workload",
      "Consistent information for every user",
      "Support availability beyond working hours",
    ],

    useCases: [
      "Frequently asked questions",
      "Customer support",
      "Information retrieval",
      "Guided assistance",
    ],
  },


  "business-management-web-application": {
    what:
      "A Business Management Web Application is a centralized online system for managing operational information and administrative processes.",

    does:
      "The application provides authorized users with dashboards, management tools and access to business data from one controlled interface instead of relying on disconnected files and manual processes.",

    benefits: [
      "Centralized operational information",
      "Simpler administrative processes",
      "Improved visibility and control",
      "Accessible through a modern web interface",
    ],

    useCases: [
      "Administrative management",
      "Operational dashboards",
      "Business records",
      "Internal workflow management",
    ],
  },


  "workflow-automation-system": {
    what:
      "A Workflow Automation System connects repeatable business operations and executes defined processes automatically.",

    does:
      "The system can receive information, apply business rules, trigger actions, transfer data between systems and send notifications without requiring manual execution at every stage.",

    benefits: [
      "Reduced repetitive work",
      "Faster operational processes",
      "More consistent execution",
      "Lower risk of manual errors",
    ],

    useCases: [
      "Automated notifications",
      "Approval processes",
      "Data movement",
      "Scheduled operational tasks",
    ],
  },


  "security-monitoring-dashboard": {
    what:
      "A Security Monitoring Dashboard provides a centralized view of system activity, security information and events that may require attention.",

    does:
      "The dashboard collects and organizes security-related information into a clear interface so administrators can monitor activity, identify unusual events and understand the current security status.",

    benefits: [
      "Centralized security visibility",
      "Faster identification of suspicious activity",
      "Simplified monitoring",
      "Better operational awareness",
    ],

    useCases: [
      "Security event monitoring",
      "Infrastructure visibility",
      "System activity tracking",
      "Operational security dashboards",
    ],
  },
};


export default function ProjectDetailsPage() {
  const params =
    useParams<{
      slug: string;
    }>();

  const slug = params.slug;


  const [project, setProject] =
    useState<Project | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


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

        <main className="detail-loading">

          <LoaderCircle
            size={24}
            className="detail-spinner"
          />

          Loading project...

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

        <main className="detail-not-found">

          <span className="section-label">
            Project unavailable
          </span>

          <h1>
            Project{" "}

            <span className="gradient-text">
              not found.
            </span>
          </h1>

          <p>
            {error ||
              "This project is currently unavailable."}
          </p>

          <Link
            href="/projects"
            className="primary-button"
          >
            <ArrowLeft size={17} />

            Back to Projects
          </Link>

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


  const details =
    projectDetails[
      project.slug as keyof typeof projectDetails
    ] ?? {
      what:
        project.description,

      does:
        project.description,

      benefits: [
        "Designed around real requirements",
        "Modern and maintainable architecture",
        "Practical operational value",
        "Secure and scalable implementation",
      ],

      useCases: [
        "Business operations",
        "Digital services",
        "Process improvement",
        "Custom software requirements",
      ],
    };


  return (
    <>
      <Navbar />


      <main>

        <section className="detail-hero">

          <div className="aurexis-container detail-hero-grid">

            <div>

              <Link
                href="/projects"
                className="detail-back"
              >
                <ArrowLeft size={14} />

                All Projects
              </Link>


              <span className="section-label detail-label">
                {project.category}
              </span>


              <h1 className="detail-title">
                {project.title}
              </h1>


              <p className="detail-intro">
                {
                  project.short_description
                }
              </p>


              <div className="detail-actions">

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


            <div className="detail-visual glass-card">

              <div className="detail-orb" />

              <div className="detail-main-icon">

                <Icon
                  size={62}
                  strokeWidth={1.1}
                />

              </div>

            </div>

          </div>

        </section>


        <section className="aurexis-container detail-content">

          <div className="detail-explanation-grid">

            <article className="detail-info-card glass-card">

              <div className="detail-info-icon">
                <Lightbulb size={21} />
              </div>

              <span>
                What is this project?
              </span>

              <h2>
                Project concept
              </h2>

              <p>
                {details.what}
              </p>

            </article>


            <article className="detail-info-card glass-card">

              <div className="detail-info-icon">
                <Workflow size={21} />
              </div>

              <span>
                What does it do?
              </span>

              <h2>
                System function
              </h2>

              <p>
                {details.does}
              </p>

            </article>

          </div>


          <div className="detail-section-heading">

            <span className="section-label">
              Project value
            </span>

            <h2>
              Why is it
              <br />

              <span className="gradient-text">
                useful?
              </span>
            </h2>

          </div>


          <div className="detail-benefits-grid">

            {details.benefits.map(
              (benefit) => (
                <div
                  key={benefit}
                  className="detail-benefit glass-card"
                >
                  <CheckCircle2
                    size={19}
                  />

                  <span>
                    {benefit}
                  </span>
                </div>
              )
            )}

          </div>


          <div className="detail-usecase-section glass-card">

            <div>

              <Target
                size={24}
              />

              <span className="section-label usecase-label">
                Practical applications
              </span>

              <h2>
                Where the project
                <br />
                can be used.
              </h2>

            </div>


            <div className="detail-usecases">

              {details.useCases.map(
                (
                  useCase,
                  index
                ) => (
                  <div
                    key={useCase}
                    className="detail-usecase"
                  >
                    <span>
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <strong>
                      {useCase}
                    </strong>
                  </div>
                )
              )}

            </div>

          </div>


          <div className="detail-cta glass-card">

            <div>

              <FolderKanban
                size={24}
              />

              <h2>
                Have a project in mind?
              </h2>

              <p>
                Aurexis can design, engineer
                and deploy a solution around
                your own requirements.
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

      <ProjectDetailStyles />

    </>
  );
}


function ProjectDetailStyles() {
  return (
    <style jsx global>{`
      /*
        Reuse the exact same detail-page
        design system used by Services.
      */

      .detail-loading {
        min-height: 100vh;

        display: flex;
        align-items: center;
        justify-content: center;

        gap: 10px;

        color: var(--color-text-muted);
      }

      .detail-spinner {
        animation:
          detail-spin .8s
          linear infinite;
      }

      @keyframes detail-spin {
        to {
          transform:
            rotate(360deg);
        }
      }

      .detail-not-found {
        min-height: 80vh;

        padding: 140px 20px;

        display: flex;
        flex-direction: column;

        align-items: center;
        justify-content: center;

        text-align: center;
      }

      .detail-not-found h1 {
        margin-top: 14px;

        font-size:
          clamp(
            2.5rem,
            6vw,
            5rem
          );

        letter-spacing:
          -.06em;
      }

      .detail-not-found p {
        max-width: 600px;

        margin-top: 18px;
        margin-bottom: 30px;

        color: var(--color-text-muted);

        line-height: 1.7;
      }

      .detail-hero {
        padding:
          135px 0 75px;

        background:
          radial-gradient(
            circle at 68% 30%,
            var(--color-accent-soft),
            transparent 32%
          );
      }

      .detail-hero-grid {
        display: grid;

        grid-template-columns:
          minmax(0, 1.15fr)
          minmax(300px, .85fr);

        gap: 55px;

        align-items: center;
      }

      .detail-back {
        width: fit-content;

        margin-bottom: 25px;

        padding: 9px 13px;

        display: inline-flex;
        align-items: center;

        gap: 8px;

        color: var(--color-text-secondary);

        border-radius: 12px;

        background:
          var(--color-border);

        border:
          1px solid
          var(--color-border);

        font-size: 11px;
      }

      .detail-label {
        display: block;
      }

      .detail-title {
        max-width: 780px;

        margin-top: 14px;

        font-size:
          clamp(
            3rem,
            5.6vw,
            5.8rem
          );

        line-height: .95;

        letter-spacing:
          -.06em;
      }

      .detail-intro {
        max-width: 650px;

        margin-top: 24px;

        color: var(--color-text-secondary);

        font-size:
          clamp(
            .98rem,
            1.4vw,
            1.1rem
          );

        line-height: 1.75;
      }

      .detail-actions {
        margin-top: 30px;

        display: flex;

        flex-wrap: wrap;

        gap: 10px;
      }

      .detail-visual {
        min-height: 350px;

        position: relative;

        display: grid;
        place-items: center;

        overflow: hidden;

        border-radius: 34px;
      }

      .detail-orb {
        position: absolute;

        width: 270px;
        height: 270px;

        border-radius: 50%;

        background:
          var(--color-accent-soft);

        filter: blur(75px);
      }

      .detail-main-icon {
        position: relative;
        z-index: 2;

        width: 135px;
        height: 135px;

        display: grid;
        place-items: center;

        border-radius: 35px;

        color: var(--color-accent);

        background:
          linear-gradient(
            135deg,
            var(--color-accent-medium),
            var(--color-accent-soft)
          );

        border:
          1px solid
          var(--color-accent-medium);

        box-shadow:
          0 24px 70px
          var(--color-accent-soft);
      }

      .detail-content {
        padding:
          65px 0 100px;
      }

      .detail-explanation-grid {
        display: grid;

        grid-template-columns:
          repeat(
            2,
            minmax(0, 1fr)
          );

        gap: 18px;
      }

      .detail-info-card {
        min-height: 330px;

        padding: 32px;

        border-radius: 28px;
      }

      .detail-info-icon {
        width: 50px;
        height: 50px;

        display: grid;
        place-items: center;

        border-radius: 15px;

        color: var(--color-accent);

        background:
          var(--color-accent-soft);
      }

      .detail-info-card > span {
        display: block;

        margin-top: 38px;

        color: var(--color-accent);

        font-size: 10px;

        font-weight: 700;

        text-transform:
          uppercase;

        letter-spacing:
          .14em;
      }

      .detail-info-card h2 {
        margin-top: 9px;

        font-size: 26px;

        letter-spacing:
          -.035em;
      }

      .detail-info-card p {
        margin-top: 15px;

        color: var(--color-text-muted);

        font-size: 14px;

        line-height: 1.8;
      }

      .detail-section-heading {
        margin-top: 85px;
      }

      .detail-section-heading h2 {
        margin-top: 12px;

        font-size:
          clamp(
            2.7rem,
            5vw,
            5rem
          );

        line-height: .98;

        letter-spacing:
          -.055em;
      }

      .detail-benefits-grid {
        margin-top: 38px;

        display: grid;

        grid-template-columns:
          repeat(
            2,
            minmax(0, 1fr)
          );

        gap: 13px;
      }

      .detail-benefit {
        min-height: 70px;

        padding: 18px;

        display: flex;
        align-items: center;

        gap: 13px;

        border-radius: 16px;

        color: var(--color-text-secondary);

        font-size: 13px;
      }

      .detail-benefit svg {
        flex-shrink: 0;

        color: var(--color-accent);
      }

      .detail-usecase-section {
        margin-top: 80px;

        padding:
          45px
          clamp(
            25px,
            5vw,
            60px
          );

        display: grid;

        grid-template-columns:
          .8fr 1.2fr;

        gap: 60px;

        border-radius: 30px;
      }

      .usecase-label {
        display: block;

        margin-top: 20px;
      }

      .detail-usecase-section h2 {
        margin-top: 11px;

        font-size:
          clamp(
            2rem,
            3.5vw,
            3.6rem
          );

        line-height: 1;

        letter-spacing:
          -.05em;
      }

      .detail-usecases {
        display: grid;

        gap: 10px;
      }

      .detail-usecase {
        padding: 18px 20px;

        display: flex;
        align-items: center;

        gap: 17px;

        border-radius: 15px;

        background:
          var(--color-border);

        border:
          1px solid
          var(--color-border);
      }

      .detail-usecase span {
        color: var(--color-accent);

        font-size: 10px;

        font-weight: 700;
      }

      .detail-usecase strong {
        color: var(--color-text-secondary);

        font-size: 13px;

        font-weight: 500;
      }

      .detail-cta {
        margin-top: 75px;

        padding:
          42px
          clamp(
            24px,
            5vw,
            60px
          );

        display: flex;

        align-items: center;

        justify-content:
          space-between;

        gap: 28px;

        flex-wrap: wrap;

        border-radius: 28px;

        background:
          radial-gradient(
            circle at 80% 50%,
            var(--color-accent-soft),
            transparent 35%
          );
      }

      .detail-cta h2 {
        margin-top: 14px;

        font-size:
          clamp(
            2rem,
            3.6vw,
            3.6rem
          );

        letter-spacing:
          -.05em;
      }

      .detail-cta p {
        max-width: 550px;

        margin-top: 9px;

        color: var(--color-text-muted);

        line-height: 1.7;
      }

      @media (max-width: 900px) {
        .detail-hero-grid,
        .detail-usecase-section {
          grid-template-columns:
            1fr;
        }

        .detail-explanation-grid {
          grid-template-columns:
            1fr;
        }
      }

      @media (max-width: 650px) {
        .detail-benefits-grid {
          grid-template-columns:
            1fr;
        }

        .detail-hero {
          padding-top: 115px;
        }

        .detail-visual {
          min-height: 280px;
        }

        .detail-info-card {
          min-height: auto;

          padding: 25px;
        }
      }
    `}</style>
  );
}