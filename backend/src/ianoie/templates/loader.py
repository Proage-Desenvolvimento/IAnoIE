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

    def list_templates(self) -> list[str]:
        if not self.templates_dir.exists():
            return []
        return [f.name for f in self.templates_dir.glob("*.yaml")]
