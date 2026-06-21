import asyncio
import json
from typing import Any

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from ianoie.core.security import verify_token
from ianoie.database import async_session_factory
from ianoie.models.installation import Installation

router = APIRouter()

# Sentinel pushed by each producer thread when it finishes, so the consumer
# knows when every stream has ended.
_STREAM_DONE: Any = object()


@router.websocket("/logs/{installation_id}")
async def logs_websocket(
    websocket: WebSocket,
    installation_id: int,
    token: str = Query(...),
):
    try:
        verify_token(token)
    except Exception:
        await websocket.close(code=4001, reason="Invalid token")
        return

    await websocket.accept()

    async with async_session_factory() as db:
        result = await db.execute(
            select(Installation).where(Installation.id == installation_id)
        )
        installation = result.scalar_one_or_none()
        if not installation:
            await websocket.send_json({"error": "Installation not found"})
            await websocket.close()
            return

        container_ids = json.loads(installation.container_ids or "[]")
        if not container_ids and installation.container_id:
            container_ids = [installation.container_id]

    if not container_ids:
        await websocket.send_json({"error": "No containers to stream"})
        await websocket.close()
        return

    from ianoie.docker_ops.client import get_docker_client

    docker_client = get_docker_client()
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue = asyncio.Queue()
    stop = asyncio.Event()

    def pump(container_id: str) -> None:
        # Runs in a worker thread: docker's log generator is a *blocking* sync
        # iterator, so it must NOT live on the event loop. Lines are handed back
        # to the loop via the queue. stop is checked between lines so a closed
        # socket lets the thread exit promptly on active containers.
        try:
            container = docker_client.containers.get(container_id)
            log_stream = container.logs(
                stream=True, follow=True, tail=100, timestamps=True
            )
            for raw_line in log_stream:
                if stop.is_set():
                    break
                line = raw_line.decode("utf-8", errors="replace").strip()
                if line:
                    loop.call_soon_threadsafe(
                        queue.put_nowait,
                        {
                            "container_id": container_id[:12],
                            "container_name": container.name,
                            "line": line,
                        },
                    )
        except Exception as e:
            loop.call_soon_threadsafe(
                queue.put_nowait,
                {"container_id": container_id[:12], "line": f"[error streaming logs: {e}]"},
            )
        finally:
            loop.call_soon_threadsafe(queue.put_nowait, _STREAM_DONE)

    # One blocking thread per container; the consumer drains them off the loop.
    producers = [asyncio.create_task(asyncio.to_thread(pump, cid)) for cid in container_ids]
    pending = len(producers)

    try:
        while pending > 0:
            item = await queue.get()
            if item is _STREAM_DONE:
                pending -= 1
                continue
            await websocket.send_json(item)
    except WebSocketDisconnect:
        pass
    finally:
        # Signal producer threads to bail (checked between log lines). We do NOT
        # await the producers: a thread blocked on a silent container can't be
        # interrupted by Python; it exits on its next line or when the stream
        # closes. The cancel just drops our interest in its task.
        stop.set()
        for task in producers:
            task.cancel()
