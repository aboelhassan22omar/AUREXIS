import { apiRequest } from "@/lib/api";

import type {
  Project,
} from "@/types/api";


export async function getProjects(
  featuredOnly = false
): Promise<Project[]> {
  const query = featuredOnly
    ? "?featured_only=true"
    : "";

  return apiRequest<Project[]>(
    `/projects${query}`
  );
}


export async function getProjectBySlug(
  slug: string
): Promise<Project> {
  return apiRequest<Project>(
    `/projects/${slug}`
  );
}