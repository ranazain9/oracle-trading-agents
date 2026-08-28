"""
ORACLE Trading System - Master LangGraph State Machine
Uses official prebuilt LangGraph StateGraph, Nodes, and Conditional Edges to orchestrate the entire 3-agent hedge fund pipeline.
"""
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, START, END

from tools.market_data_tools import MarketDataTool
from tools.macro_calendar_tools import MacroCalendarTool
from agents.strategy_brain_agent import StrategyBrainAgent, StrategyDecision
from agents.trader_agent import TraderAgent
from agents.bodyguard_agent import BodyguardAgent
from agents.risk_validator import RiskValidator, ValidationResult


class OracleState(TypedDict):
    """
    Formal TypedDict State for LangGraph Multi-Agent Orchestration.
    """
    symbols: List[str]
    portfolio_cash: float
    market_overview: Dict[str, Any]
    macro_env: Dict[str, Any]
    assets_data: List[Dict[str, Any]]
    trade_memory: str
    decision: Optional[StrategyDecision]
    validation: Optional[ValidationResult]
    execution_result: Optional[Dict[str, Any]]
    guardian_result: Optional[Dict[str, Any]]
    is_approved: bool


# ==============================================================================
# LANGGRAPH NODE FUNCTIONS
# ==============================================================================

def market_scout_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 1 (Agent 1): Collects live market data, Greeks, 25-Delta Skew & ToT Payoffs.
    """
    print("\n🌐 [LangGraph: Node 1] Market Scout gathering live feeds & ToT Payoffs...", flush=True)
    symbols = state.get("symbols", ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "SPY"])
    
    macro = MacroCalendarTool.get_macro_environment()
    overview = MarketDataTool.get_market_overview()
    assets = MarketDataTool.get_asset_universe_data(symbols=symbols, compute_deep_sentiment=True)
    brain = StrategyBrainAgent()
    memory = brain._get_trade_memory_summary()

    return {
        "market_overview": overview,
        "macro_env": macro,
        "assets_data": assets,
        "trade_memory": memory
    }


def strategy_brain_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 2 (Agent 1): Multi-turn AI Reasoning (ToT + Asymmetric Red Team + Bayesian Sizing + Runner-Up Fallback).
    """
    print("🧠 [LangGraph: Node 2] Strategy Brain executing ToT & Asymmetric Red Team Stress-Test...", flush=True)
    brain = StrategyBrainAgent()
    decision = brain.analyze_and_decide(
        symbols=state.get("symbols"),
        portfolio_cash=state.get("portfolio_cash", 100000.0),
        precomputed_assets=state.get("assets_data")
    )
    return {
        "decision": decision,
        "is_approved": decision.is_validated
    }


def trader_execution_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 3 (Agent 2): Executes approved multi-leg options strategy on Alpaca with OCC symbols & Midpoint limits.
    """
    decision = state.get("decision")
    print(f"⚡ [LangGraph: Node 3] Trader executing {decision.strategy} on {decision.symbol}...", flush=True)
    
    assets = state.get("assets_data", [])
    target_asset = next((a for a in assets if a["symbol"] == decision.symbol), None)
    stock_price = target_asset["current_price"] if target_asset else 200.0

    trader = TraderAgent()
    exec_res = trader.construct_and_execute(decision, stock_price)
    
    return {
        "execution_result": exec_res
    }


def bodyguard_guardian_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 4 (Agent 3): Continuous Active Position Risk Guardian (+50% profit lock, -$150 stop loss, wing salvage).
    """
    print("🛡️ [LangGraph: Node 4] Bodyguard executing 5-Minute Active Risk Guardian scan...", flush=True)
    bodyguard = BodyguardAgent()
    guard_res = bodyguard.monitor_positions()
    return {
        "guardian_result": guard_res
    }


def capital_preservation_node(state: OracleState) -> Dict[str, Any]:
    """
    Fallback Node: Capital Preservation Mode when a trade is vetoed or strategy is NO_TRADE.
    """
    decision = state.get("decision")
    print(f"🛑 [LangGraph: Fallback Node] Capital Preservation Mode: {decision.validator_status if decision else 'NO_TRADE'}", flush=True)
    return {
        "execution_result": {
            "status": "CAPITAL_PRESERVED_NO_ORDERS",
            "reason": decision.validator_status if decision else "NO_TRADE"
        }
    }


# ==============================================================================
# CONDITIONAL ROUTING EDGE
# ==============================================================================

def check_trade_approval_edge(state: OracleState) -> str:
    """
    LangGraph Conditional Edge routing based on deterministic validation.
    """
    if state.get("is_approved", False) and state.get("decision") and state["decision"].strategy != "NO_TRADE":
        return "trader_execution_node"
    return "capital_preservation_node"


# ==============================================================================
# BUILD & COMPILE LANGGRAPH STATE GRAPH (3-AGENT PIPELINE)
# ==============================================================================

def build_oracle_graph():
    """
    Constructs and compiles the master 3-Agent LangGraph state machine.
    """
    workflow = StateGraph(OracleState)

    # 1. Add Prebuilt Nodes
    workflow.add_node("market_scout_node", market_scout_node)
    workflow.add_node("strategy_brain_node", strategy_brain_node)
    workflow.add_node("trader_execution_node", trader_execution_node)
    workflow.add_node("bodyguard_guardian_node", bodyguard_guardian_node)
    workflow.add_node("capital_preservation_node", capital_preservation_node)

    # 2. Add Fixed Edges
    workflow.add_edge(START, "market_scout_node")
    workflow.add_edge("market_scout_node", "strategy_brain_node")

    # 3. Add Conditional Routing Edge
    workflow.add_conditional_edges(
        "strategy_brain_node",
        check_trade_approval_edge,
        {
            "trader_execution_node": "trader_execution_node",
            "capital_preservation_node": "capital_preservation_node"
        }
    )

    # 4. Route from Trader & Capital Preservation to Agent 3 Bodyguard
    workflow.add_edge("trader_execution_node", "bodyguard_guardian_node")
    workflow.add_edge("capital_preservation_node", "bodyguard_guardian_node")
    workflow.add_edge("bodyguard_guardian_node", END)

    # Compile Graph
    app = workflow.compile()
    return app


# Master Compiled LangGraph Application
oracle_app = build_oracle_graph()
