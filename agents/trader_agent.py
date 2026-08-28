"""
ORACLE Trading Agent - Agent 2: The Trader (Order Execution Engine)
Executes multi-leg options strategies on Alpaca Paper Trading with CBOE strike snapping, OCC symbols, and Midpoint limit pricing.
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
    Translates StrategyDecisions into exact multi-leg options orders with OCC contract IDs and Midpoint Limit Prices.
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
        risk_budget = getattr(decision, "suggested_risk_budget_usd", 500.0)
        
        if decision.strategy == "EARNINGS_STRADDLE":
            blueprint = self.straddle_calc.calculate_order(
                symbol=decision.symbol,
                current_price=current_stock_price,
                risk_budget_usd=risk_budget,
                target_profit_percent=decision.target_profit_percent,
                max_loss_usd=decision.max_loss_usd
            )
        elif decision.strategy == "THETA_IRON_CONDOR":
            blueprint = self.condor_calc.calculate_order(
                symbol=decision.symbol,
                current_price=current_stock_price,
                risk_budget_usd=risk_budget,
                target_profit_percent=decision.target_profit_percent,
                max_loss_usd=decision.max_loss_usd
            )
        elif decision.strategy == "DIRECTIONAL_SPREAD":
            blueprint = self.spread_calc.calculate_order(
                symbol=decision.symbol,
                current_price=current_stock_price,
                direction=decision.direction,
                risk_budget_usd=risk_budget,
                target_profit_percent=decision.target_profit_percent,
                max_loss_usd=decision.max_loss_usd
            )
        elif decision.strategy == "ADAPTIVE_ADJUSTMENT":
            blueprint = self.salvage_calc.calculate_order(
                symbol=decision.symbol,
                current_price=current_stock_price,
                risk_budget_usd=risk_budget,
                target_profit_percent=decision.target_profit_percent,
                max_loss_usd=decision.max_loss_usd
            )
        else:
            blueprint = self.straddle_calc.calculate_order(
                symbol=decision.symbol,
                current_price=current_stock_price,
                risk_budget_usd=risk_budget
            )

        print(f"\n⚡ [TraderAgent] Formulating Multi-Leg Execution for {blueprint.strategy_name} on {blueprint.underlying_symbol}:")
        print(f"   • Order Type          : {blueprint.order_type} (Slippage Shield)")
        print(f"   • Package Limit Price : ${blueprint.package_limit_price_usd:.2f} ({'Net Credit' if blueprint.is_credit else 'Net Debit'})")
        print(f"   • Margin Requirement : ${blueprint.margin_requirement_usd:.2f}")
        print(f"   • Est. Slippage Saved : +${blueprint.estimated_slippage_savings_usd:.2f}")
        print("-" * 80)
        for i, leg in enumerate(blueprint.legs, 1):
            occ = leg.occ_symbol if leg.occ_symbol else f"{leg.symbol}_{leg.strike}_{leg.option_type}"
            print(f"   Leg #{i}: {leg.side.upper()} {leg.qty}x OCC:[{occ}] Strike ${leg.strike:.2f} {leg.option_type} | Midpoint: ${leg.midpoint_limit_price:.2f}/share")

        # Step 3: Margin Pre-Flight Safety Check
        if blueprint.margin_requirement_usd > cash:
            print(f"🛑 [TraderAgent] Insufficient margin collateral (${blueprint.margin_requirement_usd:.2f} > ${cash:.2f}). Aborting order.")
            return {
                "status": "REJECTED_MARGIN_EXCEEDED",
                "reason": "Margin requirement exceeds available account cash.",
                "blueprint": blueprint,
                "orders_executed": []
            }

        # Step 4: Execute Atomic Orders on Alpaca
        executed_orders = []
        for leg in blueprint.legs:
            order_symbol = leg.occ_symbol if leg.occ_symbol else f"{leg.symbol}"
            order_res = self.alpaca.submit_order(
                symbol=order_symbol,
                qty=leg.qty,
                side=leg.side.lower(),
                order_type="limit"
            )
            order_res["midpoint_limit_price"] = leg.midpoint_limit_price
            order_res["occ_symbol"] = leg.occ_symbol
            executed_orders.append(order_res)

        # Step 5: Persist Trade Record to data/trades.json
        trade_record = {
            "trade_id": f"ORD-{int(datetime.datetime.utcnow().timestamp())}",
            "symbol": decision.symbol,
            "strategy": blueprint.strategy_name,
            "entry_date": datetime.date.today().isoformat(),
            "underlying_entry_price": current_stock_price,
            "cost_or_credit_usd": blueprint.total_debit_or_credit,
            "package_limit_price_usd": blueprint.package_limit_price_usd,
            "margin_requirement_usd": blueprint.margin_requirement_usd,
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
