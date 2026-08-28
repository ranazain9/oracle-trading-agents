"""
ORACLE Trading System - Master Institutional Multi-Agent LangGraph State Machine
Orchestrates the 6-agent quantitative fund pipeline:
1. MacroIntelligenceAgent (Macro & Catalyst Sentinel)
2. MarketScout (Market Data & ToT Scenarios)
3. StrategyBrainAgent (Tree-of-Thoughts & Red Team Stress-Test)
4. HITLSupervisorAgent (Governance & Capital Approval)
5. TraderAgent (OCC Multi-leg Midpoint Execution)
6. PortfolioHedgeAgent (Greek Risk Balancer & Tail-Risk Hedge)
7. BodyguardAgent (Real-Time Risk Guardian)
8. PostTradeAnalystAgent (PnL Attribution & Long-Term Memory Synthesis)
"""
import sys
import os

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, START, END

from tools.market_data_tools import MarketDataTool
from tools.macro_calendar_tools import MacroCalendarTool
from agents.macro_intelligence_agent import MacroIntelligenceAgent, MacroAssessment
from agents.strategy_brain_agent import StrategyBrainAgent, StrategyDecision
from agents.hitl_supervisor_agent import HITLSupervisorAgent, HITLApprovalResult
from agents.trader_agent import TraderAgent
from agents.portfolio_hedge_agent import PortfolioHedgeAgent, HedgeDecision
from agents.bodyguard_agent import BodyguardAgent
from agents.post_trade_analyst_agent import PostTradeAnalystAgent, TradeReflection
from agents.risk_validator import ValidationResult


class OracleState(TypedDict):
    """
    Formal TypedDict State for Master Multi-Agent Orchestration.
    """
    symbols: List[str]
    portfolio_cash: float
    market_overview: Dict[str, Any]
    macro_env: Dict[str, Any]
    macro_assessment: Optional[Dict[str, Any]]
    assets_data: List[Dict[str, Any]]
    trade_memory: str
    decision: Optional[StrategyDecision]
    validation: Optional[ValidationResult]
    hitl_approval: Optional[Dict[str, Any]]
    execution_result: Optional[Dict[str, Any]]
    hedge_decision: Optional[Dict[str, Any]]
    guardian_result: Optional[Dict[str, Any]]
    analyst_reflection: Optional[Dict[str, Any]]
    is_approved: bool


# ==============================================================================
# LANGGRAPH NODE FUNCTIONS
# ==============================================================================

def macro_sentinel_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 1 (Agent 4): Evaluates Macro Shock Index (MSI), Treasury yields, and Fed catalysts.
    """
    print("\n🌐 [LangGraph: Node 1] Macro Intelligence Sentinel assessing Treasury yields & Fed catalysts...", flush=True)
    agent = MacroIntelligenceAgent()
    assessment = agent.evaluate_macro_regime()
    
    return {
        "macro_assessment": assessment.model_dump(),
        "macro_env": assessment.raw_macro_data
    }


def market_scout_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 2: Collects live market data, Greeks, 25-Delta Skew & ToT Payoffs.
    """
    print("📊 [LangGraph: Node 2] Market Scout gathering live feeds & ToT Payoffs...", flush=True)
    symbols = state.get("symbols", ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "SPY"])
    
    overview = MarketDataTool.get_market_overview()
    assets = MarketDataTool.get_asset_universe_data(symbols=symbols, compute_deep_sentiment=True)
    brain = StrategyBrainAgent()
    memory = brain._get_trade_memory_summary()

    return {
        "market_overview": overview,
        "assets_data": assets,
        "trade_memory": memory
    }


def strategy_brain_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 3 (Agent 1): Multi-turn AI Reasoning (ToT + Asymmetric Red Team + Bayesian Sizing).
    """
    print("🧠 [LangGraph: Node 3] Strategy Brain executing ToT & Asymmetric Red Team Stress-Test...", flush=True)
    brain = StrategyBrainAgent()
    decision = brain.analyze_and_decide(
        symbols=state.get("symbols"),
        portfolio_cash=state.get("portfolio_cash", 100000.0),
        precomputed_assets=state.get("assets_data"),
        macro_assessment=state.get("macro_assessment")
    )
    return {
        "decision": decision,
        "is_approved": decision.is_validated
    }


def hitl_supervisor_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 4: Institutional Governance & Capital Gatekeeper.
    """
    decision = state.get("decision")
    macro = state.get("macro_assessment", {})
    macro_regime = macro.get("macro_regime", "RISK_ON_EXPANSION")

    print(f"🏛️ [LangGraph: Node 4] HITL Supervisor auditing proposal under regime {macro_regime}...", flush=True)
    supervisor = HITLSupervisorAgent()
    approval = supervisor.review_proposal(decision, macro_regime)

    is_valid = state.get("is_approved", False) and approval.is_approved
    return {
        "hitl_approval": approval.model_dump(),
        "is_approved": is_valid
    }


