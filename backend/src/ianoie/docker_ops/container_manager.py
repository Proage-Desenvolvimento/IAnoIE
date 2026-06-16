import socket
import time
from dataclasses import dataclass, field

import docker
from docker import DockerClient
from docker.models.containers import Container


def wait_for_port(host: str, port: int, timeout: int = 180) -> bool:
    """TCP readiness probe from the worker to a container.

    The worker and managed containers share the ianoie-proxy network, so a
    container is reachable by name. Avoids depending on curl in the image.
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=3):
                return True
        except OSError:
            time.sleep(2)
    return False


@dataclass
class ContainerConfig:
    name: str
    image: str
    environment: dict[str, str] = field(default_factory=dict)
    labels: dict[str, str] = field(default_factory=dict)
    network: str = "ianoie-proxy"
    volumes: dict | None = None
    ports: dict | None = None
    gpu_device_ids: list[str] = field(default_factory=list)
    healthcheck: dict | None = None
    readiness_port: int | None = None
    restart_policy: str = "unless-stopped"
    command: list[str] | None = None
    memory_limit: str | None = None
    cpu_limit: float | None = None
    user: str | None = None


class ContainerManager:
    def __init__(self, client: DockerClient):
        self.client = client

    def create(self, config: ContainerConfig) -> Container:
        kwargs: dict = {
            "image": config.image,
            "name": config.name,
            "environment": config.environment,
            "labels": config.labels,
            "network": config.network,
            "restart_policy": {"Name": config.restart_policy},
            "detach": True,
            "security_opt": ["no-new-privileges:true"],
        }

        if config.volumes:
            kwargs["volumes"] = config.volumes
        if config.ports:
            kwargs["ports"] = config.ports
        if config.command:
            kwargs["command"] = config.command
        if config.memory_limit:
            kwargs["mem_limit"] = config.memory_limit
        if config.cpu_limit:
            kwargs["nano_cpus"] = int(config.cpu_limit * 1e9)
        if config.user:
            kwargs["user"] = config.user

        if config.gpu_device_ids:
            kwargs["device_requests"] = [
                docker.types.DeviceRequest(
                    count=len(config.gpu_device_ids),
                    device_ids=config.gpu_device_ids,
                    capabilities=[["gpu"]],
                )
            ]

        # NOTE: image-internal healthchecks (curl-based in our templates) are not
        # injected — readiness is gated by a TCP probe in the install task instead.
        return self.client.containers.create(**kwargs)

    def start(self, container_id: str) -> None:
        container = self.client.containers.get(container_id)
        container.start()

    def stop(self, container_id: str, timeout: int = 30) -> None:
        container = self.client.containers.get(container_id)
        container.stop(timeout=timeout)

    def remove(self, container_id: str, force: bool = True) -> None:
        container = self.client.containers.get(container_id)
        container.remove(force=force)

    def wait_healthy(self, container_id: str, timeout: int = 180) -> bool:
        container = self.client.containers.get(container_id)
        deadline = time.time() + timeout
        while time.time() < deadline:
            container.reload()
            health = container.attrs.get("State", {}).get("Health", {})
            status = health.get("Status")
            if status == "healthy":
                return True
            if status == "unhealthy":
                return False
            time.sleep(3)
        return False

    def list_managed(self, installation_id: int | None = None) -> list[Container]:
        labels = ["ianoie.managed=true"]
        if installation_id is not None:
            labels.append(f"ianoie.installation_id={installation_id}")
        return self.client.containers.list(all=True, filters={"label": labels})
