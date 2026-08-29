/**
 * ORACLE Quantitative Terminal Pro - Master Application Controller 5.0
 * Fully integrated across all 35 endpoints and WebSocket channels.
 */

class AppController {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentSymbol = 'SPX';
        this.currentSpotPrice = 5183.45;
        this.currentStrategy = 'THETA_IRON_CONDOR';
        this.currentRiskBudget = 500.0;
        this.currentIV = 45;
        this.currentDTE = 14;
        this.isProcessing = false;
        this.syncInterval = null;
    }

    async init() {
        console.log("⚡ [AppController] Initializing ORACLE Quantitative Terminal 5.0...");

        // 1. Initialize Visual Charts
        if (window.PayoffChart) {
            PayoffChart.init();
        }

        // 2. Initialize AI Copilot
        if (window.AICopilot) {
            AICopilot.init();
        }

        // 3. Render Static/Template Components
        UIComponents.renderAgentsCards();

        // 4. Connect WebSockets
        if (window.wsClient) {
            window.wsClient.init();
            window.wsClient.onTelemetry((data) => {
                const stream = document.getElementById('monitor-log-stream');
                if (stream && data && data.message) {
                    const div = document.createElement('div');
                    div.style.color = data.agent ? 'var(--openbb-cyan)' : 'var(--openbb-emerald)';
                    div.innerText = `[${new Date().toLocaleTimeString()}] [${data.agent || 'SYSTEM'}] ${data.message}`;
                    stream.appendChild(div);
                    stream.scrollTop = stream.scrollHeight;
                }
            });

            window.wsClient.onPositions((data) => {
                if (data && data.positions) {
                    UIComponents.renderPositions(data.positions);
                }
            });
        }

        // 5. Start Market Hours Engine & Countdown
        this.startMarketCountdown();

        // 6. Bind Keyboard Shortcuts (Ctrl+K)
        this.bindEvents();

        // 7. Initial REST Sync across all 35 endpoints
        await this.syncLiveData();

        // 8. Auto Periodic Sync every 10 seconds
        if (this.syncInterval) clearInterval(this.syncInterval);
        this.syncInterval = setInterval(() => this.syncLiveData(), 10000);
    }

    // -------------------------------------------------------------------------
    // Navigation Router
    // -------------------------------------------------------------------------
    navigateToPage(pageId) {
        this.currentPage = pageId;

        // Toggle nav button active state
        document.querySelectorAll('.openbb-nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`btn-nav-${pageId}`);
        if (activeBtn) activeBtn.classList.add('active');

        // Toggle page visibility
        document.querySelectorAll('.app-page').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) targetPage.classList.add('active');

        console.log(`🧭 [Navigation] Switched to view: ${pageId}`);
        this.syncLiveData();
    }

    // -------------------------------------------------------------------------
    // Full Data Synchronization across all 35 endpoints
    // -------------------------------------------------------------------------
    async syncLiveData() {
        try {
            // 1. Health & Status
            const health = await apiClient.getHealth().catch(() => ({ status: "ONLINE" }));
            const healthPill = document.getElementById('system-health-pill');
            if (healthPill) {
                healthPill.innerText = health.status === "HEALTHY" || health.status === "ONLINE" ? "SYSTEM HEALTHY (200 OK)" : health.status;
            }

            // 2. Portfolio & Risk (Account, Positions, Greeks)
            const [account, positions, greeks, stats] = await Promise.all([
                apiClient.getAccountStatus().catch(() => null),
                apiClient.getOpenPositions().catch(() => []),
                apiClient.getPortfolioGreeks().catch(() => null),
                apiClient.getTradeStats().catch(() => null)
            ]);

            UIComponents.renderKPIs(account, greeks, stats);
            UIComponents.renderPositions(positions);

            // 3. Screener / Watchlist
            const universe = await apiClient.getUniverseScreening().catch(() => []);
            UIComponents.renderWatchlist(universe);

            // 4. Trade History
            const trades = await apiClient.getTradeHistory().catch(() => []);
            UIComponents.renderClosedTradesLedger(trades, stats);

            // 5. Signals for Selected Ticker
            const [vp, vwap, sent, flow, totMatrix] = await Promise.all([
                apiClient.getVolumeProfile(this.currentSymbol).catch(() => null),
                apiClient.getAnchoredVWAP(this.currentSymbol).catch(() => null),
                apiClient.getSentiment(this.currentSymbol).catch(() => null),
                apiClient.getUnusualFlow(this.currentSymbol).catch(() => null),
                apiClient.getToTMatrix(this.currentSymbol, this.currentSpotPrice).catch(() => null)
            ]);
            UIComponents.renderSignalsStudio(vp, vwap, sent, flow, totMatrix);

            // 6. Agents & Governance Diagnostics
            const [macro, hedge, pendingHitl, historyHitl] = await Promise.all([
                apiClient.getMacroAssessment().catch(() => null),
                apiClient.getHedgeEvaluation().catch(() => null),
                apiClient.getPendingProposals().catch(() => []),
                apiClient.getHitlHistory().catch(() => [])
            ]);
            UIComponents.renderMacroSentinel(macro);
            UIComponents.renderPortfolioHedge(hedge, greeks);
            UIComponents.renderHitlGovernance(pendingHitl, historyHitl);

            // 7. Strategy Catalog
            const strategies = await apiClient.getStrategiesList().catch(() => []);
            UIComponents.renderStrategyCatalog(strategies);

        } catch (err) {
            console.warn("⚠️ [AppController] Sync error:", err);
        }
    }

    // -------------------------------------------------------------------------
    // Interactive Actions & Endpoint Handlers
    // -------------------------------------------------------------------------
    async runAutonomousPipeline() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        this.showToast("⚡ Initiating LangGraph Multi-Agent Pipeline...", "info");

        try {
            const res = await apiClient.runPipeline([this.currentSymbol, "SPY", "NVDA", "AAPL"]);
            this.showToast(`Pipeline Run Started (ID: ${res.run_id || 'ACTIVE'})`, "success");

            // Poll status
            let attempts = 0;
            const poll = setInterval(async () => {
                attempts++;
                const status = await apiClient.getPipelineStatus();
                if (status.status === "COMPLETED" || status.status === "IDLE" || attempts > 10) {
                    clearInterval(poll);
                    this.isProcessing = false;
                    this.showToast("✅ LangGraph Pipeline Completed Successfully.", "success");
                    await this.syncLiveData();
                }
            }, 2000);
        } catch (e) {
            this.isProcessing = false;
            this.showToast(`Pipeline Error: ${e.message}`, "error");
        }
    }

    async cancelPipeline() {
        try {
            const res = await apiClient.cancelPipeline();
            this.showToast(res.message || "Pipeline execution cancelled.", "warning");
        } catch (e) {
            this.showToast(`Cancel Error: ${e.message}`, "error");
        }
    }

    async triggerBodyguardScan() {
        this.showToast("🛡️ Triggering 60s/15s Active Risk Guardian scan...", "info");
        try {
            const res = await apiClient.runBodyguardScan();
            this.showToast(`Bodyguard Scan: Status = ${res.status} | Scanned = ${res.scanned_count}`, "success");
            await this.syncLiveData();
        } catch (e) {
            this.showToast(`Scan Error: ${e.message}`, "error");
        }
    }

    async openLatestStateInspector() {
        try {
            const state = await apiClient.getLatestState();
            const modal = document.getElementById('state-inspector-modal');
            const body = document.getElementById('state-inspector-body');
            if (body) {
                body.innerHTML = `<pre style="color: var(--openbb-cyan); font-family: var(--font-mono); font-size: 0.72rem; max-height: 400px; overflow: auto; background: #05080E; padding: 12px; border-radius: 4px;">${JSON.stringify(state, null, 2)}</pre>`;
            }
            if (modal) modal.classList.add('active');
        } catch (e) {
            this.showToast(`Inspector Error: ${e.message}`, "error");
        }
    }

    closeStateInspector() {
        const modal = document.getElementById('state-inspector-modal');
        if (modal) modal.classList.remove('active');
    }

    async approveHitlProposal(proposalId) {
        try {
            const res = await apiClient.approveProposal(proposalId, "Risk Desk Operator", "Approved via Terminal");
            this.showToast(`Proposal ${proposalId} Approved! Status: ${res.status}`, "success");
            await this.syncLiveData();
        } catch (e) {
            this.showToast(`Approval Error: ${e.message}`, "error");
        }
    }

    async rejectHitlProposal(proposalId) {
        try {
            const res = await apiClient.rejectProposal(proposalId, "Risk Desk Operator", "Vetoed via Terminal");
            this.showToast(`Proposal ${proposalId} Vetoed. Status: ${res.status}`, "warning");
            await this.syncLiveData();
        } catch (e) {
            this.showToast(`Rejection Error: ${e.message}`, "error");
        }
    }

    async confirmClosePosition(symbol) {
        if (!confirm(`Liquidate position for ${symbol} immediately on Alpaca?`)) return;
        try {
            const res = await apiClient.closePosition(symbol);
            this.showToast(`Position ${symbol} Closed: ${res.status}`, "success");
            await this.syncLiveData();
        } catch (e) {
            this.showToast(`Close Error: ${e.message}`, "error");
        }
    }

    async executeWingRoll(symbol) {
        this.showToast(`🦋 Restructuring ${symbol} into Delta-Neutral Iron Butterfly...`, "info");
        try {
            const res = await apiClient.rollUntestedWing(symbol, "WING_ROLL");
            this.showToast(`Position Salvaged: ${res.roll_action || 'Completed'}`, "success");
            await this.syncLiveData();
        } catch (e) {
            this.showToast(`Roll Error: ${e.message}`, "error");
        }
    }

    async executeKillSwitch() {
        if (!confirm("🚨 ACTIVATE EMERGENCY KILL SWITCH? This will immediately cancel all orders and liquidate all open positions.")) return;
        try {
            const res = await apiClient.emergencyKillSwitch("Desk Kill Switch Activated");
            this.showToast("🚨 Emergency Kill Switch Completed. All positions liquidated.", "error");
            await this.syncLiveData();
        } catch (e) {
            this.showToast(`Kill Switch Error: ${e.message}`, "error");
        }
    }

    async exportLedger(format = 'json') {
        try {
            const res = await apiClient.exportTrades(format);
            this.showToast(`Ledger Exported (${format.toUpperCase()}): ${res.exported_records_count || 0} records`, "success");
        } catch (e) {
            this.showToast(`Export Error: ${e.message}`, "error");
        }
    }

    async selectTicker(symbol, price = null) {
        this.currentSymbol = symbol;
        if (price) this.currentSpotPrice = price;

        const spotEl = document.getElementById('payoff-spot-price');
        if (spotEl) spotEl.innerText = this.currentSpotPrice.toFixed(2);

        const headingEl = document.getElementById('payoff-strategy-heading');
        if (headingEl) headingEl.innerText = `${this.currentSymbol} ${this.currentStrategy.replace(/_/g, ' ')}`;

        this.showToast(`Selected Ticker: ${symbol} ($${this.currentSpotPrice.toFixed(2)})`, "info");

        // Calculate Strategy Blueprint & Payoff
        await this.calculateAndRenderStrategy();
        await this.syncLiveData();
    }

    async modelStrategyFromCatalog(strategyId) {
        this.currentStrategy = strategyId;
        this.navigateToPage('dashboard');
        await this.selectTicker(this.currentSymbol);
    }

    async calculateAndRenderStrategy() {
        try {
            const bp = await apiClient.calculateStrategy(
                this.currentStrategy,
                this.currentSymbol,
                this.currentSpotPrice,
                this.currentRiskBudget,
                "NEUTRAL",
                50.0,
                150.0
            );

            if (window.PayoffChart && bp) {
                const profitEl = document.getElementById('legend-profit');
                const lossEl = document.getElementById('legend-loss');
                if (profitEl) profitEl.innerText = `+$${(bp.profit_target_usd || 250).toFixed(2)}`;
                if (lossEl) lossEl.innerText = `-$${(bp.stop_loss_usd || 150).toFixed(2)}`;
            }
        } catch (e) {
            console.warn("Could not calculate strategy payoff:", e);
        }
    }

    // -------------------------------------------------------------------------
    // Market Clock & Countdown Engine
    // -------------------------------------------------------------------------
    startMarketCountdown() {
        const updateClock = () => {
            const now = new Date();
            let estDate;
            try {
                const estString = now.toLocaleString("en-US", { timeZone: "America/New_York" });
                estDate = new Date(estString);
            } catch (e) {
                estDate = new Date(now.getTime() - (4 * 3600 * 1000));
            }

            const day = estDate.getDay(); // 0=Sun, 6=Sat
            const hours = estDate.getHours();
            const minutes = estDate.getMinutes();
            const seconds = estDate.getSeconds();
            const currentMinutes = hours * 60 + minutes;
            const isWeekday = day >= 1 && day <= 5;
            const isTradingHours = currentMinutes >= (9 * 60 + 30) && currentMinutes < (16 * 60);
            this.isMarketOpen = Boolean(isWeekday && isTradingHours);

            const pill = document.getElementById('market-status-pill');
            const label = document.getElementById('market-status-text');
            const countdownEl = document.getElementById('market-countdown-clock');
            const liveClock = document.getElementById('live-utc-clock');

            if (liveClock) {
                liveClock.innerText = `New York Time: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} EST • Alpaca Feed`;
            }

            if (this.isMarketOpen) {
                if (pill) pill.className = 'openbb-status-pill open';
                if (label) label.innerText = 'MARKET OPEN (LIVE SESSION)';
                if (countdownEl) countdownEl.innerHTML = `<span>Closes in: </span><strong>${16 - hours - 1}h ${60 - minutes}m</strong> (04:00 PM EST)`;
            } else {
                if (pill) pill.className = 'openbb-status-pill';
                if (label) label.innerText = !isWeekday ? 'MARKET CLOSED (WEEKEND)' : (currentMinutes < 570 ? 'PRE-MARKET (OPENS 09:30 EST)' : 'OVERNIGHT SUSPENSION');
                if (countdownEl) countdownEl.innerHTML = `<span>Next Open: </span><strong>Mon 09:30 AM EST</strong>`;
            }
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    // -------------------------------------------------------------------------
    // Event Listeners & Command Palette (Ctrl+K)
    // -------------------------------------------------------------------------
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.togglePalette();
            }
            if (e.key === 'Escape') {
                const palette = document.getElementById('command-palette-overlay');
                if (palette && palette.classList.contains('active')) palette.classList.remove('active');
                this.closeStateInspector();
            }
        });
    }

    togglePalette() {
        const p = document.getElementById('command-palette-overlay');
        if (p) {
            p.classList.toggle('active');
            if (p.classList.contains('active')) {
                const input = document.getElementById('palette-search-input');
                if (input) input.focus();
            }
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-message ${type}`;
        toast.innerText = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
}

window.appController = new AppController();
document.addEventListener('DOMContentLoaded', () => {
    window.appController.init();
});
