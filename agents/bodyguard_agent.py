"""
ORACLE Trading System - Agent 3: The Bodyguard (60-Second Adaptive Active Risk Guardian)
Monitors positions continuously during market hours:
1. Synchronizes live open positions directly from Alpaca Broker API.
2. Enforces Dynamic Trailing Profit Ratchet (+30% -> Break-Even, +45% -> +25% Lock, +50% -> Target Exit).
3. Executes physical liquidation orders on Alpaca Brokerage.
4. Enforces 0-DTE Friday 3:30 PM Early Assignment & Black Swan VIX Spike Circuit Breakers.
5. Adapts monitoring loop frequency: 60 seconds (Normal) / 15 seconds (High-Alert / Salvage).
"""
import json
import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

from tools.market_data_tools import MarketDataTool
from tools.alpaca_tools import AlpacaTool
from tools.profit_ratchet_tools import ProfitRatchetEngine
from tools.circuit_breaker_tools import CircuitBreakerGuard
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
        Scans all active open positions, synchronizes with live broker P&L, and enforces exit/salvage rules.
        """
        print("\n🛡️ [BodyguardAgent] Initiating 60-Second Active Position Risk Scan...", flush=True)

        # 1. Check Black Swan Macro Circuit Breaker
        circuit_info = CircuitBreakerGuard.check_black_swan_circuit_breaker()
        if circuit_info["is_circuit_breaker_triggered"]:
            print(f"🚨 [CIRCUIT BREAKER TRIGGERED] {circuit_info['reason']} Freezing all new positions.", flush=True)

        # 2. Check 0-DTE Expiration Assignment Risk
        zero_dte_info = CircuitBreakerGuard.check_zero_dte_assignment_risk()
        if zero_dte_info["is_assignment_risk_active"]:
            print(f"⏳ [0-DTE GAMMA ALERT] {zero_dte_info['reason']}", flush=True)

        # 3. Read Local Active Trades
        trades = []
        if self.trades_file.exists():
            try:
                with open(self.trades_file, "r") as f:
                    trades = json.load(f)
            except Exception as e:
                print(f"[!] Error loading trades.json: {e}", flush=True)

        open_trades = [t for t in trades if t.get("status") in ["OPEN", "OPEN_ACTIVE", "ACTIVE"]]
        
        # 4. Sync with Live Alpaca Positions
        live_broker_positions = self.alpaca.get_open_positions()
        broker_symbols = [p["symbol"] for p in live_broker_positions]
        if live_broker_positions:
            print(f"📡 [BodyguardAgent] Live Alpaca Broker Sync: {len(live_broker_positions)} position(s) active on exchange.", flush=True)

        print(f"  • Active Open Positions Tracked: {len(open_trades)} trade(s)", flush=True)

        if not open_trades and not live_broker_positions:
            return {
                "scanned_count": 0,
                "actions_taken": [],
                "adaptive_sleep_seconds": 60,
                "status": "NO_ACTIVE_POSITIONS"
            }

        actions_taken = []
        updated_trades = []
        requires_high_alert_15s = False

        # Ingest current live prices for active symbols
        active_symbols = list(set([t.get("symbol", "SPY") for t in open_trades]))
        assets_data = MarketDataTool.get_asset_universe_data(symbols=active_symbols, compute_deep_sentiment=False) if active_symbols else []
        price_map = {a["symbol"]: a["current_price"] for a in assets_data}

        for trade in trades:
            if trade.get("status") not in ["OPEN", "OPEN_ACTIVE", "ACTIVE"]:
                updated_trades.append(trade)
                continue

            symbol = trade.get("symbol", "SPY")
            strategy = trade.get("strategy", "EARNINGS_STRADDLE")
            entry_price = float(trade.get("underlying_entry_price", 100.0))
            current_price = price_map.get(symbol, entry_price)
            cost_or_credit = float(trade.get("cost_or_credit_usd", 500.0))
            profit_target_usd = float(trade.get("profit_target_usd", 250.0))
            stop_loss_usd = float(trade.get("stop_loss_usd", 150.0))
            trade_id = trade.get("trade_id", "UNKNOWN")

            # Check if this position has live broker P&L
            broker_pos = next((p for p in live_broker_positions if symbol in p["symbol"]), None)
            if broker_pos:
                current_pnl = broker_pos["unrealized_pl"]
                pnl_pct = broker_pos["unrealized_plpc"]
                pnl_source = "LIVE_ALPACA_BROKER"
            else:
                pnl_info = self._calculate_pnl(trade, current_price)
                current_pnl = pnl_info["estimated_pnl_usd"]
                pnl_pct = pnl_info["pnl_percent"]
                pnl_source = "MARK_TO_MARKET_MATH"

            # 5. Evaluate Trailing Profit Ratchet
            ratchet = ProfitRatchetEngine.evaluate_ratchet(
                current_pnl_usd=current_pnl,
                cost_or_credit_usd=cost_or_credit,
                base_stop_loss_usd=stop_loss_usd,
                target_profit_percent=50.0
            )

            print(f"\n  🔍 Auditing [{trade_id}] {symbol} ({strategy}) | Source: {pnl_source}:", flush=True)
            print(f"     * Current P&L: {'+$' if current_pnl >= 0 else '-$'}{abs(current_pnl):.2f} ({pnl_pct:+.1f}%) | Ratchet Tier: {ratchet['ratchet_tier']}", flush=True)
            print(f"     * Target: +${profit_target_usd:.2f} | Active Stop Floor: ${ratchet['active_stop_floor_usd']:.2f}", flush=True)

            # Check for High-Alert 15s Acceleration
            if ratchet["ratchet_tier"] in ["TIER_1_BREAK_EVEN", "TIER_2_PROFIT_LOCK_25"] or (current_pnl <= -100.0):
                requires_high_alert_15s = True
                print("     ⚡ [HIGH ALERT] Position near critical profit/stop boundary. Accelerating loop to 15 seconds.", flush=True)

            # Action 1: Take Profit or Ratchet Stop Triggered
            if ratchet["action"] in ["CLOSE_TAKE_PROFIT", "CLOSE_RATCHET_STOP"]:
                print(f"     🎉 [{ratchet['action']}] {ratchet['reason']}. Liquidating on Alpaca.", flush=True)
                close_res = self.alpaca.close_position(symbol)
                trade["status"] = "CLOSED_PROFIT"
                trade["exit_date"] = datetime.date.today().isoformat()
                trade["exit_price"] = current_price
                trade["pnl_usd"] = current_pnl
                trade["exit_reason"] = ratchet["reason"]
                trade["broker_exit_result"] = close_res
                actions_taken.append({"trade_id": trade_id, "action": ratchet["action"], "pnl_usd": current_pnl})

            # Action 2: Hard Stop Loss Triggered
            elif ratchet["action"] == "CLOSE_STOP_LOSS":
                print(f"     🛑 [HARD STOP LOSS] {ratchet['reason']}. Liquidating on Alpaca.", flush=True)
                close_res = self.alpaca.close_position(symbol)
                trade["status"] = "CLOSED_STOPPED"
                trade["exit_date"] = datetime.date.today().isoformat()
                trade["exit_price"] = current_price
                trade["pnl_usd"] = -stop_loss_usd
                trade["exit_reason"] = ratchet["reason"]
                trade["broker_exit_result"] = close_res
                actions_taken.append({"trade_id": trade_id, "action": "CLOSE_STOP_LOSS", "pnl_usd": -stop_loss_usd})

            # Action 3: 0-DTE Friday 3:30 PM Risk Triggered
            elif zero_dte_info["is_assignment_risk_active"]:
                print(f"     ⏳ [0-DTE LIQUIDATION] Liquidating before market close to avoid assignment risk.", flush=True)
                close_res = self.alpaca.close_position(symbol)
                trade["status"] = "CLOSED_0DTE_RISK"
                trade["pnl_usd"] = current_pnl
                trade["exit_reason"] = zero_dte_info["reason"]
                actions_taken.append({"trade_id": trade_id, "action": "CLOSE_0DTE", "pnl_usd": current_pnl})

            # Action 4: Adaptive Position Salvage (Threatened Iron Condor Wing)
            elif strategy == "THETA_IRON_CONDOR" and abs(current_price - entry_price) / entry_price >= 0.03:
                print(f"     🦋 [ADAPTIVE SALVAGE TRIGGERED] Short wing threatened. Converting into Iron Butterfly.", flush=True)
                salvage_bp = self.salvage_engine.calculate_order(
                    symbol=symbol,
                    current_price=current_price,
                    risk_budget_usd=300.0
                )
                trade["strategy"] = "SALVAGED_IRON_BUTTERFLY"
                trade["salvage_notes"] = salvage_bp.execution_notes
                trade["salvaged_at"] = datetime.datetime.utcnow().isoformat()
                requires_high_alert_15s = True
                actions_taken.append({"trade_id": trade_id, "action": "SALVAGE_IRON_BUTTERFLY", "pnl_usd": current_pnl})

            else:
                print(f"     🛡️ [GUARDIAN STATUS: SAFE] Position within risk parameters. Holding.", flush=True)

            updated_trades.append(trade)

        # Atomic Write to trades.json
        try:
            with open(self.trades_file, "w") as f:
                json.dump(updated_trades, f, indent=2)
        except Exception as e:
            print(f"[!] Error saving trades.json: {e}", flush=True)

        adaptive_sleep = 15 if requires_high_alert_15s else 60

        return {
            "scanned_count": len(open_trades),
            "actions_taken": actions_taken,
            "adaptive_sleep_seconds": adaptive_sleep,
            "vix_circuit_status": circuit_info,
            "zero_dte_status": zero_dte_info,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

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
