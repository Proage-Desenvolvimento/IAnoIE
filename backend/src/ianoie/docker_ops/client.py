import docker
from docker import DockerClient

from ianoie.config import settings

_client: DockerClient | None = None


def get_docker_client() -> DockerClient:
    global _client
    if _client is None:
        _client = docker.DockerClient(
            base_url=settings.docker_host,
            timeout=settings.docker_timeout,
        )
    return _client
