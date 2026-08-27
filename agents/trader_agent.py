"""
ORACLE Trading Agent - Agent 2: The Trader (Order Execution Engine)
Executes multi-leg options strategies on Alpaca Paper Trading based on AI Strategy Decisions.
"""
import json
import datetime
from pathlib import Path
from typing import Dict, Any, Optional

from tools.alpaca_tools import AlpacaTool
from agents.strategy_brain_agent import StrategyDecision
from strategies import (
    EarningsStraddleStrategy,
    ThetaIronCondorStrategy,
    DirectionalSpreadStrategy,
    AdaptiveAdjustmentStrategy,
    StrategyOrderBlueprint
)


class TraderAgent:
    """
    Translates StrategyDecisions into exact multi-leg options orders and executes them on Alpaca.
    """

    def __init__(self):
        self.alpaca = AlpacaTool()
        self.straddle_calc = EarningsStraddleStrategy()
        self.condor_calc = ThetaIronCondorStrategy()
        self.spread_calc = DirectionalSpreadStrategy()
        self.salvage_calc = AdaptiveAdjustmentStrategy()

    def construct_and_execute(
        self,
        decision: StrategyDecision,
        current_stock_price: float
    ) -> Dict[str, Any]:
        """
        Calculates the order blueprint and submits the multi-leg order to Alpaca.
        """
        # Step 1: Check Account Buying Power
        account = self.alpaca.get_account_status()
        cash = account.get("cash", 100000.0)

        if decision.strategy == "NO_TRADE":
            print("🛑 [TraderAgent] Strategy is NO_TRADE. Preserving capital. Zero orders placed.")
            return {
                "status": "SKIPPED_NO_TRADE",
                "reason": decision.reasoning,
                "blueprint": None,
                "orders_executed": []
            }

        # Step 2: Select Strategy Engine
        if decision.strategy == "EARNINGS_STRADDLE":
            blueprint = self.straddle_calc.calculate_order(
                symbol=decision.symbol,
                current_price=current_stock_price,
                risk_budget_usd=decision.suggested_risk_budget_usd,
                target_profit_percent=decision.target_profit_percent,
                max_loss_usd=decision.max_loss_usd
            )
        elif decision.strategy == "THETA_IRON_CONDOR":
            blueprint = self.condor_calc.calculate_order(
                symbol=decision.symbol,
                current_price=current_stock_price,
                risk_budget_usd=decision.suggested_risk_budget_usd,
                target_profit_percent=decision.target_profit_percent,
                max_loss_usd=decision.max_loss_usd
            )
        elif decision.strategy == "DIRECTIONAL_SPREAD":
            blueprint = self.spread_calc.calculate_order(
                symbol=decision.symbol,
                current_price=current_stock_price,
                direction=decision.direction,
                risk_budget_usd=decision.suggested_risk_budget_usd,
                target_profit_percent=decision.target_profit_percent,
                max_loss_usd=decision.max_loss_usd
            )
        elif decision.strategy == "ADAPTIVE_ADJUSTMENT":
            blueprint = self.salvage_calc.calculate_order(
                symbol=decision.symbol,
                current_price=current_stock_price,
                risk_budget_usd=decision.suggested_risk_budget_usd,
                target_profit_percent=decision.target_profit_percent,
                max_loss_usd=decision.max_loss_usd
            )
        else:
            blueprint = self.straddle_calc.calculate_order(
                symbol=decision.symbol,
                current_price=current_stock_price,
                risk_budget_usd=decision.suggested_risk_budget_usd
            )

        print(f"\n⚡ [TraderAgent] Formulating Multi-Leg Execution for {blueprint.strategy_name} on {blueprint.underlying_symbol}:")
        for i, leg in enumerate(blueprint.legs, 1):
            print(f"   Leg #{i}: {leg.side} {leg.qty}x {leg.symbol} ${leg.strike:.2f} {leg.option_type} (~${leg.estimated_premium:.2f}/share)")

        # Step 3: Execute Orders on Alpaca
        executed_orders = []
        for leg in blueprint.legs:
            order_res = self.alpaca.submit_order(
                symbol=f"{leg.symbol}",
                qty=leg.qty,
                side=leg.side.lower(),
                order_type="market"
            )
            executed_orders.append(order_res)

        # Step 4: Persist Trade Record to data/trades.json
        trade_record = {
            "trade_id": f"ORD-{int(datetime.datetime.utcnow().timestamp())}",
            "symbol": decision.symbol,
            "strategy": blueprint.strategy_name,
            "entry_date": datetime.date.today().isoformat(),
            "underlying_entry_price": current_stock_price,
            "cost_or_credit_usd": blueprint.total_debit_or_credit,
            "is_credit": blueprint.is_credit,
            "profit_target_usd": blueprint.profit_target_usd,
            "stop_loss_usd": blueprint.stop_loss_usd,
            "status": "OPEN_ACTIVE",
            "orders": executed_orders
        }

        self._record_trade(trade_record)

        return {
            "status": "EXECUTED",
            "trade_id": trade_record["trade_id"],
            "blueprint": blueprint,
            "executed_orders": executed_orders
        }

    def _record_trade(self, trade_record: dict):
        """
        Saves the active trade into data/trades.json
        """
        trades_file = Path(__file__).resolve().parent.parent / "data" / "trades.json"
        trades = []
        if trades_file.exists():
            try:
                with open(trades_file, "r") as f:
                    trades = json.load(f)
            except Exception:
                trades = []
        
        trades.append(trade_record)
        try:
            with open(trades_file, "w") as f:
                json.dump(trades, f, indent=2)
            print(f"💾 [TraderAgent] Trade logged to data/trades.json ({trade_record['trade_id']})")
        except Exception as e:
            print(f"[!] Error recording trade: {e}")
