from ianoie.docker_ops.container_manager import ContainerConfig


class TemplateRenderer:
    """Converts parsed YAML template + user config into ContainerConfig instances."""

    def render(
        self,
        template: dict,
        user_config: dict,
        installation_id: int,
        gpu_uuids: list[str],
    ) -> list[ContainerConfig]:
        services = template["services"]
        ordered = self._resolve_dependency_order(services)
        configs = []

        for svc_name in ordered:
            svc = services[svc_name]
            config = ContainerConfig(
                name=f"ianoie-{installation_id}-{svc_name}",
                image=f"{svc['image']}:{svc.get('tag', 'latest')}",
                environment=self._render_env(svc.get("environment", {}), user_config),
                labels=self._build_labels(svc_name, svc, installation_id),
                network="ianoie-proxy",
                restart_policy=svc.get("restart", "unless-stopped"),
                healthcheck=self._build_healthcheck(svc.get("healthcheck")),
                volumes=self._build_volumes(svc.get("volumes", []), installation_id),
                gpu_device_ids=gpu_uuids if svc.get("gpu", {}).get("enabled") else [],
            )

            if svc.get("command"):
                config.command = svc["command"]
            if svc.get("resource_limits", {}).get("memory"):
                config.memory_limit = svc["resource_limits"]["memory"]
            if svc.get("resource_limits", {}).get("cpus"):
                config.cpu_limit = svc["resource_limits"]["cpus"]

            configs.append(config)

        return configs

    def _render_env(self, env: dict, user_config: dict) -> dict[str, str]:
        rendered = {}
        for key, value in env.items():
            if isinstance(value, str) and "{{config." in value:
                for config_key, config_val in user_config.items():
                    value = value.replace(f"{{{{config.{config_key}}}}}", str(config_val))
            rendered[key] = str(value)
        return rendered

    def _build_labels(self, svc_name: str, svc: dict, inst_id: int) -> dict[str, str]:
        labels = {
            "ianoie.managed": "true",
            "ianoie.installation_id": str(inst_id),
            "ianoie.service_name": svc_name,
        }

        if not svc.get("internal", False):
            for port_cfg in svc.get("ports", []):
                if port_cfg.get("expose", True):
                    router_name = f"ianoie-{inst_id}-{svc_name}"
                    labels.update({
                        "traefik.enable": "true",
                        f"traefik.http.routers.{router_name}.rule": (
                            f"PathPrefix(`/app/{inst_id}/`)"
                        ),
                        f"traefik.http.routers.{router_name}.entrypoints": "web",
                        f"traefik.http.services.{router_name}.loadbalancer.server.port": (
                            str(port_cfg["container_port"])
                        ),
                        f"traefik.http.middlewares.{router_name}-strip.stripprefix.prefixes": (
                            f"/app/{inst_id}"
                        ),
                        f"traefik.http.routers.{router_name}.middlewares": (
                            f"{router_name}-strip"
                        ),
                    })

        return labels

    def _build_healthcheck(self, hc: dict | None) -> dict | None:
        if not hc:
            return None
        return {
            "test": hc["test"],
            "interval": hc.get("interval", 30) * 1_000_000_000,
            "timeout": hc.get("timeout", 10) * 1_000_000_000,
            "retries": hc.get("retries", 3),
            "start_period": hc.get("start_period", 30) * 1_000_000_000,
        }

    def _build_volumes(self, volumes: list[dict], installation_id: int) -> dict | None:
        if not volumes:
            return None
        result = {}
        for vol in volumes:
            full_name = f"ianoie-{installation_id}-{vol['name']}"
            result[full_name] = {"bind": vol["mount_path"], "mode": vol.get("mode", "rw")}
        return result

    def _resolve_dependency_order(self, services: dict) -> list[str]:
        visited = set()
        order = []

        def visit(name: str):
            if name in visited:
                return
            visited.add(name)
            svc = services[name]
            for dep in svc.get("depends_on", []):
                if dep in services:
                    visit(dep)
            order.append(name)

        for name in services:
            visit(name)
        return order
