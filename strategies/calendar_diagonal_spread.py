"""
ORACLE Strategy: Calendar & Diagonal Spread (Term Structure & IV Crush Arbitrage)
Exploits term-structure backwardation by selling front-week premium and buying back-month contracts.
"""
import datetime
from typing import Optional
from strategies.base_strategy import BaseStrategy, StrategyOrderBlueprint, OptionLeg
from tools.occ_symbol_tools import OCCSymbolFormatter
from tools.midpoint_pricing_tools import MidpointPricingEngine


class CalendarDiagonalSpreadStrategy(BaseStrategy):
    """
    Constructs a Time-Decay Calendar or Diagonal Spread across two expiration dates.
    """

    def calculate_order(
        self,
        symbol: str,
        current_price: float,
        risk_budget_usd: float = 500.0,
        target_profit_percent: float = 50.0,
        max_loss_usd: float = 150.0,
        direction: str = "NEUTRAL",
        **kwargs
    ) -> StrategyOrderBlueprint:
        # Expiration 1: Front-week (7 DTE)
        front_exp = OCCSymbolFormatter.get_nearest_weekly_expiration()
        # Expiration 2: Back-month (~30-45 DTE)
        today = datetime.date.today()
        back_exp_dt = today + datetime.timedelta(days=35)
        back_exp = back_exp_dt.strftime("%y%m%d")

        is_neutral = direction.upper() in ["NEUTRAL", "BALANCED"]
        
        if is_neutral:
            # At-the-money Calendar Spread (Sell front ATM Call, Buy back ATM Call)
            strike = OCCSymbolFormatter.snap_strike(current_price, current_price)
            front_prem = 3.20
            back_prem = 5.80
            net_debit = back_prem - front_prem  # ~$2.60 debit

            qty = max(1, int(risk_budget_usd // (net_debit * 100.0)))

            front_occ = OCCSymbolFormatter.format_occ_symbol(symbol, front_exp, "CALL", strike)
            back_occ = OCCSymbolFormatter.format_occ_symbol(symbol, back_exp, "CALL", strike)

            leg1 = OptionLeg(
                symbol=symbol, occ_symbol=front_occ, option_type="CALL", strike=strike,
                side="SELL", qty=qty, estimated_premium=front_prem,
                bid_price=round(front_prem * 0.98, 2), ask_price=round(front_prem * 1.02, 2),
                midpoint_limit_price=front_prem
            )
            leg2 = OptionLeg(
                symbol=symbol, occ_symbol=back_occ, option_type="CALL", strike=strike,
                side="BUY", qty=qty, estimated_premium=back_prem,
                bid_price=round(back_prem * 0.98, 2), ask_price=round(back_prem * 1.02, 2),
                midpoint_limit_price=back_prem
            )
        else:
            # Directional Diagonal Spread (Sell front OTM Call, Buy back ATM/ITM Call)
            short_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 1.04)
            long_strike = OCCSymbolFormatter.snap_strike(current_price, current_price)
            front_prem = 2.10
            back_prem = 6.00
            net_debit = back_prem - front_prem

            qty = max(1, int(risk_budget_usd // (net_debit * 100.0)))

            front_occ = OCCSymbolFormatter.format_occ_symbol(symbol, front_exp, "CALL", short_strike)
            back_occ = OCCSymbolFormatter.format_occ_symbol(symbol, back_exp, "CALL", long_strike)

            leg1 = OptionLeg(
                symbol=symbol, occ_symbol=front_occ, option_type="CALL", strike=short_strike,
                side="SELL", qty=qty, estimated_premium=front_prem,
                bid_price=round(front_prem * 0.98, 2), ask_price=round(front_prem * 1.02, 2),
                midpoint_limit_price=front_prem
            )
            leg2 = OptionLeg(
                symbol=symbol, occ_symbol=back_occ, option_type="CALL", strike=long_strike,
                side="BUY", qty=qty, estimated_premium=back_prem,
                bid_price=round(back_prem * 0.98, 2), ask_price=round(back_prem * 1.02, 2),
                midpoint_limit_price=back_prem
            )

        total_net_debit = round(net_debit * 100.0 * qty, 2)

        pkg_pricing = MidpointPricingEngine.calculate_package_limit_price([
            {"side": "sell", "bid": leg1.bid_price, "ask": leg1.ask_price, "qty": qty},
            {"side": "buy",  "bid": leg2.bid_price, "ask": leg2.ask_price, "qty": qty}
        ])

        profit_target = round(total_net_debit * (target_profit_percent / 100.0), 2)

        return StrategyOrderBlueprint(
            strategy_name="CALENDAR_DIAGONAL_SPREAD",
            underlying_symbol=symbol,
            legs=[leg1, leg2],
            total_debit_or_credit=total_net_debit,
            is_credit=False,
            package_limit_price_usd=pkg_pricing["total_package_limit_usd"],
            margin_requirement_usd=0.0,  # Defined-risk debit spread
            estimated_slippage_savings_usd=pkg_pricing["estimated_slippage_savings_usd"],
            profit_target_usd=profit_target,
            stop_loss_usd=min(max_loss_usd, total_net_debit * 0.50),
            order_type="LIMIT_MIDPOINT",
            execution_notes=f"Calendar/Diagonal Spread on {symbol}. Long {back_exp} vs Short {front_exp} front theta."
        )
