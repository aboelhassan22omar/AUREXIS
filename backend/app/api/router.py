from fastapi import APIRouter

from app.api.routes import (
    auth,
    contact,
    health,
    projects,
    services,
)

from app.api.routes.admin import (
    contacts as admin_contacts,
)

from app.api.routes.admin import (
    overview as admin_overview,
)

from app.api.routes.admin import (
    projects as admin_projects,
)

from app.api.routes.admin import (
    services as admin_services,
)

from app.api.routes.admin import (
    users as admin_users,
)


api_router = APIRouter()


# Public API

api_router.include_router(
    health.router
)

api_router.include_router(
    auth.router
)

api_router.include_router(
    contact.router
)

api_router.include_router(
    services.router
)

api_router.include_router(
    projects.router
)


# Admin API

api_router.include_router(
    admin_overview.router
)

api_router.include_router(
    admin_contacts.router
)

api_router.include_router(
    admin_services.router
)

api_router.include_router(
    admin_projects.router
)

api_router.include_router(
    admin_users.router
)