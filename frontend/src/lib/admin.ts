import { apiRequest } from "@/lib/api";

import {
  getAccessToken,
  refreshSession,
} from "@/lib/auth";

import type {
  ContactResponse,
  Project,
  Service,
} from "@/types/api";

import type {
  AdminOverview,
} from "@/types/admin";

import type {
  User,
} from "@/types/auth";


export type ServiceCreatePayload = {
  name: string;
  slug: string;

  short_description: string;
  description: string;

  is_active: boolean;
};


export type ServiceUpdatePayload = {
  name?: string;
  slug?: string;

  short_description?: string;
  description?: string;

  is_active?: boolean;
};


export type ProjectCreatePayload = {
  title: string;
  slug: string;
  category: string;

  short_description: string;
  description: string;

  is_featured: boolean;
  is_active: boolean;
};


export type ProjectUpdatePayload = {
  title?: string;
  slug?: string;
  category?: string;

  short_description?: string;
  description?: string;

  is_featured?: boolean;
  is_active?: boolean;
};


export type UserAdminUpdatePayload = {
  is_active?: boolean;
  is_admin?: boolean;
};


async function adminRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let accessToken =
    getAccessToken();

  if (!accessToken) {
    throw new Error(
      "Not authenticated"
    );
  }

  try {
    return await apiRequest<T>(
      endpoint,
      {
        ...options,

        headers: {
          ...(options.headers ?? {}),

          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );
  } catch {
    accessToken =
      await refreshSession();

    return apiRequest<T>(
      endpoint,
      {
        ...options,

        headers: {
          ...(options.headers ?? {}),

          Authorization:
            `Bearer ${accessToken}`,
        },
      }
    );
  }
}


export async function getAdminOverview(): Promise<AdminOverview> {
  return adminRequest<AdminOverview>(
    "/admin/overview"
  );
}


export async function getAdminContacts(): Promise<ContactResponse[]> {
  return adminRequest<ContactResponse[]>(
    "/admin/contacts"
  );
}


export async function updateContactStatus(
  contactId: number,
  status: string
): Promise<ContactResponse> {
  return adminRequest<ContactResponse>(
    `/admin/contacts/${contactId}/status`,
    {
      method: "PATCH",

      body: JSON.stringify({
        status,
      }),
    }
  );
}


export async function getAdminServices(): Promise<Service[]> {
  return adminRequest<Service[]>(
    "/services?active_only=false"
  );
}


export async function createAdminService(
  data: ServiceCreatePayload
): Promise<Service> {
  return adminRequest<Service>(
    "/admin/services",
    {
      method: "POST",

      body:
        JSON.stringify(data),
    }
  );
}


export async function updateAdminService(
  slug: string,
  data: ServiceUpdatePayload
): Promise<Service> {
  return adminRequest<Service>(
    `/admin/services/${slug}`,
    {
      method: "PATCH",

      body:
        JSON.stringify(data),
    }
  );
}


export async function getAdminProjects(): Promise<Project[]> {
  return adminRequest<Project[]>(
    "/projects?active_only=false"
  );
}


export async function createAdminProject(
  data: ProjectCreatePayload
): Promise<Project> {
  return adminRequest<Project>(
    "/admin/projects",
    {
      method: "POST",

      body:
        JSON.stringify(data),
    }
  );
}


export async function updateAdminProject(
  slug: string,
  data: ProjectUpdatePayload
): Promise<Project> {
  return adminRequest<Project>(
    `/admin/projects/${slug}`,
    {
      method: "PATCH",

      body:
        JSON.stringify(data),
    }
  );
}


export async function getAdminUsers(): Promise<User[]> {
  return adminRequest<User[]>(
    "/admin/users"
  );
}


export async function updateAdminUser(
  userId: number,
  data: UserAdminUpdatePayload
): Promise<User> {
  return adminRequest<User>(
    `/admin/users/${userId}`,
    {
      method: "PATCH",

      body:
        JSON.stringify(data),
    }
  );
}