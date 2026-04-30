from fastapi import APIRouter

from ianoie.api.v1.auth import router as auth_router
from ianoie.api.v1.apps import router as apps_router
from ianoie.api.v1.installations import router as installations_router
from ianoie.api.v1.jobs import router as jobs_router
from ianoie.api.v1.gpu import router as gpu_router
from ianoie.api.v1.logs import router as logs_router
from ianoie.api.v1.system import router as system_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(apps_router, prefix="/apps", tags=["apps"])
api_router.include_router(installations_router, prefix="/installations", tags=["installations"])
api_router.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
api_router.include_router(gpu_router, prefix="/gpu", tags=["gpu"])
api_router.include_router(logs_router, prefix="/ws", tags=["logs"])
api_router.include_router(system_router, prefix="/system", tags=["system"])
