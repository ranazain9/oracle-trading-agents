"""
ORACLE Trading Agent - Tree-of-Thoughts (ToT) Scenario Payoff & Expected Value Engine
Simulates 3 parallel future market outcomes (Bullish +4.5%, Flat 0%, Bearish -4.5%) and computes mathematical Expected Value (EV).
"""
from typing import Dict, Any, List

class TreeOfThoughtsEngine:
    """
    Computes multi-scenario payoff matrices and probability-weighted Expected Values (EV) for options strategies.
    """

    @staticmethod
    def simulate_scenarios(
        symbol: str,
        stock_price: float,
        iv_rank: float,
        expected_move_usd: float,
        risk_budget_usd: float = 600.0
    ) -> Dict[str, Any]:
        """
        Simulates 3 future market branches:
        Branch 1 (Bullish Surge +4.5%)
        Branch 2 (Rangebound Flat 0.0%)
        Branch 3 (Bearish Drop -4.5%)
        """
        S = float(stock_price)
        budget = float(risk_budget_usd)
        
        # Probabilities based on IV rank and historical distribution
        if iv_rank < 40:
            # Low IV = higher probability of explosive expansion
            p_bull = 0.35
            p_flat = 0.30
            p_bear = 0.35
        elif iv_rank > 60:
            # High IV = higher probability of rangebound mean-reversion
            p_bull = 0.20
            p_flat = 0.60
            p_bear = 0.20
        else:
            # Balanced distribution
            p_bull = 0.30
            p_flat = 0.40
            p_bear = 0.30

        # 1. Strategy 1: EARNINGS_STRADDLE (Buy ATM Call + Buy ATM Put)
        # Profits on big moves (+/-4.5%), loses to theta on flat
        straddle_bull_pnl = round(budget * 0.50, 2)   # +50% target hit
        straddle_flat_pnl = -150.0                   # Hard stop loss hit by theta decay
        straddle_bear_pnl = round(budget * 0.50, 2)   # +50% target hit
        straddle_ev = round((p_bull * straddle_bull_pnl) + (p_flat * straddle_flat_pnl) + (p_bear * straddle_bear_pnl), 2)

        # 2. Strategy 2: THETA_IRON_CONDOR (Sell OTM Put Spread + Sell OTM Call Spread)
        # Profits on flat (0%), capped loss or wing salvage on big moves (+/-4.5%)
        condor_bull_pnl = -150.0                     # Stop loss hit on upside breach
        condor_flat_pnl = round(budget * 0.50, 2)    # +50% credit collected
        condor_bear_pnl = -150.0                     # Stop loss hit on downside breach
        condor_ev = round((p_bull * condor_bull_pnl) + (p_flat * condor_flat_pnl) + (p_bear * condor_bear_pnl), 2)

        # 3. Strategy 3: DIRECTIONAL_BULL_CALL_SPREAD
        spread_bull_pnl = round(budget * 0.50, 2)    # +50% target hit
        spread_flat_pnl = -75.0                      # Modest partial loss
        spread_bear_pnl = -150.0                     # Hard stop loss hit
        spread_ev = round((p_bull * spread_bull_pnl) + (p_flat * spread_flat_pnl) + (p_bear * spread_bear_pnl), 2)

        # Determine optimal mathematical candidate by highest EV
        ev_rankings = [
            {"strategy": "EARNINGS_STRADDLE", "expected_value_usd": straddle_ev, "win_scenarios": "Bull (+4.5%) & Bear (-4.5%)"},
            {"strategy": "THETA_IRON_CONDOR", "expected_value_usd": condor_ev, "win_scenarios": "Flat (0.0%)"},
            {"strategy": "DIRECTIONAL_SPREAD", "expected_value_usd": spread_ev, "win_scenarios": "Bull (+4.5%)"}
        ]
        ev_rankings.sort(key=lambda x: x["expected_value_usd"], reverse=True)

        return {
            "symbol": symbol,
            "stock_price": S,
            "scenario_probabilities": {
                "bullish_surge_plus_4_5pct": round(p_bull * 100, 1),
                "rangebound_flat_0pct": round(p_flat * 100, 1),
                "bearish_drop_minus_4_5pct": round(p_bear * 100, 1)
            },
            "payoff_matrix": {
                "EARNINGS_STRADDLE": {
                    "bull_pnl": straddle_bull_pnl,
                    "flat_pnl": straddle_flat_pnl,
                    "bear_pnl": straddle_bear_pnl,
                    "expected_value": straddle_ev
                },
                "THETA_IRON_CONDOR": {
                    "bull_pnl": condor_bull_pnl,
                    "flat_pnl": condor_flat_pnl,
                    "bear_pnl": condor_bear_pnl,
                    "expected_value": condor_ev
                },
                "DIRECTIONAL_SPREAD": {
                    "bull_pnl": spread_bull_pnl,
                    "flat_pnl": spread_flat_pnl,
                    "bear_pnl": spread_bear_pnl,
                    "expected_value": spread_ev
                }
            },
            "highest_ev_strategy": ev_rankings[0]["strategy"],
            "highest_ev_amount_usd": ev_rankings[0]["expected_value_usd"],
            "ev_rankings": ev_rankings
        }
