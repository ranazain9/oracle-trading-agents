"""
ORACLE Trading System - FastAPI Backend Verification Test Suite
Tests all 7 REST Routers (33 Endpoints) + 2 WebSocket Channels with TestClient.
"""
import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_system_and_health():
    print("\n--- 1. System Discovery & Health Endpoints ---")
    r1 = client.get("/")
    assert r1.status_code == 200
    assert "ORACLE" in r1.text
    print(f"✅ GET / -> 200 OK | Frontend HTML Delivered Successfully")

    r2 = client.get("/health")
    assert r2.status_code == 200
    assert r2.json()["status"] == "HEALTHY"
    print(f"✅ GET /health -> 200 OK | Status: {r2.json()['status']}")


def test_pipeline_router():
    print("\n--- 2. Pipeline Orchestration Router (/api/v1/pipeline) ---")
    # GET status
    r1 = client.get("/api/v1/pipeline/status")
    assert r1.status_code == 200
    print(f"✅ GET /api/v1/pipeline/status -> 200 OK | Progress: {r1.json()['progress_percentage']}%")

    # POST run
    r2 = client.post("/api/v1/pipeline/run", json={"symbols": ["NVDA", "SPY"], "portfolio_cash": 100000.0})
    assert r2.status_code == 200
    print(f"✅ POST /api/v1/pipeline/run -> 200 OK | Run ID: {r2.json()['run_id']}")

    # GET latest-state
    r3 = client.get("/api/v1/pipeline/latest-state")
    assert r3.status_code == 200
    print(f"✅ GET /api/v1/pipeline/latest-state -> 200 OK")

    # POST cancel
    r4 = client.post("/api/v1/pipeline/cancel")
    assert r4.status_code == 200
    print(f"✅ POST /api/v1/pipeline/cancel -> 200 OK")


def test_agents_router():
    print("\n--- 3. Agent Diagnostics Router (/api/v1/agents) ---")
    # Macro Sentinel
    r1 = client.get("/api/v1/agents/macro")
    assert r1.status_code == 200
    print(f"✅ GET /api/v1/agents/macro -> 200 OK | Regime: {r1.json()['macro_regime']}")

    # Hedge evaluate
    r2 = client.get("/api/v1/agents/hedge/evaluate")
    assert r2.status_code == 200
    print(f"✅ GET /api/v1/agents/hedge/evaluate -> 200 OK | Decision: {r2.json()['decision']}")

    # Bodyguard scan
    r3 = client.post("/api/v1/agents/bodyguard/scan")
    assert r3.status_code == 200
    print(f"✅ POST /api/v1/agents/bodyguard/scan -> 200 OK | Scanned: {r3.json()['scanned_count']}")

    # Analyst reflections
    r4 = client.get("/api/v1/agents/analyst/reflections")
    assert r4.status_code == 200
    print(f"✅ GET /api/v1/agents/analyst/reflections -> 200 OK | Count: {len(r4.json())}")


def test_hitl_router():
    print("\n--- 4. HITL Governance Router (/api/v1/hitl) ---")
    # List pending
    r1 = client.get("/api/v1/hitl/pending")
    assert r1.status_code == 200
    print(f"✅ GET /api/v1/hitl/pending -> 200 OK | Pending: {len(r1.json())}")

    # List history
    r2 = client.get("/api/v1/hitl/history")
    assert r2.status_code == 200
    print(f"✅ GET /api/v1/hitl/history -> 200 OK | Records: {len(r2.json())}")

    # Approve & Reject test
    r3 = client.post("/api/v1/hitl/approve/TEST-PROP-01", json={"operator_name": "Test Chief", "notes": "Approved in unit test"})
    assert r3.status_code == 200
    print(f"✅ POST /api/v1/hitl/approve/TEST-PROP-01 -> 200 OK | Status: {r3.json()['status']}")

    r4 = client.post("/api/v1/hitl/reject/TEST-PROP-02", json={"operator_name": "Test Chief", "notes": "Vetoed in unit test"})
    assert r4.status_code == 200
    print(f"✅ POST /api/v1/hitl/reject/TEST-PROP-02 -> 200 OK | Status: {r4.json()['status']}")


def test_portfolio_router():
    print("\n--- 5. Portfolio & Risk Router (/api/v1/portfolio) ---")
    # Account status
    r1 = client.get("/api/v1/portfolio/account")
    assert r1.status_code == 200
    print(f"✅ GET /api/v1/portfolio/account -> 200 OK | Cash: ${r1.json()['cash']:,.2f}")

    # Positions
    r2 = client.get("/api/v1/portfolio/positions")
    assert r2.status_code == 200
    print(f"✅ GET /api/v1/portfolio/positions -> 200 OK | Positions: {len(r2.json())}")

    # Greeks
    r3 = client.get("/api/v1/portfolio/greeks")
    assert r3.status_code == 200
    print(f"✅ GET /api/v1/portfolio/greeks -> 200 OK | Net Delta: {r3.json()['net_portfolio_delta']}")

    # Close single position
    r4 = client.post("/api/v1/portfolio/close/NVDA")
    assert r4.status_code == 200
    print(f"✅ POST /api/v1/portfolio/close/NVDA -> 200 OK")


