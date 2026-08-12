import { apiRequest } from "@/lib/api";

import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth";


const ACCESS_TOKEN_KEY = "axion_access_token";
const REFRESH_TOKEN_KEY = "axion_refresh_token";
const USER_KEY = "axion_user";


type RefreshResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};


export async function loginUser(
  payload: LoginPayload
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  saveAuthSession(response);

  return response;
}


export async function registerUser(
  payload: RegisterPayload
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  saveAuthSession(response);

  return response;
}


export function saveAuthSession(
  response: AuthResponse
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    response.access_token
  );

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    response.refresh_token
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(response.user)
  );
}


export function saveTokens(
  accessToken: string,
  refreshToken: string
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken
  );

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    refreshToken
  );
}


export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    ACCESS_TOKEN_KEY
  );
}


export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(
    REFRESH_TOKEN_KEY
  );
}


export function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value =
    localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
}


export function saveUser(
  user: User
): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}


export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}


export async function refreshSession(): Promise<string> {
  const refreshToken =
    getRefreshToken();

  if (!refreshToken) {
    throw new Error(
      "No refresh token"
    );
  }

  const response =
    await apiRequest<RefreshResponse>(
      "/auth/refresh",
      {
        method: "POST",

        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      }
    );

  saveTokens(
    response.access_token,
    response.refresh_token
  );

  return response.access_token;
}


async function requestCurrentUser(
  accessToken: string
): Promise<User> {
  return apiRequest<User>(
    "/auth/me",
    {
      method: "GET",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    }
  );
}


export async function fetchCurrentUser(): Promise<User> {
  let accessToken =
    getAccessToken();

  if (!accessToken) {
    throw new Error(
      "Not authenticated"
    );
  }

  try {
    const user =
      await requestCurrentUser(
        accessToken
      );

    saveUser(user);

    return user;
  } catch {
    try {
      accessToken =
        await refreshSession();

      const user =
        await requestCurrentUser(
          accessToken
        );

      saveUser(user);

      return user;
    } catch {
      clearAuthSession();

      throw new Error(
        "Authentication expired"
      );
    }
  }
}


export async function logoutUser(): Promise<void> {
  const refreshToken =
    getRefreshToken();

  try {
    if (refreshToken) {
      await apiRequest<{
        message: string;
      }>(
        "/auth/logout",
        {
          method: "POST",

          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        }
      );
    }
  } catch {
    // Even if backend logout fails,
    // remove the local session.
  } finally {
    clearAuthSession();
  }
}