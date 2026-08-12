"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Database,
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

import { getServiceBySlug } from "@/lib/services";

import type { Service } from "@/types/api";


const iconMap = {
  "ai-solutions": BrainCircuit,
  "ai-chatbot-development": Bot,
  "web-application-development": Code2,
  "business-process-automation": Workflow,
  "cybersecurity-solutions": ShieldCheck,
  "systems-integration": Database,
};


const serviceDetails = {
  "ai-solutions": {
    what:
      "AI Solutions use artificial intelligence to process information, automate decisions and add intelligent capabilities to software and business operations.",

    does:
      "These systems can analyze data, understand text, classify information, generate content and assist users or employees with tasks that normally require manual effort.",

    benefits: [
      "Reduce repetitive manual work",
      "Process large amounts of information faster",
      "Support better and faster decisions",
      "Add intelligent capabilities to existing products",
    ],

    useCases: [
      "Intelligent internal assistants",
      "Document and data analysis",
      "Automated classification",
      "Decision-support systems",
    ],
  },


  "ai-chatbot-development": {
    what:
      "AI Chatbot Development creates conversational systems that allow users to interact naturally with business information, services and support systems.",

    does:
      "The chatbot can understand user questions, search connected knowledge, provide relevant answers and guide users through common processes automatically.",

    benefits: [
      "Provide support around the clock",
      "Reduce repetitive support requests",
      "Give users faster access to information",
      "Create a consistent support experience",
    ],

    useCases: [
      "Customer support",
      "School and education assistants",
      "Internal employee support",
      "Knowledge-base assistants",
    ],
  },


  "web-application-development": {
    what:
      "Web Application Development transforms business requirements into secure, accessible and responsive applications that run through the browser.",

    does:
      "A web application can centralize business information, automate processes, provide dashboards and connect users to databases, APIs and other systems.",

    benefits: [
      "Access the system from modern browsers",
      "Centralize operational data",
      "Replace fragmented manual workflows",
      "Build around specific business requirements",
    ],

    useCases: [
      "Business management systems",
      "Customer portals",
      "Administrative dashboards",
      "Internal operational platforms",
    ],
  },


  "business-process-automation": {
    what:
      "Business Process Automation uses software to perform repeatable operational tasks automatically instead of relying on continuous manual execution.",

    does:
      "Automation connects applications, APIs, databases and business rules so information can move between systems and processes can execute consistently.",

    benefits: [
      "Reduce repetitive manual operations",
      "Improve speed and consistency",
      "Reduce operational errors",
      "Free teams for higher-value work",
    ],

    useCases: [
      "Data synchronization",
      "Approval workflows",
      "Automated notifications",
      "Recurring operational processes",
    ],
  },


  "cybersecurity-solutions": {
    what:
      "Cybersecurity Solutions protect applications, infrastructure and business information against technical risks and unauthorized access.",

    does:
      "Security controls can monitor activity, strengthen application architecture, protect sensitive information and improve visibility into potential security events.",

    benefits: [
      "Reduce exposure to security risks",
      "Protect sensitive business information",
      "Improve security visibility",
      "Build stronger and safer systems",
    ],

    useCases: [
      "Application security",
      "Security monitoring",
      "Infrastructure protection",
      "Access and authentication controls",
    ],
  },


  "systems-integration": {
    what:
      "Systems Integration connects separate applications, databases, APIs and services so they can exchange information and operate as one connected environment.",

    does:
      "Integration removes isolated systems by creating reliable communication paths between applications and automating the movement of information.",

    benefits: [
      "Reduce duplicated manual data entry",
      "Connect existing software systems",
      "Improve information consistency",
      "Create unified digital workflows",
    ],

    useCases: [
      "API integrations",
      "Database synchronization",
      "AI integration",
      "Third-party service connections",
    ],
  },
};


