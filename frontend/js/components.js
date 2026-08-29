/**
 * ORACLE Quantitative Terminal Pro - UI Components & Dynamic Renderers 5.0
 * Institutional-grade components connecting all 35 endpoints.
 */

const UIComponents = {
    // -------------------------------------------------------------------------
    // Utility: Generate Precision SVG Sparkline
    // -------------------------------------------------------------------------
    generateSparklineSVG(isPositive = true, width = 44, height = 14) {
        const color = isPositive ? '#00E676' : '#FF3D71';
        const points = isPositive 
            ? `0,12 8,10 16,11 24,6 32,7 44,2` 
            : `0,3 8,5 16,3 24,10 32,7 44,12`;
        return `
            <svg width="${width}" height="${height}" style="vertical-align: middle; overflow: visible;">
                <polyline fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" points="${points}" />
            </svg>
        `;
    },

    // -------------------------------------------------------------------------
    // 1. KPI Deck Renderer
    // -------------------------------------------------------------------------
    renderKPIs(account, greeks, stats) {
        const equityEl = document.getElementById('card-kpi-equity');
        const cashEl = document.getElementById('card-kpi-cash');
        const thetaEl = document.getElementById('card-kpi-theta');
        const deltaEl = document.getElementById('card-kpi-delta');
        const winRateEl = document.getElementById('card-kpi-winrate');
        const sharpeEl = document.getElementById('card-kpi-sharpe');

        if (equityEl && account) {
            equityEl.innerText = `$${parseFloat(account.equity || 100000.0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (cashEl && account) {
            cashEl.innerText = `$${parseFloat(account.cash || 100000.0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        if (thetaEl && greeks) {
            const theta = parseFloat(greeks.net_portfolio_theta || 0.0);
            thetaEl.innerText = `${theta >= 0 ? '+' : ''}${theta.toFixed(1)}`;
            thetaEl.className = `val ${theta >= 0 ? 'pos' : 'neg'}`;
        }
        if (deltaEl && greeks) {
            const delta = parseFloat(greeks.net_portfolio_delta || 0.0);
            deltaEl.innerText = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`;
            deltaEl.className = `val ${Math.abs(delta) <= 25 ? 'pos' : 'warn'}`;
        }
        if (winRateEl && stats) {
            winRateEl.innerText = `${parseFloat(stats.win_rate_percent || 0.0).toFixed(1)}%`;
        }
        if (sharpeEl && stats) {
            sharpeEl.innerText = `${parseFloat(stats.sharpe_ratio || 0.0).toFixed(2)}`;
        }
    },

    // -------------------------------------------------------------------------
    // 2. Watchlist Renderer
    // -------------------------------------------------------------------------
    renderWatchlist(universe) {
        const tbody = document.getElementById('watchlist-tbody');
        if (!tbody || !universe || !Array.isArray(universe)) return;

        let html = '';
        const isMarketOpen = window.appController ? window.appController.isMarketOpen : false;

        universe.forEach(item => {
            const sym = item.symbol || item.ticker || 'N/A';
            const price = parseFloat(item.price || item.current_price || 0.0);
            const chg = parseFloat(item.change_pct || 0.0);
            const isPos = chg >= 0;
            const chgColor = isPos ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)';
            const sign = isPos ? '+' : '';
            
            let badgeClass = isPos ? 'profit' : 'loss';
            let badgeText = isPos ? 'BULL' : 'BEAR';

            if (!isMarketOpen) {
                badgeClass = 'neutral';
                badgeText = '🌙 CLOSED';
            }

            const sparkline = this.generateSparklineSVG(isPos, 40, 14);

            html += `
                <tr onclick="appController.selectTicker('${sym}', ${price})" style="cursor: pointer;">
                    <td><strong style="color: var(--text-pure); font-size: 0.78rem;">${sym}</strong></td>
                    <td style="font-weight: 600;">$${price.toFixed(2)}</td>
                    <td style="color: ${chgColor}; font-weight: 700;">${sign}${chg.toFixed(2)}%</td>
                    <td>${sparkline}</td>
                    <td><span class="badge-openbb ${badgeClass}">${badgeText}</span></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    // -------------------------------------------------------------------------
    // 3. Execution Blotter (Open Positions)
    // -------------------------------------------------------------------------
    renderPositions(positions) {
        const tbody = document.getElementById('blotter-positions-tbody');
        if (!tbody) return;

        if (!positions || positions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; color: var(--text-muted); padding: 1.2rem;">
                        No open positions. Desk capital is 100% in cash standing by for next AI signal.
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        positions.forEach(p => {
            const sym = p.symbol || 'SPY';
            const qty = parseFloat(p.qty || 1);
            const entry = p.entry_price ? `$${parseFloat(p.entry_price).toFixed(2)}` : '$100.00';
            const cur = p.current_price ? `$${parseFloat(p.current_price).toFixed(2)}` : '$100.00';
            const pnl = parseFloat(p.unrealized_pl || 0.0);
            const pnlPct = parseFloat(p.unrealized_plpc || 0.0);
            const isProfit = pnl >= 0;
            const pnlColor = isProfit ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)';
            const sign = pnl >= 0 ? '+' : '';
            const strat = p.strategy || 'OPTION_STRUCTURE';

            html += `
                <tr>
                    <td><strong style="color: var(--text-pure); font-size: 0.8rem;">${sym}</strong></td>
                    <td style="color: var(--text-primary); font-size: 0.75rem;">${strat}</td>
                    <td>${qty > 0 ? '+' : ''}${qty}</td>
                    <td>${entry}</td>
                    <td style="font-weight: 600;">${cur}</td>
                    <td style="color: ${pnlColor}; font-weight: 700;">${sign}$${pnl.toFixed(2)} (${sign}${pnlPct.toFixed(1)}%)</td>
                    <td style="color: var(--openbb-emerald);">-4.2</td>
                    <td style="color: var(--openbb-emerald);">+$45.0</td>
                    <td><span class="badge-openbb ${isProfit ? 'profit' : 'loss'}">${isProfit ? 'ACTIVE PROFIT' : 'ACTIVE RISK'}</span></td>
                    <td style="display: flex; gap: 4px;">
                        <button class="btn-openbb-action danger" style="padding: 2px 6px; font-size: 0.65rem;" onclick="appController.confirmClosePosition('${sym}')">Close</button>
                        <button class="btn-openbb-action" style="padding: 2px 6px; font-size: 0.65rem;" onclick="appController.executeWingRoll('${sym}')">Roll</button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    // -------------------------------------------------------------------------
    // 4. Closed Trades Ledger & History
    // -------------------------------------------------------------------------
    renderClosedTradesLedger(trades, stats) {
        const tbody = document.getElementById('trades-history-tbody');
        const summaryContainer = document.getElementById('trade-stats-summary');

        if (summaryContainer && stats) {
            summaryContainer.innerHTML = `
                <span class="badge-openbb profit">Win Rate: ${parseFloat(stats.win_rate_percent || 0.0).toFixed(1)}%</span>
                <span class="badge-openbb ${stats.total_realized_pnl_usd >= 0 ? 'profit' : 'loss'}">Total P&L: ${stats.total_realized_pnl_usd >= 0 ? '+' : ''}$${parseFloat(stats.total_realized_pnl_usd || 0.0).toFixed(2)}</span>
                <span class="badge-openbb neutral">Sharpe: ${parseFloat(stats.sharpe_ratio || 0.0).toFixed(2)}</span>
            `;
        }

        if (!tbody) return;

        if (!trades || trades.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 12px;">No historical trades recorded yet.</td></tr>`;
            return;
        }

        let html = '';
        trades.slice().reverse().forEach(t => {
            const sym = t.symbol || 'SPY';
            const strat = t.strategy || 'N/A';
            const status = t.status || 'CLOSED';
            const pnl = parseFloat(t.pnl_usd || t.cost_or_credit_usd || 0.0);
            const isProfit = pnl >= 0;
            const pnlColor = isProfit ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)';
            const sign = isProfit ? '+' : '';
            const reason = t.exit_reason || t.reason || 'TARGET_OR_CYCLE';
            const date = t.entry_date || t.date || 'Today';

            html += `
                <tr>
                    <td><strong style="color: var(--text-pure);">${sym}</strong></td>
                    <td style="font-size: 0.75rem;">${strat}</td>
                    <td><span class="badge-openbb ${status.includes('CLOSED_PROFIT') || isProfit ? 'profit' : 'loss'}">${status}</span></td>
                    <td style="color: ${pnlColor}; font-weight: 700;">${sign}$${pnl.toFixed(2)}</td>
                    <td class="cell-wrap" style="font-size: 0.72rem; color: var(--text-muted);">${reason}</td>
                    <td style="font-family: var(--font-mono); font-size: 0.72rem;">${date}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    },

    // -------------------------------------------------------------------------
    // 5. 8-Agent Cognitive Architecture Cards
    // -------------------------------------------------------------------------
    renderAgentsCards() {
        const container = document.getElementById('agents-streaming-deck');
        if (!container) return;

        const agents = [
            { id: 1, name: "Macro Sentinel", role: "Catalyst & Treasury Radar", regime: "Yield Curve Ingest", status: "ONLINE", icon: "🌐" },
            { id: 2, name: "Market Scout", role: "Volume POC & Options Skew", regime: "8-Asset Scanner", status: "ONLINE", icon: "📊" },
            { id: 3, name: "Strategy Brain", role: "ToT Scenarios & Red Team", regime: "temp=0.0 Stress Test", status: "ONLINE", icon: "🧠" },
            { id: 4, name: "HITL Supervisor", role: "Capital Governance Gate", regime: "Kelly Corridor ($450-$600)", status: "ONLINE", icon: "🏛️" },
            { id: 5, name: "Execution Trader", role: "OCC Multi-Leg Midpoint Router", regime: "Slippage Shield", status: "ONLINE", icon: "⚡" },
            { id: 6, name: "Portfolio Hedge", role: "Net Greek Delta-Neutral Balancer", regime: "Beta-Weighted Hedge", status: "ONLINE", icon: "🛡️" },
            { id: 7, name: "Risk Bodyguard", role: "60s/15s Active Profit Ratchet", regime: "+50% Lock / -$150 Stop", status: "ONLINE", icon: "🚨" },
            { id: 8, name: "Analyst Memory", role: "Episodic Long-Term Memory Synthesis", regime: "Vectorized PnL Attribution", status: "ONLINE", icon: "📈" }
        ];

        let html = '';
        agents.forEach(a => {
            html += `
                <div class="openbb-node-card active" style="padding: 8px 10px;">
                    <div class="title">
                        <span>${a.icon} ${a.name}</span>
                        <span class="badge-openbb profit" style="font-size: 0.58rem;">${a.status}</span>
                    </div>
                    <div class="desc" style="color: var(--text-pure); margin-top: 2px;">${a.role}</div>
                    <div class="tag" style="margin-top: 4px;">${a.regime}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // -------------------------------------------------------------------------
    // 6. Macro Sentinel Renderer
    // -------------------------------------------------------------------------
    renderMacroSentinel(macro) {
        const container = document.getElementById('macro-sentinel-container');
        if (!container || !macro) return;

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.75rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-dim);">Macro Regime:</span>
                    <span class="badge-openbb profit">${macro.regime || 'RISK_ON_EXPANSION'}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-dim);">10Y Treasury Yield (^TNX):</span>
                    <strong style="color: var(--text-pure);">${parseFloat(macro.tnx_yield || 4.25).toFixed(2)}%</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-dim);">3M T-Bill Yield (^IRX):</span>
                    <strong style="color: var(--text-pure);">${parseFloat(macro.irx_yield || 5.12).toFixed(2)}%</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-dim);">Yield Curve Inversion:</span>
                    <strong style="color: ${macro.is_yield_curve_inverted ? 'var(--openbb-crimson)' : 'var(--openbb-emerald)'};">
                        ${macro.is_yield_curve_inverted ? 'INVERTED (Recessionary)' : 'NORMAL (+0.15% Spread)'}
                    </strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-dim);">Macro Sizing Multiplier:</span>
                    <strong style="color: var(--openbb-cyan);">${parseFloat(macro.sizing_multiplier || 1.0).toFixed(1)}x Kelly</strong>
                </div>
            </div>
        `;
    },

    // -------------------------------------------------------------------------
    // 7. Portfolio Hedge Balancer Renderer
    // -------------------------------------------------------------------------
    renderPortfolioHedge(hedge) {
        const container = document.getElementById('portfolio-hedge-container');
        if (!container || !hedge) return;

        const isHedged = hedge.hedge_required === false;
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.75rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-dim);">Hedge Decision:</span>
                    <span class="badge-openbb ${isHedged ? 'profit' : 'loss'}">${hedge.decision || 'HOLD_CURRENT_RISK'}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-dim);">Beta-Weighted Delta:</span>
                    <strong style="color: var(--text-pure);">${parseFloat(hedge.beta_weighted_delta || 0.0).toFixed(1)} Δ</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-dim);">SPY Unit Balance:</span>
                    <strong style="color: var(--openbb-cyan);">${hedge.recommended_hedge_units || 0} Contracts</strong>
                </div>
            </div>
        `;
    },

    // -------------------------------------------------------------------------
    // 8. HITL Governance Queue Renderer
    // -------------------------------------------------------------------------
    renderHitlGovernance(pending, history) {
        const pendingContainer = document.getElementById('hitl-pending-container');
        const historyTbody = document.getElementById('hitl-history-tbody');

        if (pendingContainer) {
            if (!pending || pending.length === 0) {
                pendingContainer.innerHTML = `
                    <div style="text-align: center; color: var(--text-muted); padding: 12px; font-size: 0.75rem;">
                        No proposals currently pending sign-off. Governance queue is clean.
                    </div>
                `;
            } else {
                let html = '';
                pending.forEach(p => {
                    html += `
                        <div class="openbb-widget" style="border: 1px solid var(--openbb-cyan); margin-bottom: 6px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <strong style="color: var(--text-pure); font-size: 0.85rem;">Proposal: ${p.proposal_id} (${p.symbol})</strong>
                                <span class="badge-openbb neutral">${p.strategy}</span>
                            </div>
                            <p style="font-size: 0.72rem; color: var(--text-muted); margin: 4px 0;">${p.reasoning || 'AI Strategy Proposal awaiting operator review.'}</p>
                            <div style="display: flex; gap: 6px; margin-top: 6px;">
                                <button class="btn-openbb-action primary" onclick="appController.approveHitlProposal('${p.proposal_id}')">✓ Approve</button>
                                <button class="btn-openbb-action danger" onclick="appController.rejectHitlProposal('${p.proposal_id}')">✕ Reject</button>
                            </div>
                        </div>
                    `;
                });
                pendingContainer.innerHTML = html;
            }
        }

        if (historyTbody && Array.isArray(history)) {
            let html = '';
            history.forEach(h => {
                const isApproved = h.status === 'APPROVED';
                html += `
                    <tr>
                        <td><strong style="color: var(--text-pure);">${h.proposal_id}</strong></td>
                        <td><span class="badge-openbb ${isApproved ? 'profit' : 'loss'}">${h.status}</span></td>
                        <td style="font-size: 0.72rem;">${h.operator_name || 'Desk Officer'}</td>
                        <td class="cell-wrap" style="font-size: 0.72rem; color: var(--text-muted);">${h.notes || 'N/A'}</td>
                    </tr>
                `;
            });
            historyTbody.innerHTML = html || `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No history.</td></tr>`;
        }
    },

    // -------------------------------------------------------------------------
    // 9. Strategy Catalog Renderer
    // -------------------------------------------------------------------------
    renderStrategyCatalog(strategies) {
        const container = document.getElementById('strategies-catalog-grid');
        if (!container || !strategies || !Array.isArray(strategies)) return;

        let html = '';
        strategies.forEach(s => {
            html += `
                <div class="openbb-widget" style="display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span class="badge-openbb neutral">${s.category}</span>
                            <span style="font-size: 0.68rem; color: var(--openbb-cyan); font-family: var(--font-mono);">${s.legs_count} Legs</span>
                        </div>
                        <strong style="color: var(--text-pure); font-size: 0.88rem;">${s.name}</strong>
                        <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; line-height: 1.35;">${s.description}</p>
                    </div>
                    <div style="margin-top: 10px;">
                        <button class="btn-openbb-action primary" style="width: 100%; justify-content: center;" onclick="appController.modelStrategyFromCatalog('${s.id}')">
                            <span>⚡</span> <span>Model Strategy</span>
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // -------------------------------------------------------------------------
    // 10. Signals & Alpha Radar Studio Renderer
    // -------------------------------------------------------------------------
    renderSignalsStudio(vp, vwap, sentiment, flow, totMatrix) {
        // Volume Profile
        const vpEl = document.getElementById('signal-vp-container');
        if (vpEl && vp) {
            vpEl.innerHTML = `
                <div class="openbb-strat-summary">
                    <div class="chip"><span class="label">POC (Point of Control)</span><span class="val" style="color: var(--openbb-cyan);">$${parseFloat(vp.point_of_control_poc || 0.0).toFixed(2)}</span></div>
                    <div class="chip"><span class="label">VAH (Value Area High)</span><span class="val profit">$${parseFloat(vp.value_area_high_vah || 0.0).toFixed(2)}</span></div>
                    <div class="chip"><span class="label">VAL (Value Area Low)</span><span class="val loss">$${parseFloat(vp.value_area_low_val || 0.0).toFixed(2)}</span></div>
                </div>
            `;
        }

        // Anchored VWAP
        const vwapEl = document.getElementById('signal-vwap-container');
        if (vwapEl && vwap) {
            vwapEl.innerHTML = `
                <div class="openbb-strat-summary">
                    <div class="chip"><span class="label">Anchored VWAP</span><span class="val" style="color: var(--openbb-cyan);">$${parseFloat(vwap.anchored_vwap || 0.0).toFixed(2)}</span></div>
                    <div class="chip"><span class="label">Current Price</span><span class="val">$${parseFloat(vwap.current_price || 0.0).toFixed(2)}</span></div>
                    <div class="chip"><span class="label">Trend Bias</span><span class="val profit">${vwap.trend_bias || 'BULLISH'}</span></div>
                </div>
            `;
        }

        // Unusual Flow
        const flowEl = document.getElementById('signal-flow-container');
        if (flowEl && flow) {
            flowEl.innerHTML = `
                <div style="background: var(--openbb-bg-surface); padding: 8px 10px; border-radius: 4px; border: 1px solid var(--openbb-border); font-size: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <strong style="color: var(--openbb-cyan);">${flow.flow_type || 'INSTITUTIONAL_SWEEP'}</strong>
                        <span class="badge-openbb profit">Premium: $${(flow.premium_usd || 150000).toLocaleString()}</span>
                    </div>
                    <p style="color: var(--text-muted); margin: 0;">${flow.details || 'Aggressive institutional sweep flow detected on strike.'}</p>
                </div>
            `;
        }

        // ToT Matrix
        const totEl = document.getElementById('signal-tot-container');
        if (totEl && totMatrix) {
            const scenarios = totMatrix.scenarios || [];
            let html = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">';
            scenarios.forEach(sc => {
                html += `
                    <div style="background: var(--openbb-bg-surface); padding: 6px; border-radius: 4px; border: 1px solid var(--openbb-border); text-align: center;">
                        <span style="font-size: 0.68rem; color: var(--text-muted);">${sc.name || 'Scenario'}</span>
                        <div style="font-size: 0.85rem; font-weight: 700; color: ${sc.payoff_usd >= 0 ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)'};">
                            ${sc.payoff_usd >= 0 ? '+' : ''}$${parseFloat(sc.payoff_usd || 0.0).toFixed(0)}
                        </div>
                        <span style="font-size: 0.65rem; color: var(--openbb-cyan);">P = ${(sc.probability * 100).toFixed(0)}%</span>
                    </div>
                `;
            });
            html += '</div>';
            totEl.innerHTML = html;
        }
    }
};

window.UIComponents = UIComponents;
