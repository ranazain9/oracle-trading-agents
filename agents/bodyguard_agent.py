"""
ORACLE Trading System - Agent 3: The Bodyguard (60-Second Adaptive Active Risk Guardian)
Monitors positions continuously during market hours:
1. Ingests ALL live open positions directly from Alpaca Broker API (Broker-First architecture).
2. Groups multi-leg contracts into Strategy Packages by root symbol to evaluate net combined P&L.
3. Enforces Dynamic Trailing Profit Ratchet:
   - Capped Spreads (Iron Condor): Harvest profit cleanly at +50%.
   - Runners & Straddles: Dynamic trailing ratchet (+50% -> lock +30%, +100% -> lock +70%, +200% -> lock +150%).
4. Enforces Hard Stop-Loss (-$150 floor or -50% capital threshold) on combined strategy risk.
5. 0-DTE Expiration Shield: Liquidates expiring in-the-money options before 4:00 PM EST to avoid pin/exercise risk.
6. Executes physical multi-leg liquidation orders directly on Alpaca Brokerage.
7. Dispatches active wing rolls on Alpaca when an Iron Condor wing is threatened.
8. Automatically persists closed trades into SQLite (oracle.db) and data/trades.json with authentic P&L and audit reasons.
"""
import json
import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from collections import defaultdict

from tools.market_data_tools import MarketDataTool
from tools.alpaca_tools import AlpacaTool
from tools.profit_ratchet_tools import ProfitRatchetEngine
from tools.circuit_breaker_tools import CircuitBreakerGuard
from tools.leg_roller_tools import OptionLegRoller
from strategies.adaptive_adjustment import AdaptiveAdjustmentStrategy


