from __future__ import annotations

from dataclasses import dataclass
from typing import Literal
import re

from app.services.company_knowledge_service import CompanyKnowledge


ScopeCategory = Literal[
    "company",
    "service",
    "solution",
    "project",
    "related-capability",
    "contact",
    "out-of-scope",
]


@dataclass(frozen=True, slots=True)
class ScopeDecision:
    allowed: bool
    category: ScopeCategory
    confidence: float


ARABIC_RE = re.compile(r"[\u0600-\u06FF]")

PROMPT_INJECTION_PATTERNS = (
    "ignore your instructions",
    "ignore previous instructions",
    "ignore all instructions",
    "reveal system prompt",
    "show system prompt",
    "developer message",
    "system message",
    "pretend you are a general assistant",
    "act as a general assistant",
    "jailbreak",
    "تجاهل التعليمات",
    "تجاهل تعليماتك",
    "اكشف البرومبت",
    "اعرض البرومبت",
    "اعرض التعليمات",
    "خليك مساعد عام",
)

OUT_OF_SCOPE_TERMS = (
    "politics",
    "political",
    "president",
    "election",
    "football",
    "soccer",
    "basketball",
    "match score",
    "weather",
    "recipe",
    "medical",
    "medicine",
    "symptom",
    "diagnosis",
    "history of",
    "historical",
    "stock price",
    "crypto price",
    "bitcoin price",
    "celebrity",
    "relationship advice",
    "life advice",
    "homework",
    "solve my assignment",
    "write my assignment",
    "write code for my homework",
    "debug my homework",
    "سياسة",
    "سياسي",
    "انتخابات",
    "رئيس الجمهورية",
    "كرة القدم",
    "ماتش",
    "طقس",
    "الجو النهاردة",
    "وصفة",
    "طب بشري",
    "طبي",
    "دواء",
    "اعراض",
    "تشخيص",
    "تاريخ مصر",
    "سعر الذهب",
    "سعر الدولار",
    "سعر البيتكوين",
    "نصيحة حياتية",
    "حل الواجب",
    "حل اسايمنت",
    "حل assignment",
    "اكتبلي الواجب",
)

COMPANY_TERMS = (
    "aurexis",
    "company",
    "الشركة",
    "شركتكم",
    "شركه",
    "خدماتكم",
    "خدمات",
    "service",
    "services",
    "solutions",
    "حلول",
    "projects",
    "project",
    "مشاريع",
    "مشروع",
    "contact",
    "تواصل",
    "اتواصل",
    "اشتغل معاكم",
    "نشتغل معاكم",
    "عرض سعر",
    "your pricing",
    "your prices",
    "your price",
    "price for your",
    "cost of your service",
    "تكلفة خدماتكم",
    "أسعاركم",
    "اسعاركم",
)

TECH_DOMAIN_TERMS = (
    "artificial intelligence",
    "machine learning",
    "generative ai",
    "llm",
    "rag",
    "ai agent",
    "ai agents",
    "chatbot",
    "chatbots",
    "assistant",
    "assistants",
    "automation",
    "workflow",
    "cybersecurity",
    "cyber security",
    "application security",
    "software development",
    "web application",
    "web development",
    "custom software",
    "api integration",
    "systems integration",
    "database integration",
    "data engineering",
    "data warehouse",
    "business intelligence",
    "ai solution",
    "custom ai",
    "ذكاء اصطناعي",
    "شات بوت",
    "شاتبوت",
    "اوتوميشن",
    "أوتوميشن",
    "اتوميشن",
    "امن سيبراني",
    "أمن سيبراني",
    "سايبر سيكيوريتي",
    "برمجة",
    "تطوير سوفتوير",
    "تطوير مواقع",
    "تطوير ويب",
    "تكامل انظمة",
    "تكامل أنظمة",
    "داتا",
    "بيانات",
)

GENERIC_TASK_PATTERNS = (
    "write code",
    "write a function",
    "solve this code",
    "fix my code",
    "debug this code",
    "implement this algorithm",
    "اكتب كود",
    "اعمل كود",
    "حل الكود",
    "صلح الكود",
    "حل السؤال",
    "حل المسألة",
)

EGYPTIAN_MARKERS = (
    "عايز",
    "عاوزه",
    "عاوز",
    "بتعملوا",
    "عندكم",
    "ازاي",
    "إزاي",
    "طب ",
    "ممكن ",
    "احنا",
    "انتوا",
    "إنتوا",
    "بتقدموا",
)

