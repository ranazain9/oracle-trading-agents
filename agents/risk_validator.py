"""
ORACLE Trading Agent - Deterministic Code Risk Validator
Pure Python deterministic gatekeeper enforcing 4 Hard Mathematical Veto Rules.
News sentiment is treated as a soft sizing factor rather than a binary kill-switch.
"""
from typing import Dict, Any
from pydantic import BaseModel, Field


class ValidationResult(BaseModel):
    """
    Result of deterministic risk validation.
    """
    is_approved: bool
    status_code: str  # "APPROVED" or "REJECTED_VETO"
    veto_reason: str
    veto_details: Dict[str, Any] = Field(default_factory=dict)


class RiskValidator:
    """
    Deterministic Post-AI Safety Gatekeeper.
    Enforces 4 physical code veto rules on all AI proposals.
    """

    MAX_SPREAD_PERCENT = 5.0          # Max acceptable ATM bid-ask spread width (%)
    MIN_OPEN_INTEREST = 500           # Minimum ATM open interest contracts
    MAX_IV_CRUSH_SCORE = 80.0         # Max acceptable IV crush score ahead of earnings

    @classmethod
    def validate_proposal(
        cls,
        ai_proposal: Any,
        greeks: Dict[str, Any],
        liquidity: Dict[str, Any],
        breakeven: Dict[str, Any],
        sentiment_score: float = 0.0,
        put_call_ratio: float = 0.8
    ) -> ValidationResult:
        """
        Executes 4 Hard Mathematical Veto Checks:
        1. Maximum Bid-Ask Spread Width (<= 5.0%)
        2. Minimum Open Interest (>= 500 contracts)
        3. Break-Even Clearance (Expected Move >= Break-Even distance)
        4. IV Crush Threshold (< 80.0)
        """
        # Extract strategy and direction
        strategy = getattr(ai_proposal, "strategy", getattr(ai_proposal, "candidate_strategy", "EARNINGS_STRADDLE"))
        direction = getattr(ai_proposal, "direction", getattr(ai_proposal, "candidate_direction", "NEUTRAL"))

        # --- VETO RULE 1: Maximum Bid-Ask Spread Width ---
        spread_pct = float(liquidity.get("bid_ask_spread_pct", 0.0))
        if spread_pct > cls.MAX_SPREAD_PERCENT:
            return ValidationResult(
                is_approved=False,
                status_code="REJECTED_VETO",
                veto_reason=f"VETO: Bid-Ask spread width ({spread_pct:.1f}%) exceeds {cls.MAX_SPREAD_PERCENT}% maximum slippage threshold.",
                veto_details={"spread_pct": spread_pct, "threshold": cls.MAX_SPREAD_PERCENT}
            )

        # --- VETO RULE 2: Minimum Open Interest ---
        open_interest = int(liquidity.get("open_interest", 0))
        if open_interest < cls.MIN_OPEN_INTEREST:
            return ValidationResult(
                is_approved=False,
                status_code="REJECTED_VETO",
                veto_reason=f"VETO: ATM Open interest ({open_interest:,} contracts) is below {cls.MIN_OPEN_INTEREST:,} liquidity depth floor.",
                veto_details={"open_interest": open_interest, "threshold": cls.MIN_OPEN_INTEREST}
            )

        # --- VETO RULE 3: Break-Even Clearance (Straddles only) ---
        if strategy == "EARNINGS_STRADDLE":
            is_be_feasible = breakeven.get("is_breakeven_feasible", True)
            if not is_be_feasible:
                req_move = breakeven.get("required_move_usd", 0.0)
                exp_move = breakeven.get("market_expected_move_usd", 0.0)
                return ValidationResult(
                    is_approved=False,
                    status_code="REJECTED_VETO",
                    veto_reason=f"VETO: Market Expected Move (±${exp_move:.2f}) does not clear required break-even move (${req_move:.2f}).",
                    veto_details={"expected_move": exp_move, "required_move": req_move}
                )

        # --- VETO RULE 4: Maximum Post-Earnings IV Crush Score ---
        iv_crush = float(liquidity.get("iv_crush_risk_score", 0.0))
        if iv_crush >= cls.MAX_IV_CRUSH_SCORE and strategy == "EARNINGS_STRADDLE":
            return ValidationResult(
                is_approved=False,
                status_code="REJECTED_VETO",
                veto_reason=f"VETO: Post-earnings IV crush risk score ({iv_crush:.1f}) exceeds {cls.MAX_IV_CRUSH_SCORE} ceiling.",
                veto_details={"iv_crush_score": iv_crush, "threshold": cls.MAX_IV_CRUSH_SCORE}
            )

        # All 4 Hard Mathematical Veto Checks Passed!
        return ValidationResult(
            is_approved=True,
            status_code="APPROVED",
            veto_reason="APPROVED: All 4 quantitative safety checks and liquidity guardrails passed.",
            veto_details={
                "spread_pct": spread_pct,
                "open_interest": open_interest,
                "iv_crush_score": iv_crush,
                "strategy": strategy
            }
        )
