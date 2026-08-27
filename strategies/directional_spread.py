"""
ORACLE Trading Agent - Strategy 3: Directional Vertical Spreads
Deploys Bull Call Spreads or Bear Put Spreads when directional momentum is strong.
"""
from strategies.base_strategy import BaseStrategy, StrategyOrderBlueprint, OptionLeg

class DirectionalSpreadStrategy(BaseStrategy):
    """
    Calculates 2-leg Vertical Debit Spreads.
    """

    def calculate_order(
        self,
        symbol: str,
        current_price: float,
        direction: str = "BULLISH",
        risk_budget_usd: float = 600.0,
        target_profit_percent: float = 50.0,
        max_loss_usd: float = 150.0
    ) -> StrategyOrderBlueprint:
        strike_step = 5.0 if current_price > 100 else 1.0
        width = 5.0 if current_price > 100 else 2.5

        if direction.upper() == "BULLISH":
            buy_strike = round(current_price / strike_step) * strike_step
            sell_strike = buy_strike + width
            opt_type = "CALL"
            est_buy_prem = 3.50
            est_sell_prem = 1.20
        else:
            buy_strike = round(current_price / strike_step) * strike_step
            sell_strike = buy_strike - width
            opt_type = "PUT"
            est_buy_prem = 3.50
            est_sell_prem = 1.20

        net_debit_per_share = est_buy_prem - est_sell_prem
        cost_per_contract = net_debit_per_share * 100
        qty = max(1, int(risk_budget_usd / max(cost_per_contract, 100)))

        legs = [
            OptionLeg(symbol=symbol, option_type=opt_type, strike=buy_strike, expiration="Front-Month", side="BUY", qty=qty, estimated_premium=est_buy_prem),
            OptionLeg(symbol=symbol, option_type=opt_type, strike=sell_strike, expiration="Front-Month", side="SELL", qty=qty, estimated_premium=est_sell_prem)
        ]

        total_debit = round(cost_per_contract * qty, 2)
        profit_target = round(total_debit * (target_profit_percent / 100.0), 2)

        return StrategyOrderBlueprint(
            strategy_name=f"DIRECTIONAL_VERTICAL_{opt_type}_SPREAD",
            underlying_symbol=symbol,
            current_stock_price=current_price,
            legs=legs,
            total_debit_or_credit=total_debit,
            is_credit=False,
            max_risk_usd=total_debit,
            profit_target_usd=profit_target,
            stop_loss_usd=max_loss_usd
        )
