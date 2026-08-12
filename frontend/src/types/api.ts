export type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  message: string;
};

export type ContactResponse = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  message: string;
  status: string;
  created_at: string;
};

export type Service = {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  is_active: boolean;
  created_at: string;
};

export type Project = {
  id: number;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  description: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};