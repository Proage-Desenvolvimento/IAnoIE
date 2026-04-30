import docker
from docker import DockerClient


class VolumeManager:
    def __init__(self, client: DockerClient):
        self.client = client

    def create(self, installation_id: int, name: str, mount_path: str) -> str:
        full_name = f"ianoie-{installation_id}-{name}"
        try:
            self.client.volumes.get(full_name)
        except docker.errors.NotFound:
            self.client.volumes.create(
                full_name,
                labels={
                    "ianoie.managed": "true",
                    "ianoie.installation_id": str(installation_id),
                    "ianoie.mount_path": mount_path,
                },
            )
        return full_name

    def remove_installation_volumes(self, installation_id: int) -> None:
        volumes = self.client.volumes.list(
            filters={"label": f"ianoie.installation_id={installation_id}"}
        )
        for vol in volumes:
            try:
                vol.remove()
            except docker.errors.APIError:
                pass
