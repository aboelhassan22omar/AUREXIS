"use client";

import {
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";

import {
  getAdminUsers,
  updateAdminUser,
} from "@/lib/admin";

import {
  useAuth,
} from "@/hooks/useAuth";

import type {
  User,
} from "@/types/auth";


export default function AdminUsersPage() {
  const router = useRouter();

  const {
    user: currentUser,
    loading: authLoading,
    authenticated,
  } = useAuth();

  const [
    users,
    setUsers,
  ] = useState<User[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    updatingId,
    setUpdatingId,
  ] = useState<number | null>(
    null
  );


  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!authenticated) {
      router.replace("/login");
      return;
    }

    if (
      currentUser &&
      !currentUser.is_admin
    ) {
      router.replace(
        "/dashboard"
      );
    }
  }, [
    authLoading,
    authenticated,
    currentUser,
    router,
  ]);


  useEffect(() => {
    async function loadUsers() {
      if (
        authLoading ||
        !currentUser?.is_admin
      ) {
        return;
      }

      try {
        const data =
          await getAdminUsers();

        setUsers(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load users"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, [
    authLoading,
    currentUser,
  ]);


  async function toggleActive(
    user: User
  ) {
    setUpdatingId(user.id);

    try {
      const updated =
        await updateAdminUser(
          user.id,
          {
            is_active:
              !user.is_active,
          }
        );

      setUsers(
        (current) =>
          current.map(
            (item) =>
              item.id === updated.id
                ? updated
                : item
          )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update user"
      );
    } finally {
      setUpdatingId(null);
    }
  }


  async function toggleAdmin(
    user: User
  ) {
    setUpdatingId(user.id);

    try {
      const updated =
        await updateAdminUser(
          user.id,
          {
            is_admin:
              !user.is_admin,
          }
        );

      setUsers(
        (current) =>
          current.map(
            (item) =>
              item.id === updated.id
                ? updated
                : item
          )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update user role"
      );
    } finally {
      setUpdatingId(null);
    }
  }


  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="admin-access-loading">
        Loading AXION users...
      </main>
    );
  }


  if (
    !authenticated ||
    !currentUser ||
    !currentUser.is_admin
  ) {
    return null;
  }


  return (
    <AdminShell>

      <div className="admin-page-heading">

        <span className="section-label">
          User Management
        </span>

        <h1>
          Manage
          <span className="gradient-text">
            {" "}users.
          </span>
        </h1>

        <p>
          Control account access and administrator privileges.
        </p>

      </div>


      {error && (
        <div className="admin-message admin-message-error">
          {error}
        </div>
      )}


      <div className="admin-users-list">

        {users.map(
          (user) => (
            <article
              key={user.id}
              className="admin-user-card glass-card"
            >

              <div className="admin-user-card-main">

                <div className="admin-lead-avatar">
                  <UserRound size={20} />
                </div>

                <div>
                  <h3>
                    {user.full_name}
                  </h3>

                  <p>
                    {user.email}
                  </p>

                  <span>
                    User #{user.id}
                  </span>
                </div>

              </div>


              <div className="admin-user-badges">

                <span
                  className={
                    user.is_active
                      ? "admin-status-badge active"
                      : "admin-status-badge inactive"
                  }
                >
                  {user.is_active
                    ? "Active"
                    : "Disabled"}
                </span>


                {user.is_admin && (
                  <span className="admin-featured-badge">
                    <ShieldCheck size={11} />
                    Admin
                  </span>
                )}

              </div>


              <div className="admin-user-actions">

                <button
                  type="button"
                  disabled={
                    updatingId === user.id
                  }
                  className={
                    user.is_active
                      ? "admin-power-button disable"
                      : "admin-power-button enable"
                  }
                  onClick={() =>
                    void toggleActive(user)
                  }
                >
                  {user.is_active
                    ? "Disable"
                    : "Enable"}
                </button>


                <button
                  type="button"
                  disabled={
                    updatingId === user.id
                  }
                  className="admin-edit-button"
                  onClick={() =>
                    void toggleAdmin(user)
                  }
                >
                  {user.is_admin
                    ? "Remove Admin"
                    : "Make Admin"}
                </button>

              </div>

            </article>
          )
        )}

      </div>

    </AdminShell>
  );
}