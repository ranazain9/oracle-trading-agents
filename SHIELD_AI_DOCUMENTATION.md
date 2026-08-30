# 🛡️ Shield-AI / ORACLE: Autonomous Risk Guardrails & Hedging Agent

> *"It doesn't predict the next meme stock. It defends the downside."*

---

## 📌 1. Executive Overview

Most algorithmic trading systems attempt to predict directional momentum and market tops. **Shield-AI takes the opposite approach:** it operates as an autonomous, multi-agent risk sentinel and mathematical hedging engine.

Shield-AI continuously monitors live equity and options portfolios, calculates institutional risk metrics (99% Portfolio VaR, Net Delta, Gamma, Theta decay), and triggers event-driven LLM shock evaluation only when quantitative guardrails are breached. When an unhedged shock occurs, the agent calculates and executes automated downside protection (protective puts, delta-balancing units, or defined-risk spreads) via Alpaca's trading infrastructure.

---

## 🏗️ 2. The 5-Step Core Blueprint

```
   ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
   │  📡 1. Live Streams  │ ──► │  📐 2. Hard Numbers  │ ──► │  🧠 3. Event-Driven  │ ──► │  ⚡ 4. Autonomous    │ ──► │  📊 5. Live Terminal │
   │  • Alpaca Market API │     │  • 99% Portfolio VaR │     │     LLM Shock Eval   │     │     OCC Put Router   │     │     Risk & Reasoning │
   │  • News & Sentiment  │     │  • Net Delta & Greeks│     │  • Tree-of-Thoughts  │     │  • Midpoint Limit    │     │     Audit Ledger     │
   └──────────────────────┘     └──────────────────────┘     └──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

### 📡 Step 1: Live Market & News Ingestion
* **Alpaca Trading & Market APIs:** Continuously streams live equity positions, options chains, mark prices, and real-time execution receipts.
* **Yahoo Finance & Google News NLP:** Ingests live financial headlines, computing polarity scores and identifying imminent macroeconomic or earnings catalysts.

### 📐 Step 2: Quantitative Calculations (SciPy & NumPy — No Vibes)
* **99% Parametric / Historical Value at Risk (VaR):** Computes the mathematical maximum projected loss over a 1-day/5-day horizon at a 99% confidence level.
* **Portfolio-Wide Net Delta ($\Delta$):** Evaluates aggregate directional exposure across multi-leg options and underlying shares.
* **Volume Distribution & POC Analysis:** Calculates 14-day Point of Control (POC), Value Area High (VAH), and Value Area Low (VAL) to detect institutional support and resistance zones.

### 🧠 Step 3: Event-Driven LLM Awakening (Zero Token Waste)
* The Large Language Model (LLM) does not waste tokens running on every price tick.
* **It only awakens when a quantitative guardrail is breached:**
  - Net Delta drifts outside the neutrality band $[-25.0, +25.0]$.
  - Portfolio VaR exceeds predetermined risk limits.
  - Imminent earnings or Macro Shock Index (MSI) exceeds $0.70$.
* **Tree-of-Thoughts (ToT) 3-Branch Simulation:** Simulates forward Bull, Base, and Bear payoff paths with a $T=0.0$ red-team adversarial check to determine the optimal hedge structure.

### ⚡ Step 4: Autonomous Execution via Alpaca Rails
* **CBOE Strike Interval Snapping:** Snaps calculated delta strikes to valid exchange intervals (\$1.00, \$2.50, \$5.00).
* **Multi-Leg OCC Payload Builder:** Constructs standardized OCC symbols (e.g. `AAPL260904C00320000`) for atomic order routing.
* **Midpoint Limit Router (Slippage Shield):** Places limit orders strictly at the bid-ask midpoint, eliminating retail market-order slippage.

### 📊 Step 5: High-Frequency Terminal Dashboard
* **Terminal Interface:** Built with React 18, TypeScript, and OpenBB Design System 5.0, served directly over FastAPI.
* **Full-Width Modular Layout:**
  - Hero 6-Card KPI Deck (Equity, Cash, Theta Decay, Delta, Win Rate, Sharpe Ratio).
  - Gaussian Payoff Curve & Scenario Modeler.
  - 8-Node LangGraph Cognitive Decision Pipeline.
  - Quantitative Watchlist with Volume POC and Options Flow.
  - Real-Time Execution Blotter with Single-Click Wing Rolling.
  - Yahoo Finance & Google News NLP Sentiment Feed.
  - Closed Trades & Loss Toll Audit Ledger.

---

## 🤖 3. The 8-Node Multi-Agent Cognitive Architecture

| Node | Agent Name | Primary Responsibility |
| :--- | :--- | :--- |
| **Node 1** | **Macro Sentinel Agent** | Analyzes 10Y Yield (`^TNX`), yield curve inversion, and Fed rates to output a capital sizing multiplier ($0.5\times$ to $1.5\times$). |
| **Node 2** | **Market Scout Agent** | Scans 14-day Volume POC, VAH, VAL, 25-Delta Skew, and institutional options sweeps. |
| **Node 3** | **Strategy Brain Agent** | Evaluates 7 quantitative alpha structures using Tree-of-Thoughts (ToT) Monte Carlo simulations. |
| **Node 4** | **HITL Supervisor Gate** | Enforces Fractional Kelly sizing (\$450–\$600 corridor) and maximum loss floors (-\$150 stop). |
| **Node 5** | **Execution Trader Agent** | Snaps CBOE strike intervals and routes multi-leg midpoint limit orders to Alpaca. |
| **Node 6** | **Portfolio Hedge Agent** | Monitors Net Delta ($\pm 25 \Delta$) and triggers beta-weighted SPY balancing hedges. |
| **Node 7** | **Risk Bodyguard Agent** | High-frequency profit ratcheting (+50% profit lock) and -\$150 emergency liquidation floor. |
| **Node 8** | **Memory & Analyst Agent** | Vectorized episodic post-trade memory synthesis stored in SQLite/ChromaDB for continuous learning. |

---

## 📊 4. The 7 Quantitative Alpha Strategy Engines

1. **Theta Iron Condor (4 Legs):** Harvests time decay in rangebound, high-IV environments with defined protective wings.
2. **Calendar & Diagonal Spread (2 Legs):** Exploits term-structure slope by selling front-week theta and buying back-month vega.
3. **Volatility Straddle (2 Legs):** Captures large price moves exceeding market-implied pricing ahead of earnings or CPI catalysts.
4. **Bull Put Credit Spread (2 Legs):** Defined-risk premium collection on upward trending assets above Volume POC.
5. **Bear Call Credit Spread (2 Legs):** Defined-risk premium collection on declining assets below Value Area Low.
6. **Jade Lizard (3 Legs):** Collects elevated put premium while eliminating upside risk through asymmetric wing positioning.
7. **Ratio Backspread (2-3 Legs):** Uncapped convexity designed to profit from sudden tail-risk black swan events.

---

## 🏆 5. Mutual Ecosystem Win-Win

| Stakeholder | Direct Value Delivered |
| :--- | :--- |
| **Retail Investor** | 🛡️ Protection against tail-risk wipeouts, automated profit-taking, and institutional-grade risk governance. |
| **Alpaca Brokerage** | 📈 Generates organic, high-utility multi-leg options trading volume through native API infrastructure. |
| **Capital Retention** | 🏦 Protects retail account equity from catastrophic drawdowns, increasing lifetime trader retention. |

---

## 🚀 6. Running the System

### Production Mode (FastAPI Direct Static Mount):
```bash
# Start FastAPI backend (serves compiled React frontend at http://localhost:8000/)
py -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Development Mode (Vite Hot-Module Reloading):
```bash
# Start React frontend in dev mode at http://localhost:5173/
cd frontend-react
npm run dev
```

### Access URLs:
- **FastAPI Direct Terminal:** [http://localhost:8000/](http://localhost:8000/)
- **Vite Dev Server (HMR):** [http://localhost:5173/](http://localhost:5173/)
- **Interactive REST API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
