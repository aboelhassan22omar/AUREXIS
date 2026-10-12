"use client";

import {
  useEffect,
  useState,
} from "react";

type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string;
};

/** Minimal client loader with cancellation; keeps pages declarative. */
export function useApiData<T>(
  loader: () => Promise<T>,
  key: string | null = "default"
): ApiState<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: "",
  });

  useEffect(() => {
    if (key === null) {
      return;
    }

    let cancelled = false;

    setState((current) => ({ ...current, loading: true, error: "" }));

    loader()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: "" });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : "Unable to load content",
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
