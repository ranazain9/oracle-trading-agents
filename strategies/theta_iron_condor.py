"""
ORACLE Trading Agent - Strategy 2: Theta Iron Condor (Premium Selling)
Sells OTM Put Spread + Sells OTM Call Spread to collect theta decay in rangebound markets when IV rank is high (> 55%).
"""
from strategies.base_strategy import BaseStrategy, StrategyOrderBlueprint, OptionLeg

class ThetaIronCondorStrategy(BaseStrategy):
    """
    Calculates 4-leg Iron Condor strikes and net credit.
    """

    def calculate_order(
        self,
        symbol: str,
        current_price: float,
        risk_budget_usd: float = 600.0,
        target_profit_percent: float = 50.0,
        max_loss_usd: float = 150.0
    ) -> StrategyOrderBlueprint:
        strike_step = 5.0 if current_price > 100 else 1.0
        
        # 1. Calculate OTM Wings (approx 5% delta buffer)
        wing_width = 5.0 if current_price > 100 else 2.5
        
        short_call = round((current_price * 1.05) / strike_step) * strike_step
        long_call = short_call + wing_width
        
        short_put = round((current_price * 0.95) / strike_step) * strike_step
        long_put = short_put - wing_width

        # Estimated credit collected
        est_call_spread_credit = 1.20
        est_put_spread_credit = 1.30
        total_credit_per_share = est_call_spread_credit + est_put_spread_credit
        net_credit_per_contract = total_credit_per_share * 100
        max_risk_per_contract = (wing_width * 100) - net_credit_per_contract

        qty = max(1, int(risk_budget_usd / max(max_risk_per_contract, 100)))

        legs = [
            # Bear Call Spread (Sell lower call, Buy higher call protection)
            OptionLeg(symbol=symbol, option_type="CALL", strike=short_call, expiration="Front-Month", side="SELL", qty=qty, estimated_premium=2.10),
            OptionLeg(symbol=symbol, option_type="CALL", strike=long_call, expiration="Front-Month", side="BUY", qty=qty, estimated_premium=0.90),
            # Bull Put Spread (Sell higher put, Buy lower put protection)
            OptionLeg(symbol=symbol, option_type="PUT", strike=short_put, expiration="Front-Month", side="SELL", qty=qty, estimated_premium=2.20),
            OptionLeg(symbol=symbol, option_type="PUT", strike=long_put, expiration="Front-Month", side="BUY", qty=qty, estimated_premium=0.90)
        ]

        total_credit = round(net_credit_per_contract * qty, 2)
        total_max_risk = round(max_risk_per_contract * qty, 2)
        profit_target = round(total_credit * (target_profit_percent / 100.0), 2)

        return StrategyOrderBlueprint(
            strategy_name="THETA_IRON_CONDOR",
            underlying_symbol=symbol,
            current_stock_price=current_price,
            legs=legs,
            total_debit_or_credit=total_credit,
            is_credit=True,
            max_risk_usd=total_max_risk,
            profit_target_usd=profit_target,
            stop_loss_usd=max_loss_usd
        )
