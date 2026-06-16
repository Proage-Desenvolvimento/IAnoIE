import asyncio
import datetime

from ianoie.schemas.worker import WorkerHealthResponse, WorkerNodeInfo


class WorkerService:
    """Checks Celery worker health via the broker (Redis).

    Uses the Celery control/inspect API, which talks to workers through the
    broker — so this works from the API process (separate from the worker).
    All control calls are blocking, so they run in a thread off the event loop.
    """

    TIMEOUT = 3.0  # seconds per inspect/control call

    async def get_worker_health(self) -> WorkerHealthResponse:
        from ianoie.workers.celery_app import celery_app

        now = datetime.datetime.now(datetime.timezone.utc)

        # Broker down -> control.ping raises a connection error.
        try:
            ping = await asyncio.to_thread(celery_app.control.ping, timeout=self.TIMEOUT)
        except Exception:
            return WorkerHealthResponse(
                status="unhealthy",
                workers_online=0,
                active_tasks=0,
                broker_online=False,
                workers=[],
                timestamp=now,
            )

        # control.ping -> [{'celery@host': 'pong'}, ...]; collect responsive names.
        online = [next(iter(node)) for node in ping if node]

        # Broker reachable but no worker answered -> unhealthy, skip detail calls.
        if not online:
            return WorkerHealthResponse(
                status="unhealthy",
                workers_online=0,
                active_tasks=0,
                broker_online=True,
                workers=[],
                timestamp=now,
            )

        # At least one worker alive -> gather per-node stats/active detail.
        try:
            inspector = celery_app.control.inspect(timeout=self.TIMEOUT)
            stats = await asyncio.to_thread(inspector.stats) or {}
            active = await asyncio.to_thread(inspector.active) or {}
        except Exception:
            stats, active = {}, {}

        nodes: list[WorkerNodeInfo] = []
        active_total = 0
        for name in online:
            node_stats = stats.get(name, {}) or {}
            node_active = active.get(name, []) or []
            active_total += len(node_active)

            total = node_stats.get("total")
            processed = sum(total.values()) if isinstance(total, dict) else None

            pool = node_stats.get("pool")
            pool_impl = pool.get("implementation") if isinstance(pool, dict) else None

            nodes.append(
                WorkerNodeInfo(
                    name=name,
                    active=len(node_active),
                    processed=processed,
                    pool=pool_impl,
                )
            )

        return WorkerHealthResponse(
            status="healthy",
            workers_online=len(online),
            active_tasks=active_total,
            broker_online=True,
            workers=nodes,
            timestamp=now,
        )
