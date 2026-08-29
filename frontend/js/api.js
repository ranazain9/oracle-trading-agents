/**
 * ORACLE Trading Terminal - Full 35-Endpoint REST API Client
 * Seamlessly interfaces with all 8 FastAPI routers and WebSocket streams.
 */

const API_BASE = "http://localhost:8000/api/v1";
const SERVER_BASE = "http://localhost:8000";

const apiClient = {
    // -------------------------------------------------------------------------
    // 1. System Discovery & Health Router (2 Endpoints)
    // -------------------------------------------------------------------------
    async getHealth() {
        const res = await fetch(`${SERVER_BASE}/health`);
        return res.json();
    },

    // -------------------------------------------------------------------------
    // 2. Pipeline Orchestration Router (4 Endpoints)
    // -------------------------------------------------------------------------
    async getPipelineStatus() {
        const res = await fetch(`${API_BASE}/pipeline/status`);
        return res.json();
    },

    async runPipeline(symbols = ["NVDA", "AAPL", "MSFT", "TSLA", "AMZN", "SPY"], portfolioCash = 100000.0, forceAutoApprove = true) {
        const res = await fetch(`${API_BASE}/pipeline/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbols, portfolio_cash: portfolioCash, force_auto_approve: forceAutoApprove })
        });
        return res.json();
    },

    async getLatestState() {
        const res = await fetch(`${API_BASE}/pipeline/latest-state`);
        return res.json();
    },

    async cancelPipeline() {
        const res = await fetch(`${API_BASE}/pipeline/cancel`, { method: "POST" });
        return res.json();
    },

    // -------------------------------------------------------------------------
    // 3. Agent Diagnostics Router (4 Endpoints)
    // -------------------------------------------------------------------------
    async getMacroAssessment() {
        const res = await fetch(`${API_BASE}/agents/macro`);
        return res.json();
    },

    async getHedgeEvaluation() {
        const res = await fetch(`${API_BASE}/agents/hedge/evaluate`);
        return res.json();
    },

    async runBodyguardScan() {
        const res = await fetch(`${API_BASE}/agents/bodyguard/scan`, { method: "POST" });
        return res.json();
    },

    async getAnalystReflections() {
        const res = await fetch(`${API_BASE}/agents/analyst/reflections`);
        return res.json();
    },

    // -------------------------------------------------------------------------
    // 4. HITL Governance Router (4 Endpoints)
    // -------------------------------------------------------------------------
    async getPendingProposals() {
        const res = await fetch(`${API_BASE}/hitl/pending`);
        return res.json();
    },

    async getHitlHistory() {
        const res = await fetch(`${API_BASE}/hitl/history`);
        return res.json();
    },

    async approveProposal(proposalId, operatorName = "Chief Risk Officer", notes = "Approved in Terminal") {
        const res = await fetch(`${API_BASE}/hitl/approve/${proposalId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operator_name: operatorName, notes })
        });
        return res.json();
    },

    async rejectProposal(proposalId, operatorName = "Chief Risk Officer", notes = "Vetoed in Terminal") {
        const res = await fetch(`${API_BASE}/hitl/reject/${proposalId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operator_name: operatorName, notes })
        });
        return res.json();
    },

    // -------------------------------------------------------------------------
    // 5. Portfolio & Risk Router (5 Endpoints)
    // -------------------------------------------------------------------------
    async getAccountStatus() {
        const res = await fetch(`${API_BASE}/portfolio/account`);
        return res.json();
    },

    async getOpenPositions() {
        const res = await fetch(`${API_BASE}/portfolio/positions`);
        return res.json();
    },

    async getPortfolioGreeks() {
        const res = await fetch(`${API_BASE}/portfolio/greeks`);
        return res.json();
    },

    async closePosition(symbolOrId) {
        const res = await fetch(`${API_BASE}/portfolio/close/${symbolOrId}`, { method: "POST" });
        return res.json();
    },

    async emergencyKillSwitch(reason = "Emergency Desk Liquidation") {
        const res = await fetch(`${API_BASE}/portfolio/kill-switch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ confirmation_code: "CONFIRM_KILL_SWITCH", reason })
        });
        return res.json();
    },

    // -------------------------------------------------------------------------
    // 6. Alpha Strategies Router (4 Endpoints)
    // -------------------------------------------------------------------------
    async getStrategiesList() {
        const res = await fetch(`${API_BASE}/strategies/list`);
        return res.json();
    },

    async calculateStrategy(strategy, symbol, currentPrice = null, riskBudget = 500.0, direction = "NEUTRAL", targetProfitPct = 50.0, maxLossUsd = 150.0) {
        const res = await fetch(`${API_BASE}/strategies/calculate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                strategy,
                symbol,
                current_price: currentPrice,
                risk_budget_usd: riskBudget,
                direction,
                target_profit_percent: targetProfitPct,
                max_loss_usd: maxLossUsd
            })
        });
        return res.json();
    },

    async executeStrategyDirect(strategy, symbol, currentPrice = null, riskBudget = 500.0, direction = "NEUTRAL") {
        const res = await fetch(`${API_BASE}/strategies/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                strategy,
                symbol,
                current_price: currentPrice,
                risk_budget_usd: riskBudget,
                direction
            })
        });
        return res.json();
    },

    async rollUntestedWing(symbol, rollType = "WING_ROLL") {
        const res = await fetch(`${API_BASE}/strategies/roll-wing`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol, roll_type: rollType })
        });
        return res.json();
    },

    // -------------------------------------------------------------------------
    // 7. Signals & Alternative Data Router (6 Endpoints)
    // -------------------------------------------------------------------------
    async getUniverseScreening() {
        const res = await fetch(`${API_BASE}/signals/universe`);
        return res.json();
    },

    async getVolumeProfile(symbol = "NVDA") {
        const res = await fetch(`${API_BASE}/signals/volume-profile?symbol=${symbol}`);
        return res.json();
    },

    async getAnchoredVWAP(symbol = "NVDA") {
        const res = await fetch(`${API_BASE}/signals/anchored-vwap?symbol=${symbol}`);
        return res.json();
    },

    async getSentiment(symbol = "NVDA") {
        const res = await fetch(`${API_BASE}/signals/sentiment?symbol=${symbol}`);
        return res.json();
    },

    async getUnusualFlow(symbol = "NVDA") {
        const res = await fetch(`${API_BASE}/signals/unusual-flow?symbol=${symbol}`);
        return res.json();
    },

    async getToTMatrix(symbol = "NVDA", price = 225.0) {
        const res = await fetch(`${API_BASE}/signals/tot-matrix?symbol=${symbol}&price=${price}`);
        return res.json();
    },

    async getMarketNews() {
        const res = await fetch(`${API_BASE}/signals/news`);
        return res.json();
    },

    // -------------------------------------------------------------------------
    // 8. Trades & Analytics Router (4 Endpoints)
    // -------------------------------------------------------------------------
    async getTradeHistory() {
        const res = await fetch(`${API_BASE}/trades/history`);
        return res.json();
    },

    async getTradeMemory() {
        const res = await fetch(`${API_BASE}/trades/memory`);
        return res.json();
    },

    async getTradeStats() {
        const res = await fetch(`${API_BASE}/trades/stats`);
        return res.json();
    },

    async exportTrades(format = "json") {
        const res = await fetch(`${API_BASE}/trades/export`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ format, include_memory: true })
        });
        return res.json();
    }
};

// Aliases for unified backward compatibility
const APIClient = {
    ...apiClient,
    getAccount: () => apiClient.getAccountStatus(),
    getPositions: () => apiClient.getOpenPositions(),
    getMacroStatus: () => apiClient.getMacroAssessment(),
    getScreenerUniverse: () => apiClient.getUniverseScreening(),
    runPipelineCycle: (symbols) => apiClient.runPipeline(symbols),
    closePosition: (sym) => apiClient.closePosition(sym),
    emergencyKillSwitch: () => apiClient.emergencyKillSwitch(),
    exportTrades: (fmt) => apiClient.exportTrades(fmt)
};

window.apiClient = apiClient;
window.APIClient = APIClient;
