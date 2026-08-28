"""
ORACLE Strategy 3: Directional Vertical Spread (Bull Call / Bear Put)
Generates 2-leg Vertical Spread orders with CBOE strike grid snapping, OCC symbols, and Midpoint limit prices.
"""
from typing import Optional
from strategies.base_strategy import BaseStrategy, StrategyOrderBlueprint, OptionLeg
from tools.occ_symbol_tools import OCCSymbolFormatter
from tools.midpoint_pricing_tools import MidpointPricingEngine


class DirectionalSpreadStrategy(BaseStrategy):
    """
    Constructs a 2-Leg Directional Vertical Spread.
    """

    def calculate_order(
        self,
        symbol: str,
        current_price: float,
        direction: str = "BULLISH",
        risk_budget_usd: float = 500.0,
        target_profit_percent: float = 50.0,
        max_loss_usd: float = 150.0,
        **kwargs
    ) -> StrategyOrderBlueprint:
        exp_date = OCCSymbolFormatter.get_nearest_weekly_expiration()
        is_bullish = direction.upper() == "BULLISH"

        if is_bullish:
            # Bull Call Spread (Buy ATM Call, Sell +5% OTM Call)
            long_strike = OCCSymbolFormatter.snap_strike(current_price, current_price)
            short_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 1.05)
            opt_type = "CALL"
            long_mid = round(current_price * 0.035, 2)
            short_mid = round(current_price * 0.015, 2)
        else:
            # Bear Put Spread (Buy ATM Put, Sell -5% OTM Put)
            long_strike = OCCSymbolFormatter.snap_strike(current_price, current_price)
            short_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 0.95)
            opt_type = "PUT"
            long_mid = round(current_price * 0.035, 2)
            short_mid = round(current_price * 0.015, 2)

        net_debit_per_share = round(long_mid - short_mid, 2)
        spread_cost_per_contract = net_debit_per_share * 100

        qty = max(1, int(risk_budget_usd // max(50.0, spread_cost_per_contract)))
        if qty == 0:
            qty = 1

        total_cost = round(spread_cost_per_contract * qty, 2)

        # Generate OCC Symbols
        long_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, opt_type, long_strike)
        short_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, opt_type, short_strike)

        # Leg 1: Long ATM
        leg1 = OptionLeg(
            symbol=symbol, occ_symbol=long_occ, option_type=opt_type, strike=long_strike,
            side="BUY", qty=qty, estimated_premium=long_mid,
            bid_price=round(long_mid * 0.98, 2), ask_price=round(long_mid * 1.02, 2), midpoint_limit_price=long_mid
        )
        # Leg 2: Short OTM
        leg2 = OptionLeg(
            symbol=symbol, occ_symbol=short_occ, option_type=opt_type, strike=short_strike,
            side="SELL", qty=qty, estimated_premium=short_mid,
            bid_price=round(short_mid * 0.98, 2), ask_price=round(short_mid * 1.02, 2), midpoint_limit_price=short_mid
        )

        # Calculate Midpoint Limit Price Package
        pkg_pricing = MidpointPricingEngine.calculate_package_limit_price([
            {"side": "buy",  "bid": leg1.bid_price, "ask": leg1.ask_price, "qty": qty},
            {"side": "sell", "bid": leg2.bid_price, "ask": leg2.ask_price, "qty": qty}
        ])

        profit_target_usd = round(total_cost * (target_profit_percent / 100.0), 2)

        return StrategyOrderBlueprint(
            strategy_name=f"DIRECTIONAL_{direction.upper()}_SPREAD",
            underlying_symbol=symbol,
            legs=[leg1, leg2],
            total_debit_or_credit=total_cost,
            is_credit=False,
            package_limit_price_usd=pkg_pricing["total_package_limit_usd"],
            margin_requirement_usd=0.0,
            estimated_slippage_savings_usd=pkg_pricing["estimated_slippage_savings_usd"],
            profit_target_usd=profit_target_usd,
            stop_loss_usd=max_loss_usd,
            order_type="LIMIT_MIDPOINT",
            execution_notes=f"Vertical {direction} Spread: {opt_type}s ${long_strike:.2f}/${short_strike:.2f} (OCC Expiry: {exp_date}) Net Debit Limit ${pkg_pricing['net_limit_price_per_share']:.2f}/share."
        )
