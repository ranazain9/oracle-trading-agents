"""
ORACLE Trading System - Dynamic Trailing Profit Ratchet Engine
Protects winning positions by dynamically ratcheting the stop-loss upward as profit targets are approached.
"""
from typing import Dict, Any

class ProfitRatchetEngine:
    """
    Evaluates dynamic trailing stop-loss floors and profit lock tiers:
    - Tier 1 (+30% P&L): Ratchet stop-loss from -$150.00 -> $0.00 (Break-Even Floor)
    - Tier 2 (+45% P&L): Ratchet stop-loss up to +$125.00 (+25% Guaranteed Profit Lock)
    - Tier 3 (+50% P&L): Full Profit Take (+50% Target Exit)
    """

    @staticmethod
    def evaluate_ratchet(
        current_pnl_usd: float,
        cost_or_credit_usd: float = 500.0,
        base_stop_loss_usd: float = 150.0,
        target_profit_percent: float = 50.0
    ) -> Dict[str, Any]:
        """
        Computes the active stop-loss floor and evaluates if an exit must be triggered.
        """
        pnl = float(current_pnl_usd)
        cost = max(100.0, float(cost_or_credit_usd))
        target_profit_usd = round(cost * (target_profit_percent / 100.0), 2)
        pnl_pct = (pnl / cost) * 100.0

        # Default Hard Stop
        active_stop_floor_usd = -float(base_stop_loss_usd)
        ratchet_tier = "TIER_0_INITIAL_RISK"
        action = "HOLD_POSITION"
        reason = "Position within normal variance."

        # Tier 3: Target Hit (+50%)
        if pnl >= target_profit_usd or pnl_pct >= target_profit_percent:
            active_stop_floor_usd = target_profit_usd
            ratchet_tier = "TIER_3_TARGET_HIT"
            action = "CLOSE_TAKE_PROFIT"
            reason = f"Profit target achieved (+${pnl:.2f}, +{pnl_pct:.1f}%)."

        # Tier 2: +45% Profit Spike -> Lock +25%
        elif pnl_pct >= 45.0:
            active_stop_floor_usd = round(cost * 0.25, 2)  # +25% profit lock
            ratchet_tier = "TIER_2_PROFIT_LOCK_25"
            if pnl < active_stop_floor_usd:
                action = "CLOSE_RATCHET_STOP"
                reason = f"Position fell below ratcheted +25% profit floor (+${active_stop_floor_usd:.2f})."
            else:
                reason = f"Trailing profit locked at +25% (+${active_stop_floor_usd:.2f})."

        # Tier 1: +30% Profit Spike -> Move to Break-Even ($0.00)
        elif pnl_pct >= 30.0:
            active_stop_floor_usd = 0.0  # Break-even floor
            ratchet_tier = "TIER_1_BREAK_EVEN"
            if pnl < 0.0:
                action = "CLOSE_RATCHET_STOP"
                reason = "Position fell below Break-Even floor ($0.00)."
            else:
                reason = "Stop-loss ratcheted to Break-Even ($0.00)."

        # Base Hard Stop Loss Check
        elif pnl <= -base_stop_loss_usd:
            active_stop_floor_usd = -base_stop_loss_usd
            ratchet_tier = "TIER_0_HARD_STOP"
            action = "CLOSE_STOP_LOSS"
            reason = f"Hard stop-loss triggered (-${abs(pnl):.2f} <= -${base_stop_loss_usd:.2f})."

        return {
            "action": action,
            "ratchet_tier": ratchet_tier,
            "active_stop_floor_usd": active_stop_floor_usd,
            "target_profit_usd": target_profit_usd,
            "current_pnl_usd": round(pnl, 2),
            "pnl_percent": round(pnl_pct, 1),
            "reason": reason
        }
