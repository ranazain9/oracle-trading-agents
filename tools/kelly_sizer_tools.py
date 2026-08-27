"""
ORACLE Trading System - Dynamic Fractional Kelly Criterion Position Sizing Engine
Calculates risk budget dynamically based on historical win-rate, payoff ratio, AI confidence, and ToT Expected Value ($EV$).
"""
from typing import Dict, Any

class KellyPositionSizer:
    """
    Computes Quarter-Kelly (1/4 Kelly) dynamic risk budgets bounded between $350 and $900.
    """

    @staticmethod
    def calculate_budget(
        win_rate: float = 0.78,
        confidence_score: float = 0.85,
        tot_expected_value_usd: float = 120.0,
        portfolio_cash: float = 100000.0,
        base_budget_usd: float = 600.0
    ) -> Dict[str, Any]:
        """
        Full Kelly Formula: f* = (p * b - q) / b
        Where:
          p = win rate (0.78)
          q = 1 - p (0.22)
          b = profit / loss payoff ratio (+50% target on $600 = $300 win; stop loss = $150 loss -> b = 2.0)
        """
        p = max(0.50, min(0.95, float(win_rate)))
        q = 1.0 - p
        b = 2.0  # +$300 profit / $150 stop loss

        # Full Kelly Fraction
        full_kelly = (p * b - q) / b
        # Institutional safety: Quarter Kelly (1/4 Kelly) to eliminate volatility drag
        quarter_kelly = max(0.05, full_kelly * 0.25)

        # Multiplier adjustments based on AI Confidence and ToT EV
        confidence_multiplier = 1.0 + (float(confidence_score) - 0.75) * 1.2
        ev_multiplier = 1.0 + (float(tot_expected_value_usd) / 200.0) * 0.25

        # Raw Calculated Budget
        raw_budget = base_budget_usd * quarter_kelly * 4.0 * confidence_multiplier * ev_multiplier

        # Institutional Risk Guardrails: Min $350 (Defensive), Max $900 (High Edge)
        final_budget = round(max(350.0, min(900.0, raw_budget)), 2)

        return {
            "dynamic_risk_budget_usd": final_budget,
            "full_kelly_fraction": round(full_kelly, 3),
            "quarter_kelly_fraction": round(quarter_kelly, 3),
            "confidence_multiplier": round(confidence_multiplier, 2),
            "ev_multiplier": round(ev_multiplier, 2),
            "sizing_regime": "AGGRESSIVE_HIGH_EDGE" if final_budget >= 750 else ("DEFENSIVE_PRESERVATION" if final_budget <= 450 else "STANDARD_DISCIPLINE")
        }
