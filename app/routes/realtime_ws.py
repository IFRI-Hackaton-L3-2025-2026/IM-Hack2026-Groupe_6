from fastapi import APIRouter, WebSocket
import asyncio
import random
from datetime import datetime

router = APIRouter()


@router.websocket("/ws/realtime")
async def websocket_realtime(websocket: WebSocket):

    await websocket.accept()

    while True:

        data = {
            "timestamp": datetime.utcnow().isoformat(),
            "temperature": random.randint(60, 100),
            "vibration": random.randint(40, 95),
            "oil_particles": random.randint(10, 80)
        }

        await websocket.send_json(data)

        await asyncio.sleep(2)  