from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager

router = APIRouter()

@router.websocket("/ai")
async def websocket_ai_endpoint(websocket: WebSocket, client_id: str = "anonymous"):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # For now, just echo back or handle specific commands if needed
            await manager.send_personal_message(f"You wrote: {data}", client_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
