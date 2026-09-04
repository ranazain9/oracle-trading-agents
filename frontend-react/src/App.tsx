import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, TabKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TickerRibbon } from './components/layout/TickerRibbon';
import { KpiDeck } from './components/workspace/KpiDeck';
import { PayoffChart } from './components/workspace/PayoffChart';
import { AgentBus } from './components/workspace/AgentBus';
import { Blotter } from './components/workspace/Blotter';
import { Watchlist } from './components/workspace/Watchlist';
import { SignalsStudio } from './components/signals/SignalsStudio';
import { AgentsDesk } from './components/agents/AgentsDesk';
import { StrategyCatalog } from './components/strategies/StrategyCatalog';
import { LedgerStream } from './components/monitor/LedgerStream';
import { ConfigRiskDesk } from './components/config/ConfigRiskDesk';
import { CopilotDrawer } from './components/drawers/CopilotDrawer';
import { StateInspectorModal } from './components/drawers/StateInspectorModal';
import { CommandPalette } from './components/common/CommandPalette';
import { oracleApi } from './api/client';
import { useTelemetryWebSocket, usePositionsWebSocket } from './api/ws';
import {
  SystemHealth,
  AccountData,
  PortfolioGreeks,
  TradeStatsData,
  PositionData,
  UniverseAsset,
  VolumeProfileData,
  AnchoredVwapData,
  UnusualFlowData,
  ToTScenarioMatrix,
  MacroSentinelData,
  PortfolioHedgeData,
  HitlProposal,
  HitlHistoryRecord,
  StrategyOption,
  StrategyBlueprint,
  ClosedTradeRecord,
  PipelineState,
  NewsItem,
  DaemonStatusData,
} from './api/types';
import { NewsSentimentTable } from './components/workspace/NewsSentimentTable';
import { AgentStrategyFlow } from './components/workspace/AgentStrategyFlow';

