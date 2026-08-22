"use client";

import {
  Check,
  CirclePlus,
  FolderKanban,
  Pencil,
  Power,
  Star,
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
  createAdminProject,
  getAdminProjects,
  updateAdminProject,
} from "@/lib/admin";

import {
  useAuth,
} from "@/hooks/useAuth";

import type {
  Project,
} from "@/types/api";


type ProjectForm = {
  title: string;
  slug: string;
  category: string;
  short_description: string;
  description: string;
  is_featured: boolean;
  is_active: boolean;
};


const emptyForm: ProjectForm = {
  title: "",
  slug: "",
  category: "",
  short_description: "",
  description: "",
  is_featured: false,
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


export default function AdminProjectsPage() {
  const router =
    useRouter();

  const {
    user,
    loading: authLoading,
    authenticated,
  } = useAuth();


  const [
    projects,
    setProjects,
  ] = useState<Project[]>([]);

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
    editingProject,
    setEditingProject,
  ] = useState<Project | null>(
    null
  );

  const [
    form,
    setForm,
  ] = useState<ProjectForm>(
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
    async function loadProjects() {
      if (
        authLoading ||
        !user?.is_admin
      ) {
        return;
      }

      try {
        const data =
          await getAdminProjects();

        setProjects(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load projects"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();
  }, [
    authLoading,
    user,
  ]);


  function openCreateForm() {
    setEditingProject(null);

    setForm(
      emptyForm
    );

    setError("");
    setSuccess("");
    setShowForm(true);
  }


  function openEditForm(
    project: Project
  ) {
    setEditingProject(
      project
    );

    setForm({
      title:
        project.title,

      slug:
        project.slug,

      category:
        project.category,

      short_description:
        project.short_description,

      description:
        project.description,

      is_featured:
        project.is_featured,

      is_active:
        project.is_active,
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

    setEditingProject(
      null
    );

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
      if (editingProject) {
        const updated =
          await updateAdminProject(
            editingProject.slug,
            form
          );

        setProjects(
          (current) =>
            current.map(
              (project) =>
                project.id ===
                updated.id
                  ? updated
                  : project
            )
        );

        setSuccess(
          "Project updated successfully."
        );
      } else {
        const created =
          await createAdminProject(
            form
          );

        setProjects(
          (current) => [
            ...current,
            created,
          ]
        );

        setSuccess(
          "Project created successfully."
        );
      }

      setShowForm(false);

      setEditingProject(
        null
      );

      setForm(
        emptyForm
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save project"
      );
    } finally {
      setSaving(false);
    }
  }


  async function toggleActive(
    project: Project
  ) {
    setUpdatingId(
      project.id
    );

    setError("");
    setSuccess("");

    try {
      const updated =
        await updateAdminProject(
          project.slug,
          {
            is_active:
              !project.is_active,
          }
        );

      setProjects(
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
          ? `${updated.title} activated.`
          : `${updated.title} disabled.`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update project"
      );
    } finally {
      setUpdatingId(null);
    }
  }


  async function toggleFeatured(
    project: Project
  ) {
    setUpdatingId(
      project.id
    );

    setError("");
    setSuccess("");

    try {
      const updated =
        await updateAdminProject(
          project.slug,
          {
            is_featured:
              !project.is_featured,
          }
        );

      setProjects(
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
        updated.is_featured
          ? `${updated.title} is now featured.`
          : `${updated.title} removed from featured projects.`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update featured status"
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
        Loading Aurexis projects...
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
              {" "}projects.
            </span>
          </h1>

          <p>
            Control the projects and
            capabilities displayed across
            the Aurexis website.
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

          Add Project
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


      <div className="admin-projects-grid">

        {projects.length === 0 && (
          <div className="admin-empty-state glass-card">
            No projects found.
          </div>
        )}


        {projects.map(
          (project) => (
            <article
              key={
                project.id
              }
              className="admin-project-card glass-card"
            >

              <div className="admin-project-card-top">

                <div className="admin-service-icon">
                  <FolderKanban
                    size={20}
                  />
                </div>


                <div className="admin-project-badges">

                  {project.is_featured && (
                    <span className="admin-featured-badge">
                      <Star size={11} />
                      Featured
                    </span>
                  )}


                  <span
                    className={
                      project.is_active
                        ? "admin-status-badge active"
                        : "admin-status-badge inactive"
                    }
                  >
                    {project.is_active
                      ? "Active"
                      : "Disabled"}
                  </span>

                </div>

              </div>


              <span className="admin-service-slug">
                /
                {
                  project.slug
                }
              </span>


              <span className="admin-project-category">
                {
                  project.category
                }
              </span>


              <h3>
                {
                  project.title
                }
              </h3>


              <p>
                {
                  project.short_description
                }
              </p>


              <div className="admin-project-actions">

                <button
                  type="button"
                  className="admin-edit-button"
                  onClick={() =>
                    openEditForm(
                      project
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
                    project.id
                  }
                  className={
                    project.is_featured
                      ? "admin-feature-button featured"
                      : "admin-feature-button"
                  }
                  onClick={() =>
                    void toggleFeatured(
                      project
                    )
                  }
                >
                  <Star
                    size={15}
                  />

                  {project.is_featured
                    ? "Unfeature"
                    : "Feature"}
                </button>


                <button
                  type="button"
                  disabled={
                    updatingId ===
                    project.id
                  }
                  className={
                    project.is_active
                      ? "admin-power-button disable"
                      : "admin-power-button enable"
                  }
                  onClick={() =>
                    void toggleActive(
                      project
                    )
                  }
                >
                  <Power
                    size={15}
                  />

                  {updatingId ===
                  project.id
                    ? "Updating..."
                    : project.is_active
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
                  {editingProject
                    ? "Edit Project"
                    : "New Project"}
                </span>

                <h2>
                  {editingProject
                    ? editingProject.title
                    : "Create project"}
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
                Project title

                <input
                  required
                  minLength={2}
                  maxLength={200}
                  value={
                    form.title
                  }
                  onChange={(
                    event
                  ) => {
                    const title =
                      event.target.value;

                    setForm(
                      (current) => ({
                        ...current,

                        title,

                        slug:
                          editingProject
                            ? current.slug
                            : createSlug(
                                title
                              ),
                      })
                    );
                  }}
                  placeholder="AI Operations Platform"
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
                  placeholder="ai-operations-platform"
                />
              </label>


              <label className="admin-form-full">
                Category

                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={
                    form.category
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (current) => ({
                        ...current,

                        category:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Artificial Intelligence"
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


              <div className="admin-form-options">

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
                    Project is active
                  </span>

                </label>


                <label className="admin-toggle-row">

                  <input
                    type="checkbox"
                    checked={
                      form.is_featured
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (current) => ({
                          ...current,

                          is_featured:
                            event.target.checked,
                        })
                      )
                    }
                  />

                  <span>
                    Featured on homepage
                  </span>

                </label>

              </div>


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
                    : editingProject
                      ? "Save Changes"
                      : "Create Project"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </AdminShell>
  );
}