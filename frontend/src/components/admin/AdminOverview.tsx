"use client";

import {
  Activity,
  FolderKanban,
  Mail,
  Settings,
  Sparkles,
  Star,
  UserRound,
  Users,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getAdminOverview,
} from "@/lib/admin";

import type {
  AdminOverview as AdminOverviewType,
} from "@/types/admin";


export default function AdminOverview() {
  const [
    data,
    setData,
  ] = useState<AdminOverviewType | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    async function loadOverview() {
      try {
        const result =
          await getAdminOverview();

        setData(result);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load administration overview"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadOverview();
  }, []);


  if (loading) {
    return (
      <p className="admin-loading">
        Loading Aurexis administration...
      </p>
    );
  }


  if (
    error ||
    !data
  ) {
    return (
      <p className="admin-error">
        {error ||
          "Unable to load dashboard"}
      </p>
    );
  }


  const cards = [
    {
      label: "Total Users",
      value:
        data.stats.total_users,
      icon: Users,
    },

    {
      label: "Active Users",
      value:
        data.stats.active_users,
      icon: Activity,
    },

    {
      label: "Total Leads",
      value:
        data.stats.total_leads,
      icon: Mail,
    },

    {
      label: "New Leads",
      value:
        data.stats.new_leads,
      icon: Sparkles,
    },

    {
      label: "Active Services",
      value:
        data.stats.active_services,
      icon: Settings,
    },

    {
      label: "Active Projects",
      value:
        data.stats.active_projects,
      icon: FolderKanban,
    },

    {
      label: "Featured Projects",
      value:
        data.stats.featured_projects,
      icon: Star,
    },
  ];


  return (
    <>
      <div className="admin-page-heading">

        <span className="section-label">
          Administration
        </span>

        <h1>
          AUREXIS Control
          <span className="gradient-text">
            {" "}Center.
          </span>
        </h1>

        <p>
          Live platform overview
          across users, leads,
          services and projects.
        </p>

      </div>


      <div className="admin-stats">

        {cards.map(
          (card) => {
            const Icon =
              card.icon;

            return (
              <article
                key={
                  card.label
                }
                className="admin-stat-card glass-card"
              >
                <div className="admin-stat-icon">
                  <Icon
                    size={21}
                  />
                </div>

                <span>
                  {card.label}
                </span>

                <strong>
                  {card.value}
                </strong>
              </article>
            );
          }
        )}

      </div>


      <div className="admin-overview-panels">

        <section className="admin-overview-panel glass-card">

          <div className="admin-overview-panel-header">

            <div>
              <span className="section-label">
                Recent Activity
              </span>

              <h2>
                Latest leads
              </h2>
            </div>

            <Mail size={19} />

          </div>


          <div className="admin-overview-list">

            {data.recent_contacts.length ===
            0 ? (
              <p className="admin-overview-empty">
                No leads yet.
              </p>
            ) : (
              data.recent_contacts.map(
                (contact) => (
                  <div
                    key={
                      contact.id
                    }
                    className="admin-overview-row"
                  >
                    <div className="admin-overview-avatar">
                      <Mail
                        size={15}
                      />
                    </div>

                    <div className="admin-overview-row-main">

                      <strong>
                        {
                          contact.name
                        }
                      </strong>

                      <span>
                        {
                          contact.email
                        }
                      </span>

                    </div>


                    <span
                      className={`admin-overview-status ${contact.status}`}
                    >
                      {
                        contact.status
                      }
                    </span>

                  </div>
                )
              )
            )}

          </div>

        </section>


        <section className="admin-overview-panel glass-card">

          <div className="admin-overview-panel-header">

            <div>
              <span className="section-label">
                Accounts
              </span>

              <h2>
                Recent users
              </h2>
            </div>

            <Users size={19} />

          </div>


          <div className="admin-overview-list">

            {data.recent_users.length ===
            0 ? (
              <p className="admin-overview-empty">
                No users yet.
              </p>
            ) : (
              data.recent_users.map(
                (user) => (
                  <div
                    key={
                      user.id
                    }
                    className="admin-overview-row"
                  >

                    <div className="admin-overview-avatar">
                      <UserRound
                        size={15}
                      />
                    </div>


                    <div className="admin-overview-row-main">

                      <strong>
                        {
                          user.full_name
                        }
                      </strong>

                      <span>
                        {
                          user.email
                        }
                      </span>

                    </div>


                    <div className="admin-overview-user-flags">

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
                          Admin
                        </span>
                      )}

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </section>

      </div>
    </>
  );
}