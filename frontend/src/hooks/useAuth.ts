"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  fetchCurrentUser,
  getStoredUser,
  logoutUser,
} from "@/lib/auth";

import type { User } from "@/types/auth";


export function useAuth() {
  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);


  const refreshUser =
    useCallback(async () => {
      setLoading(true);

      try {
        const storedUser =
          getStoredUser();

        if (storedUser) {
          setUser(storedUser);
        }

        const currentUser =
          await fetchCurrentUser();

        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }, []);


  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);


  const logout =
    useCallback(async () => {
      await logoutUser();

      setUser(null);
    }, []);


  return {
    user,
    loading,

    authenticated:
      Boolean(user),

    refreshUser,
    logout,
  };
}