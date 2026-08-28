# ORACLE Trading System - Master FastAPI Backend Specification (Redesigned)

This document serves as the master engineering blueprint and endpoint inventory for implementing the **FastAPI Backend Server** that powers the ORACLE Multi-Agent Options Trading Fund.

---

## 1. Executive Summary & Architecture

The FastAPI backend wraps the **6-Agent LangGraph State Machine**, **7 Quantitative Alpha Strategies**, **Real-Time Data Engines**, and **Multi-Broker Execution Router** into a unified, high-performance async API with real-time WebSockets.

### Total Backend Endpoint Capacity:
* **Total REST API Endpoints**: **33 Endpoints** across 7 Functional Routers
* **Total Real-Time WebSocket Channels**: **2 High-Frequency Channels**
* **Grand Total**: **35 API Endpoints**

```mermaid
graph TD
    subgraph Client Layer
        WebUI["React / Next.js Dashboard"]
        MobileBot["Telegram / Discord Bot / CLI"]
    end

    subgraph FastAPI Backend Server (Port 8000)
        R1["1. Pipeline Router (/api/v1/pipeline) [4 Endpoints]"]
        R2["2. Agents Router (/api/v1/agents) [6 Endpoints]"]
        R3["3. HITL Governance Router (/api/v1/hitl) [4 Endpoints]"]
        R4["4. Portfolio & Greeks Router (/api/v1/portfolio) [5 Endpoints]"]
        R5["5. Alpha Strategies Router (/api/v1/strategies) [4 Endpoints]"]
        R6["6. Signals & Indicators Router (/api/v1/signals) [6 Endpoints]"]
        R7["7. Trades & Analytics Router (/api/v1/trades) [4 Endpoints]"]
        WS["8. WebSocket Manager (/ws) [2 Channels]"]
    end

    subgraph Core Quant Engine
        Graph["Master LangGraph State Machine (graph.py)"]
        Agents["6 Specialized Agents"]
        Strats["7 Strategy Blueprints"]
        Tools["Institutional Tools & Sizers"]
    end

    WebUI & MobileBot <-->|REST + WebSockets| FastAPI Backend Server
    FastAPI Backend Server <--> Core Quant Engine
```

---

## 2. Directory Layout (`backend/`)

```
d:\ALPACA\backend\
├── __init__.py
├── main.py                     # FastAPI app factory, CORS, OpenAPI metadata, lifecycle
├── config.py                   # Environment settings, CORS origins, server configuration
├── dependencies.py             # Shared singletons (Alpaca instance, graph runner)
├── schemas/                    # Strict Pydantic v2 Request/Response Models
│   ├── __init__.py
│   ├── pipeline_schemas.py     # Pipeline trigger and status schemas
│   ├── agent_schemas.py        # Agent response and diagnostic schemas
│   ├── hitl_schemas.py         # HITL pending and decision schemas
│   ├── portfolio_schemas.py    # Positions, Greeks, account buying power schemas
│   ├── strategy_schemas.py     # Strategy calculation and order blueprint schemas
│   ├── signal_schemas.py       # Volume profile, VWAP, sentiment, flow schemas
│   └── trade_schemas.py        # Trade log and memory reflection schemas
├── routers/                    # Clean modular API routes
│   ├── __init__.py
│   ├── pipeline_router.py      # /api/v1/pipeline (4 endpoints)
│   ├── agents_router.py        # /api/v1/agents (6 endpoints)
│   ├── hitl_router.py          # /api/v1/hitl (4 endpoints)
│   ├── portfolio_router.py     # /api/v1/portfolio (5 endpoints)
│   ├── strategies_router.py    # /api/v1/strategies (4 endpoints)
│   ├── signals_router.py       # /api/v1/signals (6 endpoints)
│   ├── trades_router.py        # /api/v1/trades (4 endpoints)
│   └── websocket_router.py     # /ws (2 WebSocket channels)
└── services/                   # Business logic and background tasks
    ├── __init__.py
    ├── pipeline_runner.py      # Non-blocking async LangGraph runner & progress tracker
    ├── websocket_manager.py    # Multi-client WebSocket broadcast manager
    └── hitl_service.py         # State manager for pending human approvals
```

---

## 3. Complete Master Endpoint Inventory (35 Endpoints)

---

### Router 1: Pipeline & LangGraph Orchestration (`/api/v1/pipeline`) — 4 Endpoints
*Prefix: `/api/v1/pipeline` | Tag: `Pipeline Orchestration`*

