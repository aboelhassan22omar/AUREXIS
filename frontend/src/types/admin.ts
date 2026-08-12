export type AdminOverviewStats = {
  total_users: number;
  active_users: number;

  total_leads: number;
  new_leads: number;

  total_services: number;
  active_services: number;

  total_projects: number;
  active_projects: number;
  featured_projects: number;
};


export type AdminOverviewUser = {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
};


export type AdminOverviewContact = {
  id: number;
  name: string;
  email: string;
  company: string | null;
  status: string;
  created_at: string;
};


export type AdminOverview = {
  stats: AdminOverviewStats;

  recent_users:
    AdminOverviewUser[];

  recent_contacts:
    AdminOverviewContact[];
};