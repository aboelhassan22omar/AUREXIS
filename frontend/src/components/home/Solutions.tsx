"use client";

import { motion } from "motion/react";

const solutions = [
  {
    number: "01",
    title: "Understand the problem",
    description:
      "We begin with the business challenge, not with a technology trend.",
  },
  {
    number: "02",
    title: "Engineer the solution",
    description:
      "We design the right architecture using AI, software, automation or security where they create real value.",
  },
  {
    number: "03",
    title: "Build for scale",
    description:
      "Solutions are designed with maintainability, reliability and future growth in mind.",
  },
  {
    number: "04",
    title: "Secure by design",
    description:
      "Security is treated as part of the architecture rather than an afterthought.",
  },
];

export default function Solutions() {
  return (
    <section className="aurexis-section">
      <div className="aurexis-container solutions-layout">
        <div className="solutions-sticky">
          <span className="section-label">How we think</span>

          <h2 className="section-title">
            Intelligence without
            <br />
            <span className="gradient-text">complexity.</span>
          </h2>

          <p className="section-subtitle">
            Powerful technology should make your business simpler, not harder
            to operate.
          </p>
        </div>

        <div className="solutions-list">
          {solutions.map((solution, index) => (
            <motion.article
              className="solution-item glass-card"
              key={solution.number}
              initial={{ opacity: 0, x: 25 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <div className="solution-top">
                <span className="solution-number">{solution.number}</span>

                <div>
                  <h3>{solution.title}</h3>
                  <p>{solution.description}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}