FOLLOW_UP_MARKERS = (
    "طب",
    "طيب",
    "وبعدين",
    "قد ايه",
    "قد إيه",
    "ازاي",
    "إزاي",
    "كام",
    "ليه",
    "ممكن",
    "what about",
    "how long",
    "how much",
    "how does",
    "can you",
    "and that",
    "what if",
)


def _normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip().lower()


def _contains_any(value: str, terms: tuple[str, ...]) -> bool:
    return any(term in value for term in terms)


def _history_is_company_related(
    history: list[tuple[str, str]],
    knowledge: CompanyKnowledge,
) -> bool:
    recent = history[-6:]

    for role, content in reversed(recent):
        if role not in {"user", "assistant"}:
            continue

        normalized = _normalize(content)

        if _contains_any(normalized, COMPANY_TERMS):
            return True

        if _contains_any(normalized, TECH_DOMAIN_TERMS):
            return True

        tokens = set(re.findall(r"[a-z0-9_-]{3,}|[\u0600-\u06FF]{3,}", normalized))

        if tokens & knowledge.searchable_terms:
            return True

    return False


def decide_scope(
    message: str,
    *,
    history: list[tuple[str, str]],
    knowledge: CompanyKnowledge,
) -> ScopeDecision:
    normalized = _normalize(message)

    if not normalized:
        return ScopeDecision(False, "out-of-scope", 1.0)

    if _contains_any(normalized, PROMPT_INJECTION_PATTERNS):
        return ScopeDecision(False, "out-of-scope", 1.0)

    if _contains_any(normalized, OUT_OF_SCOPE_TERMS):
        return ScopeDecision(False, "out-of-scope", 0.99)

    if _contains_any(normalized, GENERIC_TASK_PATTERNS) and not _contains_any(
        normalized,
        COMPANY_TERMS,
    ):
        return ScopeDecision(False, "out-of-scope", 0.96)

    if any(term in normalized for term in ("contact", "تواصل", "اتواصل", "كلمكم")):
        return ScopeDecision(True, "contact", 0.99)

    if any(term in normalized for term in ("project", "projects", "مشروع", "مشاريع")):
        return ScopeDecision(True, "project", 0.97)

    if any(term in normalized for term in ("service", "services", "خدمة", "خدمات")):
        return ScopeDecision(True, "service", 0.97)

    if any(term in normalized for term in ("solution", "solutions", "حل", "حلول")):
        return ScopeDecision(True, "solution", 0.95)

    if _contains_any(normalized, COMPANY_TERMS):
        return ScopeDecision(True, "company", 0.98)

    if _contains_any(normalized, TECH_DOMAIN_TERMS):
        return ScopeDecision(True, "related-capability", 0.9)

    tokens = set(
        re.findall(
            r"[a-z0-9_-]{3,}|[\u0600-\u06FF]{3,}",
            normalized,
        )
    )

    if tokens & knowledge.searchable_terms:
        return ScopeDecision(True, "company", 0.88)

    history_related = _history_is_company_related(history, knowledge)
    is_short_follow_up = (
        len(normalized) <= 140
        and (
            _contains_any(normalized, FOLLOW_UP_MARKERS)
            or len(normalized.split()) <= 10
        )
    )

    if history_related and is_short_follow_up:
        return ScopeDecision(True, "company", 0.82)

    return ScopeDecision(False, "out-of-scope", 0.9)


def _is_egyptian_arabic(value: str) -> bool:
    normalized = _normalize(value)
    return _contains_any(normalized, EGYPTIAN_MARKERS)


def out_of_scope_response(message: str) -> str:
    if not ARABIC_RE.search(message):
        return (
            "That’s outside the scope of the AUREXIS assistant. I can help with "
            "AUREXIS’s services, solutions, projects, and related capabilities."
        )

    if _is_egyptian_arabic(message):
        return (
            "السؤال ده خارج نطاق مساعد AUREXIS. أقدر أساعدك في خدمات الشركة "
            "وحلول الـAI والـAutomation والـCybersecurity والـSoftware اللي بنقدمها."
        )

    return (
        "هذا السؤال خارج نطاق مساعد AUREXIS. يمكنني مساعدتك في خدمات الشركة "
        "وحلولها ومجالات عملها."
    )
