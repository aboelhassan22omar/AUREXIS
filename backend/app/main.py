from fastapi import (
    FastAPI,
    Request,
)

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from starlette.middleware.trustedhost import (
    TrustedHostMiddleware,
)

from app.api.router import api_router
from app.core.config import settings


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "Backend API for AUREXIS AI, software, automation "
            "and cybersecurity platform."
        ),

        docs_url=(
            "/docs"
            if settings.DEBUG
            else None
        ),

        redoc_url=(
            "/redoc"
            if settings.DEBUG
            else None
        ),

        openapi_url=(
            "/openapi.json"
            if settings.DEBUG
            else None
        ),
    )


    application.add_middleware(
        TrustedHostMiddleware,

        allowed_hosts=
            settings.allowed_hosts_list,

        www_redirect=False,
    )


    application.add_middleware(
        CORSMiddleware,

        allow_origins=[
            settings.FRONTEND_URL,
        ],

        allow_credentials=True,

        allow_methods=[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
        ],

        allow_headers=[
            "Authorization",
            "Content-Type",
            "Accept",
            "X-AUREXIS-Guest-Session",
        ],
    )


    @application.middleware(
        "http"
    )
    async def security_headers(
        request: Request,
        call_next,
    ):
        response = await call_next(
            request
        )

        response.headers[
            "X-Content-Type-Options"
        ] = "nosniff"

        response.headers[
            "X-Frame-Options"
        ] = "DENY"

        response.headers[
            "Referrer-Policy"
        ] = (
            "strict-origin-when-cross-origin"
        )

        response.headers[
            "Permissions-Policy"
        ] = (
            "camera=(), "
            "microphone=(), "
            "geolocation=()"
        )

        response.headers[
            "Cross-Origin-Opener-Policy"
        ] = "same-origin"

        return response


    application.include_router(
        api_router,
        prefix=settings.API_V1_PREFIX,
    )

    return application


app = create_application()


@app.get(
    "/",
    tags=["Root"],
    include_in_schema=False,
)
def root() -> dict:
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",

        "docs": (
            "/docs"
            if settings.DEBUG
            else None
        ),
    }