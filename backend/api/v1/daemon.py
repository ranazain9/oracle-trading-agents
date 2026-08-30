"""
ORACLE Trading System - Autonomous 24/7 Daemon API Router
Provides controls and status for 24/7 Auto-Pilot market operations.
"""
from fastapi import APIRouter
from typing import Dict, Any, Optional
from pydantic import BaseModel

from backend.services.daemon_service import daemon_service
from backend.core.logging import logger

router = APIRouter(prefix="/daemon", tags=["24/7 Autonomous Daemon"])


class ToggleAutoPilotRequest(BaseModel):
    enabled: Optional[bool] = None


@router.get("/status")
def get_daemon_status() -> Dict[str, Any]:
    """
    Returns the real-time status, phase, and execution history of the 24/7 Auto-Pilot daemon.
    """
    return daemon_service.get_status()


@router.post("/toggle")
def toggle_auto_pilot(req: Optional[ToggleAutoPilotRequest] = None) -> Dict[str, Any]:
    """
    Enables or disables 24/7 Auto-Pilot mode.
    """
    enabled_val = req.enabled if req else None
    new_state = daemon_service.toggle_auto_pilot(enabled_val)
    return {
        "success": True,
        "auto_pilot_enabled": new_state,
        "mode": "24/7 AUTO-PILOT ACTIVE" if new_state else "MANUAL OPERATOR MODE"
    }


@router.post("/run-cycle")
def run_immediate_cycle() -> Dict[str, Any]:
    """
    Triggers an immediate autonomous cycle on demand.
    """
    result = daemon_service.run_immediate_cycle()
    return {
        "success": True,
        "message": "Immediate autonomous cycle executed.",
        "result": result
    }
