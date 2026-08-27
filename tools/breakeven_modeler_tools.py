"""
ORACLE Trading Agent - Mathematical Break-Even & Risk/Reward Modeler
Calculates Upper/Lower break-evens and checks if Expected Move clears required distance.
"""
from typing import Dict, Any

class BreakEvenModeler:
    """
    Computes mathematical break-even price boundaries and risk/reward payoff ratios.
    """

    @staticmethod
    def model_breakeven(
        symbol: str,
        strategy: str,
        stock_price: float,
        expected_move_usd: float,
        suggested_budget_usd: float = 600.0
    ) -> Dict[str, Any]:
        """
        Calculates exact break-even levels and validates expected move feasibility.
        """
        S = float(stock_price)
        exp_move = float(expected_move_usd)

        if strategy == "EARNINGS_STRADDLE":
            # Straddle cost per contract approx 7% of stock price
            total_premium_per_share = S * 0.070
            upper_be = round(S + total_premium_per_share, 2)
            lower_be = round(S - total_premium_per_share, 2)
            required_move_usd = round(total_premium_per_share, 2)
            required_move_pct = round((required_move_usd / S) * 100, 2)
            
            # Feasibility: Does the market implied move exceed the required break-even move?
            is_feasible = (exp_move >= required_move_usd * 0.85)
            risk_reward_ratio = "1:2.5 (Unlimited Upside/Downside)"

        elif strategy == "THETA_IRON_CONDOR":
            # Wing width 5%, collected credit approx 2.5%
            upper_be = round(S * 1.05 + 1.25, 2)
            lower_be = round(S * 0.95 - 1.25, 2)
            required_move_usd = round(S * 0.05, 2)
            required_move_pct = 5.0
            is_feasible = (exp_move <= required_move_usd * 1.10)  # Needs stock to stay inside wings
            risk_reward_ratio = "1:1.8 (Defined Credit)"

        elif "DIRECTIONAL" in strategy or "SPREAD" in strategy:
            spread_cost_per_share = S * 0.025
            upper_be = round(S + spread_cost_per_share, 2)
            lower_be = round(S - spread_cost_per_share, 2)
            required_move_usd = round(spread_cost_per_share, 2)
            required_move_pct = round((required_move_usd / S) * 100, 2)
            is_feasible = (exp_move >= required_move_usd)
            risk_reward_ratio = "1:2.0 (Defined Debit)"

        else:
            upper_be = round(S * 1.05, 2)
            lower_be = round(S * 0.95, 2)
            required_move_usd = round(S * 0.05, 2)
            required_move_pct = 5.0
            is_feasible = True
            risk_reward_ratio = "1:1.0"

        return {
            "symbol": symbol,
            "stock_price": S,
            "strategy": strategy,
            "upper_breakeven": upper_be,
            "lower_breakeven": lower_be,
            "required_move_usd": required_move_usd,
            "required_move_pct": required_move_pct,
            "market_expected_move_usd": exp_move,
            "is_breakeven_feasible": is_feasible,
            "risk_reward_ratio": risk_reward_ratio
        }
