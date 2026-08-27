"""
ORACLE Trading Agent - Strategy 1: Earnings Straddle (Volatility Expansion)
Buys ATM Call + ATM Put ahead of high-impact catalysts when IV rank is low (< 40%).
"""
from typing import Dict, Any
from strategies.base_strategy import BaseStrategy, StrategyOrderBlueprint, OptionLeg

class EarningsStraddleStrategy(BaseStrategy):
    """
    Calculates strike prices and contracts for Long Straddles.
    """

    def calculate_order(
        self,
        symbol: str,
        current_price: float,
        risk_budget_usd: float = 600.0,
        target_profit_percent: float = 50.0,
        max_loss_usd: float = 150.0
    ) -> StrategyOrderBlueprint:
        # 1. Round to nearest standard options strike
        strike_step = 5.0 if current_price > 100 else 1.0
        atm_strike = round(current_price / strike_step) * strike_step

        # 2. Estimate options premium (approx 3.5% of stock price per leg)
        est_call_premium = round(current_price * 0.035, 2)
        est_put_premium = round(current_price * 0.035, 2)
        total_straddle_cost_per_contract = round((est_call_premium + est_put_premium) * 100, 2)

        # 3. Calculate position size based on risk budget
        qty = max(1, int(risk_budget_usd / max(total_straddle_cost_per_contract, 100)))

        legs = [
            OptionLeg(
                symbol=symbol,
                option_type="CALL",
                strike=atm_strike,
                expiration="Front-Month (Weekly)",
                side="BUY",
                qty=qty,
                estimated_premium=est_call_premium
            ),
            OptionLeg(
                symbol=symbol,
                option_type="PUT",
                strike=atm_strike,
                expiration="Front-Month (Weekly)",
                side="BUY",
                qty=qty,
                estimated_premium=est_put_premium
            )
        ]

        total_debit = round((est_call_premium + est_put_premium) * 100 * qty, 2)
        profit_target = round(total_debit * (target_profit_percent / 100.0), 2)

        return StrategyOrderBlueprint(
            strategy_name="EARNINGS_STRADDLE",
            underlying_symbol=symbol,
            current_stock_price=current_price,
            legs=legs,
            total_debit_or_credit=total_debit,
            is_credit=False,
            max_risk_usd=total_debit,
            profit_target_usd=profit_target,
            stop_loss_usd=max_loss_usd
        )
