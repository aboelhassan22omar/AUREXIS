"use client";

import {
  Building2,
  Mail,
  MessageSquareText,
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
  getAdminContacts,
  updateContactStatus,
} from "@/lib/admin";

import {
  useAuth,
} from "@/hooks/useAuth";

import type {
  ContactResponse,
} from "@/types/api";


const statusOptions = [
  "new",
  "contacted",
  "qualified",
  "closed",
  "spam",
];


export default function AdminLeadsPage() {
  const router =
    useRouter();

  const {
    user,
    loading: authLoading,
    authenticated,
  } = useAuth();

  const [
    contacts,
    setContacts,
  ] = useState<ContactResponse[]>([]);

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
      user &&
      !user.is_admin
    ) {
      router.replace(
        "/dashboard"
      );
    }
  }, [
    authLoading,
    authenticated,
    router,
    user,
  ]);


  useEffect(() => {
    async function loadContacts() {
      if (
        authLoading ||
        !user?.is_admin
      ) {
        return;
      }

      try {
        const data =
          await getAdminContacts();

        setContacts(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load leads"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadContacts();
  }, [
    authLoading,
    user,
  ]);


  async function handleStatusChange(
    contactId: number,
    status: string
  ) {
    setUpdatingId(
      contactId
    );

    try {
      const updated =
        await updateContactStatus(
          contactId,
          status
        );

      setContacts(
        (
          current
        ) =>
          current.map(
            (
              contact
            ) =>
              contact.id ===
              updated.id
                ? updated
                : contact
          )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update lead"
      );
    } finally {
      setUpdatingId(
        null
      );
    }
  }


  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="admin-access-loading">
        Loading AXION leads...
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

      <div className="admin-page-heading">

        <span className="section-label">
          Leads Inbox
        </span>

        <h1>
          Customer
          <span className="gradient-text">
            {" "}inquiries.
          </span>
        </h1>

        <p>
          Review incoming project
          requests and update their
          status.
        </p>
      </div>


      {error && (
        <p className="admin-error">
          {error}
        </p>
      )}


      <div className="admin-leads-list">

        {contacts.length === 0 && (
          <div className="admin-empty-state glass-card">
            No leads yet.
          </div>
        )}


        {contacts.map(
          (contact) => (
            <article
              key={
                contact.id
              }
              className="admin-lead-card glass-card"
            >

              <div className="admin-lead-top">

                <div className="admin-lead-person">

                  <div className="admin-lead-avatar">
                    <UserRound
                      size={20}
                    />
                  </div>

                  <div>
                    <h3>
                      {
                        contact.name
                      }
                    </h3>

                    <span>
                      Lead #
                      {
                        contact.id
                      }
                    </span>
                  </div>

                </div>


                <select
                  value={
                    contact.status
                  }
                  disabled={
                    updatingId ===
                    contact.id
                  }
                  onChange={(
                    event
                  ) =>
                    void handleStatusChange(
                      contact.id,
                      event.target.value
                    )
                  }
                  className="admin-status-select"
                >
                  {statusOptions.map(
                    (
                      status
                    ) => (
                      <option
                        key={
                          status
                        }
                        value={
                          status
                        }
                      >
                        {
                          status
                        }
                      </option>
                    )
                  )}
                </select>

              </div>


              <div className="admin-lead-meta">

                <div>
                  <Mail
                    size={15}
                  />

                  {
                    contact.email
                  }
                </div>


                {contact.company && (
                  <div>
                    <Building2
                      size={15}
                    />

                    {
                      contact.company
                    }
                  </div>
                )}

              </div>


              <div className="admin-lead-message">

                <MessageSquareText
                  size={17}
                />

                <p>
                  {
                    contact.message
                  }
                </p>

              </div>


              <div className="admin-lead-date">
                {new Date(
                  contact.created_at
                ).toLocaleString()}
              </div>

            </article>
          )
        )}

      </div>

    </AdminShell>
  );
}