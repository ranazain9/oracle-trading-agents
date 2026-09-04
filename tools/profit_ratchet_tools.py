"""
ORACLE Trading System - Dynamic Trailing Profit Ratchet Engine
Protects winning positions by dynamically ratcheting the stop-loss upward as profit targets are approached.
Supports strategy-aware trailing: capped +50% harvest for credit spreads (Iron Condors),
and multi-tier uncapped trailing ratchets for directional runners / straddles.
"""
from typing import Dict, Any


class ProfitRatchetEngine:
    """
    Evaluates dynamic trailing stop-loss floors and profit lock tiers:
    - Credit Spreads (Iron Condor):
        - Tier 1 (+30%): Break-Even floor ($0.00)
        - Tier 2 (+45%): Guaranteed +25% profit lock
        - Tier 3 (+50%): Take profit exit (capital redemption)
    - Momentum & Straddles (Uncapped Runners):
        - Tier 1 (+30%): Break-Even floor ($0.00)
        - Tier 2 (+50%): Trail floor at +30% (DO NOT EXIT; let runners expand)
        - Tier 3 (+100%): Trail floor at +70%
        - Tier 4 (+200%+): Trail floor at +150%
        - Exit only occurs on trailing pullback below active floor!
    """

    @staticmethod
    def evaluate_ratchet(
        current_pnl_usd: float,
        cost_or_credit_usd: float = 500.0,
        base_stop_loss_usd: float = 150.0,
        target_profit_percent: float = 50.0,
        strategy_name: str = "THETA_IRON_CONDOR"
    ) -> Dict[str, Any]:
        """
        Computes the active stop-loss floor and evaluates if an exit must be triggered.
        """
        pnl = float(current_pnl_usd)
        cost = max(50.0, float(cost_or_credit_usd))
        target_profit_usd = round(cost * (target_profit_percent / 100.0), 2)
        pnl_pct = (pnl / cost) * 100.0

        is_uncapped_runner = any(k in strategy_name.upper() for k in ["STRADDLE", "STRANGLE", "CALL", "PUT", "RUNNER", "MOMENTUM"])

        active_stop_floor_usd = -float(base_stop_loss_usd)
        ratchet_tier = "TIER_0_INITIAL_RISK"
        action = "HOLD_POSITION"
        reason = "Position within normal variance."

        if is_uncapped_runner:
            # === DYNAMIC RUNNER TRAILING (STRADDLES & LONG OPTIONS) ===
            if pnl_pct >= 200.0:
                active_stop_floor_usd = round(cost * 1.50, 2)  # Lock in +150%
                ratchet_tier = "TIER_4_RUNNER_200"
                if pnl < active_stop_floor_usd:
                    action = "CLOSE_RATCHET_STOP"
                    reason = f"Trailing stop triggered (+{pnl_pct:.1f}% retreated below +150% locked floor +${active_stop_floor_usd:.2f})."
                else:
                    reason = f"Super-runner active (+{pnl_pct:.1f}%); trailing floor locked at +150% (+${active_stop_floor_usd:.2f})."

            elif pnl_pct >= 100.0:
                active_stop_floor_usd = round(cost * 0.70, 2)  # Lock in +70%
                ratchet_tier = "TIER_3_RUNNER_100"
                if pnl < active_stop_floor_usd:
                    action = "CLOSE_RATCHET_STOP"
                    reason = f"Trailing stop triggered (+{pnl_pct:.1f}% retreated below +70% locked floor +${active_stop_floor_usd:.2f})."
                else:
                    reason = f"Runner expanding (+{pnl_pct:.1f}%); trailing floor locked at +70% (+${active_stop_floor_usd:.2f})."

            elif pnl_pct >= 50.0:
                active_stop_floor_usd = round(cost * 0.30, 2)  # Lock in +30%
                ratchet_tier = "TIER_2_RUNNER_50"
                if pnl < active_stop_floor_usd:
                    action = "CLOSE_RATCHET_STOP"
                    reason = f"Trailing stop triggered (+{pnl_pct:.1f}% retreated below +30% locked floor +${active_stop_floor_usd:.2f})."
                else:
                    reason = f"First profit wave (+{pnl_pct:.1f}%); trailing floor locked at +30% (+${active_stop_floor_usd:.2f}). Holding for runner upside."

            elif pnl_pct >= 30.0:
                active_stop_floor_usd = 0.0  # Break-even floor
                ratchet_tier = "TIER_1_BREAK_EVEN"
                if pnl < 0.0:
                    action = "CLOSE_RATCHET_STOP"
                    reason = "Position fell below Break-Even floor ($0.00)."
                else:
                    reason = f"Stop-loss ratcheted to Break-Even ($0.00) at +{pnl_pct:.1f}% gain."

            elif pnl <= -base_stop_loss_usd:
                active_stop_floor_usd = -base_stop_loss_usd
                ratchet_tier = "TIER_0_HARD_STOP"
                action = "CLOSE_STOP_LOSS"
                reason = f"Hard stop-loss triggered (-${abs(pnl):.2f} <= -${base_stop_loss_usd:.2f})."

        else:
            # === CAPPED CREDIT SPREADS (IRON CONDOR / THETA SPREADS) ===
            # Max profit is capped; holding past +50% yields poor risk-adjusted reward
            if pnl >= target_profit_usd or pnl_pct >= target_profit_percent:
                active_stop_floor_usd = target_profit_usd
                ratchet_tier = "TIER_3_TARGET_HIT"
                action = "CLOSE_TAKE_PROFIT"
                reason = f"Profit target achieved (+${pnl:.2f}, +{pnl_pct:.1f}% on capped theta spread)."

            elif pnl_pct >= 45.0:
                active_stop_floor_usd = round(cost * 0.25, 2)
                ratchet_tier = "TIER_2_PROFIT_LOCK_25"
                if pnl < active_stop_floor_usd:
                    action = "CLOSE_RATCHET_STOP"
                    reason = f"Position fell below ratcheted +25% profit floor (+${active_stop_floor_usd:.2f})."
                else:
                    reason = f"Trailing profit locked at +25% (+${active_stop_floor_usd:.2f})."

            elif pnl_pct >= 30.0:
                active_stop_floor_usd = 0.0
                ratchet_tier = "TIER_1_BREAK_EVEN"
                if pnl < 0.0:
                    action = "CLOSE_RATCHET_STOP"
                    reason = "Position fell below Break-Even floor ($0.00)."
                else:
                    reason = "Stop-loss ratcheted to Break-Even ($0.00)."

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
            "reason": reason,
            "is_uncapped_runner": is_uncapped_runner
        }
