import base64
import hashlib
import os
import platform

from ianoie.docker_ops.container_manager import ContainerConfig

# Produção é HTTPS-only em websecure (:443); :80 é redirecionado p/ :443.
# Routers de app precisam ancorar no host público p/ o Traefik selecionar o cert TLS.
_APP_DOMAIN = os.environ.get("APP_DOMAIN", "").strip()

# Map the host's CPU architecture onto the docker image arch labels used by a
# template's optional `arch.<arch>` override block (e.g. amd64 vs arm64 images).
# The api/worker containers run the host's native arch, so platform.machine()
# reflects the host an installed app will actually run on.
_ARCH_BY_MACHINE = {
    "x86_64": "amd64",
    "amd64": "amd64",
    "aarch64": "arm64",
    "arm64": "arm64",
}


def _detect_host_arch() -> str:
    """Return ``amd64`` or ``arm64`` for the current host (default ``amd64``)."""
    return _ARCH_BY_MACHINE.get(platform.machine().lower(), "amd64")


def _sha1_basic_auth_hash(password: str) -> str:
    """htpasswd-style ``{SHA}`` hash — accepted by Traefik's BasicAuth middleware.

    Uses only the stdlib (no passlib needed); sufficient for a local access token.
    """
    return "{SHA}" + base64.b64encode(hashlib.sha1(password.encode()).digest()).decode()


