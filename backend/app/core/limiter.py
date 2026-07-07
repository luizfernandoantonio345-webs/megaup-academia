import os
from slowapi import Limiter
from slowapi.util import get_remote_address

# Em modo de teste usa limites altíssimos para não interferir nos testes
_default = ["99999/minute"] if os.getenv("TESTING") == "1" else ["200/minute"]
limiter = Limiter(key_func=get_remote_address, default_limits=_default)
