import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="axion-section">
      <div className="axion-container">
        <div className="cta-card glass-card">
          <div className="about-orb" />

          <div className="cta-content">
            <span className="section-label">Build with AXION</span>

            <h2>
              Have an idea?
              <br />
              <span className="gradient-text">Make it intelligent.</span>
            </h2>

            <p>
              Tell us what you want to build, automate, protect or improve.
              We&apos;ll figure out the technology behind it.
            </p>

            <div className="cta-actions">
              <Link href="/contact" className="primary-button">
                Start your project
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}