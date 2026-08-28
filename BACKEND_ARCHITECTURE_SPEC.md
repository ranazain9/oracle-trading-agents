# ORACLE Trading System - FastAPI Backend Architecture Specification

This document serves as the master engineering blueprint for implementing the **FastAPI Backend Server** that powers the ORACLE Multi-Agent Options Trading Fund.

---

## 1. System Overview & Objectives

The FastAPI backend exposes RESTful endpoints, asynchronous background execution runners, and real-time WebSockets to:
1. **Trigger & Monitor Multi-Agent LangGraph Pipelines**: Run on-demand or scheduled trading cycles and stream state transitions live.
2. **Expose Agent Reasoning & Telemetry**: Provide structured data on Macro Sentinels, Strategy Brain (Tree-of-Thoughts + Red Team), Trader Execution, Greek Hedging, and Bodyguard audits.
3. **Handle Human-In-The-Loop (HITL) Authorizations**: Deliver interactive approval gates for high-capital trades ($>\$10,000$) or blackout regime overrides.
4. **Deliver Live Greek & Portfolio Telemetry**: Feed real-time portfolio metrics, Greeks ($\Delta, \Gamma, \Theta, \text{Vega}$), open positions, and profit ratchet floors to the frontend.
5. **Serve Alternative Data & Signal Scanners**: Expose Volume Profile (POC/VAH/VAL), Anchored VWAP, Social Sentiment, SEC Form 4 Insiders, and Unusual Flow sweeps.

```mermaid
graph TD
    subgraph Client Layer
        WebUI["React / Next.js Dashboard"]
        MobileBot["Telegram / Discord Bot / CLI"]
    end

    subgraph FastAPI Backend Layer (Port 8000)
        RouterPipe["/api/v1/pipeline"]
        RouterAgents["/api/v1/agents"]
        RouterHITL["/api/v1/hitl"]
        RouterPort["/api/v1/portfolio"]
        RouterStrats["/api/v1/strategies"]
        RouterSignals["/api/v1/signals"]
        RouterTrades["/api/v1/trades"]
        WSManager["WebSocket Connection Manager (/ws)"]
    end

    subgraph Multi-Agent Engine
        LangGraph["LangGraph Master State Machine (graph.py)"]
        Agents["6 Specialized Agents"]
        Tools["Institutional Tools & Pricing Engines"]
    end

    WebUI & MobileBot <-->|REST API + WebSockets| FastAPI Backend Layer
    FastAPI Backend Layer <--> Multi-Agent Engine
```

---

## 2. Target Directory & Modular File Structure

```
d:\ALPACA\backend\
├── __init__.py
├── main.py                     # FastAPI app factory, CORS, lifecycle, router mounting
├── config.py                   # API configuration, CORS origins, server settings
├── dependencies.py             # Shared dependencies (Alpaca instance, graph runner)
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
│   ├── pipeline_router.py      # /api/v1/pipeline
│   ├── agents_router.py        # /api/v1/agents
│   ├── hitl_router.py          # /api/v1/hitl
│   ├── portfolio_router.py     # /api/v1/portfolio
│   ├── strategies_router.py    # /api/v1/strategies
│   ├── signals_router.py       # /api/v1/signals
│   ├── trades_router.py        # /api/v1/trades
│   └── websocket_router.py     # /ws/telemetry, /ws/positions
└── services/                   # Business logic and background tasks
    ├── __init__.py
    ├── pipeline_runner.py      # Asynchronous LangGraph pipeline execution manager
    ├── websocket_manager.py    # Multi-client WebSocket broadcast manager
    └── hitl_service.py         # State manager for pending human approvals
```

---

## 3. Core Dependencies & Technology Stack

* **Framework**: `FastAPI` (High-performance async Python web framework)
* **ASGI Server**: `uvicorn[standard]` (Lightning-fast ASGI server)
* **Data Validation**: `pydantic` (v2 data validation and schema generation)
* **WebSockets**: Native FastAPI `WebSocket` and `websockets` for live streaming
* **Async Runtime**: Python `asyncio` with background task execution
* **CORS Middleware**: `fastapi.middleware.cors.CORSMiddleware` for frontend integration

---

## 4. API Endpoints Specification

### 4.1 Pipeline & LangGraph Orchestration (`/api/v1/pipeline`)
| Method | Endpoint | Description | Request Body | Response Model |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/run` | Triggers a full 8-node LangGraph execution cycle asynchronously | `PipelineRunRequest` | `PipelineRunResponse` |
| `GET` | `/status` | Retrieves status and progress of the current/latest pipeline run | None | `PipelineStatusResponse` |
| `GET` | `/latest-state` | Retrieves complete `OracleState` snapshot from last run | None | `OracleStateResponse` |

### 4.2 Agent Diagnostics & Telemetry (`/api/v1/agents`)
| Method | Endpoint | Description | Query / Body | Response Model |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/macro` | Runs live Macro Sentinel audit (MSI, Yield Curve, Fed catalysts) | None | `MacroAssessmentSchema` |
| `POST`| `/brain/decide` | Queries Strategy Brain directly for specific symbol list | `BrainAnalysisRequest` | `StrategyDecisionSchema` |
| `GET` | `/hedge/evaluate` | Evaluates net portfolio Greek risk and tail-risk hedge suggestions | None | `HedgeDecisionSchema` |
| `GET` | `/bodyguard/scan` | Runs immediate active position scan (+50% profit lock / stop loss) | None | `BodyguardScanResponse` |
| `GET` | `/analyst/reflections` | Returns last 50 trade performance reflections and lessons | None | `List[TradeReflectionSchema]` |

