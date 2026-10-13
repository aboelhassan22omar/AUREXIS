"use client";

import { FolderKanban } from "lucide-react";
import { useMemo, useState } from "react";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Reveal from "@/components/motion/Reveal";
import {
  ClosingCTA,
  WorkCard,
} from "@/components/sections/HomeSections";
import PageHero from "@/components/sections/PageHero";
import { useApiData } from "@/hooks/useApiData";
import { getProjects } from "@/lib/projects";

export default function ProjectsPage() {
  const { data, loading, error } = useApiData(() => getProjects(), "projects");
  const [filter, setFilter] = useState("All");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    (data ?? []).forEach((project) => counts.set(project.category, (counts.get(project.category) ?? 0) + 1));
    return [["All", data?.length ?? 0] as const, ...Array.from(counts.entries())];
  }, [data]);

  const visible = (data ?? []).filter((project) => filter === "All" || project.category === filter);

  return (
    <>
      <Navbar />

      <main id="main">
        <PageHero
          eyebrow="Projects"
          icon={<FolderKanban size={84} strokeWidth={1.1} />}
          title={["Built for", "real requirements."]}
          lead="Intelligent systems, platforms and security products — each engineered around how an organization actually operates."
        />

        <section className="ax-section ax-section--tight pt-0" aria-label="Project list">
          <div className="container">
            {data && data.length > 0 && (
              <div className="ax-filter" role="group" aria-label="Filter projects by category">
                {categories.map(([name, count]) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={filter === name}
                    onClick={() => setFilter(name)}
                  >
                    {name}
                    <span>{count}</span>
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="row g-4">
                {[0, 1, 2, 3].map((index) => (
                  <div className="col-12 col-md-6" key={index}>
                    <div className="ax-skeleton" style={{ height: 460 }} />
                  </div>
                ))}
              </div>
            )}

            {error && <p className="ax-state">{error}</p>}

            {data && visible.length === 0 && (
              <p className="ax-state">No projects in this category yet.</p>
            )}

            <div className="row g-4">
              {visible.map((project, index) => (
                <Reveal className="col-12 col-md-6" key={`${filter}-${project.id}`} delay={(index % 2) * 0.08}>
                  <WorkCard
                    href={`/projects/${project.slug}`}
                    category={project.category}
                    title={project.title}
                    summary={project.short_description}
                    index={index}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <ClosingCTA />
      </main>

      <Footer />
    </>
  );
}
