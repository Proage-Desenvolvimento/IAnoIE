import docker
from docker import DockerClient


class ImageManager:
    def __init__(self, client: DockerClient):
        self.client = client

    def pull(self, image: str, tag: str = "latest") -> docker.models.images.Image:
        full_image = f"{image}:{tag}"
        return self.client.images.pull(full_image)

    def get(self, image: str) -> docker.models.images.Image | None:
        try:
            return self.client.images.get(image)
        except docker.errors.ImageNotFound:
            return None

    def exists(self, image: str) -> bool:
        return self.get(image) is not None

    def remove(self, image: str) -> None:
        try:
            self.client.images.remove(image)
        except docker.errors.ImageNotFound:
            pass
