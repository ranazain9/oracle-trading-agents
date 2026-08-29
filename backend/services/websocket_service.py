"""
ORACLE Trading System - WebSocket Connection & Broadcast Service
Manages real-time streaming connections for telemetry and position updates.
"""
from typing import List, Dict, Any, Set
from fastapi import WebSocket
import json
import asyncio
from backend.core.logging import logger


class WebSocketManager:
    """
    Thread-safe connection manager for multi-client WebSocket streaming.
    """

    def __init__(self):
        # Active connections grouped by channel
        self.telemetry_connections: Set[WebSocket] = set()
        self.positions_connections: Set[WebSocket] = set()

    async def connect_telemetry(self, websocket: WebSocket):
        await websocket.accept()
        self.telemetry_connections.add(websocket)
        logger.info(f"WebSocket client connected to /ws/telemetry (Total: {len(self.telemetry_connections)})")

    def disconnect_telemetry(self, websocket: WebSocket):
        self.telemetry_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected from /ws/telemetry (Remaining: {len(self.telemetry_connections)})")

    async def connect_positions(self, websocket: WebSocket):
        await websocket.accept()
        self.positions_connections.add(websocket)
        logger.info(f"WebSocket client connected to /ws/positions (Total: {len(self.positions_connections)})")

    def disconnect_positions(self, websocket: WebSocket):
        self.positions_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected from /ws/positions (Remaining: {len(self.positions_connections)})")

    async def broadcast_telemetry(self, message: Dict[str, Any]):
        """Broadcasts agent telemetry event to all connected listeners."""
        if not self.telemetry_connections:
            return
        payload = json.dumps(message)
        dead_sockets = set()
        for ws in self.telemetry_connections:
            try:
                await ws.send_text(payload)
            except Exception:
                dead_sockets.add(ws)
        self.telemetry_connections.difference_update(dead_sockets)

    async def broadcast_positions(self, message: Dict[str, Any]):
        """Broadcasts live position / Greeks update to all connected listeners."""
        if not self.positions_connections:
            return
        payload = json.dumps(message)
        dead_sockets = set()
        for ws in self.positions_connections:
            try:
                await ws.send_text(payload)
            except Exception:
                dead_sockets.add(ws)
        self.positions_connections.difference_update(dead_sockets)


# Global Singleton
ws_manager = WebSocketManager()