export default function ServiceDetailsPage() {
  const params =
    useParams<{
      slug: string;
    }>();

  const slug = params.slug;


  const [service, setService] =
    useState<Service | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


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

        <main className="detail-loading">

          <LoaderCircle
            size={24}
            className="detail-spinner"
          />

          Loading service...

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

        <main className="detail-not-found">

          <span className="section-label">
            Service unavailable
          </span>

          <h1>
            Service{" "}

            <span className="gradient-text">
              not found.
            </span>
          </h1>

          <p>
            {error ||
              "This service is currently unavailable."}
          </p>

          <Link
            href="/services"
            className="primary-button"
          >
            <ArrowLeft size={17} />

            Back to Services
          </Link>

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


  const details =
    serviceDetails[
      service.slug as keyof typeof serviceDetails
    ] ?? {
      what:
        service.description,

      does:
        service.description,

      benefits: [
        "Built around real requirements",
        "Designed for practical operation",
        "Secure and scalable architecture",
        "Focused on measurable value",
      ],

      useCases: [
        "Business operations",
        "Digital platforms",
        "Internal systems",
        "Process improvement",
      ],
    };


  return (
    <>
      <Navbar />


      <main>

        <section className="detail-hero">

          <div className="axion-container detail-hero-grid">

            <div>

              <Link
                href="/services"
                className="detail-back"
              >
                <ArrowLeft size={14} />

                All Services
              </Link>


              <span className="section-label detail-label">
                AXION Service
              </span>


              <h1 className="detail-title">
                {service.name}
              </h1>


              <p className="detail-intro">
                {
                  service.short_description
                }
              </p>


              <div className="detail-actions">

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


        <section className="axion-container detail-content">

          <div className="detail-explanation-grid">

            <article className="detail-info-card glass-card">

              <div className="detail-info-icon">
                <Lightbulb size={21} />
              </div>

              <span>
                What is it?
              </span>

              <h2>
                Understanding the service
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
                How it works
              </h2>

              <p>
                {details.does}
              </p>

            </article>

          </div>


          <div className="detail-section-heading">

            <span className="section-label">
              Business value
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
                color="#a985ff"
              />

              <span className="section-label usecase-label">
                Common use cases
              </span>

              <h2>
                Where this service
                <br />
                creates value.
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

              <Sparkles
                size={24}
                color="#a985ff"
              />

              <h2>
                Need this solution?
              </h2>

              <p>
                Tell AXION what you need
                and we&apos;ll design the
                technology around your
                requirements.
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


      <DetailStyles />

    </>
  );
}


function DetailStyles() {
  return (
    <style jsx global>{`
      .detail-loading {
        min-height: 100vh;

        display: flex;
        align-items: center;
        justify-content: center;

        gap: 10px;

        color: #817c89;
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

        color: #817c89;

        line-height: 1.7;
      }

      .detail-hero {
        padding:
          135px 0 75px;

        background:
          radial-gradient(
            circle at 68% 30%,
            rgba(
              108,
              51,
              255,
              .12
            ),
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

        color: #aaa4b1;

        border-radius: 12px;

        background:
          rgba(
            255,
            255,
            255,
            .025
          );

        border:
          1px solid
          rgba(
            255,
            255,
            255,
            .07
          );

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

        color: #9c96a3;

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
          rgba(
            108,
            51,
            255,
            .17
          );

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

        color: #bda4ff;

        background:
          linear-gradient(
            135deg,
            rgba(
              108,
              51,
              255,
              .22
            ),
            rgba(
              153,
              95,
              255,
              .06
            )
          );

        border:
          1px solid
          rgba(
            139,
            92,
            246,
            .25
          );

        box-shadow:
          0 24px 70px
          rgba(
            74,
            30,
            190,
            .18
          );
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

        color: #ae8aff;

        background:
          rgba(
            108,
            51,
            255,
            .1
          );
      }

      .detail-info-card > span {
        display: block;

        margin-top: 38px;

        color: #8e6fe7;

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

        color: #99939f;

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

        color: #aaa5b0;

        font-size: 13px;
      }

      .detail-benefit svg {
        flex-shrink: 0;

        color: #916deb;
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
          rgba(
            255,
            255,
            255,
            .025
          );

        border:
          1px solid
          rgba(
            255,
            255,
            255,
            .05
          );
      }

      .detail-usecase span {
        color: #825be2;

        font-size: 10px;

        font-weight: 700;
      }

      .detail-usecase strong {
        color: #bbb6c1;

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
            rgba(
              108,
              51,
              255,
              .1
            ),
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

        color: #817c89;

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