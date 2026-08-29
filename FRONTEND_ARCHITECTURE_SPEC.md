# ORACLE Trading System - Master Frontend Architecture Specification (Redesigned)

## Institutional Bloomberg-Style AI Options Terminal & Fund Dashboard

---

## 1. Executive Summary & Design Vision

The **ORACLE Frontend Terminal** is an institutional-grade, real-time web application providing total transparency, control, and quantitative visualization for the multi-agent autonomous options hedge fund.

It connects directly to the **FastAPI Backend (35 Endpoints + 2 WebSockets)**, providing sub-millisecond telemetry synchronization with Alpaca Securities, live CBOE options market feeds, and the 8-node LangGraph multi-agent cognitive architecture.

### 🎨 Visual Theme & Fintech Aesthetics
* **Theme:** Deep Obsidian & Navy Fintech Palette (`#0B0F19` base, `#111827` cards, `#1E293B` elevated containers).
* **Accents:**
  * **Neon Emerald (`#10B981`)**: Profit lock-in, positive theta decay, bullish bias.
  * **Electric Crimson (`#EF4444`)**: Stop-losses, negative delta shocks, bearish bias.
  * **Cyan & Indigo (`#06B6D4` / `#6366F1`)**: AI reasoning, Tree-of-Thoughts scenario matrices, WebSocket heartbeats.
  * **Amber Gold (`#F59E0B`)**: HITL pending authorizations, circuit breaker warnings, high-alert loops.
  * **Amethyst Purple (`#A855F7`)**: Macro intelligence, Yield curve shifts, Broken Wing Butterfly convexity.
* **Typography:**
  * Header/Brand: Google Fonts `Outfit` (600/700 weight).
  * Body/Labels: Google Fonts `Inter` (400/500 weight).
  * Financial Numbers & OCC Codes: `JetBrains Mono` (tabular lining numbers).
* **Interactivity:** Glassmorphism cards with `backdrop-filter: blur(12px)`, glowing pulse indicators, smooth micro-transitions, and 2D canvas payoff curves.

---

