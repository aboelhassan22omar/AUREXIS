import type {
  Metadata,
} from "next";

import About from "@/components/home/About";
import CTA from "@/components/home/CTA";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";


export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about AXION, a technology company engineering AI, cybersecurity, automation and custom software solutions.",
};


export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        <section
          className="page-hero"
          style={{
            background:
              "radial-gradient(circle at 55% 20%, rgba(108,51,255,.10), transparent 32%)",
          }}
        >
          <div className="axion-container">

            <span className="section-label">
              About AXION
            </span>


            <h1>
              Engineering the
              <br />

              <span className="gradient-text">
                next advantage.
              </span>
            </h1>


            <p>
              AXION is a technology company
              focused on artificial intelligence,
              cybersecurity, automation and
              software engineering — building
              systems around real-world problems.
            </p>

          </div>
        </section>


        <About />


        <section
          className="axion-container"
          style={{
            paddingTop: 20,
            paddingBottom: 40,
          }}
        >
          <div
            className="glass-card"
            style={{
              padding:
                "clamp(28px,5vw,55px)",
              borderRadius: 30,
              background:
                "radial-gradient(circle at 85% 30%, rgba(108,51,255,.10), transparent 34%)",
            }}
          >

            <span className="section-label">
              What defines us
            </span>


            <h2
              style={{
                marginTop: 14,
                maxWidth: 850,
                fontSize:
                  "clamp(2.2rem,5vw,4.8rem)",
                lineHeight: .98,
                letterSpacing: "-.055em",
              }}
            >
              Technology should create
              <br />

              <span className="gradient-text">
                measurable impact.
              </span>
            </h2>


            <p
              style={{
                marginTop: 24,
                maxWidth: 760,
                color: "#8e8996",
                fontSize: 14,
                lineHeight: 1.85,
              }}
            >
              We do not build technology
              simply because it is new.
              AXION combines the right tools,
              architecture and intelligence
              to make organizations faster,
              smarter, safer and more capable.
            </p>


            <div
              style={{
                marginTop: 38,
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0,1fr))",
                gap: 12,
              }}
              className="about-values-grid"
            >

              <div
                style={{
                  padding: 20,
                  borderRadius: 17,
                  background:
                    "rgba(255,255,255,.02)",
                  border:
                    "1px solid rgba(255,255,255,.055)",
                }}
              >
                <span
                  style={{
                    color: "#a985ff",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  Intelligent
                </span>

                <p
                  style={{
                    marginTop: 9,
                    color: "#918b98",
                    fontSize: 12,
                    lineHeight: 1.7,
                  }}
                >
                  AI is applied where it
                  genuinely improves a system.
                </p>
              </div>


              <div
                style={{
                  padding: 20,
                  borderRadius: 17,
                  background:
                    "rgba(255,255,255,.02)",
                  border:
                    "1px solid rgba(255,255,255,.055)",
                }}
              >
                <span
                  style={{
                    color: "#a985ff",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  Secure
                </span>

                <p
                  style={{
                    marginTop: 9,
                    color: "#918b98",
                    fontSize: 12,
                    lineHeight: 1.7,
                  }}
                >
                  Security is part of the
                  architecture, not an
                  afterthought.
                </p>
              </div>


              <div
                style={{
                  padding: 20,
                  borderRadius: 17,
                  background:
                    "rgba(255,255,255,.02)",
                  border:
                    "1px solid rgba(255,255,255,.055)",
                }}
              >
                <span
                  style={{
                    color: "#a985ff",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: ".1em",
                  }}
                >
                  Practical
                </span>

                <p
                  style={{
                    marginTop: 9,
                    color: "#918b98",
                    fontSize: 12,
                    lineHeight: 1.7,
                  }}
                >
                  Every solution should solve a
                  real problem and deliver value.
                </p>
              </div>

            </div>

          </div>
        </section>


        <CTA />
      </main>

      <Footer />


      <style>{`
        @media (max-width: 750px) {
          .about-values-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}