"use client";

import {
  Check,
  CirclePlus,
  Pencil,
  Power,
  Settings,
  X,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";

import {
  createAdminService,
  getAdminServices,
  updateAdminService,
} from "@/lib/admin";

import {
  useAuth,
} from "@/hooks/useAuth";

import type {
  Service,
} from "@/types/api";


type ServiceForm = {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  is_active: boolean;
};


const emptyForm: ServiceForm = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  is_active: true,
};


function createSlug(
  value: string
) {
  return value
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    );
}


export default function AdminServicesPage() {
  const router =
    useRouter();

  const {
    user,
    loading: authLoading,
    authenticated,
  } = useAuth();


  const [
    services,
    setServices,
  ] = useState<Service[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingService,
    setEditingService,
  ] = useState<Service | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<ServiceForm>(
    emptyForm
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

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
    async function loadServices() {
      if (
        authLoading ||
        !user?.is_admin
      ) {
        return;
      }

      try {
        const data =
          await getAdminServices();

        setServices(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load services"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadServices();
  }, [
    authLoading,
    user,
  ]);


  function openCreateForm() {
    setEditingService(null);

    setForm(
      emptyForm
    );

    setError("");
    setSuccess("");
    setShowForm(true);
  }


  function openEditForm(
    service: Service
  ) {
    setEditingService(
      service
    );

    setForm({
      name:
        service.name,

      slug:
        service.slug,

      short_description:
        service.short_description,

      description:
        service.description,

      is_active:
        service.is_active,
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  }


  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingService(null);

    setForm(
      emptyForm
    );
  }


  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingService) {
        const updated =
          await updateAdminService(
            editingService.slug,
            form
          );

        setServices(
          (current) =>
            current.map(
              (service) =>
                service.id ===
                updated.id
                  ? updated
                  : service
            )
        );

        setSuccess(
          "Service updated successfully."
        );
      } else {
        const created =
          await createAdminService(
            form
          );

        setServices(
          (current) => [
            ...current,
            created,
          ]
        );

        setSuccess(
          "Service created successfully."
        );
      }

      setShowForm(false);

      setEditingService(
        null
      );

      setForm(
        emptyForm
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save service"
      );
    } finally {
      setSaving(false);
    }
  }


  async function toggleService(
    service: Service
  ) {
    setUpdatingId(
      service.id
    );

    setError("");
    setSuccess("");

    try {
      const updated =
        await updateAdminService(
          service.slug,
          {
            is_active:
              !service.is_active,
          }
        );

      setServices(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              updated.id
                ? updated
                : item
          )
      );

      setSuccess(
        updated.is_active
          ? `${updated.name} activated.`
          : `${updated.name} disabled.`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update service"
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
        Loading AXION services...
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

      <div className="admin-management-header">

        <div className="admin-page-heading">

          <span className="section-label">
            Content Management
          </span>

          <h1>
            Manage
            <span className="gradient-text">
              {" "}services.
            </span>
          </h1>

          <p>
            Control the services
            displayed across the AXION
            website.
          </p>

        </div>


        <button
          type="button"
          className="admin-primary-button"
          onClick={
            openCreateForm
          }
        >
          <CirclePlus
            size={17}
          />

          Add Service
        </button>

      </div>


      {error && (
        <div className="admin-message admin-message-error">
          {error}
        </div>
      )}


      {success && (
        <div className="admin-message admin-message-success">
          <Check size={16} />
          {success}
        </div>
      )}


      <div className="admin-services-grid">

        {services.length === 0 && (
          <div className="admin-empty-state glass-card">
            No services found.
          </div>
        )}


        {services.map(
          (service) => (
            <article
              key={
                service.id
              }
              className="admin-service-card glass-card"
            >

              <div className="admin-service-card-top">

                <div className="admin-service-icon">
                  <Settings
                    size={20}
                  />
                </div>


                <span
                  className={
                    service.is_active
                      ? "admin-status-badge active"
                      : "admin-status-badge inactive"
                  }
                >
                  {service.is_active
                    ? "Active"
                    : "Disabled"}
                </span>

              </div>


              <span className="admin-service-slug">
                /
                {
                  service.slug
                }
              </span>


              <h3>
                {service.name}
              </h3>


              <p>
                {
                  service.short_description
                }
              </p>


              <div className="admin-service-actions">

                <button
                  type="button"
                  className="admin-edit-button"
                  onClick={() =>
                    openEditForm(
                      service
                    )
                  }
                >
                  <Pencil
                    size={15}
                  />

                  Edit
                </button>


                <button
                  type="button"
                  disabled={
                    updatingId ===
                    service.id
                  }
                  className={
                    service.is_active
                      ? "admin-power-button disable"
                      : "admin-power-button enable"
                  }
                  onClick={() =>
                    void toggleService(
                      service
                    )
                  }
                >
                  <Power
                    size={15}
                  />

                  {updatingId ===
                  service.id
                    ? "Updating..."
                    : service.is_active
                      ? "Disable"
                      : "Enable"}
                </button>

              </div>

            </article>
          )
        )}

      </div>


      {showForm && (
        <div
          className="admin-modal-backdrop"
          onMouseDown={
            closeForm
          }
        >

          <div
            className="admin-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>
                <span className="section-label">
                  {editingService
                    ? "Edit Service"
                    : "New Service"}
                </span>

                <h2>
                  {editingService
                    ? editingService.name
                    : "Create service"}
                </h2>
              </div>


              <button
                type="button"
                className="admin-modal-close"
                onClick={
                  closeForm
                }
              >
                <X
                  size={20}
                />
              </button>

            </div>


            <form
              className="admin-service-form"
              onSubmit={
                handleSubmit
              }
            >

              <label>
                Service name

                <input
                  required
                  minLength={2}
                  maxLength={200}
                  value={
                    form.name
                  }
                  onChange={(
                    event
                  ) => {
                    const name =
                      event.target.value;

                    setForm(
                      (current) => ({
                        ...current,
                        name,

                        slug:
                          editingService
                            ? current.slug
                            : createSlug(
                                name
                              ),
                      })
                    );
                  }}
                  placeholder="AI Consulting"
                />
              </label>


              <label>
                Slug

                <input
                  required
                  minLength={2}
                  maxLength={200}
                  value={
                    form.slug
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,

                        slug:
                          createSlug(
                            event.target.value
                          ),
                      })
                    )
                  }
                  placeholder="ai-consulting"
                />
              </label>


              <label className="admin-form-full">
                Short description

                <textarea
                  required
                  minLength={10}
                  maxLength={300}
                  rows={3}
                  value={
                    form.short_description
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,

                        short_description:
                          event.target.value,
                      })
                    )
                  }
                />
              </label>


              <label className="admin-form-full">
                Full description

                <textarea
                  required
                  minLength={20}
                  maxLength={5000}
                  rows={6}
                  value={
                    form.description
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,

                        description:
                          event.target.value,
                      })
                    )
                  }
                />
              </label>


              <label className="admin-toggle-row">

                <input
                  type="checkbox"
                  checked={
                    form.is_active
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,

                        is_active:
                          event.target.checked,
                      })
                    )
                  }
                />

                <span>
                  Service is active
                </span>

              </label>


              <div className="admin-form-actions">

                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={
                    closeForm
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="admin-primary-button"
                >
                  {saving
                    ? "Saving..."
                    : editingService
                      ? "Save Changes"
                      : "Create Service"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </AdminShell>
  );
}