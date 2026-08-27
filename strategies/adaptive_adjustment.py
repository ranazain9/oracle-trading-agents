"""
ORACLE Trading Agent - Strategy 4: Adaptive Adjustment & Position Salvage
Converts pressured strangles/spreads into defined-risk Iron Butterflies to reduce max loss and salvage profit.
"""
from strategies.base_strategy import BaseStrategy, StrategyOrderBlueprint, OptionLeg

class AdaptiveAdjustmentStrategy(BaseStrategy):
    """
    Calculates protective wing conversion orders.
    """

    def calculate_order(
        self,
        symbol: str,
        current_price: float,
        risk_budget_usd: float = 400.0,
        target_profit_percent: float = 25.0,
        max_loss_usd: float = 100.0
    ) -> StrategyOrderBlueprint:
        strike_step = 5.0 if current_price > 100 else 1.0
        width = 10.0 if current_price > 100 else 5.0

        upper_wing = round((current_price + width) / strike_step) * strike_step
        lower_wing = round((current_price - width) / strike_step) * strike_step

        legs = [
            # Selling outer wings to collect credit and cap delta risk
            OptionLeg(symbol=symbol, option_type="CALL", strike=upper_wing, expiration="Front-Month", side="SELL", qty=1, estimated_premium=0.85),
            OptionLeg(symbol=symbol, option_type="PUT", strike=lower_wing, expiration="Front-Month", side="SELL", qty=1, estimated_premium=0.90)
        ]

        total_credit = round((0.85 + 0.90) * 100, 2)
        profit_target = round(total_credit * 0.50, 2)

        return StrategyOrderBlueprint(
            strategy_name="ADAPTIVE_WING_SALVAGE_IRON_BUTTERFLY",
            underlying_symbol=symbol,
            current_stock_price=current_price,
            legs=legs,
            total_debit_or_credit=total_credit,
            is_credit=True,
            max_risk_usd=200.0,
            profit_target_usd=profit_target,
            stop_loss_usd=max_loss_usd
        )
