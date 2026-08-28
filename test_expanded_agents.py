"""
ORACLE Trading System - Master Expanded Agent Pipeline Verification
"""
import sys
import os

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from agents.macro_intelligence_agent import MacroIntelligenceAgent
from agents.portfolio_hedge_agent import PortfolioHedgeAgent
from agents.hitl_supervisor_agent import HITLSupervisorAgent
from agents.post_trade_analyst_agent import PostTradeAnalystAgent
from agents.strategy_brain_agent import StrategyDecision
from graph import oracle_app


def test_individual_agents():
    print("=" * 75)
    print("[TEST] 1. TESTING INDIVIDUAL EXPANDED AGENTS")
    print("=" * 75)

    # 1. Test MacroIntelligenceAgent
    print("\n--- [Agent 4: MacroIntelligenceAgent] ---")
    macro_agent = MacroIntelligenceAgent()
    macro_res = macro_agent.evaluate_macro_regime()
    print(f"[*] Macro Regime: {macro_res.macro_regime}")
    print(f"[*] Macro Shock Index: {macro_res.macro_shock_index}")
    print(f"[*] Max Sizing Multiplier: {macro_res.max_allocation_multiplier}x")
    print(f"[*] Strategic Thesis: {macro_res.strategic_macro_thesis}")

    # 2. Test PortfolioHedgeAgent
    print("\n--- [Agent 5: PortfolioHedgeAgent] ---")
    hedge_agent = PortfolioHedgeAgent()
    hedge_res = hedge_agent.evaluate_portfolio_hedge()
    print(f"[*] Hedge Decision: {hedge_res.decision}")
    print(f"[*] Recommended Structure: {hedge_res.recommended_structure}")
    print(f"[*] Commentary: {hedge_res.risk_commentary}")

    # 3. Test HITLSupervisorAgent
    print("\n--- [Governance: HITLSupervisorAgent] ---")
    hitl = HITLSupervisorAgent(manual_approval_threshold_usd=10000.0)
    mock_decision = StrategyDecision(
        symbol="NVDA",
        strategy="EARNINGS_STRADDLE",
        suggested_risk_budget_usd=500.0,
        is_validated=True
    )
    approval = hitl.review_proposal(mock_decision, macro_res.macro_regime)
    print(f"[*] Approval Status: {approval.approval_level}")
    print(f"[*] Is Authorized: {approval.is_approved}")
    print(f"[*] Operator Notes: {approval.operator_notes}")

    # 4. Test PostTradeAnalystAgent
    print("\n--- [Agent 6: PostTradeAnalystAgent] ---")
    analyst = PostTradeAnalystAgent()
    reflection = analyst.analyze_trade_event({
        "symbol": "NVDA",
        "strategy": "EARNINGS_STRADDLE",
        "pnl_usd": 250.0,
        "return_pct": 50.0,
        "exit_reason": "PROFIT_RATCHET_LOCK",
        "holding_period_days": 2,
        "entry_iv_rank": 48.0,
        "exit_iv_rank": 42.0
    })
    print(f"[*] Outcome Category: {reflection.trade_outcome_category}")
    print(f"[*] Primary PnL Driver: {reflection.primary_pnl_driver}")
    print(f"[*] Execution Grade: {reflection.execution_grade}")
    print(f"[*] Core Lesson: {reflection.core_lesson}")


def test_full_langgraph_pipeline():
    print("\n" + "=" * 75)
    print("[TEST] 2. TESTING FULL MASTER LANGGRAPH STATE MACHINE")
    print("=" * 75)

    initial_state = {
        "symbols": ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "SPY"],
        "portfolio_cash": 100000.0,
        "market_overview": {},
        "macro_env": {},
        "macro_assessment": None,
        "assets_data": [],
        "trade_memory": "",
        "decision": None,
        "validation": None,
        "hitl_approval": None,
        "execution_result": None,
        "hedge_decision": None,
        "guardian_result": None,
        "analyst_reflection": None,
        "is_approved": False
    }

    final_state = oracle_app.invoke(initial_state)
    
    print("\n" + "=" * 75)
    print("[SUCCESS] MASTER LANGGRAPH EXECUTION COMPLETED")
    print("=" * 75)
    print(f"• Macro Regime: {final_state.get('macro_assessment', {}).get('macro_regime')}")
    print(f"• Decision Symbol: {final_state.get('decision').symbol if final_state.get('decision') else 'N/A'}")
    print(f"• Strategy: {final_state.get('decision').strategy if final_state.get('decision') else 'N/A'}")
    print(f"• HITL Authorized: {final_state.get('is_approved')}")
    print(f"• Execution Status: {final_state.get('execution_result', {}).get('status')}")
    print(f"• Hedge Action: {final_state.get('hedge_decision', {}).get('decision')}")
    print(f"• Analyst Outcome: {final_state.get('analyst_reflection', {}).get('trade_outcome_category')}")


if __name__ == "__main__":
    test_individual_agents()
    test_full_langgraph_pipeline()
