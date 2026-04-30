from fastapi import HTTPException, status


class AppNotFound(HTTPException):
    def __init__(self, slug: str):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"App '{slug}' not found")


class InstallationNotFound(HTTPException):
    def __init__(self, installation_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Installation {installation_id} not found",
        )


class InstallationConflict(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="This app is already installed",
        )


class GPUUnavailable(HTTPException):
    def __init__(self, detail: str = "No GPU available"):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)


class InvalidCredentials(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
