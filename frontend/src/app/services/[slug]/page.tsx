"use client";

import { useParams } from "next/navigation";

import DetailView, {
  DetailLoading,
  DetailMissing,
} from "@/components/sections/DetailView";
import { SceneArt, sceneForService } from "@/components/sections/ProjectArt";
import { useApiData } from "@/hooks/useApiData";
import {
  getServiceIcon,
  serviceDetails,
} from "@/lib/content";
import {
  getServiceBySlug,
  getServices,
} from "@/lib/services";

export default function ServiceDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: service, loading, error } = useApiData(() => getServiceBySlug(slug), slug ?? null);
  const { data: all } = useApiData(getServices, "services");

  if (loading) {
    return <DetailLoading />;
  }

  if (error || !service) {
    return (
      <DetailMissing
        kind="Service"
        backHref="/services"
        message={error || "This service is currently unavailable."}
      />
    );
  }

  const details = serviceDetails[service.slug] ?? {
    what: service.description,
    does: service.short_description,
    benefits: [],
    useCases: [],
  };

  return (
    <DetailView
      kind="Service"
      backHref="/services"
      backLabel="Services"
      name={service.name}
      summary={service.description}
      Icon={getServiceIcon(service.slug)}
      details={details}
      visual={
        <div className="ax-glass" style={{ overflow: "hidden", borderRadius: "var(--ax-r-xl)" }}>
          <div className="ax-art-lg-wrap">
            <SceneArt kind={sceneForService(service.slug)} />
          </div>
        </div>
      }
      related={(all ?? [])
        .filter((item) => item.slug !== service.slug)
        .slice(0, 3)
        .map((item) => ({
          href: `/services/${item.slug}`,
          name: item.name,
          summary: item.short_description,
        }))}
    />
  );
}
