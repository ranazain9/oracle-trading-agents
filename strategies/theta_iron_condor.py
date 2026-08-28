"""
ORACLE Strategy 2: Theta Iron Condor (Rangebound Premium Collection)
Generates 4-leg Iron Condor orders with CBOE strike grid snapping, OCC symbols, midpoint limit prices, and margin checks.
"""
from typing import Optional
from strategies.base_strategy import BaseStrategy, StrategyOrderBlueprint, OptionLeg
from tools.occ_symbol_tools import OCCSymbolFormatter
from tools.midpoint_pricing_tools import MidpointPricingEngine


class ThetaIronCondorStrategy(BaseStrategy):
    """
    Constructs a 4-Leg Iron Condor (Sell OTM Call Spread + Sell OTM Put Spread).
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
        exp_date = OCCSymbolFormatter.get_nearest_weekly_expiration()

        # Snap 4 Strikes to CBOE Strike Grid
        short_call_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 1.05)  # +5% OTM
        long_call_strike  = OCCSymbolFormatter.snap_strike(current_price, current_price * 1.10)  # +10% OTM wing
        short_put_strike  = OCCSymbolFormatter.snap_strike(current_price, current_price * 0.95)  # -5% OTM
        long_put_strike   = OCCSymbolFormatter.snap_strike(current_price, current_price * 0.90)  # -10% OTM wing

        # Estimated Premiums
        sc_mid = 2.10
        lc_mid = 0.90
        sp_mid = 2.20
        lp_mid = 0.90

        net_credit_per_share = (sc_mid - lc_mid) + (sp_mid - lp_mid)  # ~$2.50/share
        wing_width = long_call_strike - short_call_strike
        max_risk_per_contract = (wing_width - net_credit_per_share) * 100

        # Contract Sizing
        qty = max(1, int(risk_budget_usd // max(100.0, max_risk_per_contract)))
        if qty == 0:
            qty = 1

        total_net_credit = round(net_credit_per_share * 100 * qty, 2)
        total_margin_requirement = round(wing_width * 100 * qty, 2)

        # Generate OCC Contract Identifiers
        sc_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "CALL", short_call_strike)
        lc_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "CALL", long_call_strike)
        sp_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "PUT",  short_put_strike)
        lp_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "PUT",  long_put_strike)

        # Leg 1: Short Call
        leg1 = OptionLeg(
            symbol=symbol, occ_symbol=sc_occ, option_type="CALL", strike=short_call_strike,
            side="SELL", qty=qty, estimated_premium=sc_mid,
            bid_price=round(sc_mid * 0.98, 2), ask_price=round(sc_mid * 1.02, 2), midpoint_limit_price=sc_mid
        )
        # Leg 2: Long Call (Protection Wing)
        leg2 = OptionLeg(
            symbol=symbol, occ_symbol=lc_occ, option_type="CALL", strike=long_call_strike,
            side="BUY", qty=qty, estimated_premium=lc_mid,
            bid_price=round(lc_mid * 0.98, 2), ask_price=round(lc_mid * 1.02, 2), midpoint_limit_price=lc_mid
        )
        # Leg 3: Short Put
        leg3 = OptionLeg(
            symbol=symbol, occ_symbol=sp_occ, option_type="PUT", strike=short_put_strike,
            side="SELL", qty=qty, estimated_premium=sp_mid,
            bid_price=round(sp_mid * 0.98, 2), ask_price=round(sp_mid * 1.02, 2), midpoint_limit_price=sp_mid
        )
        # Leg 4: Long Put (Protection Wing)
        leg4 = OptionLeg(
            symbol=symbol, occ_symbol=lp_occ, option_type="PUT", strike=long_put_strike,
            side="BUY", qty=qty, estimated_premium=lp_mid,
            bid_price=round(lp_mid * 0.98, 2), ask_price=round(lp_mid * 1.02, 2), midpoint_limit_price=lp_mid
        )

        # Calculate Midpoint Limit Price Package
        pkg_pricing = MidpointPricingEngine.calculate_package_limit_price([
            {"side": "sell", "bid": leg1.bid_price, "ask": leg1.ask_price, "qty": qty},
            {"side": "buy",  "bid": leg2.bid_price, "ask": leg2.ask_price, "qty": qty},
            {"side": "sell", "bid": leg3.bid_price, "ask": leg3.ask_price, "qty": qty},
            {"side": "buy",  "bid": leg4.bid_price, "ask": leg4.ask_price, "qty": qty}
        ])

        profit_target_usd = round(total_net_credit * (target_profit_percent / 100.0), 2)

        return StrategyOrderBlueprint(
            strategy_name="THETA_IRON_CONDOR",
            underlying_symbol=symbol,
            legs=[leg1, leg2, leg3, leg4],
            total_debit_or_credit=total_net_credit,
            is_credit=True,
            package_limit_price_usd=pkg_pricing["total_package_limit_usd"],
            margin_requirement_usd=total_margin_requirement,
            estimated_slippage_savings_usd=pkg_pricing["estimated_slippage_savings_usd"],
            profit_target_usd=profit_target_usd,
            stop_loss_usd=max_loss_usd,
            order_type="LIMIT_MIDPOINT",
            execution_notes=f"4-Leg Iron Condor: Calls ${short_call_strike:.2f}/${long_call_strike:.2f} | Puts ${short_put_strike:.2f}/${long_put_strike:.2f} (OCC Expiry: {exp_date}) Net Credit Limit ${pkg_pricing['net_limit_price_per_share']:.2f}/share."
        )
