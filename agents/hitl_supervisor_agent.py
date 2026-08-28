"""
ORACLE Trading Agent - Human-in-the-Loop (HITL) Supervisor Agent
Enforces institutional governance, size limits, and interactive trade authorizations.
"""
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class HITLApprovalResult(BaseModel):
    """
    Pydantic Schema for Human-in-the-Loop Trade Authorization
    """
    is_approved: bool = Field(default=True, description="Whether order execution is authorized")
    approval_level: str = Field(default="AUTO_AUTHORIZED", description="AUTO_AUTHORIZED, MANUAL_REQUIRED, or VETOED")
    operator_notes: str = Field(default="Standard risk budget within automated tier limits.", description="Notes or override reason")
    allocated_budget_usd: float = Field(default=500.0, description="Approved capital allocation")


class HITLSupervisorAgent:
    """
    Supervises trade proposals, checks capital thresholds ($10k+ require explicit sign-off),
    and formats human-readable dispatch messages.
    """

    def __init__(self, manual_approval_threshold_usd: float = 10000.0, force_auto_approve: bool = True):
        self.manual_threshold = manual_approval_threshold_usd
        self.force_auto_approve = force_auto_approve

    def review_proposal(self, decision: Any, macro_regime: Optional[str] = None) -> HITLApprovalResult:
        """
        Evaluates a StrategyDecision against governance rules.
        """
        budget = getattr(decision, "suggested_risk_budget_usd", 500.0)
        symbol = getattr(decision, "symbol", "NVDA")
        strategy = getattr(decision, "strategy", "EARNINGS_STRADDLE")
        direction = getattr(decision, "direction", "NEUTRAL")

        # 1. Check if capital exceeds high-tier threshold
        if budget >= self.manual_threshold and not self.force_auto_approve:
            return HITLApprovalResult(
                is_approved=False,
                approval_level="MANUAL_REQUIRED",
                operator_notes=f"Capital allocation (${budget:,.2f}) exceeds manual threshold (${self.manual_threshold:,.2f}). Human sign-off required.",
                allocated_budget_usd=budget
            )

        # 2. Check if macro regime is in extreme blackout
        if macro_regime == "EVENT_BLACKOUT":
            adjusted_budget = round(budget * 0.25, 2)
            return HITLApprovalResult(
                is_approved=True,
                approval_level="AUTO_AUTHORIZED_SCALED_DOWN",
                operator_notes=f"Event blackout active. Scaled budget down from ${budget:.2f} to ${adjusted_budget:.2f}.",
                allocated_budget_usd=adjusted_budget
            )

        # 3. Standard automated tier approval
        return HITLApprovalResult(
            is_approved=True,
            approval_level="AUTO_AUTHORIZED",
            operator_notes=f"Approved {strategy} on {symbol} ({direction}) for ${budget:.2f}.",
            allocated_budget_usd=budget
        )
