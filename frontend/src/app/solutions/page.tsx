import type {
  Metadata,
} from "next";

import CTA from "@/components/home/CTA";
import Solutions from "@/components/home/Solutions";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";


export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Explore how AXION combines artificial intelligence, cybersecurity, automation and software engineering to solve complex business problems.",
};


export default function SolutionsPage() {
  return (
    <>
      <Navbar />

      <main>
        <section
          className="page-hero"
          style={{
            background:
              "radial-gradient(circle at 50% 20%, rgba(108,51,255,.10), transparent 32%)",
          }}
        >
          <div className="axion-container">

            <span className="section-label">
              Our Approach
            </span>


            <h1>
              Complex problems.
              <br />

              <span className="gradient-text">
                Clear solutions.
              </span>
            </h1>


            <p>
              AXION selects and engineers
              technology around the problem
              itself — combining AI,
              cybersecurity, automation and
              software where they create
              real operational value.
            </p>

          </div>
        </section>


        <Solutions />


        <section
          className="axion-container"
          style={{
            paddingTop: 20,
            paddingBottom: 20,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 14,
            }}
            className="solutions-principles-grid"
          >

            <article
              className="glass-card"
              style={{
                padding: 25,
                borderRadius: 22,
              }}
            >
              <span className="section-label">
                01
              </span>

              <h3
                style={{
                  marginTop: 18,
                  fontSize: 19,
                  letterSpacing: "-.03em",
                }}
              >
                Understand
              </h3>

              <p
                style={{
                  marginTop: 10,
                  color: "#817c89",
                  fontSize: 12,
                  lineHeight: 1.75,
                }}
              >
                We start with the business
                problem, workflows, risks and
                desired outcome before choosing
                any technology.
              </p>
            </article>


            <article
              className="glass-card"
              style={{
                padding: 25,
                borderRadius: 22,
              }}
            >
              <span className="section-label">
                02
              </span>

              <h3
                style={{
                  marginTop: 18,
                  fontSize: 19,
                  letterSpacing: "-.03em",
                }}
              >
                Engineer
              </h3>

              <p
                style={{
                  marginTop: 10,
                  color: "#817c89",
                  fontSize: 12,
                  lineHeight: 1.75,
                }}
              >
                We design the software,
                intelligence, infrastructure
                and security architecture as
                one complete system.
              </p>
            </article>


            <article
              className="glass-card"
              style={{
                padding: 25,
                borderRadius: 22,
              }}
            >
              <span className="section-label">
                03
              </span>

              <h3
                style={{
                  marginTop: 18,
                  fontSize: 19,
                  letterSpacing: "-.03em",
                }}
              >
                Deliver
              </h3>

              <p
                style={{
                  marginTop: 10,
                  color: "#817c89",
                  fontSize: 12,
                  lineHeight: 1.75,
                }}
              >
                The result is a usable,
                maintainable and scalable
                solution designed around real
                operational requirements.
              </p>
            </article>

          </div>
        </section>


        <CTA />
      </main>

      <Footer />


      <style>{`
        @media (max-width: 800px) {
          .solutions-principles-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}