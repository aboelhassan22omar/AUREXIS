import { API_BASE_URL } from "@/lib/config";

type ApiError = {
  // FastAPI validation errors (422) send a list of { msg } instead of a string.
  detail?: string | { msg?: string }[];
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

      if (typeof data.detail === "string") {
        errorMessage = data.detail;
      } else if (data.detail?.[0]?.msg) {
        errorMessage = data.detail[0].msg.replace(/^Value error, /, "");
      }
    } catch {
      // Ignore invalid JSON error responses
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}