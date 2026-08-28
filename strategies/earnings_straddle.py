"""
ORACLE Strategy 1: Volatility Expansion Straddle (Earnings Play)
Generates 2-leg Long Straddle orders with CBOE strike grid snapping, OCC symbols, and Midpoint limit prices.
"""
import math
from typing import Optional
from strategies.base_strategy import BaseStrategy, StrategyOrderBlueprint, OptionLeg
from tools.occ_symbol_tools import OCCSymbolFormatter
from tools.midpoint_pricing_tools import MidpointPricingEngine


class EarningsStraddleStrategy(BaseStrategy):
    """
    Constructs an institutional 2-Leg Long Straddle (Buy ATM Call + Buy ATM Put).
    """

    def calculate_order(
        self,
        symbol: str,
        current_price: float,
        risk_budget_usd: float = 500.0,
        target_profit_percent: float = 50.0,
        max_loss_usd: float = 150.0,
        **kwargs
    ) -> StrategyOrderBlueprint:
        # Snap ATM Strike to CBOE Strike Grid
        atm_strike = OCCSymbolFormatter.snap_strike(current_price, current_price)
        exp_date = OCCSymbolFormatter.get_nearest_weekly_expiration()

        # Estimated ATM Straddle premium (~3.5% of spot per leg)
        est_call_mid = round(current_price * 0.035, 2)
        est_put_mid = round(current_price * 0.035, 2)
        straddle_cost_per_share = est_call_mid + est_put_mid
        straddle_cost_per_contract = straddle_cost_per_share * 100

        # Dynamic contract sizing based on Bayesian risk budget
        qty = max(1, int(risk_budget_usd // straddle_cost_per_contract))
        if qty == 0:
            qty = 1

        total_cost = round(straddle_cost_per_contract * qty, 2)

        # Generate OCC Contract Identifiers
        call_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "CALL", atm_strike)
        put_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "PUT", atm_strike)

        # Leg 1: Long Call (ATM)
        leg1 = OptionLeg(
            symbol=symbol,
            occ_symbol=call_occ,
            option_type="CALL",
            strike=atm_strike,
            side="BUY",
            qty=qty,
            estimated_premium=est_call_mid,
            bid_price=round(est_call_mid * 0.98, 2),
            ask_price=round(est_call_mid * 1.02, 2),
            midpoint_limit_price=est_call_mid
        )

        # Leg 2: Long Put (ATM)
        leg2 = OptionLeg(
            symbol=symbol,
            occ_symbol=put_occ,
            option_type="PUT",
            strike=atm_strike,
            side="BUY",
            qty=qty,
            estimated_premium=est_put_mid,
            bid_price=round(est_put_mid * 0.98, 2),
            ask_price=round(est_put_mid * 1.02, 2),
            midpoint_limit_price=est_put_mid
        )

        # Calculate Midpoint Limit Price Package
        pkg_pricing = MidpointPricingEngine.calculate_package_limit_price([
            {"side": "buy", "bid": leg1.bid_price, "ask": leg1.ask_price, "qty": qty},
            {"side": "buy", "bid": leg2.bid_price, "ask": leg2.ask_price, "qty": qty}
        ])

        profit_target_usd = round(total_cost * (target_profit_percent / 100.0), 2)

        return StrategyOrderBlueprint(
            strategy_name="EARNINGS_STRADDLE",
            underlying_symbol=symbol,
            legs=[leg1, leg2],
            total_debit_or_credit=total_cost,
            is_credit=False,
            package_limit_price_usd=pkg_pricing["total_package_limit_usd"],
            margin_requirement_usd=0.0,  # Long debit strategies require no collateral margin
            estimated_slippage_savings_usd=pkg_pricing["estimated_slippage_savings_usd"],
            profit_target_usd=profit_target_usd,
            stop_loss_usd=max_loss_usd,
            order_type="LIMIT_MIDPOINT",
            execution_notes=f"Long Straddle: {qty}x ATM Strike ${atm_strike:.2f} (OCC Expiry: {exp_date}) with Midpoint Limit ${pkg_pricing['net_limit_price_per_share']:.2f}/share."
        )
