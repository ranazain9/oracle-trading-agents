"""
ORACLE Trading Agent - Black-Scholes Greeks & Expected Move Engine
Calculates Delta, Gamma, Theta ($/day), Vega, and Market-Implied Expected Move.
"""
import math
from typing import Dict, Any

class GreeksCalculator:
    """
    Quantitative options pricing and Greeks mathematical engine.
    """

    @staticmethod
    def _norm_cdf(x: float) -> float:
        """Standard normal cumulative distribution function."""
        return (1.0 + math.erf(x / math.sqrt(2.0))) / 2.0

    @staticmethod
    def _norm_pdf(x: float) -> float:
        """Standard normal probability density function."""
        return (1.0 / math.sqrt(2.0 * math.pi)) * math.exp(-0.5 * x * x)

    @staticmethod
    def calculate_greeks(
        stock_price: float,
        strike_price: float,
        iv_percent: float,
        dte_days: int = 7,
        risk_free_rate: float = 0.05
    ) -> Dict[str, Any]:
        """
        Computes Black-Scholes Delta, Gamma, Theta ($/day), Vega, and Market Expected Move.
        """
        S = float(stock_price)
        K = float(strike_price)
        sigma = max(float(iv_percent) / 100.0, 0.05)
        T = max(float(dte_days) / 365.0, 0.001)
        r = float(risk_free_rate)

        d1 = (math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * math.sqrt(T))
        d2 = d1 - sigma * math.sqrt(T)

        # 1. Delta
        call_delta = round(GreeksCalculator._norm_cdf(d1), 3)
        put_delta = round(call_delta - 1.0, 3)

        # 2. Gamma
        gamma = round(GreeksCalculator._norm_pdf(d1) / (S * sigma * math.sqrt(T)), 4)

        # 3. Theta (Decay in $ per contract per day)
        theta_call_raw = -(S * GreeksCalculator._norm_pdf(d1) * sigma) / (2.0 * math.sqrt(T)) - r * K * math.exp(-r * T) * GreeksCalculator._norm_cdf(d2)
        theta_per_day_usd = round((theta_call_raw / 365.0) * 100, 2)  # Per 100-share contract

        # 4. Vega ($ change per 1% move in IV per contract)
        vega_per_contract_usd = round((S * GreeksCalculator._norm_pdf(d1) * math.sqrt(T) / 100.0) * 100, 2)

        # 5. Market-Implied Expected Move ($ +/-)
        expected_move_usd = round(S * sigma * math.sqrt(T), 2)
        expected_move_pct = round((expected_move_usd / S) * 100, 2)

        return {
            "stock_price": S,
            "strike_price": K,
            "iv_annualized_pct": round(sigma * 100, 1),
            "dte_days": dte_days,
            "call_delta": call_delta,
            "put_delta": put_delta,
            "gamma": gamma,
            "theta_per_day_usd": theta_per_day_usd,
            "vega_per_contract_usd": vega_per_contract_usd,
            "expected_move_usd": expected_move_usd,
            "expected_move_pct": expected_move_pct,
            "upper_expected_boundary": round(S + expected_move_usd, 2),
            "lower_expected_boundary": round(S - expected_move_usd, 2)
        }
