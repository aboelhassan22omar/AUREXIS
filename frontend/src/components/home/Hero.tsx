"use client";

import {
  ArrowRight,
  Bot,
  Cpu,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Link from "next/link";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-grid" />
      <div className="hero-glow" />

      <div className="aurexis-container hero-inner">
        <div className="hero-copy">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <Sparkles size={14} />
            AI-powered innovation
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08 }}
          >
            <span className="hero-title-line">We build</span>

            <span className="hero-title-line gradient-text">
              intelligence.
            </span>
          </motion.h1>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            From intelligent chatbots to AI-powered cybersecurity and custom
            software, Aurexis engineers technology designed to solve real
            problems and create measurable impact.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            <Link href="/contact" className="primary-button">
              Start a project
              <ArrowRight size={17} />
            </Link>

            <Link href="/services" className="secondary-button">
              Explore our work
            </Link>
          </motion.div>

          <motion.div
            className="hero-trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
          >
            <div className="hero-trust-icons">
              <span className="hero-trust-icon">
                <Bot size={14} />
              </span>

              <span className="hero-trust-icon">
                <ShieldCheck size={14} />
              </span>

              <span className="hero-trust-icon">
                <Cpu size={14} />
              </span>
            </div>

            AI Agents · Chatbots · Security · Smart Systems
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          <div className="orbit-glow" />

          <motion.div
            className="orbit orbit-three"
            animate={{ rotate: -360 }}
            transition={{
              duration: 38,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="orbit-node node-three" />
          </motion.div>

          <motion.div
            className="orbit orbit-two"
            animate={{ rotate: 360 }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="orbit-node node-two" />
          </motion.div>

          <motion.div
            className="orbit orbit-one"
            animate={{ rotate: -360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="orbit-node node-one" />
          </motion.div>

          <motion.div
            className="floating-card floating-card-one"
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="floating-card-icon">
              <Bot size={21} />
            </div>

            <div>
              <strong>AI Systems</strong>
              <span>Adaptive intelligence</span>
            </div>
          </motion.div>

          <motion.div
            className="floating-card floating-card-two"
            animate={{ y: [0, 12, 0] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="floating-card-icon">
              <ShieldCheck size={21} />
            </div>

            <div>
              <strong>AI Security</strong>
              <span>Intelligent protection</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}