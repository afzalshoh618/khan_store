import time
from typing import Dict, Tuple
from fastapi import HTTPException, status, Request

# In-memory store for failed login attempts: { key: (failed_count, lockout_until_timestamp) }
_failed_attempts: Dict[str, Tuple[int, float]] = {}

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_SECONDS = 15 * 60  # 15 minutes


def check_login_rate_limit(request: Request, identifier: str):
    """
    Checks if an IP or Email identifier is currently locked out due to brute-force attempts.
    """
    client_ip = request.client.host if request.client else "unknown"
    key = f"{client_ip}:{identifier.lower().strip()}"
    now = time.time()

    if key in _failed_attempts:
        count, lockout_until = _failed_attempts[key]
        if now < lockout_until:
            remaining_minutes = int((lockout_until - now) // 60) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Juda ko'p noto'g'ri urinishlar kiritildi. Tizim xavfsizlik yuzasidan bloklandi. Iltimos, {remaining_minutes} daqiqadan so'ng qayta urinib ko'ring.",
            )
        elif now >= lockout_until:
            # Lockout expired, reset
            del _failed_attempts[key]


def record_failed_login_attempt(request: Request, identifier: str):
    """
    Records a failed login attempt. If attempts exceed MAX_FAILED_ATTEMPTS, locks out the identifier.
    """
    client_ip = request.client.host if request.client else "unknown"
    key = f"{client_ip}:{identifier.lower().strip()}"
    now = time.time()

    count, lockout_until = _failed_attempts.get(key, (0, 0.0))
    new_count = count + 1

    if new_count >= MAX_FAILED_ATTEMPTS:
        new_lockout = now + LOCKOUT_DURATION_SECONDS
        _failed_attempts[key] = (new_count, new_lockout)
    else:
        _failed_attempts[key] = (new_count, 0.0)


def reset_login_rate_limit(request: Request, identifier: str):
    """
    Resets failed login attempts upon successful authentication.
    """
    client_ip = request.client.host if request.client else "unknown"
    key = f"{client_ip}:{identifier.lower().strip()}"
    if key in _failed_attempts:
        del _failed_attempts[key]