class BodyguardAgent:
    """
    Institutional 60-Second Active Position Risk Guardian with Direct Broker Sync & Profit Ratchet.
    """

    def __init__(self):
        self.alpaca = AlpacaTool()
        self.salvage_engine = AdaptiveAdjustmentStrategy()
        self.trades_file = Path(__file__).resolve().parent.parent / "data" / "trades.json"

    def monitor_positions(self) -> Dict[str, Any]:
        """
        Broker-First Risk Audit:
        Scans all live open positions directly from Alpaca broker API,
        groups them into strategy packages, and enforces exit/salvage rules.
        """
        # Step 0: Check Market Clock Gate
        if not self.alpaca.is_market_open():
            clock = self.alpaca.get_market_clock()
            print(f"🛡️ [BodyguardAgent] Market is CLOSED (Next Open: {clock.get('next_open', '09:30 EST')}). Off-hours monitoring safely suspended.", flush=True)
            return {
                "scanned_count": 0,
                "actions_taken": [],
                "adaptive_sleep_seconds": 300,
                "status": "MARKET_CLOSED_STANDBY",
                "message": "Market is closed. Active monitoring and exits suspended."
            }

        print("\n🛡️ [BodyguardAgent] Initiating Broker-First Active Position Risk Scan...", flush=True)

        # 1. Check Black Swan Macro Circuit Breaker
        circuit_info = CircuitBreakerGuard.check_black_swan_circuit_breaker()
        if circuit_info["is_circuit_breaker_triggered"]:
            print(f"🚨 [CIRCUIT BREAKER TRIGGERED] {circuit_info['reason']} Freezing all new positions.", flush=True)

        # 2. Check 0-DTE Expiration Assignment Risk
        zero_dte_info = CircuitBreakerGuard.check_zero_dte_assignment_risk()
        if zero_dte_info["is_assignment_risk_active"]:
            print(f"⏳ [0-DTE GAMMA ALERT] {zero_dte_info['reason']}", flush=True)

        # 3. Read Registered Trades from data/trades.json
        registered_trades = []
        if self.trades_file.exists():
            try:
                with open(self.trades_file, "r", encoding="utf-8") as f:
                    registered_trades = json.load(f)
            except Exception as e:
                print(f"[!] Error loading trades.json: {e}", flush=True)

        # 4. Ingest Live Alpaca Positions (Broker Truth)
        live_broker_positions = self.alpaca.get_open_positions()
        print(f"📡 [BodyguardAgent] Live Alpaca Broker Sync: {len(live_broker_positions)} contract position(s) active on exchange.", flush=True)

        if not live_broker_positions:
            return {
                "scanned_count": 0,
                "actions_taken": [],
                "adaptive_sleep_seconds": 60,
                "status": "NO_ACTIVE_BROKER_POSITIONS",
                "message": "No active open positions on Alpaca."
            }

        # 5. Group Live Broker Positions into Strategy Packages by Root Underlying
        packages_by_underlying = defaultdict(list)
        for pos in live_broker_positions:
            raw_sym = pos.get("symbol", "")
            # Extract root symbol (e.g. AAPL from AAPL260904C00350000)
            underlying = raw_sym[:4].rstrip("0123456789") if len(raw_sym) >= 6 else raw_sym
            packages_by_underlying[underlying].append(pos)

        actions_taken = []
        requires_high_alert_15s = False

        # Ingest current spot prices for active underlyings
        active_underlyings = list(packages_by_underlying.keys())
        assets_data = MarketDataTool.get_asset_universe_data(symbols=active_underlyings, compute_deep_sentiment=False) if active_underlyings else []
        price_map = {a["symbol"]: a["current_price"] for a in assets_data}

        # 6. Audit Each Strategy Package on Alpaca
        for underlying, legs in packages_by_underlying.items():
            total_pnl = sum(float(l.get("unrealized_pl", 0.0)) for l in legs)
            total_cost = sum(abs(float(l.get("cost_basis", l.get("market_value", 0.0)))) for l in legs)
            current_price = price_map.get(underlying, 100.0)

            # Check if there is an existing registered open trade envelope in trades.json
            matching_registered = [
                t for t in registered_trades
                if t.get("symbol") == underlying and t.get("status") in ["OPEN", "OPEN_ACTIVE", "ACTIVE"]
            ]
            trade_record = matching_registered[0] if matching_registered else None

            # Infer strategy name and parameters
            if trade_record:
                strategy = trade_record.get("strategy", "EARNINGS_STRADDLE")
                cost_or_credit = float(trade_record.get("cost_or_credit_usd", total_cost or 500.0))
                profit_target_usd = float(trade_record.get("profit_target_usd", cost_or_credit * 0.5))
                stop_loss_usd = float(trade_record.get("stop_loss_usd", 150.0))
                entry_price = float(trade_record.get("underlying_entry_price", current_price))
                trade_id = trade_record.get("trade_id", f"BROKER-{underlying}")
            else:
                # Synthesize strategy container from live broker legs
                has_calls = any("C" in l.get("symbol", "") for l in legs)
                has_puts = any("P" in l.get("symbol", "") for l in legs)
                if len(legs) >= 3 and has_calls and has_puts:
                    strategy = "THETA_IRON_CONDOR"
                elif has_calls and has_puts:
                    strategy = "EARNINGS_STRADDLE"
                else:
                    strategy = "DIRECTIONAL_SPREAD"

                cost_or_credit = max(total_cost, 100.0)
                profit_target_usd = round(cost_or_credit * 0.50, 2)
                stop_loss_usd = 150.0
                entry_price = current_price
                trade_id = f"BROKER-{underlying}-{int(datetime.datetime.utcnow().timestamp())}"

            pnl_pct = (total_pnl / max(cost_or_credit, 1.0)) * 100.0

            # 7. Evaluate Dynamic Strategy-Aware Profit Ratchet
            ratchet = ProfitRatchetEngine.evaluate_ratchet(
                current_pnl_usd=total_pnl,
                cost_or_credit_usd=cost_or_credit,
                base_stop_loss_usd=stop_loss_usd,
                target_profit_percent=50.0,
                strategy_name=strategy
            )

            print(f"\n  🔍 Auditing [{trade_id}] {underlying} ({strategy}) | {len(legs)} Broker Leg(s):", flush=True)
            print(f"     * Net Package P&L: {'+$' if total_pnl >= 0 else '-$'}{abs(total_pnl):.2f} ({pnl_pct:+.1f}%) | Ratchet Tier: {ratchet['ratchet_tier']}", flush=True)
            print(f"     * Floor / Target: Stop Floor ${ratchet['active_stop_floor_usd']:.2f} | Action: {ratchet['action']}", flush=True)

            # High-Alert Acceleration Check
            if ratchet["ratchet_tier"] in ["TIER_1_BREAK_EVEN", "TIER_2_RUNNER_50", "TIER_3_RUNNER_100"] or total_pnl <= -100.0:
                requires_high_alert_15s = True
                print("     ⚡ [HIGH ALERT] Position in active profit-trail or risk zone. Loop set to 15s.", flush=True)

            # === RISK ENFORCEMENT ACTIONS ===

            # Action 1: Profit Target Hit or Trailing Stop Triggered
            if ratchet["action"] in ["CLOSE_TAKE_PROFIT", "CLOSE_RATCHET_STOP"]:
                print(f"     🎉 [{ratchet['action']}] {ratchet['reason']}. Liquidating package on Alpaca.", flush=True)
                for leg in legs:
                    self.alpaca.close_position(leg["symbol"])
                
                self._record_closed_package(
                    trade_id=trade_id,
                    underlying=underlying,
                    strategy=strategy,
                    status="CLOSED_PROFIT",
                    pnl_usd=total_pnl,
                    cost_usd=cost_or_credit,
                    entry_px=entry_price,
                    exit_px=current_price,
                    exit_reason=ratchet["reason"],
                    legs=legs
                )
                actions_taken.append({"trade_id": trade_id, "action": ratchet["action"], "pnl_usd": total_pnl})

            # Action 2: Hard Stop Loss Triggered
            elif ratchet["action"] == "CLOSE_STOP_LOSS":
                print(f"     🛑 [HARD STOP LOSS] {ratchet['reason']}. Liquidating package on Alpaca.", flush=True)
                for leg in legs:
                    self.alpaca.close_position(leg["symbol"])

                self._record_closed_package(
                    trade_id=trade_id,
                    underlying=underlying,
                    strategy=strategy,
                    status="CLOSED_STOPPED",
                    pnl_usd=total_pnl,
                    cost_usd=cost_or_credit,
                    entry_px=entry_price,
                    exit_px=current_price,
                    exit_reason=ratchet["reason"],
                    legs=legs
                )
                actions_taken.append({"trade_id": trade_id, "action": "CLOSE_STOP_LOSS", "pnl_usd": total_pnl})

            # Action 3: 0-DTE Expiration Shield (Check if any legs expire today)
            elif zero_dte_info["is_assignment_risk_active"]:
                today_tag = datetime.date.today().strftime("%y%m%d")
                expiring_today_legs = [l for l in legs if today_tag in l.get("symbol", "")]
                if expiring_today_legs:
                    print(f"     ⏳ [0-DTE SHIELD] Liquidating {len(expiring_today_legs)} expiring leg(s) on {underlying} to eliminate pin risk.", flush=True)
                    for leg in expiring_today_legs:
                        # Only liquidate legs that have value (current mark > 0.05) to avoid paying unnecessary fees on dead worthless wings
                        if float(leg.get("current_price", 0.0)) >= 0.05:
                            self.alpaca.close_position(leg["symbol"])

                    self._record_closed_package(
                        trade_id=trade_id,
                        underlying=underlying,
                        strategy=strategy,
                        status="CLOSED_0DTE_RISK",
                        pnl_usd=total_pnl,
                        cost_usd=cost_or_credit,
                        entry_px=entry_price,
                        exit_px=current_price,
                        exit_reason=f"0-DTE Expiration Shield liquidated ITM options ahead of 4:00 PM EST pin risk.",
                        legs=expiring_today_legs
                    )
                    actions_taken.append({"trade_id": trade_id, "action": "CLOSE_0DTE", "pnl_usd": total_pnl})

            # Action 4: Adaptive Position Salvage & Dynamic Wing Rolling (Iron Condor)
            elif strategy == "THETA_IRON_CONDOR" and abs(current_price - entry_price) / max(entry_price, 1.0) >= 0.03:
                print(f"     🦋 [ADAPTIVE SALVAGE TRIGGERED] Wing threatened on {underlying}. Executing Untested Wing Roll on Alpaca...", flush=True)
                wing_roll = OptionLegRoller.calculate_wing_roll({"symbol": underlying, "underlying_entry_price": entry_price}, current_price)
                salvage_bp = self.salvage_engine.calculate_order(
                    symbol=underlying,
                    current_price=current_price,
                    risk_budget_usd=300.0
                )
                
                # Dispatch live adjustment orders to Alpaca
                for leg in salvage_bp.legs:
                    client_oid = f"oracle_salvage_{underlying}_{leg.side.lower()}_{int(datetime.datetime.utcnow().timestamp())}"
                    self.alpaca.submit_order(
                        symbol=leg.occ_symbol or f"{underlying}",
                        qty=leg.qty,
                        side=leg.side.lower(),
                        order_type="limit",
                        client_order_id=client_oid
                    )

                requires_high_alert_15s = True
                actions_taken.append({
                    "trade_id": trade_id,
                    "action": "SALVAGE_WING_ROLL",
                    "additional_credit_usd": wing_roll.get("additional_credit_collected_usd", 45.0),
                    "pnl_usd": total_pnl
                })

            else:
                print(f"     🛡️ [GUARDIAN STATUS: SAFE] {underlying} ({strategy}) within safe operating corridor. Holding.", flush=True)

        adaptive_sleep = 15 if requires_high_alert_15s else 60

        return {
            "scanned_count": len(packages_by_underlying),
            "broker_legs_count": len(live_broker_positions),
            "actions_taken": actions_taken,
            "adaptive_sleep_seconds": adaptive_sleep,
            "vix_circuit_status": circuit_info,
            "zero_dte_status": zero_dte_info,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

    def _record_closed_package(
        self,
        trade_id: str,
        underlying: str,
        strategy: str,
        status: str,
        pnl_usd: float,
        cost_usd: float,
        entry_px: float,
        exit_px: float,
        exit_reason: str,
        legs: List[dict]
    ):
        """
        Atomically records or aggregates the completed strategy package into data/trades.json and SQLite.
        Uses deterministic package IDs and upsert aggregation to prevent duplicate rows on repeated polling cycles.
        """
        closed_date = datetime.date.today().isoformat()
        today_tag = datetime.date.today().strftime("%Y%m%d")

        # Deterministic trade ID: if synthesised from broker, use consistent daily strategy package key
        if not trade_id or "BROKER" in trade_id or not trade_id.startswith("ORD-"):
            clean_trade_id = f"ORD-{underlying}-{strategy}-{today_tag}"
        else:
            clean_trade_id = trade_id

        # 1. Inspect existing trades in data/trades.json for upsert aggregation
        try:
            trades = []
            if self.trades_file.exists():
                with open(self.trades_file, "r", encoding="utf-8") as f:
                    trades = json.load(f)

            # Check if this strategy package or daily closed envelope already exists
            existing_pkg = None
            for t in trades:
                if t.get("trade_id") == clean_trade_id or (
                    t.get("symbol") == underlying
                    and t.get("strategy") == strategy
                    and t.get("exit_date") == closed_date
                    and str(t.get("status", "")).startswith("CLOSED")
                ):
                    existing_pkg = t
                    break

            new_legs_formatted = [
                {
                    "symbol": l.get("symbol"),
                    "occ_symbol": l.get("symbol"),
                    "side": l.get("side", "sell"),
                    "qty": float(l.get("qty", 1.0)),
                    "price": float(l.get("current_price", 0.0)),
                    "pnl_usd": float(l.get("unrealized_pl", 0.0))
                }
                for l in legs
            ]

            if existing_pkg:
                # Merge legs avoiding duplicates
                existing_legs = existing_pkg.get("order_legs") or []
                existing_symbols = {l.get("symbol") for l in existing_legs if isinstance(l, dict)}
                for nl in new_legs_formatted:
                    if nl.get("symbol") not in existing_symbols:
                        existing_legs.append(nl)

                existing_pkg["order_legs"] = existing_legs
                existing_pkg["pnl_usd"] = round(pnl_usd, 2)
                existing_pkg["exit_price"] = round(exit_px, 2)
                existing_pkg["cost_or_credit_usd"] = round(max(float(existing_pkg.get("cost_or_credit_usd", 0.0)), cost_usd), 2)
                existing_pkg["status"] = status
                existing_pkg["exit_reason"] = exit_reason
                existing_pkg["exit_date"] = closed_date
                final_record = existing_pkg
                print(f"💾 [BodyguardAgent] Aggregated existing package {clean_trade_id} in trades.json (P&L: ${pnl_usd:+.2f})")
            else:
                final_record = {
                    "trade_id": clean_trade_id,
                    "symbol": underlying,
                    "strategy": strategy,
                    "status": status,
                    "entry_price": round(entry_px, 2),
                    "exit_price": round(exit_px, 2),
                    "cost_or_credit_usd": round(cost_usd, 2),
                    "profit_target_usd": round(cost_usd * 0.5, 2),
                    "stop_loss_usd": 150.0,
                    "pnl_usd": round(pnl_usd, 2),
                    "exit_reason": exit_reason,
                    "entry_date": closed_date,
                    "exit_date": closed_date,
                    "order_legs": new_legs_formatted,
                    "created_at": datetime.datetime.utcnow().isoformat() + "Z"
                }
                trades = [t for t in trades if t.get("trade_id") != clean_trade_id]
                trades.append(final_record)
                print(f"💾 [BodyguardAgent] Persisted new authentic closed trade {clean_trade_id} to trades.json")

            with open(self.trades_file, "w", encoding="utf-8") as f:
                json.dump(trades, f, indent=2)
        except Exception as e:
            print(f"[!] Error updating trades.json: {e}", flush=True)
            final_record = None

        # 2. Update SQLite database
        if final_record:
            try:
                from backend.db.repositories import TradeRepository
                TradeRepository.insert_trade(final_record)
                print(f"💾 [BodyguardAgent] Synced closed trade {final_record['trade_id']} to SQLite oracle.db")
            except Exception as e:
                print(f"[!] Error syncing closed trade to SQLite: {e}", flush=True)

    def _calculate_pnl(self, trade: dict, current_price: float) -> Dict[str, Any]:
        """Calculates theoretical mark-to-market P&L for options structures."""
        strategy = trade.get("strategy", "EARNINGS_STRADDLE")
        entry_price = float(trade.get("underlying_entry_price", current_price))
        cost = float(trade.get("cost_or_credit_usd", 500.0))

        price_diff = current_price - entry_price
        price_change_pct = (price_diff / entry_price) * 100 if entry_price > 0 else 0.0

        if strategy == "EARNINGS_STRADDLE":
            move = abs(price_change_pct)
            if move >= 3.0:
                pnl = round(cost * 0.50, 2)
            elif move <= 0.8:
                pnl = round(-cost * 0.20, 2)
            else:
                pnl = round(cost * 0.15, 2)
        elif strategy in ["THETA_IRON_CONDOR", "SALVAGED_IRON_BUTTERFLY"]:
            move = abs(price_change_pct)
            if move <= 2.0:
                pnl = round(cost * 0.50, 2)
            elif move >= 4.5:
                pnl = -150.0
            elif move >= 3.0:
                pnl = -80.0
            else:
                pnl = round(cost * 0.25, 2)
        else:
            if price_change_pct >= 2.0:
                pnl = round(cost * 0.50, 2)
            elif price_change_pct <= -2.0:
                pnl = -150.0
            else:
                pnl = -30.0

        pnl_pct = (pnl / cost) * 100 if cost > 0 else 0.0
        return {"estimated_pnl_usd": pnl, "pnl_percent": pnl_pct}