| # | Method | Path | Description | Request Body | Response Schema |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/run` | Dispatches asynchronous 8-node LangGraph execution cycle | `PipelineRunRequest` | `PipelineRunResponse` |
| 2 | `GET` | `/status` | Returns real-time progress percentage, active node, and status | None | `PipelineStatusResponse` |
| 3 | `POST` | `/cancel` | Cancels/halts an ongoing pipeline execution | None | `GenericActionResponse` |
| 4 | `GET` | `/latest-state` | Retrieves complete serialized `OracleState` snapshot from the last run | None | `OracleStateResponse` |

---

### Router 2: Agent Telemetry & Diagnostics (`/api/v1/agents`) — 6 Endpoints
*Prefix: `/api/v1/agents` | Tag: `Agent Diagnostics`*

| # | Method | Path | Description | Request / Query | Response Schema |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 5 | `GET` | `/macro` | Runs live Macro Sentinel audit (MSI score, Yield curve spread, Fed catalysts) | None | `MacroAssessmentSchema` |
| 6 | `POST` | `/brain/decide` | Queries Strategy Brain directly for custom ticker list with ToT & Red Team | `BrainAnalysisRequest` | `StrategyDecisionSchema` |
| 7 | `POST` | `/trader/simulate-order` | Generates OCC option legs, package limit price, and margin without broker submission | `SimulateOrderRequest` | `StrategyOrderBlueprintSchema` |
| 8 | `GET` | `/hedge/evaluate` | Evaluates net portfolio Greeks and synthesizes tail-risk hedge recommendations | None | `HedgeDecisionSchema` |
| 9 | `POST` | `/bodyguard/scan` | Runs immediate active position scan (+50% profit ratchet, -$150 stop loss, wing roll) | None | `BodyguardScanResponse` |
| 10 | `GET` | `/analyst/reflections` | Returns last 50 trade performance reflections, PnL attribution, and AI lessons | None | `List[TradeReflectionSchema]` |

---

### Router 3: Human-In-The-Loop (HITL) Governance (`/api/v1/hitl`) — 4 Endpoints
*Prefix: `/api/v1/hitl` | Tag: `HITL Governance`*

| # | Method | Path | Description | Request / Query | Response Schema |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 11 | `GET` | `/pending` | Lists all pending trade proposals awaiting operator authorization | None | `List[PendingApprovalSchema]` |
| 12 | `GET` | `/history` | Returns historical operator decisions, overrides, and timestamps | None | `List[HITLHistorySchema]` |
| 13 | `POST` | `/approve/{proposal_id}` | Approves pending trade proposal and dispatches order to TraderAgent | `HITLDecisionRequest` | `HITLDecisionResponse` |
| 14 | `POST` | `/reject/{proposal_id}` | Rejects pending proposal with operator veto reason, triggering Capital Preservation | `HITLDecisionRequest` | `HITLDecisionResponse` |

---

### Router 4: Portfolio, Greeks & Positions (`/api/v1/portfolio`) — 5 Endpoints
*Prefix: `/api/v1/portfolio` | Tag: `Portfolio & Risk`*

| # | Method | Path | Description | Request / Query | Response Schema |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 15 | `GET` | `/account` | Retrieves real-time buying power, cash, portfolio equity, and day trading status | None | `AccountStatusSchema` |
| 16 | `GET` | `/positions` | Lists all active open equity and multi-leg option positions from Alpaca | None | `List[PositionSchema]` |
| 17 | `GET` | `/greeks` | Computes net portfolio $\Delta, \Gamma, \Theta, \text{Vega}$ & Beta weighting vs SPY | None | `PortfolioGreeksSchema` |
| 18 | `POST` | `/close/{symbol}` | Manually closes / liquidates a specific position on exchange | None | `ClosePositionResponse` |
| 19 | `POST` | `/close-all` | Emergency Fund Kill-Switch: Liquidates all open positions immediately | `KillSwitchRequest` | `CloseAllPositionsResponse` |

---

### Router 5: Quantitative Alpha Strategies (`/api/v1/strategies`) — 4 Endpoints
*Prefix: `/api/v1/strategies` | Tag: `Alpha Strategies`*

| # | Method | Path | Description | Request / Query | Response Schema |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 20 | `GET` | `/list` | Returns metadata, rules, and parameters for all 7 strategy calculators | None | `List[StrategyInfoSchema]` |
| 21 | `POST` | `/calculate` | Formulates exact OCC multi-leg order blueprint for any strategy with custom strikes | `CalculateStrategyRequest` | `StrategyOrderBlueprintSchema` |
| 22 | `POST` | `/execute` | Formulates and immediately submits multi-leg order via TraderAgent | `ExecuteStrategyRequest` | `ExecutionResultSchema` |
| 23 | `POST` | `/roll-wing` | Calculates dynamic untested wing roll or defensive roll-out via OptionLegRoller | `RollWingRequest` | `RollWingResponse` |

