import { apiRequest } from "@/lib/api";
import type { Service } from "@/types/api";


export async function getServices(): Promise<Service[]> {
  return apiRequest<Service[]>(
    "/services"
  );
}


export async function getServiceBySlug(
  slug: string
): Promise<Service> {
  return apiRequest<Service>(
    `/services/${slug}`
  );
}