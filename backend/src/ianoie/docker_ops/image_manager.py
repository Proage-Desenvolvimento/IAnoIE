import docker
from docker import DockerClient


class ImageManager:
    def __init__(self, client: DockerClient):
        self.client = client

    def pull(self, image: str, tag: str = "latest") -> docker.models.images.Image:
        full_image = f"{image}:{tag}"
        return self.client.images.pull(full_image)

    def build(
        self, context: str, dockerfile: str, tag: str
    ) -> docker.models.images.Image:
        """Build an image from a local Dockerfile context (operator-built images).

        ``context`` is an absolute path (resolved against BUILD_CONTEXT_ROOT by the
        caller) readable from this container; the Docker SDK TARs it and sends it to
        the daemon. Builds for the daemon's native arch (= host arch). ``rm=True``
        removes intermediate layers on success, ``forcerm=True`` on failure.
        """
        image, _logs = self.client.images.build(
            path=context,
            dockerfile=dockerfile,
            tag=tag,
            rm=True,
            forcerm=True,
        )
        return image

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
