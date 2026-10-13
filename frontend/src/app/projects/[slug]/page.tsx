"use client";

import { useParams } from "next/navigation";

import DetailView, {
  DetailLoading,
  DetailMissing,
} from "@/components/sections/DetailView";
import ProjectArt from "@/components/sections/ProjectArt";
import { useApiData } from "@/hooks/useApiData";
import {
  getProjectIcon,
  projectDetails,
} from "@/lib/content";
import {
  getProjectBySlug,
  getProjects,
} from "@/lib/projects";

export default function ProjectDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, loading, error } = useApiData(() => getProjectBySlug(slug), slug ?? null);
  const { data: all } = useApiData(() => getProjects(), "projects");

  if (loading) {
    return <DetailLoading />;
  }

  if (error || !project) {
    return (
      <DetailMissing
        kind="Project"
        backHref="/projects"
        message={error || "This project is currently unavailable."}
      />
    );
  }

  const details = projectDetails[project.slug] ?? {
    what: project.description,
    does: project.short_description,
    benefits: [],
    useCases: [],
  };
  const Icon = getProjectIcon(project.category);

  return (
    <DetailView
      kind="Project"
      backHref="/projects"
      backLabel="Projects"
      name={project.title}
      summary={project.description}
      Icon={Icon}
      details={details}
      tags={
        <>
          <span className="ax-tag ax-tag--accent">{project.category}</span>
          {project.is_featured && <span className="ax-tag">Featured</span>}
        </>
      }
      visual={
        <div className="ax-glass" style={{ overflow: "hidden", borderRadius: "var(--ax-r-xl)" }}>
          <div className="ax-art-lg-wrap">
            <ProjectArt category={project.category} Icon={Icon} />
          </div>
        </div>
      }
      related={(all ?? [])
        .filter((item) => item.slug !== project.slug)
        .slice(0, 3)
        .map((item) => ({
          href: `/projects/${item.slug}`,
          name: item.title,
          summary: item.short_description,
        }))}
    />
  );
}
