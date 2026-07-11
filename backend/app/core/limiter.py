import os
from slowapi import Limiter


def _get_client_ip(request) -> str:
    # Render (and most proxies) sets X-Forwarded-For with the real client IP first.
    # Falling back to direct TCP address when the header is absent (local dev).
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


_default = ["99999/minute"] if os.getenv("TESTING") == "1" else ["200/minute"]
limiter = Limiter(key_func=_get_client_ip, default_limits=_default)
