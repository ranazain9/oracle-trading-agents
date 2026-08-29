"""
ORACLE Trading System - HITL State & Governance Service
Manages pending trade approvals, operator sign-offs, and governance decision logs.
"""
from typing import Dict, Any, List, Optional
import uuid
import datetime
from pathlib import Path
import json

from backend.schemas.hitl_schemas import PendingApprovalSchema, HITLDecisionResponse, HITLHistorySchema
from backend.core.logging import logger


class HITLService:
    """
    In-memory and file-persisted governance engine for human sign-offs.
    """

    def __init__(self):
        self._pending_proposals: Dict[str, Dict[str, Any]] = {}
        self._history: List[Dict[str, Any]] = []
        self._history_file = Path(__file__).resolve().parent.parent.parent / "data" / "hitl_history.json"
        self._load_history()

    def _load_history(self):
        if self._history_file.exists():
            try:
                with open(self._history_file, "r") as f:
                    self._history = json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load hitl_history.json: {e}")
                self._history = []

    def _save_history(self):
        try:
            self._history_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self._history_file, "w") as f:
                json.dump(self._history, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save hitl_history.json: {e}")

    def add_pending_proposal(
        self,
        symbol: str,
        strategy: str,
        direction: str,
        budget: float,
        confidence: float,
        reasoning: str,
        macro_regime: str,
        decision_payload: Optional[Dict[str, Any]] = None
    ) -> str:
        """Registers a proposal in the pending queue."""
        prop_id = f"PROP-{uuid.uuid4().hex[:8].upper()}"
        self._pending_proposals[prop_id] = {
            "proposal_id": prop_id,
            "symbol": symbol,
            "strategy": strategy,
            "direction": direction,
            "suggested_risk_budget_usd": budget,
            "confidence_score": confidence,
            "reasoning": reasoning,
            "macro_regime": macro_regime,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "status": "PENDING_APPROVAL",
            "decision_payload": decision_payload or {}
        }
        logger.info(f"Registered pending HITL proposal: {prop_id} for {strategy} on {symbol}")
        return prop_id

    def list_pending(self) -> List[PendingApprovalSchema]:
        """Returns all currently active proposals awaiting review."""
        return [
            PendingApprovalSchema(
                proposal_id=p["proposal_id"],
                symbol=p["symbol"],
                strategy=p["strategy"],
                direction=p["direction"],
                suggested_risk_budget_usd=p["suggested_risk_budget_usd"],
                confidence_score=p["confidence_score"],
                reasoning=p["reasoning"],
                macro_regime=p["macro_regime"],
                created_at=p["created_at"],
                status=p["status"]
            )
            for p in self._pending_proposals.values()
        ]

    def list_history(self) -> List[HITLHistorySchema]:
        """Returns historical decisions."""
        return [HITLHistorySchema(**h) for h in self._history[-50:]]

    def approve(
        self,
        proposal_id: str,
        operator_name: str = "Risk Desk Operator",
        notes: str = "Authorized",
        adjusted_budget_usd: Optional[float] = None
    ) -> HITLDecisionResponse:
        """Approves a pending proposal."""
        prop = self._pending_proposals.pop(proposal_id, None)
        timestamp = datetime.datetime.utcnow().isoformat()
        
        symbol = prop["symbol"] if prop else "UNKNOWN"
        strategy = prop["strategy"] if prop else "UNKNOWN"

        record = {
            "proposal_id": proposal_id,
            "symbol": symbol,
            "strategy": strategy,
            "decision": "APPROVED",
            "operator": operator_name,
            "timestamp": timestamp,
            "notes": notes
        }
        self._history.append(record)
        self._save_history()

        logger.info(f"HITL Proposal {proposal_id} APPROVED by {operator_name}")
        return HITLDecisionResponse(
            proposal_id=proposal_id,
            is_approved=True,
            status="APPROVED",
            operator_name=operator_name,
            operator_notes=notes,
            timestamp=timestamp
        )

    def reject(
        self,
        proposal_id: str,
        operator_name: str = "Risk Desk Operator",
        notes: str = "Vetoed by desk"
    ) -> HITLDecisionResponse:
        """Rejects a pending proposal."""
        prop = self._pending_proposals.pop(proposal_id, None)
        timestamp = datetime.datetime.utcnow().isoformat()

        symbol = prop["symbol"] if prop else "UNKNOWN"
        strategy = prop["strategy"] if prop else "UNKNOWN"

        record = {
            "proposal_id": proposal_id,
            "symbol": symbol,
            "strategy": strategy,
            "decision": "REJECTED",
            "operator": operator_name,
            "timestamp": timestamp,
            "notes": notes
        }
        self._history.append(record)
        self._save_history()

        logger.info(f"HITL Proposal {proposal_id} REJECTED by {operator_name}")
        return HITLDecisionResponse(
            proposal_id=proposal_id,
            is_approved=False,
            status="REJECTED",
            operator_name=operator_name,
            operator_notes=notes,
            timestamp=timestamp
        )


# Global Singleton
hitl_service = HITLService()
