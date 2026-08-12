"use client";

import {
  useRouter,
} from "next/navigation";

import {
  useEffect,
} from "react";

import AdminOverview from "@/components/admin/AdminOverview";
import AdminShell from "@/components/admin/AdminShell";

import {
  useAuth,
} from "@/hooks/useAuth";


export default function AdminPage() {
  const router = useRouter();

  const {
    user,
    loading,
    authenticated,
  } = useAuth();


  useEffect(() => {
    if (loading) {
      return;
    }

    if (!authenticated) {
      router.replace("/login");
      return;
    }

    if (
      authenticated &&
      user &&
      !user.is_admin
    ) {
      router.replace(
        "/dashboard"
      );
    }
  }, [
    authenticated,
    loading,
    router,
    user,
  ]);


  if (loading) {
    return (
      <main className="admin-access-loading">
        Loading AXION...
      </main>
    );
  }


  if (
    !authenticated ||
    !user ||
    !user.is_admin
  ) {
    return null;
  }


  return (
    <AdminShell>
      <AdminOverview />
    </AdminShell>
  );
}