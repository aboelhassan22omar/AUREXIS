from __future__ import annotations

from collections import defaultdict, deque
from ipaddress import ip_address
from threading import Lock
import re
import time

from fastapi import Request

from app.core.config import settings


_BUCKETS: dict[str, deque[float]] = defaultdict(deque)
_LOCK = Lock()
_SESSION_RE = re.compile(r"^[A-Za-z0-9_-]{8,80}$")


def _client_ip(request: Request) -> str:
    candidate = request.headers.get("x-real-ip", "").strip()

    if candidate:
        try:
            return str(ip_address(candidate))
        except ValueError:
            pass

    if request.client is not None:
        return request.client.host

    return "unknown"


def _session_part(value: str | None) -> str:
    if value and _SESSION_RE.fullmatch(value):
        return value

    return "anonymous"


def _consume_bucket(
    key: str,
    *,
    now: float,
    cutoff: float,
    limit: int,
) -> None:
    bucket = _BUCKETS[key]

    while bucket and bucket[0] < cutoff:
        bucket.popleft()

    if len(bucket) >= limit:
        raise RuntimeError(
            "Too many guest chat messages. Please wait a moment and try again."
        )

    bucket.append(now)


def enforce_guest_rate_limit(
    request: Request,
    anonymous_session_id: str | None,
) -> None:
    limit = settings.CHAT_RATE_LIMIT_PER_MINUTE

    if limit <= 0:
        return

    ip = _client_ip(request)
    session = _session_part(anonymous_session_id)
    now = time.monotonic()
    cutoff = now - 60.0

    with _LOCK:
        # Enforce both dimensions independently. Rotating the anonymous id
        # cannot bypass the IP bucket, while a single session is still
        # limited if its network address changes.
        _consume_bucket(
            f"ip:{ip}",
            now=now,
            cutoff=cutoff,
            limit=limit,
        )
        try:
            _consume_bucket(
                f"session:{session}",
                now=now,
                cutoff=cutoff,
                limit=limit,
            )
        except RuntimeError:
            # Do not count the rejected request twice in the IP bucket.
            ip_bucket = _BUCKETS[f"ip:{ip}"]
            if ip_bucket and ip_bucket[-1] == now:
                ip_bucket.pop()
            raise

        if len(_BUCKETS) > 4096:
            stale_keys = [
                item_key
                for item_key, item_bucket in list(_BUCKETS.items())[:1024]
                if not item_bucket or item_bucket[-1] < cutoff
            ]
            for item_key in stale_keys:
                _BUCKETS.pop(item_key, None)