class TemplateRenderer:
    """Converts parsed YAML template + user config into ContainerConfig instances."""

    def render(
        self,
        template: dict,
        user_config: dict,
        installation_id: int,
        gpu_uuids: list[str],
        app_slug: str,
        llm_config: dict | None = None,
    ) -> list[ContainerConfig]:
        services = template["services"]
        # Apply config field defaults so unset fields don't leave {{config.*}} placeholders
        user_config = dict(user_config or {})
        for field in template.get("config", []):
            key = field.get("key")
            if key and "default" in field and user_config.get(key) in (None, ""):
                user_config[key] = field["default"]
        ordered = self._resolve_dependency_order(services)
        # Map each service name to its real container hostname on the proxy
        # network, so templates can reference a sibling service with
        # {{services.<name>}} (e.g. ws://{{services.surrealdb}}:8000/rpc).
        service_hosts = {name: f"ianoie-{installation_id}-{name}" for name in services}
        # Public HTTPS origin for this installation — single source of truth shared
        # with the Traefik Host rule (same {app_slug}-{installation_id}.{APP_DOMAIN}),
        # so templates can reference it via {{public_url}} (e.g. API_URL).
        public_url = f"https://{app_slug}-{installation_id}.{_APP_DOMAIN}"
        configs = []

        # Extract LLM connection env from template if present
        llm_connection_env = template.get("llm", {}).get("connection_env", {})

        host_arch = _detect_host_arch()
        for svc_name in ordered:
            svc = dict(services[svc_name])
            # Optional per-arch override (e.g. amd64 vs arm64 images). Keys in
            # the override replace the base service's (image, environment,
            # volumes, ports, healthcheck, ...); templates without an `arch`
            # block are unaffected. Popped so it never reaches ContainerConfig.
            arch_override = svc.pop("arch", {}).get(host_arch)
            if arch_override:
                svc.update(arch_override)

            # Build environment: start with service env, merge LLM connection env
            environment = dict(svc.get("environment", {}))

            # If LLM config provided and template defines connection env for the provider,
            # merge those env vars into the service environment
            if llm_config and llm_connection_env:
                provider_type = llm_config.get("provider_type", "")
                provider_env = llm_connection_env.get(provider_type, {})
                environment.update(provider_env)

            config = ContainerConfig(
                name=f"ianoie-{installation_id}-{svc_name}",
                image=f"{svc['image']}:{svc.get('tag', 'latest')}",
                build=svc.get("build"),
                environment=self._render_env(
                    environment, user_config, llm_config, service_hosts, public_url,
                ),
                labels=self._build_labels(svc_name, svc, installation_id, user_config, app_slug),
                network="ianoie-proxy",
                restart_policy=svc.get("restart", "unless-stopped"),
                healthcheck=self._build_healthcheck(svc.get("healthcheck")),
                readiness_port=self._first_container_port(svc),
                volumes=self._build_volumes(svc.get("volumes", []), installation_id),
                gpu_device_ids=gpu_uuids if svc.get("gpu", {}).get("enabled") else [],
                user=svc.get("user"),
            )

            if svc.get("command"):
                config.command = svc["command"]
            if svc.get("resource_limits", {}).get("memory"):
                config.memory_limit = svc["resource_limits"]["memory"]
            if svc.get("resource_limits", {}).get("cpus"):
                config.cpu_limit = svc["resource_limits"]["cpus"]

            configs.append(config)

        return configs

    def _render_env(
        self, env: dict, user_config: dict, llm_config: dict | None = None,
        service_hosts: dict | None = None, public_url: str | None = None,
    ) -> dict[str, str]:
        rendered = {}
        for key, value in env.items():
            if isinstance(value, str):
                # Existing {{config.*}} interpolation
                if "{{config." in value:
                    for config_key, config_val in user_config.items():
                        value = value.replace(f"{{{{config.{config_key}}}}}", str(config_val))
                # New {{llm.*}} interpolation
                if "{{llm." in value and llm_config:
                    for llm_key, llm_val in llm_config.items():
                        value = value.replace(f"{{{{llm.{llm_key}}}}}", str(llm_val))
                # {{services.<name>}} -> real container hostname of a sibling service
                if "{{services." in value and service_hosts:
                    for svc_name, host in service_hosts.items():
                        value = value.replace(f"{{{{services.{svc_name}}}}}", host)
                # {{public_url}} -> the installation's public HTTPS origin (no trailing slash)
                if public_url and "{{public_url}}" in value:
                    value = value.replace("{{public_url}}", public_url)
            rendered[key] = str(value)
        return rendered

    def _build_labels(
        self, svc_name: str, svc: dict, inst_id: int, user_config: dict | None = None,
        app_slug: str = "",
    ) -> dict[str, str]:
        labels = {
            "ianoie.managed": "true",
            "ianoie.installation_id": str(inst_id),
            "ianoie.service_name": svc_name,
        }

        if svc.get("internal", False):
            return labels

        # BasicAuth middleware shared across all of the service's routers.
        auth_mw = self._build_auth_labels(svc, svc_name, inst_id, user_config, labels)

        if svc.get("routes"):
            self._build_route_labels(svc_name, svc, inst_id, app_slug, auth_mw, labels)
        else:
            self._build_port_labels(svc_name, svc, inst_id, app_slug, auth_mw, labels)
        return labels

    def _build_port_labels(
        self, svc_name: str, svc: dict, inst_id: int, app_slug: str,
        auth_mw: str | None, labels: dict[str, str],
    ) -> None:
        """Expose a service on its own subdomain ``{app_slug}-{inst_id}.{APP_DOMAIN}``.

        The app runs at the root of its subdomain, so no StripPrefix is needed and
        assets referenced with absolute paths (``/assets/...``) resolve correctly.
        """
        for port_cfg in svc.get("ports", []):
            if not port_cfg.get("expose", True):
                continue
            router_name = f"ianoie-{inst_id}-{svc_name}"
            subdomain = f"{app_slug}-{inst_id}"
            labels.update({
                "traefik.enable": "true",
                f"traefik.http.routers.{router_name}.rule": (
                    f"Host(`{subdomain}.{_APP_DOMAIN}`)"
                ),
                f"traefik.http.routers.{router_name}.entrypoints": "websecure",
                f"traefik.http.routers.{router_name}.tls": "true",
                f"traefik.http.routers.{router_name}.tls.certresolver": "le",
                f"traefik.http.routers.{router_name}.priority": "100",
                f"traefik.http.services.{router_name}.loadbalancer.server.port": (
                    str(port_cfg["container_port"])
                ),
            })
            if auth_mw:
                labels[f"traefik.http.routers.{router_name}.middlewares"] = auth_mw

    def _build_route_labels(
        self, svc_name: str, svc: dict, inst_id: int, app_slug: str,
        auth_mw: str | None, labels: dict[str, str],
    ) -> None:
        """Multi-path exposure via ``routes`` — one Traefik router per ``{path, port}``.

        All routes share the installation's subdomain ``{app_slug}-{inst_id}.{APP_DOMAIN}``.
        Each non-root route keeps its own StripPrefix so the backend sees it at ``/``;
        the root route (``path: ""``) excludes its sibling sub-paths so it doesn't shadow them.
        """
        subdomain = f"{app_slug}-{inst_id}"
        host = f"Host(`{subdomain}.{_APP_DOMAIN}`)"
        sibling_paths = [r["path"] for r in svc["routes"] if r.get("path")]
        labels["traefik.enable"] = "true"
        for route in svc["routes"]:
            path = route.get("path", "") or ""
            port = route["port"]
            slug = path or "root"
            router = f"ianoie-{inst_id}-{svc_name}-{slug}"
            if path:
                prefix = f"/{path}"
                rule = f"{host} && PathPrefix(`{prefix}`)"
                middlewares = []
                # Strip the prefix by default (backends that serve at "/"). A route whose
                # backend serves AT the prefix (e.g. an MCP server mounted at /mcp) declares
                # strip_prefix: false so the path reaches the backend unchanged.
                if route.get("strip_prefix", True):
                    labels[f"traefik.http.middlewares.{router}-strip.stripprefix.prefixes"] = prefix
                    middlewares.append(f"{router}-strip")
                if auth_mw:
                    middlewares.append(auth_mw)
                if middlewares:
                    labels[f"traefik.http.routers.{router}.middlewares"] = ",".join(middlewares)
            else:
                exclusions = "".join(f" && !PathPrefix(`/{p}`)" for p in sibling_paths)
                rule = f"{host}{exclusions}"
                if auth_mw:
                    labels[f"traefik.http.routers.{router}.middlewares"] = auth_mw
            labels.update({
                f"traefik.http.routers.{router}.rule": rule,
                f"traefik.http.routers.{router}.entrypoints": "websecure",
                f"traefik.http.routers.{router}.tls": "true",
                f"traefik.http.routers.{router}.tls.certresolver": "le",
                f"traefik.http.routers.{router}.priority": "100",
                # Explicit router→service link: with >1 route each router would otherwise
                # match multiple services and Traefik refuses to auto-link ("cannot be linked
                # automatically with multiple Services"), leaving the routers dead (no cert).
                f"traefik.http.routers.{router}.service": router,
                f"traefik.http.services.{router}.loadbalancer.server.port": str(port),
            })

    def _build_auth_labels(
        self, svc: dict, svc_name: str, inst_id: int,
        user_config: dict | None, labels: dict[str, str],
    ) -> str | None:
        """Emit a Traefik BasicAuth middleware (auth.type == basic); name or None."""
        auth = svc.get("auth")
        if not auth or auth.get("type") != "basic":
            return None
        mw = f"ianoie-{inst_id}-{svc_name}-auth"
        rendered = []
        for user in auth.get("users", []):
            username = self._interpolate(user.get("username", ""), user_config)
            token = self._interpolate(user.get("token", ""), user_config)
            rendered.append(f"{username}:{_sha1_basic_auth_hash(token)}")
        labels[f"traefik.http.middlewares.{mw}.basicauth.users"] = ",".join(rendered)
        return mw

    def _interpolate(self, value, user_config: dict | None) -> str:
        """Replace ``{{config.<key>}}`` placeholders in a string (mirrors ``_render_env``)."""
        if not isinstance(value, str):
            return str(value) if value is not None else ""
        if user_config:
            for ck, cv in user_config.items():
                value = value.replace(f"{{{{config.{ck}}}}}", str(cv))
        return value

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

    def _first_container_port(self, svc: dict) -> int | None:
        """First listening port of the service — used for the worker TCP readiness probe.

        Checks ``routes`` (multi-path) first, then the legacy ``ports`` list.
        """
        for route in svc.get("routes", []):
            if route.get("port"):
                return route["port"]
        for port_cfg in svc.get("ports", []):
            if port_cfg.get("container_port"):
                return port_cfg["container_port"]
        return None

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
