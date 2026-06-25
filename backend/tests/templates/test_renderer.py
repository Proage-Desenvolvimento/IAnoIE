"""Tests for the template renderer's env interpolation.

Runs under the full backend deps (the renderer imports ``container_manager``,
which imports the ``docker`` SDK) — i.e. inside the api/worker image or a proper
venv, not the bare system python.
"""

import os
from pathlib import Path

# The renderer captures APP_DOMAIN into a module-level constant at import time,
# so it must be set before the import.
_DOMAIN = "suite.aimization.com"
os.environ.setdefault("APP_DOMAIN", _DOMAIN)

from ianoie.templates.loader import TemplateLoader  # noqa: E402
from ianoie.templates.renderer import TemplateRenderer  # noqa: E402

_REPO_ROOT = Path(__file__).resolve().parents[3]


def _minimal_template(env: dict) -> dict:
    return {
        "metadata": {
            "name": "T", "slug": "t", "version": "1",
            "description": "d", "category": "c",
        },
        "services": {
            "web": {
                "image": "img", "internal": False,
                "environment": env,
                "ports": [{"container_port": 8080, "expose": True}],
            }
        },
    }


def test_public_url_token_is_resolved():
    """{{public_url}} resolves to the installation's HTTPS origin, no trailing slash."""
    template = _minimal_template({"API_URL": "{{public_url}}"})
    configs = TemplateRenderer().render(
        template, {}, installation_id=7, gpu_uuids=[], app_slug="myapp",
    )
    api_url = configs[0].environment["API_URL"]
    assert api_url == f"https://myapp-7.{_DOMAIN}"
    assert not api_url.endswith("/")
    assert "/api" not in api_url  # consumer appends /api itself


def test_open_notebook_template_renders_api_url():
    """The shipped open-notebook.yaml must produce a usable API_URL for install #22."""
    template = TemplateLoader(
        templates_dir=str(_REPO_ROOT / "templates"),
    ).load("open-notebook.yaml")

    configs = TemplateRenderer().render(
        template, {}, installation_id=22, gpu_uuids=[], app_slug="open-notebook",
    )
    notebook = next(c for c in configs if c.name.endswith("-open_notebook"))
    assert notebook.environment["API_URL"] == f"https://open-notebook-22.{_DOMAIN}"
