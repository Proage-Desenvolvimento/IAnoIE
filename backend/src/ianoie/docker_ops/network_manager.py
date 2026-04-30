import docker
from docker import DockerClient
from docker.models.networks import Network


class NetworkManager:
    PROXY_NETWORK = "ianoie-proxy"

    def __init__(self, client: DockerClient):
        self.client = client

    def ensure_proxy_network(self) -> Network:
        try:
            return self.client.networks.get(self.PROXY_NETWORK)
        except docker.errors.NotFound:
            return self.client.networks.create(
                self.PROXY_NETWORK,
                driver="bridge",
                labels={"ianoie.managed": "true"},
            )

    def remove_proxy_network(self) -> None:
        try:
            network = self.client.networks.get(self.PROXY_NETWORK)
            network.remove()
        except docker.errors.NotFound:
            pass