## 2. Master Dashboard Wireframe & Layout Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏛️ ORACLE AI OPTIONS TRADING TERMINAL                🟢 LIVE ALPACA WS SYNC  |  SESSION: ACTIVE  |  MODE: PAPER TRADING (REST/WS)     │
├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  EQUITY: $100,000.00  |  CASH: $100,000.00  |  NET Δ: +0.02  |  DAILY Θ: +$45.00  |  VIX: 14.50  |  MSI: 0.50  |  WIN RATE: 83.3%  │
├───────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────┤
│ 🌐 MODULE 1: MULTI-AGENT STATE MACHINE & LANGGRAPH RUNNER         │ 🏛️ MODULE 2: HITL GOVERNANCE & CAPITAL SIGN-OFF DESK              │
│ • Active Node: Node 3 [StrategyBrain] (Progress: 60%)             │ • Pending Proposals: 1 (NVDA Earnings Straddle for $500.00)       │
│ • Regime: RISK_ON_EXPANSION (Macro Multiplier: 1.0x)              │ • Actions: [ ✅ Authorize Order ]   [ ❌ Veto Proposal ]          │
│ • Runner-Up Fallback: AAPL (Passed 4/4 Hard Veto Checks)          │ • Risk Desk Override: Adjusted Budget Input ($450.00)             │
├───────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 📊 MODULE 3: 8-ASSET QUANTITATIVE SCREENER & ALTERNATIVE RADAR     │ 📉 MODULE 4: 2D OPTIONS PAYOFF TENT & RISK BOUNDARIES             │
│ • Screener: NVDA, AAPL, MSFT, TSLA, AMZN, SPY (IV Rank % & Skew)  │ • Interactive Canvas Payoff Curve (Max Profit Plateau)            │
│ • Volume Profile: POC $225.46 | VAH $228.16 | VAL $215.84         │ • Breakeven Markers: Lower $217.02 | Upper $242.98                │
│ • Anchored VWAP: $219.72 (BULLISH_ABOVE_VWAP)                     │ • Stock Needle: $230.00 (In Max Profit Zone)                      │
│ • Unusual Flow: AGGRESSIVE_CALL_SWEEPS ($4.5M Premium)            │ • Net Greeks: Delta +0.05 | Theta +$12.50/day                     │
├───────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────┤
│ 🎯 MODULE 5: ACTIVE POSITIONS & DYNAMIC TRAILING PROFIT RATCHET                                                                      │
│ • NVDA 4-Leg Theta Iron Condor | PnL: +$125.00 (+50.0%) | Ratchet Tier: TIER_2_LOCKED (+25% Floor: +$62.50)                          │
│ • Actions: [ 🔄 Roll Untested Wing (+$140 Credit) ]   [ 🛑 Liquidate Position ]   [ 🛡️ Run Bodyguard Scan ]                          │
├───────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────────────────────────┤
│ 🧪 MODULE 6: 7-STRATEGY QUANTITATIVE LAB & BLUEPRINT CALCULATOR   │ 📈 MODULE 7: MACRO SENTINEL & TREASURY YIELD BAROMETER            │
│ • Selector: Straddle / Condor / Vertical / 0DTE / Calendar / Wheel│ • 10Y Yield: 4.25% | 2Y Yield: 4.10% (Spread: +15 bps Normal)     │
│ • Strike Snapping, Package Midpoint Limit & Slippage Savings      │ • Macro Shock Index: 0.50 (RISK_ON_EXPANSION)                     │
├───────────────────────────────────────────────────────────────────┼───────────────────────────────────────────────────────────────────┤
│ 📟 MODULE 8: REAL-TIME TELEMETRY LOG STREAM (/ws/telemetry)       │ 📑 MODULE 9: POST-TRADE REFLECTION & HACKATHON SOCIAL EXPORTER    │
│ • [17:50:04] StrategyBrain: Evaluated 3 ToT Branches...           │ • Win Rate: 83.3% | Profit Factor: 3.2 | Sharpe Ratio: 2.45       │
│ • [17:50:18] Bodyguard: Stop floor ratcheted to +$62.50...        │ • [ 🐦 Copy Twitter/X Post ]  [ 💼 Copy LinkedIn ]  [ 📥 Export ] │
├───────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────────────────────────┤
│ 🕹️ MODULE 10: FUND COMMAND BAR:  [ 🚀 Run Trade Cycle ]   [ 🛡️ Guardian Scan ]   [ 🚨 Emergency Kill-Switch (Liquidate All) ]         │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Deep-Dive Specification of the 10 Frontend Modules

### Module 1: Live Multi-Agent LangGraph Pipeline Streamer
* **Backend Connection:** `POST /api/v1/pipeline/run`, `GET /api/v1/pipeline/status`, `WebSocket /ws/telemetry`.
* **Visuals:**
  * Animated node-progression stepper (Node 1 Macro $\to$ Node 2 Scout $\to$ Node 3 Brain $\to$ Node 4 HITL $\to$ Node 5 Trader $\to$ Node 6 Hedge $\to$ Node 7 Bodyguard $\to$ Node 8 Analyst).
  * Real-time progress bar (0% to 100%).
  * Collapsible tree showing Tree-of-Thoughts branches (+4.5% Bull, 0% Flat, -4.5% Bear) with calculated Expected Values ($EV$).
  * Red Team critique badge (`CONFIRMED_ROBUST` vs `REJECTED_RUNNER_UP_SELECTED`).

