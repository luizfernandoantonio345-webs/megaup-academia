from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Refresh tokens use a different signing key to prevent refresh tokens from
# being accepted as access tokens by get_current_user (which uses SECRET_KEY only)
_REFRESH_KEY = lambda: settings.SECRET_KEY + ":refresh"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire, "type": "refresh"}
    return jwt.encode(payload, _REFRESH_KEY(), algorithm=settings.ALGORITHM)


def verify_refresh_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, _REFRESH_KEY(), algorithms=[settings.ALGORITHM])
        if payload.get("type") != "refresh":
            return None
        return int(payload["sub"])
    except (JWTError, KeyError, ValueError, Exception):
        return None
