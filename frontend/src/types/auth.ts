export type User = {
  id: number;
  full_name: string;
  email: string;
  username?: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  username: string;
  password: string;
};