import os
import time
from datetime import datetime
from typing import Any, Dict, Optional, Tuple, Set

from services.redis_client import cache

GUEST_SESSION_TTL_SECONDS = int(os.getenv("GUEST_SESSION_TTL_SECONDS", "86400"))  # 24 hours
GUEST_UPLOAD_COOLDOWN_DAYS = int(os.getenv("GUEST_UPLOAD_COOLDOWN_DAYS", "28"))
GUEST_UPLOAD_COOLDOWN_SECONDS = GUEST_UPLOAD_COOLDOWN_DAYS * 24 * 3600


def _parse_bypass_ips() -> Set[str]:
    raw = os.getenv("GUEST_UPLOAD_BYPASS_IPS", "")
    if not raw:
        return set()
    return {ip.strip() for ip in raw.split(",") if ip.strip()}


_guest_upload_bypass_ips = _parse_bypass_ips()

_local_sessions: Dict[str, Dict[str, Any]] = {}
_local_ip_locks: Dict[str, float] = {}


def _cleanup_local_sessions() -> None:
    if not _local_sessions:
        return
    now = time.time()
    expired = [
        session_id
        for session_id, payload in _local_sessions.items()
        if now - payload.get("_stored_at", now) > GUEST_SESSION_TTL_SECONDS
    ]
    for session_id in expired:
        _local_sessions.pop(session_id, None)


def reserve_guest_upload_slot(ip_address: str) -> Optional[int]:
    """
    Reserve a guest upload slot for an IP address.
    Returns remaining seconds if blocked, or None if allowed.
    """
    now = time.time()
    ttl = GUEST_UPLOAD_COOLDOWN_SECONDS

    if ip_address and ip_address in _guest_upload_bypass_ips:
        return None

    if cache.enabled:
        key = f"guest_upload_ip:{ip_address}"
        record = cache.get(key)
        if record:
            reset_at = record.get("reset_at", now)
            remaining = max(0, int(reset_at - now))
            return remaining

        cache.set(
            key,
            {"ip": ip_address, "reset_at": now + ttl},
            ttl=ttl,
        )
        return None

    # Fallback to in-memory tracking
    expires_at = _local_ip_locks.get(ip_address, 0)
    if expires_at > now:
        return max(0, int(expires_at - now))

    _local_ip_locks[ip_address] = now + ttl
    return None


def store_guest_session(session_id: str, data: Dict[str, Any]) -> None:
    payload = {**data, "_stored_at": time.time()}

    if cache.enabled:
        cache.set(
            f"guest_session:{session_id}",
            payload,
            ttl=GUEST_SESSION_TTL_SECONDS,
        )
        return

    _cleanup_local_sessions()
    _local_sessions[session_id] = payload


def get_guest_session(session_id: str) -> Optional[Dict[str, Any]]:
    if cache.enabled:
        session = cache.get(f"guest_session:{session_id}")
        return session

    _cleanup_local_sessions()
    return _local_sessions.get(session_id)

