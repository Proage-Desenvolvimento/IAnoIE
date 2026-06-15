from cryptography.fernet import Fernet

from ianoie.config import settings


def _get_fernet() -> Fernet:
    return Fernet(settings.encryption_key.encode())


def encrypt_api_key(plain: str) -> str:
    """Encrypt an API key using Fernet symmetric encryption."""
    f = _get_fernet()
    return f.encrypt(plain.encode()).decode()


def decrypt_api_key(encrypted: str) -> str:
    """Decrypt an API key using Fernet symmetric encryption."""
    f = _get_fernet()
    return f.decrypt(encrypted.encode()).decode()
