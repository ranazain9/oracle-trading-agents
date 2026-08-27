"""
ORACLE Trading System - Master LangGraph State Machine
Uses official prebuilt LangGraph StateGraph, Nodes, and Conditional Edges to orchestrate the hedge fund pipeline.
"""
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, START, END

from tools.market_data_tools import MarketDataTool
from tools.macro_calendar_tools import MacroCalendarTool
from agents.strategy_brain_agent import StrategyBrainAgent, StrategyDecision
from agents.trader_agent import TraderAgent
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
    is_approved: bool


# ==============================================================================
# LANGGRAPH NODE FUNCTIONS
# ==============================================================================

def market_scout_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 1: Collects 100% real live market data, Greeks, 25-Delta Skew & ToT Payoffs.
    """
    print("\n🌐 [LangGraph: Node 1] Market Scout gathering live feeds & ToT Payoffs...")
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
    Node 2: Multi-turn AI Reasoning (Pass 1 Proposer -> Pass 2 Red Team Critic -> Pass 3 Synthesis).
    """
    print("🧠 [LangGraph: Node 2] Strategy Brain executing ToT & Red Team Self-Critique...")
    brain = StrategyBrainAgent()
    decision = brain.analyze_and_decide(
        symbols=state.get("symbols"),
        portfolio_cash=state.get("portfolio_cash", 100000.0)
    )
    return {
        "decision": decision,
        "is_approved": decision.is_validated
    }


def trader_execution_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 3: Executes approved multi-leg options strategy on Alpaca Paper Trading.
    """
    decision = state.get("decision")
    print(f"⚡ [LangGraph: Node 3] Trader executing {decision.strategy} on {decision.symbol}...")
    
    # Get live stock price for target
    assets = state.get("assets_data", [])
    target_asset = next((a for a in assets if a["symbol"] == decision.symbol), None)
    stock_price = target_asset["current_price"] if target_asset else 200.0

    trader = TraderAgent()
    exec_res = trader.construct_and_execute(decision, stock_price)
    
    return {
        "execution_result": exec_res
    }


def capital_preservation_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 4: Capital Preservation Mode when a trade is vetoed or strategy is NO_TRADE.
    """
    decision = state.get("decision")
    print(f"🛑 [LangGraph: Node 4] Capital Preservation Mode: {decision.validator_status if decision else 'NO_TRADE'}")
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
# BUILD & COMPILE LANGGRAPH STATE GRAPH
# ==============================================================================

def build_oracle_graph():
    """
    Constructs and compiles the master LangGraph state machine.
    """
    workflow = StateGraph(OracleState)

    # 1. Add Prebuilt Nodes
    workflow.add_node("market_scout_node", market_scout_node)
    workflow.add_node("strategy_brain_node", strategy_brain_node)
    workflow.add_node("trader_execution_node", trader_execution_node)
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

    workflow.add_edge("trader_execution_node", END)
    workflow.add_edge("capital_preservation_node", END)

    # Compile Graph
    app = workflow.compile()
    return app


# Master Compiled LangGraph Application
oracle_app = build_oracle_graph()