def trader_execution_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 5 (Agent 2): Executes approved multi-leg options strategy on Alpaca with OCC symbols & Midpoint limits.
    """
    decision = state.get("decision")
    print(f"⚡ [LangGraph: Node 5] Trader executing {decision.strategy} on {decision.symbol}...", flush=True)
    
    assets = state.get("assets_data", [])
    target_asset = next((a for a in assets if a["symbol"] == decision.symbol), None)
    stock_price = target_asset["current_price"] if target_asset else 200.0

    trader = TraderAgent()
    exec_res = trader.construct_and_execute(decision, stock_price)
    
    return {
        "execution_result": exec_res
    }


def portfolio_hedge_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 6 (Agent 5): Portfolio Greek Risk Balancer & Tail-Risk Guardian.
    """
    print("🛡️ [LangGraph: Node 6] Portfolio Hedge Agent auditing net portfolio Greeks...", flush=True)
    hedge_agent = PortfolioHedgeAgent()
    hedge_res = hedge_agent.evaluate_portfolio_hedge()

    return {
        "hedge_decision": hedge_res.model_dump()
    }


def bodyguard_guardian_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 7 (Agent 3): Continuous Active Position Risk Guardian (+50% profit lock, -$150 stop loss).
    """
    print("🚨 [LangGraph: Node 7] Bodyguard executing Active Risk Guardian scan...", flush=True)
    bodyguard = BodyguardAgent()
    guard_res = bodyguard.monitor_positions()
    return {
        "guardian_result": guard_res
    }


def post_trade_analyst_node(state: OracleState) -> Dict[str, Any]:
    """
    Node 8 (Agent 6): Post-Trade Performance Auditor & Long-Term Memory Synthesis.
    """
    print("📈 [LangGraph: Node 8] Post-Trade Analyst auditing execution & updating memory...", flush=True)
    analyst = PostTradeAnalystAgent()
    decision = state.get("decision")
    
    trade_summary = {
        "symbol": decision.symbol if decision else "NVDA",
        "strategy": decision.strategy if decision else "NO_TRADE",
        "pnl_usd": 0.0,
        "return_pct": 0.0,
        "exit_reason": "CYCLE_COMPLETED",
        "holding_period_days": 1,
        "entry_iv_rank": 45.0,
        "exit_iv_rank": 40.0
    }
    reflection = analyst.analyze_trade_event(trade_summary)

    return {
        "analyst_reflection": reflection.model_dump()
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
    LangGraph Conditional Edge routing based on deterministic validation & HITL approval.
    """
    if state.get("is_approved", False) and state.get("decision") and state["decision"].strategy != "NO_TRADE":
        return "trader_execution_node"
    return "capital_preservation_node"


# ==============================================================================
# BUILD & COMPILE MASTER LANGGRAPH STATE GRAPH
# ==============================================================================

def build_oracle_graph():
    """
    Constructs and compiles the master institutional Multi-Agent LangGraph pipeline.
    """
    workflow = StateGraph(OracleState)

    # 1. Add All Graph Nodes
    workflow.add_node("macro_sentinel_node", macro_sentinel_node)
    workflow.add_node("market_scout_node", market_scout_node)
    workflow.add_node("strategy_brain_node", strategy_brain_node)
    workflow.add_node("hitl_supervisor_node", hitl_supervisor_node)
    workflow.add_node("trader_execution_node", trader_execution_node)
    workflow.add_node("capital_preservation_node", capital_preservation_node)
    workflow.add_node("portfolio_hedge_node", portfolio_hedge_node)
    workflow.add_node("bodyguard_guardian_node", bodyguard_guardian_node)
    workflow.add_node("post_trade_analyst_node", post_trade_analyst_node)

    # 2. Add Fixed Edges
    workflow.add_edge(START, "macro_sentinel_node")
    workflow.add_edge("macro_sentinel_node", "market_scout_node")
    workflow.add_edge("market_scout_node", "strategy_brain_node")
    workflow.add_edge("strategy_brain_node", "hitl_supervisor_node")

    # 3. Add Conditional Routing Edge
    workflow.add_conditional_edges(
        "hitl_supervisor_node",
        check_trade_approval_edge,
        {
            "trader_execution_node": "trader_execution_node",
            "capital_preservation_node": "capital_preservation_node"
        }
    )

    # 4. Route to Portfolio Hedge -> Bodyguard -> Post-Trade Analyst -> END
    workflow.add_edge("trader_execution_node", "portfolio_hedge_node")
    workflow.add_edge("capital_preservation_node", "portfolio_hedge_node")
    workflow.add_edge("portfolio_hedge_node", "bodyguard_guardian_node")
    workflow.add_edge("bodyguard_guardian_node", "post_trade_analyst_node")
    workflow.add_edge("post_trade_analyst_node", END)

    # Compile Graph
    app = workflow.compile()
    return app


# Master Compiled LangGraph Application
oracle_app = build_oracle_graph()
