import { API_BASE_URL } from "@/lib/config";

type ApiError = {
  detail?: string;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let errorMessage = "Something went wrong";

    try {
      const data = (await response.json()) as ApiError;

      if (data.detail) {
        errorMessage = data.detail;
      }
    } catch {
      // Ignore invalid JSON error responses
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}