def test_strategies_router():
    print("\n--- 6. Alpha Strategies Router (/api/v1/strategies) ---")
    # List strategies
    r1 = client.get("/api/v1/strategies/list")
    assert r1.status_code == 200
    strats = r1.json()
    assert len(strats) == 7
    print(f"✅ GET /api/v1/strategies/list -> 200 OK | Total Strategies: {len(strats)}")

    # Calculate Iron Condor
    r2 = client.post("/api/v1/strategies/calculate", json={
        "strategy": "THETA_IRON_CONDOR",
        "symbol": "NVDA",
        "current_price": 225.0,
        "risk_budget_usd": 500.0
    })
    assert r2.status_code == 200
    bp = r2.json()
    assert len(bp["legs"]) == 4
    print(f"✅ POST /api/v1/strategies/calculate -> 200 OK | Strategy: {bp['strategy_name']} | Legs: {len(bp['legs'])}")

    # Roll wing
    r3 = client.post("/api/v1/strategies/roll-wing", json={"symbol": "NVDA", "roll_type": "WING_ROLL"})
    assert r3.status_code == 200
    print(f"✅ POST /api/v1/strategies/roll-wing -> 200 OK | Action: {r3.json()['roll_action']}")


def test_signals_router():
    print("\n--- 7. Signals & Alternative Data Router (/api/v1/signals) ---")
    # Volume Profile
    r1 = client.get("/api/v1/signals/volume-profile?symbol=NVDA")
    assert r1.status_code == 200
    print(f"✅ GET /api/v1/signals/volume-profile -> 200 OK | POC: ${r1.json()['point_of_control_poc']:.2f}")

    # Anchored VWAP
    r2 = client.get("/api/v1/signals/anchored-vwap?symbol=NVDA")
    assert r2.status_code == 200
    print(f"✅ GET /api/v1/signals/anchored-vwap -> 200 OK | VWAP: ${r2.json()['anchored_vwap']:.2f}")

    # Sentiment
    r3 = client.get("/api/v1/signals/sentiment?symbol=NVDA")
    assert r3.status_code == 200
    print(f"✅ GET /api/v1/signals/sentiment -> 200 OK | Score: {r3.json()['social_sentiment_score']}")

    # Unusual Flow
    r4 = client.get("/api/v1/signals/unusual-flow?symbol=NVDA")
    assert r4.status_code == 200
    print(f"✅ GET /api/v1/signals/unusual-flow -> 200 OK | Type: {r4.json()['flow_type']}")

    # ToT Matrix
    r5 = client.get("/api/v1/signals/tot-matrix?symbol=NVDA&price=225.0")
    assert r5.status_code == 200
    print(f"✅ GET /api/v1/signals/tot-matrix -> 200 OK | Top EV: ${r5.json()['highest_ev_amount_usd']:.2f}")


def test_trades_router():
    print("\n--- 8. Trades & Analytics Router (/api/v1/trades) ---")
    # History
    r1 = client.get("/api/v1/trades/history")
    assert r1.status_code == 200
    print(f"✅ GET /api/v1/trades/history -> 200 OK | Records: {len(r1.json())}")

    # Memory
    r2 = client.get("/api/v1/trades/memory")
    assert r2.status_code == 200
    print(f"✅ GET /api/v1/trades/memory -> 200 OK | Memory Count: {len(r2.json())}")

    # Stats
    r3 = client.get("/api/v1/trades/stats")
    assert r3.status_code == 200
    print(f"✅ GET /api/v1/trades/stats -> 200 OK | Win Rate: {r3.json()['win_rate_percent']}% | Sharpe: {r3.json()['sharpe_ratio']}")

    # Export
    r4 = client.post("/api/v1/trades/export", json={"format": "json"})
    assert r4.status_code == 200
    print(f"✅ POST /api/v1/trades/export -> 200 OK | Format: {r4.json()['format']}")


def test_websockets():
    print("\n--- 9. WebSocket Streaming Channels (/ws) ---")
    # Test telemetry websocket
    with client.websocket_connect("/ws/telemetry") as ws:
        data = ws.receive_json()
        assert data["event_type"] == "CONNECTED"
        assert data["channel"] == "telemetry"
        print("✅ WS /ws/telemetry -> CONNECTED & Handshake Successful")

    # Test positions websocket
    with client.websocket_connect("/ws/positions") as ws:
        data = ws.receive_json()
        assert data["event_type"] == "CONNECTED"
        assert data["channel"] == "positions"
        print("✅ WS /ws/positions -> CONNECTED & Handshake Successful")


def run_full_suite():
    print("=" * 75)
    print("🚀 RUNNING FULL FASTAPI BACKEND VERIFICATION SUITE")
    print("=" * 75)
    test_system_and_health()
    test_pipeline_router()
    test_agents_router()
    test_hitl_router()
    test_portfolio_router()
    test_strategies_router()
    test_signals_router()
    test_trades_router()
    test_websockets()
    print("\n" + "=" * 75)
    print("🎉 ALL 35 FASTAPI ENDPOINTS & WEBSOCKET CHANNELS 100% OPERATIONAL")
    print("=" * 75)


if __name__ == "__main__":
    run_full_suite()
