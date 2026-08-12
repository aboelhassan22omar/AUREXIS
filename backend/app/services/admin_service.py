from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.contact import Contact
from app.models.project import Project
from app.models.service import Service
from app.models.user import User


def get_admin_overview(
    db: Session,
) -> dict:
    total_users = db.scalar(
        select(
            func.count(User.id)
        )
    ) or 0

    active_users = db.scalar(
        select(
            func.count(User.id)
        ).where(
            User.is_active.is_(True)
        )
    ) or 0


    total_leads = db.scalar(
        select(
            func.count(Contact.id)
        )
    ) or 0

    new_leads = db.scalar(
        select(
            func.count(Contact.id)
        ).where(
            Contact.status == "new"
        )
    ) or 0


    total_services = db.scalar(
        select(
            func.count(Service.id)
        )
    ) or 0

    active_services = db.scalar(
        select(
            func.count(Service.id)
        ).where(
            Service.is_active.is_(True)
        )
    ) or 0


    total_projects = db.scalar(
        select(
            func.count(Project.id)
        )
    ) or 0

    active_projects = db.scalar(
        select(
            func.count(Project.id)
        ).where(
            Project.is_active.is_(True)
        )
    ) or 0

    featured_projects = db.scalar(
        select(
            func.count(Project.id)
        ).where(
            Project.is_featured.is_(True)
        )
    ) or 0


    recent_users = list(
        db.scalars(
            select(User)
            .order_by(
                User.created_at.desc()
            )
            .limit(5)
        ).all()
    )


    recent_contacts = list(
        db.scalars(
            select(Contact)
            .order_by(
                Contact.created_at.desc()
            )
            .limit(5)
        ).all()
    )


    return {
        "stats": {
            "total_users":
                total_users,

            "active_users":
                active_users,

            "total_leads":
                total_leads,

            "new_leads":
                new_leads,

            "total_services":
                total_services,

            "active_services":
                active_services,

            "total_projects":
                total_projects,

            "active_projects":
                active_projects,

            "featured_projects":
                featured_projects,
        },

        "recent_users":
            recent_users,

        "recent_contacts":
            recent_contacts,
    }