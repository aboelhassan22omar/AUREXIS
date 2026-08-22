"use client";

import { motion } from "motion/react";

export default function About() {
  return (
    <section className="aurexis-section">
      <div className="aurexis-container">
        <motion.div
          className="about-card glass-card"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="about-orb" />

          <div className="about-content">
            <span className="section-label">Why AUREXIS</span>

            <h2 className="about-big-text">
              We don&apos;t sell AI.
              <br />
              <span className="gradient-text">We build solutions.</span>
            </h2>

            <p className="about-description">
              Technology matters only when it solves something. Aurexis exists to
              transform ambitious ideas and difficult problems into intelligent,
              secure and usable products.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}