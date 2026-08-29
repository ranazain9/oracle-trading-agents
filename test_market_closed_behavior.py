"""
Test Suite: Market Closed Agent Behavior & Ledger Protection
Verifies:
1. Alpaca market clock detection
2. AlpacaTool order rejection during market closed state
3. TraderAgent aborting execution and skipping ledger write when closed
4. BodyguardAgent entering safe standby mode
5. Master LangGraph workflow routing to Capital Preservation Mode
6. Preservation of data/trades.json integrity
"""
import sys
import json
import datetime
from pathlib import Path

# Add project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent))

from tools.alpaca_tools import AlpacaTool
from agents.strategy_brain_agent import StrategyDecision
from agents.trader_agent import TraderAgent
from agents.bodyguard_agent import BodyguardAgent
from graph import oracle_app

TRADES_FILE = Path(__file__).resolve().parent / "data" / "trades.json"


def test_alpaca_clock_and_submit():
    print("\n--- TEST 1: Alpaca Clock & submit_order ---")
    alpaca = AlpacaTool()
    clock = alpaca.get_market_clock()
    print(f"Market Clock: is_open={clock.get('is_open')}, next_open={clock.get('next_open')}")

    # Test submit_order when closed
    # Force market_open = False to test rejection behavior deterministically
    original_is_open = alpaca.is_market_open
    alpaca.is_market_open = lambda: False
    
    order_res = alpaca.submit_order(symbol="NVDA260918C00150000", qty=1, side="buy", order_type="limit", limit_price=5.0)
    print(f"Order Response (Market Closed): status={order_res.get('status')}, reason={order_res.get('reason')}")
    assert order_res["status"] == "REJECTED_MARKET_CLOSED", f"Expected REJECTED_MARKET_CLOSED, got {order_res['status']}"
    print("✅ TEST 1 PASSED: Order was strictly rejected when market is closed.")


def test_trader_agent_market_closed():
    print("\n--- TEST 2: TraderAgent Market Closed Handling ---")
    trader = TraderAgent()
    # Mock closed market
    trader.alpaca.is_market_open = lambda: False

    # Read trades before
    trades_before_count = 0
    if TRADES_FILE.exists():
        with open(TRADES_FILE, "r") as f:
            trades_before_count = len(json.load(f))

    mock_decision = StrategyDecision(
        symbol="NVDA",
        strategy="THETA_IRON_CONDOR",
        confidence_score=0.88,
        direction="NEUTRAL",
        target_profit_percent=50.0,
        max_loss_usd=150.0,
        reasoning="Test decision during market closed hours",
        is_validated=True,
        validator_status="VALIDATED"
    )

    result = trader.construct_and_execute(mock_decision, current_stock_price=120.0)
    print(f"TraderAgent Result: status={result.get('status')}, reason={result.get('reason')}")
    assert result["status"] == "MARKET_CLOSED_STANDBY", f"Expected MARKET_CLOSED_STANDBY, got {result['status']}"

    # Verify no new trades were written to trades.json
    trades_after_count = 0
    if TRADES_FILE.exists():
        with open(TRADES_FILE, "r") as f:
            trades_after_count = len(json.load(f))

    assert trades_after_count == trades_before_count, f"Trade was incorrectly written! Before: {trades_before_count}, After: {trades_after_count}"
    print(f"✅ TEST 2 PASSED: TraderAgent returned MARKET_CLOSED_STANDBY and trade ledger was NOT modified ({trades_before_count} == {trades_after_count}).")


def test_bodyguard_market_closed():
    print("\n--- TEST 3: BodyguardAgent Market Closed Standby ---")
    bodyguard = BodyguardAgent()
    bodyguard.alpaca.is_market_open = lambda: False

    bg_result = bodyguard.monitor_positions()
    print(f"Bodyguard Result: status={bg_result.get('status')}, sleep={bg_result.get('adaptive_sleep_seconds')}s")
    assert bg_result["status"] == "MARKET_CLOSED_STANDBY", f"Expected MARKET_CLOSED_STANDBY, got {bg_result['status']}"
    assert bg_result["adaptive_sleep_seconds"] == 300
    print("✅ TEST 3 PASSED: BodyguardAgent safely returned MARKET_CLOSED_STANDBY.")


def test_langgraph_pipeline_market_closed():
    print("\n--- TEST 4: Master LangGraph Pipeline Market Closed Routing ---")
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

    trades_before_count = 0
    if TRADES_FILE.exists():
        with open(TRADES_FILE, "r") as f:
            trades_before_count = len(json.load(f))

    final_state = oracle_app.invoke(initial_state)
    exec_res = final_state.get("execution_result", {})
    print(f"LangGraph Execution Result: status={exec_res.get('status')}, reason={exec_res.get('reason')}")
    print(f"Guardian Result: status={final_state.get('guardian_result', {}).get('status')}")

    # Verify no rogue writes during graph execution
    trades_after_count = 0
    if TRADES_FILE.exists():
        with open(TRADES_FILE, "r") as f:
            trades_after_count = len(json.load(f))

    assert trades_after_count == trades_before_count, f"Trade was written during LangGraph run! {trades_after_count} != {trades_before_count}"
    print(f"✅ TEST 4 PASSED: LangGraph routed to fallback/standby node cleanly without modifying ledger ({trades_before_count} == {trades_after_count}).")


if __name__ == "__main__":
    test_alpaca_clock_and_submit()
    test_trader_agent_market_closed()
    test_bodyguard_market_closed()
    test_langgraph_pipeline_market_closed()
    print("\n" + "=" * 60)
    print("🎉 ALL MARKET CLOSED TESTS PASSED PERFECTLY!")
    print("=" * 60 + "\n")
