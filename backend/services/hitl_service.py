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
from backend.db.repositories import HitlRepository


class HITLService:
    """
    In-memory and SQLite-persisted governance engine for human sign-offs.
    """

    def __init__(self):
        self._pending_proposals: Dict[str, Dict[str, Any]] = {}
        self._history: List[Dict[str, Any]] = []
        self._load_history()

    def _load_history(self):
        try:
            self._history = HitlRepository.get_history()
        except Exception as e:
            logger.warning(f"HitlRepository load notice: {e}")
            self._history = []

    def _save_history(self):
        pass  # HitlRepository saves on each write

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
        """Registers a proposal in the pending queue and saves to SQLite."""
        prop_id = f"PROP-{uuid.uuid4().hex[:8].upper()}"
        prop_data = {
            "proposal_id": prop_id,
            "symbol": symbol,
            "strategy": strategy,
            "direction": direction,
            "suggested_risk_budget_usd": budget,
            "allocation_usd": budget,
            "confidence_score": confidence,
            "reasoning": reasoning,
            "macro_regime": macro_regime,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "status": "PENDING_APPROVAL",
            "decision_payload": decision_payload or {}
        }
        self._pending_proposals[prop_id] = prop_data
        try:
            HitlRepository.save_proposal(prop_data)
        except Exception as e:
            logger.warning(f"Failed to persist proposal to SQLite: {e}")

        logger.info(f"Registered pending HITL proposal: {prop_id} for {strategy} on {symbol}")
        return prop_id

    def list_pending(self) -> List[PendingApprovalSchema]:
        """Returns all currently active proposals awaiting review from SQLite/Memory."""
        try:
            db_pending = HitlRepository.get_pending_proposals()
            if db_pending:
                for p in db_pending:
                    if p["proposal_id"] not in self._pending_proposals:
                        self._pending_proposals[p["proposal_id"]] = p
        except Exception:
            pass

        return [
            PendingApprovalSchema(
                proposal_id=p.get("proposal_id", ""),
                symbol=p.get("symbol", "NVDA"),
                strategy=p.get("strategy", "THETA_CONDOR"),
                direction=p.get("direction", "NEUTRAL"),
                suggested_risk_budget_usd=float(p.get("suggested_risk_budget_usd", p.get("allocation_usd", 500.0))),
                confidence_score=float(p.get("confidence_score", 0.85)),
                reasoning=p.get("reasoning", ""),
                macro_regime=p.get("macro_regime", "BULLISH_TREND"),
                created_at=p.get("created_at", p.get("timestamp", "")),
                status=p.get("status", "PENDING_APPROVAL")
            )
            for p in self._pending_proposals.values()
        ]

    def list_history(self) -> List[HITLHistorySchema]:
        """Returns historical decisions from SQLite."""
        try:
            db_hist = HitlRepository.get_history()
            return [
                HITLHistorySchema(
                    proposal_id=h.get("proposal_id", ""),
                    symbol=h.get("symbol", "NVDA"),
                    strategy=h.get("strategy", "THETA_CONDOR"),
                    decision=h.get("status", "APPROVED"),
                    operator=h.get("operator_name", "Risk Desk Officer"),
                    timestamp=h.get("timestamp", ""),
                    notes=h.get("notes", "")
                )
                for h in db_hist[-50:]
            ]
        except Exception:
            return [HITLHistorySchema(**h) for h in self._history[-50:]]

    def approve(
        self,
        proposal_id: str,
        operator_name: str = "Risk Desk Operator",
        notes: str = "Authorized",
        adjusted_budget_usd: Optional[float] = None
    ) -> HITLDecisionResponse:
        """Approves a pending proposal and records to SQLite."""
        prop = self._pending_proposals.pop(proposal_id, None)
        timestamp = datetime.datetime.utcnow().isoformat()
        
        symbol = prop["symbol"] if prop else "UNKNOWN"
        strategy = prop["strategy"] if prop else "UNKNOWN"

        record = {
            "proposal_id": proposal_id,
            "symbol": symbol,
            "strategy": strategy,
            "decision": "APPROVED",
            "status": "APPROVED",
            "operator": operator_name,
            "operator_name": operator_name,
            "timestamp": timestamp,
            "notes": notes
        }
        self._history.append(record)
        try:
            HitlRepository.update_decision(proposal_id, "APPROVED", operator_name, notes)
        except Exception as e:
            logger.warning(f"Failed to record decision to SQLite: {e}")

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
        """Rejects a pending proposal and records to SQLite."""
        prop = self._pending_proposals.pop(proposal_id, None)
        timestamp = datetime.datetime.utcnow().isoformat()

        symbol = prop["symbol"] if prop else "UNKNOWN"
        strategy = prop["strategy"] if prop else "UNKNOWN"

        record = {
            "proposal_id": proposal_id,
            "symbol": symbol,
            "strategy": strategy,
            "decision": "REJECTED",
            "status": "REJECTED",
            "operator": operator_name,
            "operator_name": operator_name,
            "timestamp": timestamp,
            "notes": notes
        }
        self._history.append(record)
        try:
            HitlRepository.update_decision(proposal_id, "REJECTED", operator_name, notes)
        except Exception as e:
            logger.warning(f"Failed to record decision to SQLite: {e}")

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