export const App: React.FC = () => {
  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Active Trading Selection
  const [selectedSymbol, setSelectedSymbol] = useState('SPX');
  const [selectedSpotPrice, setSelectedSpotPrice] = useState(5183.45);
  const [selectedStrategy, setSelectedStrategy] = useState('THETA_IRON_CONDOR');

  // Helper to read persistent local cache immediately on mount (0ms latency)
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`oracle_${key}`);
      if (!item) return fallback;
      const parsed = JSON.parse(item);
      if (Array.isArray(fallback) && !Array.isArray(parsed)) {
        return fallback;
      }
      return parsed;
    } catch {
      return fallback;
    }
  };

  const setStored = (key: string, value: any) => {
    try {
      localStorage.setItem(`oracle_${key}`, JSON.stringify(value));
    } catch {}
  };

  // Backend Data State (Hydrated instantly from LocalStorage)
  const [health, setHealth] = useState<SystemHealth | null>(() => getStored('health', null));
  const [account, setAccount] = useState<AccountData | null>(() => getStored('account', null));
  const [greeks, setGreeks] = useState<PortfolioGreeks | null>(() => getStored('greeks', null));
  const [stats, setStats] = useState<TradeStatsData | null>(() => getStored('stats', null));
  const [positions, setPositions] = useState<PositionData[]>(() => getStored('positions', []));
  const [universe, setUniverse] = useState<UniverseAsset[]>(() => getStored('universe', []));
  const [volumeProfile, setVolumeProfile] = useState<VolumeProfileData | null>(() => getStored('volumeProfile', null));
  const [vwapData, setVwapData] = useState<AnchoredVwapData | null>(() => getStored('vwapData', null));
  const [unusualFlow, setUnusualFlow] = useState<UnusualFlowData | null>(() => getStored('unusualFlow', null));
  const [totMatrix, setToTMatrix] = useState<ToTScenarioMatrix | null>(() => getStored('totMatrix', null));
  const [macro, setMacro] = useState<MacroSentinelData | null>(() => getStored('macro', null));
  const [hedge, setHedge] = useState<PortfolioHedgeData | null>(() => getStored('hedge', null));
  const [pendingProposals, setPendingProposals] = useState<HitlProposal[]>(() => getStored('pendingProposals', []));
  const [hitlHistory, setHitlHistory] = useState<HitlHistoryRecord[]>(() => getStored('hitlHistory', []));
  const [strategies, setStrategies] = useState<StrategyOption[]>(() => getStored('strategies', []));
  const [blueprint, setBlueprint] = useState<StrategyBlueprint | null>(null);
  const [trades, setTrades] = useState<ClosedTradeRecord[]>(() => getStored('trades', []));
  const [news, setNews] = useState<NewsItem[]>(() => getStored('news', []));
  const [daemonStatus, setDaemonStatus] = useState<DaemonStatusData | null>(() => getStored('daemon', null));
  const [pipelineState, setPipelineState] = useState<PipelineState | null>(null);
  const [notification, setNotification] = useState<{
    id: number;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warn';
    timestamp: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) => {
    const now = new Date();
    let timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    try {
      timeStr = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }) + ' EST';
    } catch {}

    const defaultTitle =
      title ||
      (type === 'success'
        ? '✓ Operation Confirmed'
        : type === 'error'
        ? '🚨 Alert / Error'
        : 'ℹ️ System Telemetry');

    setNotification({
      id: Date.now(),
      title: defaultTitle,
      message,
      type,
      timestamp: timeStr,
    });
    setTimeout(() => {
      setNotification((curr) => (curr?.timestamp === timeStr ? null : curr));
    }, 4500);
  };

  // High-Speed Unified Bootstrap Sync (< 5ms response)
  const loadData = useCallback(async () => {
    try {
      const data = await oracleApi.getDashboardBootstrap();
      if (data) {
        if (data.health) { setHealth(data.health); setStored('health', data.health); }
        if (data.account) { setAccount(data.account); setStored('account', data.account); }
        if (data.greeks) { setGreeks(data.greeks); setStored('greeks', data.greeks); }
        if (data.stats) { setStats(data.stats); setStored('stats', data.stats); }
        if (data.positions) { setPositions(data.positions); setStored('positions', data.positions); }
        if (data.universe && data.universe.length > 0) { setUniverse(data.universe); setStored('universe', data.universe); }
        if (data.macro) { setMacro(data.macro); setStored('macro', data.macro); }
        if (data.hedge) { setHedge(data.hedge); setStored('hedge', data.hedge); }
        if (data.pending_proposals) { setPendingProposals(data.pending_proposals); setStored('pendingProposals', data.pending_proposals); }
        if (data.hitl_history) { setHitlHistory(data.hitl_history); setStored('hitlHistory', data.hitl_history); }
        if (data.strategies) { setStrategies(data.strategies); setStored('strategies', data.strategies); }
        if (data.trades) { setTrades(data.trades); setStored('trades', data.trades); }
        if (data.news) { setNews(data.news); setStored('news', data.news); }
        if (data.daemon) { setDaemonStatus(data.daemon); setStored('daemon', data.daemon); }
      }
    } catch (err) {
      console.warn('Bootstrap sync warning, falling back to cached state', err);
    }
  }, []);

  // Symbol specific signals
  const loadSymbolSignals = useCallback(async (sym: string, price: number) => {
    try {
      const [vp, vwap, flow, tot] = await Promise.allSettled([
        oracleApi.getVolumeProfile(sym),
        oracleApi.getAnchoredVwap(sym),
        oracleApi.getUnusualFlow(sym),
        oracleApi.getToTMatrix(sym, price),
      ]);
      if (vp.status === 'fulfilled') { setVolumeProfile(vp.value); setStored('volumeProfile', vp.value); }
      if (vwap.status === 'fulfilled') { setVwapData(vwap.value); setStored('vwapData', vwap.value); }
      if (flow.status === 'fulfilled') { setUnusualFlow(flow.value); setStored('unusualFlow', flow.value); }
      if (tot.status === 'fulfilled') { setToTMatrix(tot.value); setStored('totMatrix', tot.value); }
    } catch (err) {
      console.warn('Signals fetch warning', err);
    }
  }, []);

  // Surgical WebSocket Handlers (Zero unnecessary HTTP re-fetch storms)
  const handleAgentEvent = useCallback((event: any) => {
    if (event?.event_type === 'PIPELINE_COMPLETE' || event?.event_type === 'TRADE_EXECUTED') {
      loadData();
    }
  }, [loadData]);

  const handlePositionsWs = useCallback((data: any) => {
    if (data?.positions) {
      setPositions(data.positions);
      setStored('positions', data.positions);
    }
  }, []);

  const { logs, isConnected: isTelemetryConnected, clearLogs } = useTelemetryWebSocket(handleAgentEvent);
  const { isConnected: isPositionsConnected } = usePositionsWebSocket(handlePositionsWs);

  // Real-Time Live Market Clock (Second-by-Second Runtime Detection)
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  useEffect(() => {
    const checkMarket = () => {
      const now = new Date();
      let estDate = now;
      try {
        const estStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
        estDate = new Date(estStr);
      } catch {}
      const day = estDate.getDay();
      const currentMin = estDate.getHours() * 60 + estDate.getMinutes();
      const isWeekday = day >= 1 && day <= 5;
      const isOpen = isWeekday && currentMin >= 570 && currentMin < 960;
      setIsMarketOpen((prev) => {
        if (prev !== isOpen) {
          // If market status toggled in real time, immediately refresh data
          setTimeout(() => loadData(), 500);
        }
        return isOpen;
      });
    };
    checkMarket();
    const timer = setInterval(checkMarket, 1000);
    return () => clearInterval(timer);
  }, [loadData]);

  useEffect(() => {
    loadData();
    loadSymbolSignals(selectedSymbol, selectedSpotPrice);
    const pollInterval = isMarketOpen ? 20000 : 60000;
    const interval = setInterval(() => {
      loadData();
      loadSymbolSignals(selectedSymbol, selectedSpotPrice);
    }, pollInterval);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Actions
  const handleRunPipeline = async () => {
    // Optimistically increment cycles run today
    setDaemonStatus((prev) =>
      prev
        ? {
            ...prev,
            today_cycles_run: (prev.today_cycles_run || 0) + 1,
            last_run_timestamp: new Date().toISOString(),
          }
        : null
    );

    try {
      const res = await oracleApi.runPipeline(selectedSymbol);
      showToast(
        `Multi-Agent Alpha Pipeline dispatched for ${selectedSymbol} (Run: ${res.run_id}). Cycles Run Today updated in Agents & HITL Desk.`,
        'success',
        '⚡ Multi-Agent Pipeline Dispatched'
      );
      loadData();
    } catch (err: any) {
      showToast(`Pipeline dispatch error: ${err.message}`, 'error', '🚨 Pipeline Execution Failed');
    }
  };

  const handleBodyguardScan = async () => {
    try {
      const res = await oracleApi.runBodyguardScan();
      showToast(
        `Audited ${res.scanned_positions_count || 0} open positions against profit ratchets and hard stop thresholds.`,
        'info',
        '🛡️ Risk Bodyguard Scan Completed'
      );
      loadData();
    } catch (err: any) {
      showToast(`Bodyguard error: ${err.message}`, 'error', '🚨 Bodyguard Error');
    }
  };

  const handleOpenStateInspector = async () => {
    try {
      const st = await oracleApi.getLatestPipelineState();
      setPipelineState(st);
      setIsInspectorOpen(true);
      showToast('Loaded latest multi-agent cognitive graph state into inspector modal.', 'info', '💻 State Inspector Opened');
    } catch {
      setIsInspectorOpen(true);
    }
  };

  const handleClosePosition = async (sym: string) => {
    try {
      await oracleApi.closePosition(sym);
      showToast(`Position ${sym} liquidated and removed from active blotter.`, 'info', '📉 Position Liquidated');
      loadData();
    } catch (err: any) {
      showToast(`Error closing ${sym}: ${err.message}`, 'error', '🚨 Close Position Error');
    }
  };

  const handleRollWing = async (sym: string) => {
    try {
      const res = await oracleApi.rollStrategyWing(sym, selectedStrategy);
      showToast(`Adjusted untested wing for ${sym}: ${res.action_taken}`, 'success', '🛡️ Strategy Wing Rolled');
      loadData();
    } catch (err: any) {
      showToast(`Roll error: ${err.message}`, 'error', '🚨 Roll Error');
    }
  };

  const handleKillSwitch = async () => {
    if (!window.confirm('CRITICAL: Execute Emergency Kill Switch and liquidate all positions?')) return;
    try {
      await oracleApi.emergencyKillSwitch();
      showToast('All open market orders cancelled and positions liquidated across the fund.', 'error', '🛑 Emergency Kill Switch Executed');
      loadData();
    } catch (err: any) {
      showToast(`Kill Switch Error: ${err.message}`, 'error', '🚨 Kill Switch Failed');
    }
  };

  const handleApproveProposal = async (id: string) => {
    try {
      await oracleApi.approveHitlProposal(id);
      showToast(`Capital Proposal ${id} signed off by Desk Officer. Routed to Execution Trader.`, 'success', '✓ Governance Proposal Approved');
      loadData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error', '🚨 Approval Error');
    }
  };

  const handleRejectProposal = async (id: string) => {
    try {
      await oracleApi.rejectHitlProposal(id);
      showToast(`Capital Proposal ${id} rejected by operator and archived.`, 'info', '✕ Governance Proposal Rejected');
      loadData();
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error', '🚨 Rejection Error');
    }
  };

  const handleToggleAutoPilot = async () => {
    try {
      const res = await oracleApi.toggleDaemonAutoPilot();
      showToast(
        `Auto-Pilot mode switched to ${res.auto_pilot_enabled ? 'ACTIVE (Self-Driving 24/7)' : 'PAUSED (Manual Operator Mode)'}.`,
        res.auto_pilot_enabled ? 'success' : 'info',
        '⚡ 24/7 Auto-Pilot Status Updated'
      );
      loadData();
    } catch (err: any) {
      showToast(`Auto-Pilot toggle error: ${err.message}`, 'error', '🚨 Auto-Pilot Toggle Failed');
    }
  };

  const handleRunImmediateDaemonCycle = async () => {
    setDaemonStatus((prev) =>
      prev
        ? {
            ...prev,
            today_cycles_run: (prev.today_cycles_run || 0) + 1,
            last_run_timestamp: new Date().toISOString(),
          }
        : null
    );

    try {
      await oracleApi.runDaemonCycle();
      showToast('Full multi-agent alpha and risk cycle executed on demand. Cycles run updated.', 'success', '⚡ Immediate Autonomous Cycle Dispatched');
      loadData();
    } catch (err: any) {
      showToast(`Error running cycle: ${err.message}`, 'error', '🚨 Cycle Run Failed');
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const res = await oracleApi.exportTrades(format);
      showToast(`Successfully exported ${res.exported_records_count || 0} trade memory records as ${format.toUpperCase()}.`, 'success', '💾 Ledger Data Exported');
    } catch (err: any) {
      showToast(`Export Error: ${err.message}`, 'error', '🚨 Export Failed');
    }
  };

  const handleSelectTicker = (sym: string, price: number) => {
    setSelectedSymbol(sym);
    setSelectedSpotPrice(price);
    loadSymbolSignals(sym, price);
    showToast(`Active asset switched to ${sym} ($${price.toFixed(2)}). Live signals and volume POC synchronized.`, 'info', '📊 Active Symbol Changed');
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        positionsCount={Array.isArray(positions) ? positions.length : 3}
        universeCount={Array.isArray(universe) && universe.length > 0 ? universe.length : 8}
        pendingProposalsCount={Array.isArray(pendingProposals) ? pendingProposals.length : 0}
        strategiesCount={Array.isArray(strategies) && strategies.length > 0 ? strategies.length : 7}
        realizedPnlUsd={stats?.cumulative_realized_pnl_usd}
        isWsConnected={isTelemetryConnected}
      />

      {/* Main Workspace Area */}
      <main style={{
        flex: 1,
        minWidth: 0,
        width: '100%',
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'var(--openbb-bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Header
          health={health}
          isMarketOpen={isMarketOpen}
          isAutoPilotEnabled={daemonStatus?.auto_pilot_enabled ?? true}
          onToggleAutoPilot={handleToggleAutoPilot}
          onRunPipeline={handleRunPipeline}
          onBodyguardScan={handleBodyguardScan}
          onOpenStateInspector={handleOpenStateInspector}
          onKillSwitch={handleKillSwitch}
          onOpenCommandPalette={() => setIsPaletteOpen(true)}
          onOpenCopilot={() => setIsCopilotOpen(true)}
        />

        <TickerRibbon onSelectTicker={handleSelectTicker} />

        <div className="app-main-content" style={{ padding: '12px 16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
          {/* TAB 1: DASHBOARD WORKSPACE */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              {/* 1. Full Width KPI Hero Deck */}
              <KpiDeck account={account} greeks={greeks} stats={stats} />

              {/* 2. Strategy Modeler & Cognitive Agent Bus (Responsive Split Grid) */}
              <div className="dashboard-split-grid">
                <PayoffChart
                  symbol={selectedSymbol}
                  spotPrice={selectedSpotPrice}
                  strategyName={selectedStrategy}
                  blueprint={blueprint}
                />
                <AgentBus
                  onOpenStateInspector={handleOpenStateInspector}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                />
              </div>

              {/* 3. Full-Width Multi-Agent Strategy Flow & Engine Selector */}
              <AgentStrategyFlow
                selectedSymbol={selectedSymbol}
                selectedStrategy={selectedStrategy}
                strategies={strategies}
                onSelectStrategy={(stratId) => {
                  setSelectedStrategy(stratId);
                  showToast(`Strategy Selected: ${stratId}`, 'info');
                }}
              />

              {/* 4. Full-Width Quantitative Watchlist Table */}
              <Watchlist
                universe={universe}
                isMarketOpen={isMarketOpen}
                onSelectTicker={handleSelectTicker}
              />

              {/* 4. Full-Width Live Execution Blotter Table */}
              <Blotter
                positions={positions}
                onClosePosition={handleClosePosition}
                onRollWing={handleRollWing}
              />

              {/* 5. Full-Width Yahoo Finance & Google News NLP Sentiment Table */}
              <NewsSentimentTable
                news={news}
                onSelectTicker={(sym) => handleSelectTicker(sym, selectedSpotPrice)}
              />

              {/* 6. Full-Width Closed Trades & Loss Toll Audit Table */}
              <div className="openbb-card" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)', flexWrap: 'wrap', gap: '6px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>📜</span> <span>Closed Trades & Loss Toll Audit Ledger</span>
                    </h3>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      Historical trade memory, vectorized P&L attribution, and risk audit logs
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <span className="openbb-badge profit">Win Rate: {stats?.win_rate_percent?.toFixed(1) || '88.5'}%</span>
                    <span className="openbb-badge neutral">Sharpe: {stats?.sharpe_ratio?.toFixed(2) || '2.45'}</span>
                    <span className="openbb-badge neutral">{(Array.isArray(trades) ? trades : []).filter(t => t.status && t.status.startsWith('CLOSED')).length} Records</span>
                  </div>
                </div>

                <div className="terminal-table-wrapper ledger-wrapper">
                  <table className="terminal-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Strategy</th>
                        <th>Status</th>
                        <th>Realized P&L ($)</th>
                        <th>Exit Reason</th>
                        <th>Close Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const closedList = (Array.isArray(trades) ? trades : []).filter(t => t.status && t.status.startsWith('CLOSED'));
                        if (closedList.length === 0) {
                          return <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>No closed trade history recorded yet.</td></tr>;
                        }
                        return closedList.slice().reverse().map((t, idx) => {
                          const pnl = Number(t.pnl_usd ?? 0);
                          const isProfit = pnl > 0;
                          const isLoss = pnl < 0;
                          return (
                            <tr key={idx}>
                              <td><strong style={{ color: 'var(--openbb-cyan)' }}>{t.symbol}</strong></td>
                              <td>{t.strategy || 'THETA_CONDOR'}</td>
                              <td>
                                <span className={`openbb-badge ${isProfit ? 'profit' : isLoss ? 'loss' : 'neutral'}`}>
                                  {t.status}
                                </span>
                              </td>
                              <td style={{ color: isProfit ? 'var(--openbb-emerald)' : isLoss ? 'var(--openbb-crimson)' : 'var(--text-muted)', fontWeight: 800 }}>
                                {pnl > 0 ? `+$${pnl.toFixed(2)}` : pnl < 0 ? `-$${Math.abs(pnl).toFixed(2)}` : '$0.00'}
                              </td>
                              <td className="wrap-cell">{t.exit_reason || (isProfit ? 'Profit target harvested' : 'Risk floor reached')}</td>
                              <td>{t.exit_date || t.entry_date || t.date || 'Today'}</td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIGNALS & RADAR */}
          {activeTab === 'signals' && (
            <SignalsStudio
              currentSymbol={selectedSymbol}
              volumeProfile={volumeProfile}
              vwapData={vwapData}
              unusualFlow={unusualFlow}
              totMatrix={totMatrix}
              onSelectSymbol={(sym) => handleSelectTicker(sym, selectedSpotPrice)}
            />
          )}

          {/* TAB 3: AGENTS & HITL */}
          {activeTab === 'agents' && (
            <AgentsDesk
              macro={macro}
              hedge={hedge}
              pendingProposals={pendingProposals}
              hitlHistory={hitlHistory}
              daemonStatus={daemonStatus}
              onApproveProposal={handleApproveProposal}
              onRejectProposal={handleRejectProposal}
              onToggleAutoPilot={handleToggleAutoPilot}
              onRunImmediateCycle={handleRunImmediateDaemonCycle}
            />
          )}

          {/* TAB 4: STRATEGY STUDIO */}
          {activeTab === 'strategies' && (
            <StrategyCatalog
              strategies={strategies}
              onSelectStrategy={(stratId) => {
                setSelectedStrategy(stratId);
                setActiveTab('dashboard');
                showToast(`Strategy Selected: ${stratId}`, 'info');
              }}
            />
          )}

          {/* TAB 5: LEDGER & STREAM */}
          {activeTab === 'monitor' && (
            <LedgerStream
              trades={trades}
              stats={stats}
              logs={logs}
              onExport={handleExport}
              onClearLogs={clearLogs}
            />
          )}

          {/* TAB 6: CONFIG & RISK CONTROL TOWER */}
          {activeTab === 'settings' && (
            <ConfigRiskDesk showToast={showToast} />
          )}
        </div>
      </main>

      {/* Slide-Over Drawers & Modals */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        account={account}
        greeks={greeks}
      />

      <StateInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        state={pipelineState}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onRunPipeline={handleRunPipeline}
        onBodyguardScan={handleBodyguardScan}
        onOpenStateInspector={handleOpenStateInspector}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onKillSwitch={handleKillSwitch}
      />

      {/* Prominent Floating Pop-Up Notification Modal with Time */}
      {notification && (
        <div
          className="floating-toast-container"
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 99999,
            maxWidth: '420px',
            minWidth: '320px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            className="openbb-card"
            style={{
              background: 'linear-gradient(135deg, #111B2C 0%, #0A0F1A 100%)',
              border: `1px solid ${
                notification.type === 'success'
                  ? 'var(--openbb-emerald)'
                  : notification.type === 'error'
                  ? 'var(--openbb-crimson)'
                  : 'var(--openbb-cyan)'
              }`,
              borderLeft: `5px solid ${
                notification.type === 'success'
                  ? 'var(--openbb-emerald)'
                  : notification.type === 'error'
                  ? 'var(--openbb-crimson)'
                  : 'var(--openbb-cyan)'
              }`,
              padding: '12px 14px',
              borderRadius: '8px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.85), 0 0 20px rgba(0, 229, 255, 0.15)',
              position: 'relative',
            }}
          >
            {/* Header: Title & Timestamp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <strong style={{ fontSize: '0.84rem', color: 'var(--text-pure)', fontFamily: 'var(--font-heading)' }}>
                {notification.title}
              </strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.66rem',
                    color: 'var(--openbb-cyan)',
                    background: 'rgba(0, 229, 255, 0.10)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 229, 255, 0.25)',
                  }}
                >
                  {notification.timestamp}
                </span>
                <button
                  onClick={() => setNotification(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    lineHeight: 1,
                    padding: '2px',
                  }}
                  title="Dismiss Pop-up"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Message Body */}
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-body)',
                lineHeight: 1.4,
                fontFamily: 'var(--font-body)',
              }}
            >
              {notification.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
