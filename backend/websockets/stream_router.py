"""
ORACLE Trading System - WebSocket Streaming Router
Provides high-frequency real-time channels: /ws/telemetry and /ws/positions.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json

from backend.services.websocket_service import ws_manager
from backend.services.dashboard_service import dashboard_cache
from backend.core.logging import logger

router = APIRouter(prefix="/ws", tags=["WebSockets"])


@router.websocket("/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    Real-time streaming channel for LangGraph state transitions, agent proposals, and ToT decisions.
    """
    await ws_manager.connect_telemetry(websocket)
    try:
        # Send initial connection acknowledgment
        await websocket.send_text(json.dumps({
            "event_type": "CONNECTED",
            "channel": "telemetry",
            "message": "Connected to ORACLE Agent Telemetry Stream."
        }))
        while True:
            # Keep socket open and receive heartbeat/ping from clients
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"event_type": "PONG"}))
    except WebSocketDisconnect:
        ws_manager.disconnect_telemetry(websocket)
    except Exception as e:
        logger.warning(f"Error in telemetry websocket: {e}")
        ws_manager.disconnect_telemetry(websocket)


@router.websocket("/positions")
async def websocket_positions_endpoint(websocket: WebSocket):
    """
    High-frequency streaming channel for live Mark-to-Market PnL, Greeks, and ratchet stop floors.
    """
    await ws_manager.connect_positions(websocket)
    try:
        await websocket.send_text(json.dumps({
            "event_type": "CONNECTED",
            "channel": "positions",
            "message": "Connected to ORACLE Live Position & Greek Stream."
        }))
        
        # Periodically push live position snapshots every 15 seconds from memory cache
        while True:
            try:
                bootstrap = dashboard_cache.get_bootstrap_data()
                positions = bootstrap.get("positions", [])
                greeks = bootstrap.get("greeks", {})
                await websocket.send_text(json.dumps({
                    "event_type": "POSITION_HEARTBEAT",
                    "positions_count": len(positions),
                    "positions": positions,
                    "net_delta": greeks.get("net_portfolio_delta", 0.0),
                    "net_theta": greeks.get("net_portfolio_theta_daily_usd", 0.0),
                    "requires_hedge": greeks.get("requires_hedge", False)
                }))
            except Exception:
                pass
            await asyncio.sleep(15.0)

    except WebSocketDisconnect:
        ws_manager.disconnect_positions(websocket)
    except Exception as e:
        logger.warning(f"Error in positions websocket: {e}")
        ws_manager.disconnect_positions(websocket)
