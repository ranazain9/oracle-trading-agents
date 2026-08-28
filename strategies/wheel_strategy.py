"""
ORACLE Strategy: Systematic Wheel Strategy (Cash-Secured Put & Covered Call Engine)
Generates systematic yield by selling OTM Cash-Secured Puts and systematic Covered Calls.
"""
from typing import Optional
from strategies.base_strategy import BaseStrategy, StrategyOrderBlueprint, OptionLeg
from tools.occ_symbol_tools import OCCSymbolFormatter
from tools.midpoint_pricing_tools import MidpointPricingEngine


class WheelStrategy(BaseStrategy):
    """
    Constructs systematic Cash-Secured Put (CSP) or Covered Call (CC) order blueprints.
    """

    def calculate_order(
        self,
        symbol: str,
        current_price: float,
        risk_budget_usd: float = 500.0,
        target_profit_percent: float = 50.0,
        max_loss_usd: float = 150.0,
        wheel_mode: str = "CASH_SECURED_PUT",
        **kwargs
    ) -> StrategyOrderBlueprint:
        exp_date = OCCSymbolFormatter.get_nearest_weekly_expiration()
        is_csp = wheel_mode.upper() == "CASH_SECURED_PUT"

        if is_csp:
            # Sell ~0.30 delta OTM Put (3-5% OTM)
            strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 0.96)
            prem = 2.40
            qty = max(1, int(risk_budget_usd // (strike * 10.0)))  # Sizing based on cash buffer
            
            occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "PUT", strike)
            leg = OptionLeg(
                symbol=symbol, occ_symbol=occ, option_type="PUT", strike=strike,
                side="SELL", qty=qty, estimated_premium=prem,
                bid_price=round(prem * 0.98, 2), ask_price=round(prem * 1.02, 2),
                midpoint_limit_price=prem
            )
            total_net_credit = round(prem * 100.0 * qty, 2)
            margin_req = round(strike * 100.0 * qty, 2)  # Full cash collateral for CSP
            notes = f"Wheel Step 1: Cash-Secured Put on {symbol} at strike ${strike:.2f}. Collecting premium."
        else:
            # Sell ~0.30 delta OTM Covered Call (3-5% OTM)
            strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 1.04)
            prem = 2.20
            qty = max(1, int(risk_budget_usd // (strike * 10.0)))

            occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "CALL", strike)
            leg = OptionLeg(
                symbol=symbol, occ_symbol=occ, option_type="CALL", strike=strike,
                side="SELL", qty=qty, estimated_premium=prem,
                bid_price=round(prem * 0.98, 2), ask_price=round(prem * 1.02, 2),
                midpoint_limit_price=prem
            )
            total_net_credit = round(prem * 100.0 * qty, 2)
            margin_req = 0.0  # Covered by underlying shares
            notes = f"Wheel Step 2: Covered Call on {symbol} at strike ${strike:.2f}. Harvesting upside income."

        pkg_pricing = MidpointPricingEngine.calculate_package_limit_price([
            {"side": "sell", "bid": leg.bid_price, "ask": leg.ask_price, "qty": qty}
        ])

        profit_target = round(total_net_credit * (target_profit_percent / 100.0), 2)

        return StrategyOrderBlueprint(
            strategy_name="WHEEL_INCOME_STRATEGY",
            underlying_symbol=symbol,
            legs=[leg],
            total_debit_or_credit=total_net_credit,
            is_credit=True,
            package_limit_price_usd=pkg_pricing["total_package_limit_usd"],
            margin_requirement_usd=margin_req,
            estimated_slippage_savings_usd=pkg_pricing["estimated_slippage_savings_usd"],
            profit_target_usd=profit_target,
            stop_loss_usd=max_loss_usd,
            order_type="LIMIT_MIDPOINT",
            execution_notes=notes
        )
