import asyncio
import json
from typing import Annotated

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ianoie.core.security import verify_token
from ianoie.database import get_db, async_session_factory
from ianoie.models.installation import Installation

router = APIRouter()


@router.websocket("/logs/{installation_id}")
async def logs_websocket(
    websocket: WebSocket,
    installation_id: int,
    token: str = Query(...),
):
    try:
        payload = verify_token(token)
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

    from ianoie.docker_ops.client import get_docker_client

    docker_client = get_docker_client()
    tasks = []

    async def stream_container(container_id: str):
        try:
            container = docker_client.containers.get(container_id)
            log_stream = container.logs(
                stream=True, follow=True, tail=100, timestamps=True
            )
            for raw_line in log_stream:
                line = raw_line.decode("utf-8", errors="replace").strip()
                if line:
                    await websocket.send_json({
                        "container_id": container_id[:12],
                        "container_name": container.name,
                        "line": line,
                    })
        except Exception as e:
            await websocket.send_json({
                "container_id": container_id[:12],
                "line": f"[error streaming logs: {e}]",
            })

    try:
        tasks = [asyncio.create_task(stream_container(cid)) for cid in container_ids]
        await asyncio.gather(*tasks)
    except WebSocketDisconnect:
        pass
    finally:
        for task in tasks:
            task.cancel()
