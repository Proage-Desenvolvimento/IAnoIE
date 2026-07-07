"""Ensure a container image is present locally — shared by the install/update/reconfigure tasks.

Operator-built images (scrapling/omnivoice/voicebox) declare a ``build`` block in
their template and live on no registry. For those we build the image locally via
the Docker SDK (context mounted read-only into the worker at BUILD_CONTEXT_ROOT)
when it is missing — and rebuild it on ``force_refresh`` (the update path, where
"latest" for a local image means "rebuild from the current Dockerfile"). Registry
images are pulled (or reused if already present on install/reconfigure).
"""

import os

import structlog

from ianoie.config import settings
from ianoie.workers.tasks._events import log_event

logger = structlog.get_logger()


def ensure_image(image_mgr, cfg, installation_id: int, *, force_refresh: bool = False) -> None:
    """Make sure ``cfg.image`` exists locally before a container is created from it.

    - Operator-built image (``cfg.build`` set): build/rebuild locally; never pulled.
    - Registry image: reuse if present (unless ``force_refresh``), else pull.

    Raises ``RuntimeError`` with an actionable message if the image can't be obtained.
    """
    image_parts = cfg.image.split(":")
    img_name = image_parts[0]
    img_tag = image_parts[1] if len(image_parts) > 1 else "latest"

    # Operator-built image — build it from the mounted Dockerfile context.
    if cfg.build:
        if force_refresh or not image_mgr.exists(cfg.image):
            context_rel = cfg.build.get("context", ".")
            dockerfile = cfg.build.get("dockerfile", "Dockerfile")
            context = os.path.join(settings.build_context_root, context_rel)
            log_event(
                installation_id, "info",
                f"Construindo imagem {cfg.image} localmente ({context_rel})…",
                container_name=cfg.name,
            )
            logger.info("building_image", image=cfg.image, context=context)
            try:
                image_mgr.build(context, dockerfile, cfg.image)
            except Exception as build_err:
                raise RuntimeError(
                    f"Falha ao construir imagem {cfg.image} a partir de {context}: {build_err}"
                ) from build_err
            log_event(
                installation_id, "info",
                f"Imagem {cfg.image} construída",
                container_name=cfg.name,
            )
        return

    # Registry image — reuse if already present (install/reconfigure), else pull.
    if not force_refresh and image_mgr.exists(cfg.image):
        return
    log_event(installation_id, "info", f"Baixando imagem {cfg.image}…", container_name=cfg.name)
    logger.info("pulling_image", image=cfg.image)
    try:
        image_mgr.pull(img_name, img_tag)
    except Exception as pull_err:
        raise RuntimeError(
            f"Imagem {cfg.image} não encontrada localmente nem no registry."
        ) from pull_err
