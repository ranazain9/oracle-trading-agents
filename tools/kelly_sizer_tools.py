"""
ORACLE Trading System - Bayesian Shrinkage & Quarter-Kelly Position Sizing Engine
Calculates risk budget using Bayesian prior shrinkage (prior = 55%, M = 15) and bounds risk to a strict $450 - $600 safety band.
"""
from typing import Dict, Any

class KellyPositionSizer:
    """
    Computes Bayesian-Shrunk Quarter-Kelly risk budgets strictly bounded between $450.00 and $600.00.
    """

    @staticmethod
    def calculate_budget(
        total_trades: int = 69,
        observed_wins: int = 54,
        confidence_score: float = 0.85,
        tot_expected_value_usd: float = 120.0,
        portfolio_cash: float = 100000.0,
        base_budget_usd: float = 500.0,
        sentiment_score: float = 0.0
    ) -> Dict[str, Any]:
        """
        Bayesian Win-Rate Shrinkage Formula:
        p_shrunk = (Observed Wins + M * p_prior) / (Total Trades + M)
        Where:
          p_prior = 0.55 (Conservative market baseline)
          M = 15 (Prior sample weight)
        """
        p_prior = 0.55
        M = 15
        
        # Bayesian Win Rate Shrinkage
        n = max(1, int(total_trades))
        w = max(0, min(n, int(observed_wins)))
        p_shrunk = (w + M * p_prior) / (n + M)
        q_shrunk = 1.0 - p_shrunk
        b = 2.0  # Profit Target ($250) / Max Loss ($150)

        # Full Kelly Fraction based on Shrunk Win Rate
        full_kelly = max(0.0, (p_shrunk * b - q_shrunk) / b)
        
        # Institutional Quarter-Kelly (1/4 Kelly)
        quarter_kelly = max(0.05, full_kelly * 0.25)

        # Confidence & Expected Value Multipliers
        confidence_multiplier = 1.0 + (float(confidence_score) - 0.75) * 0.8
        ev_multiplier = 1.0 + (float(tot_expected_value_usd) / 250.0) * 0.15

        # Soft Sentiment Multiplier (0.80x to 1.0x)
        if sentiment_score > 0.15:
            sentiment_multiplier = 1.00
        elif sentiment_score < -0.15:
            sentiment_multiplier = 0.85  # Soft downsize on negative news
        else:
            sentiment_multiplier = 0.95

        # Raw Scaled Budget
        raw_budget = base_budget_usd * (quarter_kelly / 0.15) * confidence_multiplier * ev_multiplier * sentiment_multiplier

        # Institutional Hard Risk Band: $450.00 Floor, $600.00 Ceiling (0.45% - 0.60% of $100K portfolio)
        final_budget = round(max(450.0, min(600.0, raw_budget)), 2)

        return {
            "dynamic_risk_budget_usd": final_budget,
            "raw_win_rate_pct": round((w / n) * 100, 1),
            "bayesian_shrunk_win_rate_pct": round(p_shrunk * 100, 1),
            "full_kelly_fraction": round(full_kelly, 3),
            "quarter_kelly_fraction": round(quarter_kelly, 3),
            "confidence_multiplier": round(confidence_multiplier, 2),
            "ev_multiplier": round(ev_multiplier, 2),
            "sentiment_multiplier": round(sentiment_multiplier, 2),
            "sizing_regime": "INSTITUTIONAL_CAPITAL_PRESERVATION" if final_budget <= 480 else ("BALANCED_QUANT_DISCIPLINE" if final_budget <= 550 else "MAX_EDGE_CONSERVATIVE_CAP")
        }
