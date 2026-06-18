from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose.exceptions import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from ianoie.core.security import verify_token
from ianoie.database import get_db
from ianoie.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    from sqlalchemy import select

    try:
        payload = verify_token(token)
    except JWTError:
        # Token expirado (ExpiredSignatureError) ou malformado/inválido → 401, não 500.
        # Sem isso a exceção do jose propaga e o frontend (que só redireciona em 401) não volta pro login.
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return user
