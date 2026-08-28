"""
ORACLE Trading Agent - Advanced Macro Catalyst & Sentiment Analysis Tools
Computes Macro Shock Index (MSI), Fed policy stance, inflation risk window, and calendar catalysts.
"""
import datetime
from typing import Dict, Any
from tools.macro_calendar_tools import MacroCalendarTool


class MacroSentimentTool:
    """
    Advanced Macroeconomic Risk Radar and Macro Shock Index (MSI) Evaluator.
    """

    @staticmethod
    def calculate_macro_shock_index() -> Dict[str, Any]:
        """
        Synthesizes Treasury yield spreads, VIX regime proxy, and upcoming catalyst dates
        into a quantitative Macro Shock Index (MSI: 0.0 to 1.0) and policy regime.
        """
        macro_base = MacroCalendarTool.get_macro_environment()
        
        # 1. Base components
        yield_spread = macro_base.get("yield_curve_spread", 0.0)
        is_inverted = yield_spread < 0
        has_warning = macro_base.get("high_volatility_warning", False)
        event_name = macro_base.get("event_summary", "")

        # 2. Score Macro Shock Index (0.0 = ultra benign, 1.0 = extreme macro event shock)
        msi_score = 0.15  # Baseline calm market
        
        if is_inverted:
            msi_score += 0.20  # Inversion penalty
        
        if "FOMC" in event_name or "Federal Reserve" in event_name:
            msi_score += 0.50
        elif "CPI" in event_name or "Inflation" in event_name:
            msi_score += 0.35
        elif "Non-Farm" in event_name or "Jobs" in event_name:
            msi_score += 0.25

        msi_score = round(min(max(msi_score, 0.05), 0.95), 2)

        # 3. Macro Regime Classification
        if msi_score >= 0.70:
            regime = "EVENT_BLACKOUT"
            max_allocation_pct = 0.25  # Limit position sizing to 25% of normal Kelly
            recommendation = "PREEMPTIVE_RISK_OFF: De-risk long gamma/vega or maintain tight delta hedges."
        elif msi_score >= 0.45:
            regime = "HIGH_MACRO_VOLATILITY"
            max_allocation_pct = 0.60
            recommendation = "SELECTIVE_OPPORTUNITY: Favor defined-risk theta spreads or long volatility straddles."
        else:
            regime = "RISK_ON_EXPANSION"
            max_allocation_pct = 1.00
            recommendation = "MACRO_CLEAR: Full algorithmic trade allocation permitted across universe."

        return {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "macro_shock_index": msi_score,
            "macro_regime": regime,
            "max_allocation_multiplier": max_allocation_pct,
            "recommendation": recommendation,
            "yield_curve_spread": yield_spread,
            "yield_curve_status": macro_base.get("yield_curve_status", "NORMAL"),
            "fed_funds_rate": macro_base.get("fed_funds_rate_environment", "5.25%"),
            "ten_year_yield": macro_base.get("ten_year_treasury_yield", "4.25%"),
            "upcoming_catalyst": event_name,
            "high_volatility_warning": has_warning
        }
