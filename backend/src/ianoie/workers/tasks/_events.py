"""Persist installation lifecycle events to the ``app_logs`` table.

The install/uninstall/start/stop/restart/reconfigure tasks call ``log_event``
at each meaningful step. The UI polls ``GET /installations/{id}/logs`` and shows
these lines live (status message under the progress bar + a "View logs" panel),
so the user can tell an install is progressing even when the bar sits still on a
long image pull or a readiness probe.

Uses a short-lived sync session (independent from the task's own session) and
commits immediately, so each event is visible to the API the moment it happens.
A logging failure must never break the task itself — it is swallowed + warned.
"""

import structlog

logger = structlog.get_logger()


def log_event(
    installation_id: int,
    level: str,
    message: str,
    container_name: str | None = None,
) -> None:
    """Append one event line to ``app_logs`` for the given installation.

    Args:
        installation_id: target installation.
        level: one of ``debug``/``info``/``warn``/``error``.
        message: human-readable description of the step.
        container_name: optional container the event relates to.
    """
    from ianoie.database import sync_session_factory
    from ianoie.models.app_log import AppLog, LogLevel

    db = sync_session_factory()
    try:
        db.add(
            AppLog(
                installation_id=installation_id,
                level=LogLevel(level),
                message=message,
                container_name=container_name,
            )
        )
        db.commit()
    except Exception as e:  # noqa: BLE001 — never break a task over a log write
        logger.warning("log_event_failed", installation_id=installation_id, error=str(e))
        try:
            db.rollback()
        finally:
            db.close()
        return
    db.close()