### Module 2: Human-In-The-Loop (HITL) Governance Modal
* **Backend Connection:** `GET /api/v1/hitl/pending`, `POST /api/v1/hitl/approve/{id}`, `POST /api/v1/hitl/reject/{id}`.
* **Visuals:**
  * Glowing Amber notification badge when a trade proposal exceeds $500.00 or requires operator review.
  * Trade details card: Symbol, Strategy, Proposed Risk Budget, AI Confidence Score, Macro Regime thesis.
  * Interactive operator inputs: Operator Name, Notes, Budget Override slider, **[Authorize]** and **[Veto]** buttons.

### Module 3: 8-Asset Quantitative Screener & Alternative Data Radar
* **Backend Connection:** `GET /api/v1/signals/universe`, `GET /api/v1/signals/volume-profile`, `GET /api/v1/signals/sentiment`, `GET /api/v1/signals/unusual-flow`.
* **Visuals:**
  * High-density financial data table with ticker search & filtering.
  * **Volume Profile Gauge:** Visual bar indicating Point of Control (POC), Value Area High (VAH), and Value Area Low (VAL).
  * **Anchored VWAP Badge:** Green/Red pills showing if stock is trading above or below VWAP $\pm 1\text{SD} / \pm 2\text{SD}$.
  * **Social & Insider Sentiment:** Crowd polarity score (`+0.72`) + SEC Form 4 insider flow status.
  * **Unusual Flow Sweeps:** Radar icon highlighting aggressive institutional call/put sweep orders.

### Module 4: Dynamic 2D Options Payoff & Profit Tent Visualizer
* **Backend Connection:** `GET /api/v1/signals/tot-matrix`, `POST /api/v1/strategies/calculate`.
* **Visuals:**
  * High-resolution HTML5 Canvas / Chart.js interactive graph.
  * Green shaded polygon showing max profit zone across strike ranges.
  * Red shaded tails showing defined maximum risk boundaries.
  * Vertical dashed markers for Lower Breakeven and Upper Breakeven.
  * Glowing animated vertical line indicating current underlying stock price.

### Module 5: Active Positions & Trailing Profit Ratchet Matrix
* **Backend Connection:** `GET /api/v1/portfolio/positions`, `GET /api/v1/portfolio/greeks`, `POST /api/v1/strategies/roll-wing`, `POST /api/v1/portfolio/close/{symbol}`.
* **Visuals:**
  * Real-time Mark-to-Market PnL badges ($+\$125.00$ / $+50.0\%$).
  * Dynamic Trailing Ratchet status badge (`Tier 0 Hard Stop`, `Tier 1 Break-Even`, `Tier 2 Profit Lock`, `Tier 3 Target`).
  * **1-Click Wing Roll Button:** Triggers `OptionLegRoller` to roll untested wings inward for extra credit.
  * **1-Click Close Button:** Immediate individual position liquidation on exchange.

### Module 6: 7-Strategy Quantitative Order Calculator
* **Backend Connection:** `GET /api/v1/strategies/list`, `POST /api/v1/strategies/calculate`, `POST /api/v1/strategies/execute`.
* **Visuals:**
  * Strategy switcher:
    1. Earnings Volatility Straddle
    2. Theta Iron Condor
    3. Directional Vertical Spread
    4. 0DTE Mean Reversion Spread
    5. Calendar & Diagonal Spread
    6. Systematic Wheel Strategy
    7. Broken Wing Butterfly (BWB)
  * Real-time CBOE strike snapping, package limit price, margin requirement, and estimated slippage savings indicator ($+\$32.00$).
  * **[Simulate Blueprint]** and **[Execute Live]** action buttons.

### Module 7: Macro Intelligence & Treasury Yield Barometer
* **Backend Connection:** `GET /api/v1/agents/macro`.
* **Visuals:**
  * 10-Year vs 2-Year Treasury Yield Spread inversion gauge.
  * Macro Shock Index (MSI) circular dial meter.
  * Sizing multiplier indicator ($0.25\times$ to $1.0\times$).
  * Fed catalyst calendar countdown (CPI, FOMC, NFP).

