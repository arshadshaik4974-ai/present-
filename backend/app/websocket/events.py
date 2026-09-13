import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.manager import manager
from app.services.ai_service import ai_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/ai")
async def websocket_ai_endpoint(websocket: WebSocket, client_id: str = "anonymous"):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                data = json.loads(data_str)
                if data.get("type") == "FRAME":
                    base64_image = data.get("image")
                    if base64_image:
                        # Process frame in a separate thread to not block the event loop
                        result = await asyncio.to_thread(ai_service.process_frame, base64_image)
                        await manager.send_personal_message(json.dumps(result), client_id)
                elif data.get("type") == "START_RTSP":
                    camera_id = data.get("camera_id")
                    if camera_id:
                        res = await ai_service.start_rtsp(camera_id)
                        await manager.send_personal_message(json.dumps({"type": "STATUS", "status": res["status"]}), client_id)
                elif data.get("type") == "STOP_RTSP":
                    res = await ai_service.stop_rtsp()
                    await manager.send_personal_message(json.dumps({"type": "STATUS", "status": res["status"]}), client_id)
                elif data.get("type") == "PING":
                    await manager.send_personal_message(json.dumps({"type": "PONG"}), client_id)
            except json.JSONDecodeError:
                await manager.send_personal_message(json.dumps({"type": "ERROR", "message": "Invalid JSON"}), client_id)
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                await manager.send_personal_message(json.dumps({"type": "ERROR", "message": str(e)}), client_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