---

### Router 6: Signals & Technical Indicators (`/api/v1/signals`) — 6 Endpoints
*Prefix: `/api/v1/signals` | Tag: `Signals & Alternative Data`*

| # | Method | Path | Description | Request / Query | Response Schema |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 24 | `GET` | `/universe` | Scans entire asset universe with Greeks, expected moves, and liquidity grades | `symbols: Optional[List[str]]` | `List[AssetUniverseDataSchema]` |
| 25 | `GET` | `/volume-profile` | Computes 14-day Point of Control (POC), Value Area High (VAH), and VAL | `symbol: str = "NVDA"` | `VolumeProfileSchema` |
| 26 | `GET` | `/anchored-vwap` | Computes Anchored VWAP with ±1SD and ±2SD standard deviation bands | `symbol: str = "NVDA"` | `AnchoredVWAPSchema` |
| 27 | `GET` | `/sentiment` | Returns social sentiment score, retail crowd bias, and SEC Form 4 insider flow | `symbol: str = "NVDA"` | `SentimentSchema` |
| 28 | `GET` | `/unusual-flow` | Scans for institutional option sweep prints, block trades, and Put/Call bursts | `symbol: str = "NVDA"` | `UnusualFlowSchema` |
| 29 | `GET` | `/tot-matrix` | Computes 3-scenario Tree-of-Thoughts (+4.5% Bull, 0% Flat, -4.5% Bear) payoff matrix | `symbol: str = "NVDA"` | `ToTMatrixSchema` |

---

### Router 7: Trade History, Analytics & Memory (`/api/v1/trades`) — 4 Endpoints
*Prefix: `/api/v1/trades` | Tag: `Trade Ledger & Memory`*

| # | Method | Path | Description | Request / Query | Response Schema |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 30 | `GET` | `/history` | Returns live trade execution ledger from `data/trades.json` | None | `List[TradeRecordSchema]` |
| 31 | `GET` | `/memory` | Returns long-term AI reflection memory logs from `data/trade_memory.json` | None | `List[TradeMemorySchema]` |
| 32 | `GET` | `/stats` | Computes win rate, cumulative realized PnL, profit factor, max drawdown, Sharpe | None | `TradeStatsSchema` |
| 33 | `POST` | `/export` | Exports trade history and reflections as CSV or JSON | `ExportRequest` | `ExportResponse` |

---

### Router 8: Real-Time WebSockets (`/ws`) — 2 Streaming Channels
*Prefix: `/ws` | Tag: `WebSockets`*

| # | Protocol | Path | Description | Message Payload |
| :-: | :--- | :--- | :--- | :--- |
| 34 | `WS` | `/ws/telemetry` | Real-time stream of LangGraph agent state transitions and decisions | `{ event_type: "NODE_COMPLETED", node_name: str, data: dict }` |
| 35 | `WS` | `/ws/positions` | High-frequency stream of Mark-to-Market PnL, profit ratchet floors, stops | `{ event_type: "POSITION_UPDATE", positions: list, net_greeks: dict }` |

---

## 4. Asynchronous Pipeline Runner Specification

```python
class PipelineRunner:
    """
    Manages non-blocking asynchronous execution of the 8-node LangGraph state machine.
    """
    def __init__(self):
        self.is_running: bool = False
        self.current_node: str = "IDLE"
        self.progress_pct: int = 0
        self.latest_state: Optional[Dict[str, Any]] = None
        self.last_run_timestamp: Optional[str] = None

    async def run_pipeline_async(self, symbols: List[str], portfolio_cash: float) -> Dict[str, Any]:
        # Dispatches graph execution to background thread pool
        # Broadcasts progress events over WebSocket /ws/telemetry
```

---

## 5. Implementation Roadmap

1. **Step 1**: Build Pydantic v2 Schemas in `backend/schemas/`.
2. **Step 2**: Implement core services in `backend/services/` (`websocket_manager.py`, `pipeline_runner.py`, `hitl_service.py`).
3. **Step 3**: Implement all 7 API routers and the WebSocket router in `backend/routers/`.
4. **Step 4**: Assemble `backend/main.py` with CORS, Swagger docs, and lifecycle event handlers.
5. **Step 5**: Write and run `test_backend_api.py` to verify all 35 endpoints with `pytest` / `TestClient`.
