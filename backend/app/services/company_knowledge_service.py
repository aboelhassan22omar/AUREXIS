from __future__ import annotations

from dataclasses import dataclass
import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.service import Service


ABOUT_CONTEXT = (
    "AUREXIS is a technology company focused on artificial intelligence, "
    "cybersecurity, automation, software engineering, and custom digital "
    "solutions built around real-world business problems. AUREXIS applies AI "
    "where it genuinely improves a system and treats security as part of the "
    "architecture rather than an afterthought."
)

SOLUTION_CONTEXT = (
    "AUREXIS starts by understanding the business problem, workflows, risks, "
    "and desired outcome. It then engineers the software, intelligence, "
    "automation, infrastructure, integrations, and security architecture as "
    "one solution, with maintainability, reliability, scalability, and "
    "practical operation in mind."
)

CONTACT_CONTEXT = (
    "People can contact AUREXIS through the Contact page at /contact to discuss "
    "a project, requirements, or a related custom solution. Do not invent "
    "pricing, delivery dates, guarantees, certifications, partners, clients, "
    "or contact details that are not present in the approved context."
)

RELATED_CAPABILITY_CONTEXT = (
    "If a requested capability is close to AUREXIS's approved domains but is not "
    "listed as an active service, describe it only as something AUREXIS may "
    "discuss as a custom implementation. Never present it as an existing "
    "service unless it is listed below."
)


@dataclass(frozen=True, slots=True)
class CompanyKnowledge:
    context: str
    service_names: tuple[str, ...]
    project_titles: tuple[str, ...]
    searchable_terms: frozenset[str]


def _clean(value: str, limit: int = 1200) -> str:
    normalized = re.sub(r"\s+", " ", value or "").strip()

    if len(normalized) <= limit:
        return normalized

    return normalized[: limit - 1].rstrip() + "…"


def _term_tokens(value: str) -> set[str]:
    return {
        token.lower()
        for token in re.findall(
            r"[A-Za-z0-9][A-Za-z0-9+.#_-]{2,}|[\u0600-\u06FF]{3,}",
            value,
        )
    }


def build_company_knowledge(db: Session) -> CompanyKnowledge:
    services = list(
        db.scalars(
            select(Service)
            .where(Service.is_active.is_(True))
            .order_by(Service.id.asc())
        ).all()
    )
    projects = list(
        db.scalars(
            select(Project)
            .where(Project.is_active.is_(True))
            .order_by(Project.id.asc())
        ).all()
    )

    sections: list[str] = [
        "APPROVED AUREXIS COMPANY CONTEXT",
        f"About: {ABOUT_CONTEXT}",
        f"Working approach: {SOLUTION_CONTEXT}",
        f"Contact: {CONTACT_CONTEXT}",
        f"Related capabilities: {RELATED_CAPABILITY_CONTEXT}",
    ]

    service_names: list[str] = []
    project_titles: list[str] = []
    searchable_terms: set[str] = {
        "aurexis",
        "ai",
        "automation",
        "cybersecurity",
        "security",
        "software",
        "chatbot",
        "chatbots",
        "assistant",
        "assistants",
        "integration",
        "integrations",
        "development",
        "custom",
        "service",
        "services",
        "solution",
        "solutions",
        "project",
        "projects",
        "company",
    }

    if services:
        sections.append("Active services:")

        for service in services:
            service_names.append(service.name)
            text = (
                f"- {service.name}: {_clean(service.short_description, 360)} "
                f"Details: {_clean(service.description)}"
            )
            sections.append(text)
            searchable_terms.update(_term_tokens(text))

    else:
        sections.append("Active services: none are currently published.")

    if projects:
        sections.append("Published projects:")

        for project in projects:
            project_titles.append(project.title)
            text = (
                f"- {project.title} [{project.category}]: "
                f"{_clean(project.short_description, 360)} "
                f"Details: {_clean(project.description)}"
            )
            sections.append(text)
            searchable_terms.update(_term_tokens(text))

    else:
        sections.append("Published projects: none are currently published.")

    context = "\n".join(sections)

    return CompanyKnowledge(
        context=context,
        service_names=tuple(service_names),
        project_titles=tuple(project_titles),
        searchable_terms=frozenset(searchable_terms),
    )