### 4.3 Human-In-The-Loop (HITL) Governance (`/api/v1/hitl`)
| Method | Endpoint | Description | Request Body | Response Model |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/pending` | Lists all trade proposals awaiting manual operator sign-off | None | `List[PendingApprovalSchema]` |
| `POST` | `/approve/{proposal_id}`| Approves pending trade proposal and dispatches to Trader | `HITLDecisionRequest` | `HITLDecisionResponse` |
| `POST` | `/reject/{proposal_id}` | Vetoes pending trade proposal and triggers capital preservation | `HITLDecisionRequest` | `HITLDecisionResponse` |

### 4.4 Portfolio, Greeks & Positions (`/api/v1/portfolio`)
| Method | Endpoint | Description | Query Params | Response Model |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/account` | Retrieves buying power, cash, equity, and portfolio status | None | `AccountStatusSchema` |
| `GET` | `/positions` | Lists all active open equity and option contracts | None | `List[PositionSchema]` |
| `GET` | `/greeks` | Computes net portfolio $\Delta, \Gamma, \Theta, \text{Vega}$ & Beta weighting | None | `PortfolioGreeksSchema` |
| `POST`| `/close/{symbol}` | Manually closes / liquidates a specific position | None | `ClosePositionResponse` |

### 4.5 Strategies & Order Blueprint Engine (`/api/v1/strategies`)
| Method | Endpoint | Description | Request Body | Response Model |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/list` | Lists all 7 available institutional strategy calculators | None | `List[str]` |
| `POST` | `/calculate` | Formulates exact OCC multi-leg order blueprint with midpoint limits | `CalculateStrategyRequest` | `StrategyOrderBlueprintSchema` |
| `POST` | `/execute` | Formulates and immediately executes strategy via TraderAgent | `ExecuteStrategyRequest` | `ExecutionResultSchema` |

### 4.6 Alternative Signals & Technical Indicators (`/api/v1/signals`)
| Method | Endpoint | Description | Query Params | Response Model |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/volume-profile`| Calculates Volume Profile (POC, VAH, VAL) and regime | `symbol: str = "NVDA"` | `VolumeProfileSchema` |
| `GET` | `/anchored-vwap` | Calculates Anchored VWAP with ±1SD and ±2SD bands | `symbol: str = "NVDA"` | `AnchoredVWAPSchema` |
| `GET` | `/sentiment` | Returns social sentiment polarity & SEC Form 4 insider flow | `symbol: str = "NVDA"` | `SentimentSchema` |
| `GET` | `/unusual-flow` | Scans for institutional option sweep prints and block trades | `symbol: str = "NVDA"` | `UnusualFlowSchema` |

### 4.7 Trade History & Reflection Memory (`/api/v1/trades`)
| Method | Endpoint | Description | Query Params | Response Model |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/history` | Returns complete live trade execution ledger (`data/trades.json`) | None | `List[TradeRecordSchema]` |
| `GET` | `/memory` | Returns long-term AI reflection memory (`data/trade_memory.json`) | None | `List[TradeMemorySchema]` |
| `GET` | `/stats` | Returns win rate, realized PnL, profit factor, and Sharpe ratio | None | `TradeStatsSchema` |

---

## 5. Real-Time WebSockets Architecture

FastAPI will provide two high-frequency WebSocket channels:

### 1. `/ws/telemetry` (Agent & Pipeline State Stream)
Streams JSON events whenever an agent completes a node or initiates a decision:
```json
{
  "event_type": "NODE_COMPLETED",
  "node_name": "strategy_brain_node",
  "timestamp": "2026-08-28T17:30:00Z",
  "data": {
    "symbol": "MSFT",
    "strategy": "THETA_IRON_CONDOR",
    "confidence": 0.85,
    "pass1_proposal": "MSFT",
    "pass2_red_team": "CONFIRMED_ROBUST",
    "kelly_sizing_usd": 450.0
  }
}
```

### 2. `/ws/positions` (Live Greek & Bodyguard Stream)
Broadcasts live Mark-to-Market PnL, ratchet floor adjustments, and stop-loss triggers every 5 seconds.

---

## 6. Asynchronous Pipeline Runner (`pipeline_runner.py`)

To prevent blocking the API event loop during LLM reasoning and data fetching, pipeline runs are dispatched to an async background worker using Python `concurrent.futures.ThreadPoolExecutor` / `asyncio.to_thread`.
* Updates progress percentage (0% to 100%).
* Emits events to all connected WebSocket subscribers.
* Retains the latest execution state in memory for fast querying.

---

## 7. Security, CORS & Production Readiness

1. **CORS Configuration**: Allow `http://localhost:3000`, `http://localhost:5173` (Vite/Next.js), and configurable production domains via `backend/config.py`.
2. **Interactive OpenAPI / Swagger Documentation**: Auto-generated docs available at `http://localhost:8000/docs` and `http://localhost:8000/redoc`.
3. **Structured Logging**: All API requests and agent events logged to `logs/oracle_api.log`.

---

## 8. Implementation Steps Roadmap

When executing the backend creation, we will proceed in these exact steps:
1. **Step 1: Core App & Schemas**
   * Create `backend/schemas/` with strict Pydantic models matching our agents and strategies.
   * Create `backend/config.py` and `backend/services/websocket_manager.py`.
2. **Step 2: Business Logic & Runners**
   * Create `backend/services/pipeline_runner.py` and `backend/services/hitl_service.py`.
3. **Step 3: Modular API Routers**
   * Implement all 7 routers in `backend/routers/`.
4. **Step 4: Master Entrypoint & App Factory**
   * Create `backend/main.py` and assemble all routers and WebSocket listeners.
5. **Step 5: Testing & Verification**
   * Create `test_backend_api.py` and run end-to-end endpoint tests via `TestClient` and live uvicorn.
