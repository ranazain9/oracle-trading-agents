"""
ORACLE Trading System - Market Circuit Breaker & 0-DTE Gamma Risk Engine
Monitors intraday market anomalies and enforces 0-DTE Friday 3:30 PM expiration risk liquidation.
"""
import datetime
from typing import Dict, Any, List

try:
    import yfinance as yf
    YF_AVAILABLE = True
except ImportError:
    YF_AVAILABLE = False


class CircuitBreakerGuard:
    """
    Evaluates macro market shocks and options expiration assignment risk.
    """

    @staticmethod
    def check_black_swan_circuit_breaker() -> Dict[str, Any]:
        """
        Detects if market-wide circuit breaker is triggered (VIX spike > +25% or SPY drop < -3.0%).
        """
        vix_change_pct = 0.0
        spy_change_pct = 0.0
        is_triggered = False
        trigger_reason = "Market conditions normal."

        if YF_AVAILABLE:
            try:
                # Check VIX intraday move
                vix = yf.Ticker("^VIX").history(period="2d")
                if len(vix) >= 2:
                    vix_open = float(vix["Open"].iloc[-1])
                    vix_current = float(vix["Close"].iloc[-1])
                    if vix_open > 0:
                        vix_change_pct = round(((vix_current - vix_open) / vix_open) * 100, 2)
            except Exception:
                pass

            try:
                # Check SPY intraday move
                spy = yf.Ticker("SPY").history(period="2d")
                if len(spy) >= 2:
                    spy_open = float(spy["Open"].iloc[-1])
                    spy_current = float(spy["Close"].iloc[-1])
                    if spy_open > 0:
                        spy_change_pct = round(((spy_current - spy_open) / spy_open) * 100, 2)
            except Exception:
                pass

        if vix_change_pct >= 25.0:
            is_triggered = True
            trigger_reason = f"BLACK SWAN ALERT: CBOE VIX spiked +{vix_change_pct:.1f}% intraday."
        elif spy_change_pct <= -3.0:
            is_triggered = True
            trigger_reason = f"MARKET CRASH ALERT: S&P 500 (SPY) plunged {spy_change_pct:.1f}% intraday."

        return {
            "is_circuit_breaker_triggered": is_triggered,
            "vix_intraday_change_pct": vix_change_pct,
            "spy_intraday_change_pct": spy_change_pct,
            "action_required": "EMERGENCY_PORTFOLIO_FREEZE" if is_triggered else "NONE",
            "reason": trigger_reason
        }

    @staticmethod
    def check_zero_dte_assignment_risk(expiration_date_str: str = "") -> Dict[str, Any]:
        """
        Checks if it is Friday after 3:30 PM EST for 0-DTE options to prevent after-hours stock assignment.
        """
        now = datetime.datetime.utcnow() - datetime.timedelta(hours=4)  # EST Time
        is_friday = now.weekday() == 4
        is_after_330_pm = now.hour == 15 and now.minute >= 30
        is_after_400_pm = now.hour >= 16

        is_risk_active = False
        action = "HOLD"
        reason = "Normal holding window."

        if is_friday and (is_after_330_pm or is_after_400_pm):
            is_risk_active = True
            action = "AUTO_LIQUIDATE_EXPIRATION"
            reason = "Friday 3:30 PM EST reached. Closing near-the-money options to avoid weekend stock assignment."

        return {
            "is_assignment_risk_active": is_risk_active,
            "is_friday": is_friday,
            "current_est_time": now.strftime("%H:%M:%S EST"),
            "action_required": action,
            "reason": reason
        }
