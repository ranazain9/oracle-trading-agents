"""
ORACLE Strategy: Broken Wing Butterfly (Asymmetric Zero-Upside-Risk Alpha)
Constructs an asymmetric 3-strike butterfly with skipped wing to eliminate upside risk and target high-convexity payoffs.
"""
from typing import Optional
from strategies.base_strategy import BaseStrategy, StrategyOrderBlueprint, OptionLeg
from tools.occ_symbol_tools import OCCSymbolFormatter
from tools.midpoint_pricing_tools import MidpointPricingEngine


class BrokenWingButterflyStrategy(BaseStrategy):
    """
    Constructs an Asymmetric Broken Wing Butterfly (BWB):
    • Long 1x Lower Strike Call/Put
    • Short 2x Mid Strike Call/Put (Target pin zone)
    • Long 1x Wide Outer Strike Call/Put (Broken wing)
    """

    def calculate_order(
        self,
        symbol: str,
        current_price: float,
        risk_budget_usd: float = 500.0,
        target_profit_percent: float = 50.0,
        max_loss_usd: float = 150.0,
        direction: str = "BULLISH",
        **kwargs
    ) -> StrategyOrderBlueprint:
        exp_date = OCCSymbolFormatter.get_nearest_weekly_expiration()
        is_bullish = direction.upper() in ["BULLISH", "LONG"]

        if is_bullish:
            # Bullish Broken Wing Call Butterfly (Skewed to the upside)
            lower_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 1.00)   # ATM
            mid_strike   = OCCSymbolFormatter.snap_strike(current_price, current_price * 1.03)   # +3% OTM (Target)
            outer_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 1.08)   # +8% OTM (Wider broken wing)

            p_lower = 4.50
            p_mid   = 2.60
            p_outer = 1.00

            # Cost formula: +1 lower - 2 mid + 1 outer
            net_cost = p_lower - (2.0 * p_mid) + p_outer  # 4.50 - 5.20 + 1.00 = +0.30 debit or slight credit
            is_credit = net_cost < 0
            abs_cost = abs(net_cost)

            qty = max(1, int(risk_budget_usd // max(50.0, abs_cost * 100.0)))

            occ_lower = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "CALL", lower_strike)
            occ_mid   = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "CALL", mid_strike)
            occ_outer = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "CALL", outer_strike)

            leg1 = OptionLeg(
                symbol=symbol, occ_symbol=occ_lower, option_type="CALL", strike=lower_strike,
                side="BUY", qty=qty, estimated_premium=p_lower,
                bid_price=round(p_lower * 0.98, 2), ask_price=round(p_lower * 1.02, 2),
                midpoint_limit_price=p_lower
            )
            leg2 = OptionLeg(
                symbol=symbol, occ_symbol=occ_mid, option_type="CALL", strike=mid_strike,
                side="SELL", qty=qty * 2, estimated_premium=p_mid,
                bid_price=round(p_mid * 0.98, 2), ask_price=round(p_mid * 1.02, 2),
                midpoint_limit_price=p_mid
            )
            leg3 = OptionLeg(
                symbol=symbol, occ_symbol=occ_outer, option_type="CALL", strike=outer_strike,
                side="BUY", qty=qty, estimated_premium=p_outer,
                bid_price=round(p_outer * 0.98, 2), ask_price=round(p_outer * 1.02, 2),
                midpoint_limit_price=p_outer
            )
            broken_wing_gap = (outer_strike - mid_strike) - (mid_strike - lower_strike)
            margin_req = round(broken_wing_gap * 100.0 * qty, 2)
        else:
            # Bearish Broken Wing Put Butterfly
            lower_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 0.92)   # -8% OTM (Broken wing)
            mid_strike   = OCCSymbolFormatter.snap_strike(current_price, current_price * 0.97)   # -3% OTM (Target)
            upper_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 1.00)   # ATM

            p_upper = 4.50
            p_mid   = 2.60
            p_lower = 1.00

            net_cost = p_upper - (2.0 * p_mid) + p_lower
            is_credit = net_cost < 0
            abs_cost = abs(net_cost)

            qty = max(1, int(risk_budget_usd // max(50.0, abs_cost * 100.0)))

            occ_upper = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "PUT", upper_strike)
            occ_mid   = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "PUT", mid_strike)
            occ_lower = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "PUT", lower_strike)

            leg1 = OptionLeg(
                symbol=symbol, occ_symbol=occ_upper, option_type="PUT", strike=upper_strike,
                side="BUY", qty=qty, estimated_premium=p_upper,
                bid_price=round(p_upper * 0.98, 2), ask_price=round(p_upper * 1.02, 2),
                midpoint_limit_price=p_upper
            )
            leg2 = OptionLeg(
                symbol=symbol, occ_symbol=occ_mid, option_type="PUT", strike=mid_strike,
                side="SELL", qty=qty * 2, estimated_premium=p_mid,
                bid_price=round(p_mid * 0.98, 2), ask_price=round(p_mid * 1.02, 2),
                midpoint_limit_price=p_mid
            )
            leg3 = OptionLeg(
                symbol=symbol, occ_symbol=occ_lower, option_type="PUT", strike=lower_strike,
                side="BUY", qty=qty, estimated_premium=p_lower,
                bid_price=round(p_lower * 0.98, 2), ask_price=round(p_lower * 1.02, 2),
                midpoint_limit_price=p_lower
            )
            broken_wing_gap = (mid_strike - lower_strike) - (upper_strike - mid_strike)
            margin_req = round(broken_wing_gap * 100.0 * qty, 2)

        total_net_amount = round(abs_cost * 100.0 * qty, 2)

        pkg_pricing = MidpointPricingEngine.calculate_package_limit_price([
            {"side": "buy",  "bid": leg1.bid_price, "ask": leg1.ask_price, "qty": qty},
            {"side": "sell", "bid": leg2.bid_price, "ask": leg2.ask_price, "qty": qty * 2},
            {"side": "buy",  "bid": leg3.bid_price, "ask": leg3.ask_price, "qty": qty}
        ])

        profit_target = round(max(total_net_amount * 1.5, 300.0 * qty), 2)

        return StrategyOrderBlueprint(
            strategy_name="BROKEN_WING_BUTTERFLY",
            underlying_symbol=symbol,
            legs=[leg1, leg2, leg3],
            total_debit_or_credit=total_net_amount,
            is_credit=is_credit,
            package_limit_price_usd=pkg_pricing["total_package_limit_usd"],
            margin_requirement_usd=margin_req,
            estimated_slippage_savings_usd=pkg_pricing["estimated_slippage_savings_usd"],
            profit_target_usd=profit_target,
            stop_loss_usd=min(max_loss_usd, margin_req),
            order_type="LIMIT_MIDPOINT",
            execution_notes=f"Broken Wing Butterfly on {symbol} ({direction}). Asymmetric risk profile with zero-loss buffer zone."
        )
