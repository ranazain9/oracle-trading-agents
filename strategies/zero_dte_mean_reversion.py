"""
ORACLE Strategy: 0DTE Intraday Mean Reversion Credit Spread
Capitalizes on short-duration, high-gamma intraday imbalances on index ETFs (SPY, QQQ) or high-liquidity megacaps.
"""
from typing import Optional
from strategies.base_strategy import BaseStrategy, StrategyOrderBlueprint, OptionLeg
from tools.occ_symbol_tools import OCCSymbolFormatter
from tools.midpoint_pricing_tools import MidpointPricingEngine


class ZeroDTEMeanReversionStrategy(BaseStrategy):
    """
    Constructs a 0DTE / 1DTE Credit Spread (Bull Put Spread or Bear Call Spread)
    for high-speed intraday theta decay and mean reversion.
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
        # Expiration is immediate nearest trading day (0DTE/1DTE)
        exp_date = OCCSymbolFormatter.get_nearest_weekly_expiration()
        is_bullish = direction.upper() in ["BULLISH", "LONG"]

        if is_bullish:
            # Bull Put Credit Spread: Sell closer OTM Put, Buy further OTM Put
            short_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 0.99)
            long_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 0.975)
            spread_width = short_strike - long_strike

            short_prem = 1.60
            long_prem = 0.60
            net_credit = short_prem - long_prem

            max_risk_per_contract = (spread_width - net_credit) * 100.0
            qty = max(1, int(risk_budget_usd // max(50.0, max_risk_per_contract)))

            sp_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "PUT", short_strike)
            lp_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "PUT", long_strike)

            leg1 = OptionLeg(
                symbol=symbol, occ_symbol=sp_occ, option_type="PUT", strike=short_strike,
                side="SELL", qty=qty, estimated_premium=short_prem,
                bid_price=round(short_prem * 0.98, 2), ask_price=round(short_prem * 1.02, 2),
                midpoint_limit_price=short_prem
            )
            leg2 = OptionLeg(
                symbol=symbol, occ_symbol=lp_occ, option_type="PUT", strike=long_strike,
                side="BUY", qty=qty, estimated_premium=long_prem,
                bid_price=round(long_prem * 0.98, 2), ask_price=round(long_prem * 1.02, 2),
                midpoint_limit_price=long_prem
            )
        else:
            # Bear Call Credit Spread: Sell closer OTM Call, Buy further OTM Call
            short_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 1.01)
            long_strike = OCCSymbolFormatter.snap_strike(current_price, current_price * 1.025)
            spread_width = long_strike - short_strike

            short_prem = 1.60
            long_prem = 0.60
            net_credit = short_prem - long_prem

            max_risk_per_contract = (spread_width - net_credit) * 100.0
            qty = max(1, int(risk_budget_usd // max(50.0, max_risk_per_contract)))

            sc_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "CALL", short_strike)
            lc_occ = OCCSymbolFormatter.format_occ_symbol(symbol, exp_date, "CALL", long_strike)

            leg1 = OptionLeg(
                symbol=symbol, occ_symbol=sc_occ, option_type="CALL", strike=short_strike,
                side="SELL", qty=qty, estimated_premium=short_prem,
                bid_price=round(short_prem * 0.98, 2), ask_price=round(short_prem * 1.02, 2),
                midpoint_limit_price=short_prem
            )
            leg2 = OptionLeg(
                symbol=symbol, occ_symbol=lc_occ, option_type="CALL", strike=long_strike,
                side="BUY", qty=qty, estimated_premium=long_prem,
                bid_price=round(long_prem * 0.98, 2), ask_price=round(long_prem * 1.02, 2),
                midpoint_limit_price=long_prem
            )

        total_net_credit = round(net_credit * 100.0 * qty, 2)
        total_margin = round(spread_width * 100.0 * qty, 2)

        pkg_pricing = MidpointPricingEngine.calculate_package_limit_price([
            {"side": "sell", "bid": leg1.bid_price, "ask": leg1.ask_price, "qty": qty},
            {"side": "buy",  "bid": leg2.bid_price, "ask": leg2.ask_price, "qty": qty}
        ])

        profit_target = round(total_net_credit * (target_profit_percent / 100.0), 2)

        return StrategyOrderBlueprint(
            strategy_name="ZERO_DTE_MEAN_REVERSION",
            underlying_symbol=symbol,
            legs=[leg1, leg2],
            total_debit_or_credit=total_net_credit,
            is_credit=True,
            package_limit_price_usd=pkg_pricing["total_package_limit_usd"],
            margin_requirement_usd=total_margin,
            estimated_slippage_savings_usd=pkg_pricing["estimated_slippage_savings_usd"],
            profit_target_usd=profit_target,
            stop_loss_usd=min(max_loss_usd, total_margin),
            order_type="LIMIT_MIDPOINT",
            execution_notes=f"0DTE {direction} Spread on {symbol}. Rapid theta capture with short strike ${short_strike:.2f}."
        )
