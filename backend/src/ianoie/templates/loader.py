from pathlib import Path

import yaml

from ianoie.config import settings


class TemplateLoader:
    def __init__(self, templates_dir: str | None = None):
        self.templates_dir = Path(templates_dir or settings.templates_dir)

    def load(self, template_path: str) -> dict:
        path = self.templates_dir / template_path
        if not path.exists():
            raise FileNotFoundError(f"Template not found: {path}")

        with open(path) as f:
            template = yaml.safe_load(f)

        self._validate(template)
        return template

    def _validate(self, template: dict) -> None:
        required_keys = ["metadata", "services"]
        for key in required_keys:
            if key not in template:
                raise ValueError(f"Template missing required key: {key}")

        metadata = template["metadata"]
        for key in ["name", "slug", "version", "description", "category"]:
            if key not in metadata:
                raise ValueError(f"Template metadata missing required key: {key}")

        services = template["services"]
        if not isinstance(services, dict) or not services:
            raise ValueError("Template 'services' must be a non-empty mapping")
        for svc_name, svc in services.items():
            if not isinstance(svc, dict):
                raise ValueError(f"Service '{svc_name}' must be a mapping")
            self._validate_service(svc_name, svc)

    def _validate_service(self, svc_name: str, svc: dict) -> None:
        # A service exposes itself via either legacy `ports` (with expose:true) or
        # multi-path `routes` — not both. Internal services need neither.
        routes = svc.get("routes")
        if routes is not None:
            if not isinstance(routes, list) or not routes:
                raise ValueError(f"Service '{svc_name}': 'routes' must be a non-empty list")
            for i, route in enumerate(routes):
                if "port" not in route:
                    raise ValueError(f"Service '{svc_name}': route[{i}] missing 'port'")
                if "path" not in route:
                    raise ValueError(f"Service '{svc_name}': route[{i}] missing 'path'")
            if any(p.get("expose", True) for p in svc.get("ports", [])):
                raise ValueError(
                    f"Service '{svc_name}': use either 'routes' or 'ports' (with expose), not both"
                )

        auth = svc.get("auth")
        if auth is not None:
            if auth.get("type") not in (None, "basic"):
                raise ValueError(
                    f"Service '{svc_name}': unsupported auth type {auth.get('type')!r}"
                )
            if "users" not in auth or not isinstance(auth["users"], list):
                raise ValueError(f"Service '{svc_name}': 'auth.users' must be a list")

    def list_templates(self) -> list[str]:
        if not self.templates_dir.exists():
            return []
        return [f.name for f in self.templates_dir.glob("*.yaml")]
