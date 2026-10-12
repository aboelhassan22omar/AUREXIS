"use client";

import { ArrowUpRight, Layers } from "lucide-react";
import Link from "next/link";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Reveal from "@/components/motion/Reveal";
import { ClosingCTA } from "@/components/sections/HomeSections";
import PageHero from "@/components/sections/PageHero";
import { useApiData } from "@/hooks/useApiData";
import { getServiceIcon } from "@/lib/content";
import { getServices } from "@/lib/services";

export default function ServicesPage() {
  const { data, loading, error } = useApiData(getServices, "services");

  return (
    <>
      <Navbar />

      <main id="main">
        <PageHero
          eyebrow="Services"
          icon={<Layers size={84} strokeWidth={1.1} />}
          title={["Everything technology.", "Built intelligently."]}
          lead="From artificial intelligence and automation to security systems and complete software platforms — Aurexis builds practical technology around real business requirements."
        >
          {data && <span className="ax-tag ax-tag--accent">{data.length} disciplines</span>}
          <span className="ax-tag">AI · Software · Security</span>
        </PageHero>

        <section className="ax-section ax-section--tight pt-0" aria-label="All services">
          <div className="container">
            {loading && (
              <div className="d-grid gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <div className="ax-skeleton" style={{ height: 120 }} key={index} />
                ))}
              </div>
            )}

            {error && <p className="ax-state">{error}</p>}

            {data && (
              <ol className="ax-index">
                {data.map((service, index) => {
                  const Icon = getServiceIcon(service.slug);

                  return (
                    <Reveal as="li" key={service.id} delay={Math.min(index, 4) * 0.05} y={20}>
                      <Link href={`/services/${service.slug}`} className="ax-index__row">
                        <span className="ax-mono ax-index__num">{String(index + 1).padStart(2, "0")}</span>
                        <div className="ax-index__main">
                          <span className="ax-index__title">
                            <span className="ax-icon-tile ax-icon-tile--sm">
                              <Icon size={18} strokeWidth={1.6} />
                            </span>
                            {service.name}
                          </span>
                          <p className="ax-body ax-index__desc">{service.description}</p>
                        </div>
                        <span className="ax-index__go" aria-hidden="true">
                          <ArrowUpRight size={20} />
                        </span>
                      </Link>
                    </Reveal>
                  );
                })}
              </ol>
            )}
          </div>
        </section>

        <ClosingCTA />
      </main>

      <Footer />
    </>
  );
}
