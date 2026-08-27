"""
ORACLE Trading Agent - Deterministic Post-AI Risk Validator
The Safety Gatekeeper: Enforces 5 Hard Quantitative Veto Rules on AI Strategy Proposals.
"""
from typing import Dict, Any, Tuple
from pydantic import BaseModel

class ValidationResult(BaseModel):
    is_approved: bool
    status_code: str  # "APPROVED" or "REJECTED_VETO"
    veto_reason: str
    liquidity_check: bool
    spread_check: bool
    breakeven_feasibility_check: bool
    iv_crush_check: bool
    conflict_check: bool

class RiskValidator:
    """
    Pure deterministic Python safety engine that intercepts AI recommendations.
    """

    @staticmethod
    def validate_proposal(
        ai_proposal: Any,
        greeks: Dict[str, Any],
        liquidity: Dict[str, Any],
        breakeven: Dict[str, Any],
        sentiment_score: float,
        put_call_ratio: float
    ) -> ValidationResult:
        """
        Runs 5 Hard Veto Rules. If any check fails, vetoes the trade and forces NO_TRADE.
        """
        spread_pct = liquidity.get("bid_ask_spread_pct", 1.5)
        open_interest = liquidity.get("open_interest", 1000)
        iv_crush_score = liquidity.get("iv_crush_risk_score", 30.0)
        is_feasible = breakeven.get("is_breakeven_feasible", True)
        confidence = getattr(ai_proposal, "confidence_score", 0.70)
        strategy = getattr(ai_proposal, "strategy", "NO_TRADE")

        # 1. Check AI Confidence
        if confidence < 0.60 or strategy == "NO_TRADE":
            return ValidationResult(
                is_approved=False,
                status_code="REJECTED_VETO",
                veto_reason=f"VETO: AI Confidence ({confidence*100:.1f}%) is below minimum 60% threshold or strategy is NO_TRADE.",
                liquidity_check=True,
                spread_check=True,
                breakeven_feasibility_check=True,
                iv_crush_check=True,
                conflict_check=True
            )

        # 2. VETO RULE 1: Bid-Ask Spread Width
        if spread_pct > 5.0:
            return ValidationResult(
                is_approved=False,
                status_code="REJECTED_VETO",
                veto_reason=f"VETO: Bid-Ask spread width ({spread_pct:.1f}%) exceeds 5.0% maximum slippage threshold.",
                liquidity_check=True,
                spread_check=False,
                breakeven_feasibility_check=True,
                iv_crush_check=True,
                conflict_check=True
            )

        # 3. VETO RULE 2: Open Interest Liquidity
        if open_interest < 500:
            return ValidationResult(
                is_approved=False,
                status_code="REJECTED_VETO",
                veto_reason=f"VETO: Open Interest ({open_interest}) is below 500 contract institutional liquidity threshold.",
                liquidity_check=False,
                spread_check=True,
                breakeven_feasibility_check=True,
                iv_crush_check=True,
                conflict_check=True
            )

        # 4. VETO RULE 3: Expected Move vs Break-Even Feasibility
        if strategy == "EARNINGS_STRADDLE" and not is_feasible:
            return ValidationResult(
                is_approved=False,
                status_code="REJECTED_VETO",
                veto_reason=f"VETO: Market Expected Move (${breakeven.get('market_expected_move_usd'):.2f}) is smaller than required break-even move (${breakeven.get('required_move_usd'):.2f}).",
                liquidity_check=True,
                spread_check=True,
                breakeven_feasibility_check=False,
                iv_crush_check=True,
                conflict_check=True
            )

        # 5. VETO RULE 4: Extreme IV Crush Risk on Long Options
        if strategy == "EARNINGS_STRADDLE" and iv_crush_score > 80.0:
            return ValidationResult(
                is_approved=False,
                status_code="REJECTED_VETO",
                veto_reason=f"VETO: Severe IV Crush Risk ({iv_crush_score:.1f}/100). Implied Volatility collapse post-earnings will destroy premium.",
                liquidity_check=True,
                spread_check=True,
                breakeven_feasibility_check=True,
                iv_crush_check=False,
                conflict_check=True
            )

        # 6. VETO RULE 5: Signal Conflict Check
        if sentiment_score > 0.50 and put_call_ratio > 1.35 and strategy.startswith("DIRECTIONAL"):
            return ValidationResult(
                is_approved=False,
                status_code="REJECTED_VETO",
                veto_reason=f"VETO: Signal conflict between bullish news (+{sentiment_score:.2f}) and heavy institutional put buying ({put_call_ratio:.2f} PCR).",
                liquidity_check=True,
                spread_check=True,
                breakeven_feasibility_check=True,
                iv_crush_check=True,
                conflict_check=False
            )

        # ALL CHECKS PASSED
        return ValidationResult(
            is_approved=True,
            status_code="APPROVED",
            veto_reason="APPROVED: All 5 quantitative safety checks and liquidity guardrails passed.",
            liquidity_check=True,
            spread_check=True,
            breakeven_feasibility_check=True,
            iv_crush_check=True,
            conflict_check=True
        )