### Module 8: Real-Time Multi-Agent Telemetry Terminal
* **Backend Connection:** `WebSocket /ws/telemetry`.
* **Visuals:**
  * Retro-modern dark console with color-coded log entries:
    * `[Macro]` (Purple), `[Scout]` (Blue), `[Brain]` (Cyan), `[HITL]` (Amber), `[Trader]` (Emerald), `[Hedge]` (Indigo), `[Bodyguard]` (Red), `[Analyst]` (Green).
  * Auto-scroll toggle, pause stream button, and log search filter.

### Module 9: Trade Memory Ledger & Hackathon Social Exporter
* **Backend Connection:** `GET /api/v1/trades/history`, `GET /api/v1/trades/memory`, `GET /api/v1/trades/stats`, `POST /api/v1/trades/export`.
* **Visuals:**
  * Win Rate %, Profit Factor, Sharpe Ratio ($2.45$), Max Drawdown ($3.8\%$).
  * Post-trade reflections card displaying AI lessons learned from `trade_memory.json`.
  * **1-Click Social Buttons**:
    * **[ 🐦 Copy Twitter/X Post ]**: Auto-generates compliant 280-character hackathon recap with `#AlpacaHQ @AlpacaHQ @lablabai`.
    * **[ 💼 Copy LinkedIn Review ]**: Generates executive 3-paragraph fund overview.
    * **[ 📥 Download Tearsheet ]**: Exports clean JSON / CSV dataset.

### Module 10: Fund Command Hub & Emergency Kill-Switch
* **Backend Connection:** `POST /api/v1/pipeline/run`, `POST /api/v1/agents/bodyguard/scan`, `POST /api/v1/portfolio/close-all`.
* **Visuals:**
  * Glassmorphism floating bottom bar.
  * Primary Action: **[ 🚀 Run Autonomous Trade Cycle ]**
  * Secondary Action: **[ 🛡️ Trigger Bodyguard Scan ]**
  * Emergency Action: **[ 🚨 Emergency Kill-Switch (Liquidate All) ]** (opens double-confirmation dialog requiring code entry).

---

## 4. Frontend Technology Stack

* **Structure & UI Logic:** Modern Vanilla HTML5 + Modular ES6 JavaScript (Zero heavy build dependencies, instant local loading, high maintainability).
* **Styling:** Vanilla CSS3 with Custom Properties (CSS Tokens), CSS Grid / Flexbox, Glassmorphism, and GPU-accelerated micro-animations.
* **Charting:** Chart.js 4.x via CDN for 2D Payoff curves, VIX gauges, and Macro dials.
* **WebSockets & Networking:** Native JavaScript `WebSocket` with automatic reconnection backoff and `fetch()` API.

---

## 5. Master Step-by-Step Build Sequence

1. **Step 1: Create Frontend Structure & Design Tokens (`frontend/index.html`, `frontend/css/`)**
   * Set up modern dark-mode CSS theme, glassmorphism tokens, responsive grid layouts, and typography.
2. **Step 2: Build API & WebSocket Client Service (`frontend/js/api.js` & `frontend/js/ws.js`)**
   * Implement type-safe async fetch wrapper for all 35 endpoints and resilient WebSocket listeners for telemetry & positions.
3. **Step 3: Build Core Components & Visual Modules (`frontend/js/components/`)**
   * KPI header, Multi-Agent Stepper, 8-Asset Screener table, Active Positions with Ratchet badges, HITL modal, and Strategy Calculator.
4. **Step 4: Build Interactive 2D Payoff & Chart Visualizers (`frontend/js/charts.js`)**
   * 2D Black-Scholes profit tent with dynamic breakevens and current stock needle.
5. **Step 5: Assemble App, Connect Command Hub & End-to-End Verification (`frontend/js/app.js` & Browser Subagent Testing)**
   * Bind all buttons, test live streaming with backend on `http://localhost:8000`, and verify 100% responsiveness.
