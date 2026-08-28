"""
ORACLE Trading System - Midpoint Limit Pricing & Slippage Shield Engine
Calculates the optimal Net Debit or Net Credit Limit Price at the Midpoint ((Bid + Ask) / 2) to eliminate market-order slippage.
"""
from typing import Dict, Any, List

class MidpointPricingEngine:
    """
    Computes Net Midpoint Limit Prices for complex multi-leg options packages.
    """

    @staticmethod
    def calculate_leg_midpoint(bid_price: float, ask_price: float) -> float:
        """
        Calculates individual option contract midpoint price.
        """
        bid = max(0.01, float(bid_price))
        ask = max(bid, float(ask_price))
        return round((bid + ask) / 2.0, 2)

    @staticmethod
    def calculate_package_limit_price(legs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates the Net Package Midpoint Limit Price across all legs:
        - BUY leg midpoint increases Net Debit / reduces Net Credit
        - SELL leg midpoint increases Net Credit / reduces Net Debit
        """
        net_value = 0.0
        total_slippage_savings = 0.0

        for leg in legs:
            side = leg.get("side", "buy").lower()
            bid = float(leg.get("bid", leg.get("estimated_premium", 2.0) * 0.98))
            ask = float(leg.get("ask", leg.get("estimated_premium", 2.0) * 1.02))
            qty = int(leg.get("qty", 1))
            mid = (bid + ask) / 2.0
            
            # Slippage saved vs crossing the full ask/bid spread
            slippage_saved = (ask - mid) * 100 * qty if side == "buy" else (mid - bid) * 100 * qty
            total_slippage_savings += slippage_saved

            if side == "buy":
                net_value -= (mid * qty)
            else:
                net_value += (mid * qty)

        is_credit = net_value >= 0
        limit_price = round(abs(net_value), 2)

        return {
            "net_limit_price_per_share": limit_price,
            "total_package_limit_usd": round(limit_price * 100, 2),
            "is_net_credit": is_credit,
            "order_type": "LIMIT_MIDPOINT",
            "estimated_slippage_savings_usd": round(total_slippage_savings, 2)
        }
