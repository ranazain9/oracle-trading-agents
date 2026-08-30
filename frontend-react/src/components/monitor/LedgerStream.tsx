import React, { useState, useMemo } from 'react';
import { TelemetryLogMessage } from '../../api/types';
import {
  Trash2,
  Radio,
  Activity,
  Filter,
  CheckCircle2,
  AlertCircle,
  Shield,
  Cpu,
  RefreshCw,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
  Layers,
  Search,
} from 'lucide-react';

interface LedgerStreamProps {
  trades: any[];
  logs: TelemetryLogMessage[];
  stats?: any;
  onExport?: (format: 'json' | 'csv') => Promise<void> | void;
  onClearLogs: () => void;
}

export const LedgerStream: React.FC<LedgerStreamProps> = ({ trades, logs, stats, onExport, onClearLogs }) => {
  const [filterAgent, setFilterAgent] = useState<string>('ALL');
  const [tickerFilter, setTickerFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const tradeList = Array.isArray(trades) ? trades : [];
  const logList = Array.isArray(logs) ? logs : [];

  // 1. Quantitative Ledger Analytics Calculation
  const analytics = useMemo(() => {
    let totalPnl = 0;
    let wins = 0;
    let losses = 0;
    let grossProfit = 0;
    let grossLoss = 0;

    tradeList.forEach((t) => {
      const pnl = Number(t.pnl_usd ?? 0);
      totalPnl += pnl;
      if (pnl > 0) {
        wins += 1;
        grossProfit += pnl;
      } else if (pnl < 0) {
        losses += 1;
        grossLoss += Math.abs(pnl);
      }
    });

    const totalClosed = tradeList.length;
    const winRate = totalClosed > 0 ? (wins / totalClosed) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;

    return {
      totalPnl,
      totalClosed,
      wins,
      losses,
      winRate,
      profitFactor,
      grossProfit,
      grossLoss,
    };
  }, [tradeList]);

  // 2. Filtered Trades
  const filteredTrades = useMemo(() => {
    return tradeList.slice().reverse().filter((t) => {
      if (tickerFilter !== 'ALL' && t.symbol !== tickerFilter) return false;
      if (statusFilter === 'PROFIT' && (t.pnl_usd ?? 0) <= 0) return false;
      if (statusFilter === 'LOSS' && (t.pnl_usd ?? 0) >= 0) return false;
      if (statusFilter === 'STOPPED' && !String(t.status).includes('STOP')) return false;
      return true;
    });
  }, [tradeList, tickerFilter, statusFilter]);

  // 3. Filtered Clean Logs (Removing any PONG heartbeat strings)
  const cleanLogs = useMemo(() => {
    return logList.filter(
      (l) => l.message && !l.message.includes('"PONG"') && l.message !== '{"event_type":"PONG"}'
    );
  }, [logList]);

  const filteredLogs = useMemo(() => {
    return filterAgent === 'ALL'
      ? cleanLogs
      : cleanLogs.filter((l) => (l.agent || '').toUpperCase().includes(filterAgent.toUpperCase()));
  }, [cleanLogs, filterAgent]);

  const uniqueTickers = Array.from(new Set(tradeList.map((t) => t.symbol).filter(Boolean)));

  const handleExportCsv = () => {
    if (onExport) {
      onExport('csv');
      return;
    }
    const headers = ['Symbol', 'Strategy', 'Status', 'Realized_PnL_USD', 'Exit_Reason', 'Date'];
    const rows = tradeList.map((t) => [
      t.symbol,
      t.strategy || 'THETA_CONDOR',
      t.status,
      t.pnl_usd ?? 0,
      `"${(t.exit_reason || '').replace(/"/g, '""')}"`,
      t.entry_date || t.date || 'Today',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oracle_closed_trades_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getAgentColor = (agent?: string) => {
    if (!agent) return { bg: 'rgba(255, 255, 255, 0.08)', text: 'var(--text-muted)', border: 'rgba(255, 255, 255, 0.15)' };
    const a = agent.toUpperCase();
    if (a.includes('MACRO')) return { bg: 'rgba(255, 183, 3, 0.15)', text: 'var(--openbb-amber)', border: 'rgba(255, 183, 3, 0.4)' };
    if (a.includes('SCOUT') || a.includes('MARKET')) return { bg: 'rgba(0, 229, 255, 0.15)', text: 'var(--openbb-cyan)', border: 'rgba(0, 229, 255, 0.4)' };
    if (a.includes('STRATEGY') || a.includes('BRAIN')) return { bg: 'rgba(168, 85, 247, 0.15)', text: 'var(--openbb-purple)', border: 'rgba(168, 85, 247, 0.4)' };
    if (a.includes('HITL') || a.includes('SUPERVISOR')) return { bg: 'rgba(0, 230, 118, 0.15)', text: 'var(--openbb-emerald)', border: 'rgba(0, 230, 118, 0.4)' };
    if (a.includes('BODYGUARD') || a.includes('RISK')) return { bg: 'rgba(255, 59, 48, 0.15)', text: 'var(--openbb-crimson)', border: 'rgba(255, 59, 48, 0.4)' };
    if (a.includes('HEDGE')) return { bg: 'rgba(59, 130, 246, 0.15)', text: '#60A5FA', border: 'rgba(59, 130, 246, 0.4)' };
    if (a.includes('TRADER') || a.includes('ORDER')) return { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ADE80', border: 'rgba(34, 197, 94, 0.4)' };
    return { bg: 'rgba(0, 229, 255, 0.12)', text: 'var(--openbb-cyan)', border: 'rgba(0, 229, 255, 0.35)' };
  };

  const formatExitReasonBadge = (reason?: string, status?: string) => {
    if (!reason) return <span style={{ color: 'var(--text-dim)' }}>Standard Exit</span>;
    const r = reason.toLowerCase();
    const s = String(status || '').toUpperCase();

    if (r.includes('profit') || s.includes('PROFIT')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(0, 230, 118, 0.12)',
            color: 'var(--openbb-emerald)',
            border: '1px solid rgba(0, 230, 118, 0.35)',
            padding: '2px 7px',
            borderRadius: '4px',
            fontSize: '0.66rem',
            fontWeight: 700,
          }}
          title={reason}
        >
          <CheckCircle2 size={11} /> +50% Profit Ratchet Target Lock
        </span>
      );
    }
    if (r.includes('stop') || s.includes('STOP')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 59, 48, 0.12)',
            color: 'var(--openbb-crimson)',
            border: '1px solid rgba(255, 59, 48, 0.35)',
            padding: '2px 7px',
            borderRadius: '4px',
            fontSize: '0.66rem',
            fontWeight: 700,
          }}
          title={reason}
        >
          <AlertCircle size={11} /> -$150.00 Hard Stop Floor Liquidated
        </span>
      );
    }
    if (r.includes('0dte') || r.includes('friday') || r.includes('assignment')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 183, 3, 0.12)',
            color: 'var(--openbb-amber)',
            border: '1px solid rgba(255, 183, 3, 0.35)',
            padding: '2px 7px',
            borderRadius: '4px',
            fontSize: '0.66rem',
            fontWeight: 700,
          }}
          title={reason}
        >
          <Shield size={11} /> 0DTE Friday Assignment Risk-Off
        </span>
      );
    }
    if (r.includes('clean_slate') || r.includes('reset')) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-muted)',
            border: '1px solid var(--openbb-border)',
            padding: '2px 7px',
            borderRadius: '4px',
            fontSize: '0.66rem',
            fontWeight: 700,
          }}
          title={reason}
        >
          <RefreshCw size={11} /> Session Clean Slate Reset
        </span>
      );
    }
    return <span style={{ color: 'var(--text-body)' }}>{reason}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 1. Quantitative Performance Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
        }}
      >
        {/* Net Realized PnL */}
        <div
          className="openbb-card"
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(13, 21, 36, 0.95) 0%, rgba(20, 32, 54, 0.85) 100%)',
            borderLeft: `3px solid ${analytics.totalPnl >= 0 ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)'}`,
          }}
        >
          <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            NET REALIZED P&L
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: analytics.totalPnl >= 0 ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)',
              margin: '2px 0',
            }}
          >
            {analytics.totalPnl >= 0 ? '+' : ''}${analytics.totalPnl.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>
            Across {analytics.totalClosed} Executed Trades
          </div>
        </div>

        {/* Win Rate */}
        <div
          className="openbb-card"
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(13, 21, 36, 0.95) 0%, rgba(20, 32, 54, 0.85) 100%)',
            borderLeft: '3px solid var(--openbb-cyan)',
          }}
        >
          <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            HISTORICAL WIN RATE
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--openbb-cyan)',
              margin: '2px 0',
            }}
          >
            {analytics.winRate.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>
            {analytics.wins} Wins • {analytics.losses} Losses
          </div>
        </div>

        {/* Profit Factor */}
        <div
          className="openbb-card"
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(13, 21, 36, 0.95) 0%, rgba(20, 32, 54, 0.85) 100%)',
            borderLeft: '3px solid var(--openbb-purple)',
          }}
        >
          <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            PROFIT FACTOR
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--openbb-purple)',
              margin: '2px 0',
            }}
          >
            {analytics.profitFactor >= 90 ? '∞' : analytics.profitFactor.toFixed(2)}x
          </div>
          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>
            Gross: +${analytics.grossProfit.toFixed(0)} / -${analytics.grossLoss.toFixed(0)}
          </div>
        </div>

        {/* Max Loss Floor Enforced */}
        <div
          className="openbb-card"
          style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, rgba(13, 21, 36, 0.95) 0%, rgba(20, 32, 54, 0.85) 100%)',
            borderLeft: '3px solid var(--openbb-amber)',
          }}
        >
          <div style={{ fontSize: '0.66rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            RISK BODYGUARD LIMIT
          </div>
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              color: 'var(--openbb-amber)',
              margin: '2px 0',
            }}
          >
            -$150.00 Max
          </div>
          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>
            Hard Circuit Breaker Active
          </div>
        </div>
      </div>

      {/* 2. Closed Trades Ledger Table */}
      <div className="openbb-card">
        {/* Header Bar with Filters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--openbb-border)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.90rem', fontWeight: 800, color: 'var(--text-pure)' }}>
                📜 Realized Closed Trades & PnL Attribution Ledger
              </h3>
              <span className="openbb-badge neutral" style={{ fontSize: '0.60rem' }}>
                {filteredTrades.length} of {tradeList.length} Trades
              </span>
            </div>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              100% Autonomous Options Execution History & Stop/Ratchet Audit
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Ticker Filter Chips */}
            <div style={{ display: 'flex', gap: '3px' }}>
              <button
                onClick={() => setTickerFilter('ALL')}
                style={{
                  background: tickerFilter === 'ALL' ? 'var(--openbb-cyan)' : 'rgba(255, 255, 255, 0.05)',
                  color: tickerFilter === 'ALL' ? '#000000' : 'var(--text-dim)',
                  border: '1px solid var(--openbb-border)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '0.60rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ALL
              </button>
              {uniqueTickers.map((sym) => (
                <button
                  key={sym}
                  onClick={() => setTickerFilter(sym)}
                  style={{
                    background: tickerFilter === sym ? 'var(--openbb-cyan)' : 'rgba(255, 255, 255, 0.05)',
                    color: tickerFilter === sym ? '#000000' : 'var(--text-dim)',
                    border: '1px solid var(--openbb-border)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.60rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {sym}
                </button>
              ))}
            </div>

            {/* Outcome Filter */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {(['ALL', 'PROFIT', 'STOPPED'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setStatusFilter(mode)}
                  style={{
                    background: statusFilter === mode ? 'var(--openbb-bg-elevated)' : 'transparent',
                    color: statusFilter === mode ? 'var(--text-pure)' : 'var(--text-dim)',
                    border: `1px solid ${statusFilter === mode ? 'var(--openbb-cyan)' : 'var(--openbb-border)'}`,
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.60rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {mode === 'PROFIT' ? '✓ Profit' : mode === 'STOPPED' ? '✕ Stopped' : 'All Types'}
                </button>
              ))}
            </div>

            {/* Export CSV Button */}
            <button className="btn-terminal" onClick={handleExportCsv} title="Export Closed Trades to CSV">
              <Download size={11} /> Export CSV
            </button>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="table-responsive-wrapper" style={{ maxHeight: '280px', overflowY: 'auto', width: '100%' }}>
          <table className="openbb-table" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 5, background: '#0D1422' }}>
              <tr>
                <th style={{ width: '10%' }}>Symbol</th>
                <th style={{ width: '18%' }}>Strategy</th>
                <th style={{ width: '14%' }}>Status</th>
                <th style={{ width: '14%' }}>Realized P&L</th>
                <th style={{ width: '32%' }}>Exit Reason & Risk Attribution</th>
                <th style={{ width: '12%' }}>Close Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px 0' }}>
                    No trades match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((t, idx) => {
                  const pnl = Number(t.pnl_usd ?? 0);
                  const isProfit = pnl > 0;
                  const isLoss = pnl < 0;

                  return (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)' }}>
                      {/* Symbol */}
                      <td>
                        <strong
                          style={{
                            color: 'var(--openbb-cyan)',
                            fontFamily: 'var(--font-heading)',
                            fontSize: '0.80rem',
                            letterSpacing: '0.3px',
                          }}
                        >
                          {t.symbol}
                        </strong>
                      </td>

                      {/* Strategy */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-body)',
                            background: 'rgba(255, 255, 255, 0.04)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid var(--openbb-border)',
                          }}
                        >
                          {t.strategy || 'THETA_CONDOR'}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`openbb-badge ${isProfit ? 'profit' : isLoss ? 'loss' : 'neutral'}`}
                          style={{ fontSize: '0.62rem', fontWeight: 800 }}
                        >
                          {t.status}
                        </span>
                      </td>

                      {/* Realized PnL */}
                      <td>
                        <span
                          style={{
                            color: isProfit ? 'var(--openbb-emerald)' : isLoss ? 'var(--openbb-crimson)' : 'var(--text-muted)',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                          }}
                        >
                          {pnl > 0 ? `+$${pnl.toFixed(2)}` : pnl < 0 ? `-$${Math.abs(pnl).toFixed(2)}` : '$0.00'}
                        </span>
                      </td>

                      {/* Exit Reason */}
                      <td className="wrap-cell">
                        {formatExitReasonBadge(t.exit_reason, t.status)}
                      </td>

                      {/* Date */}
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                        {t.entry_date || t.date || t.exit_date || '2026-08-29'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Real-Time WebSocket Telemetry & Log Stream */}
      <div className="openbb-card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            paddingBottom: '6px',
            borderBottom: '1px solid var(--openbb-border)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-pure)' }}>
                📡 Real-Time Agent Telemetry & Log Stream
              </h3>
              <span
                className="openbb-badge profit"
                style={{ fontSize: '0.60rem', background: 'rgba(0, 230, 118, 0.15)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <span className="pulse-dot-green" /> 15s HEARTBEAT ACTIVE
              </span>
            </div>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              WebSocket channel: <code style={{ color: 'var(--openbb-cyan)' }}>/ws/telemetry</code> • Live Cognitive State Bus
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {['ALL', 'MACRO', 'SCOUT', 'BRAIN', 'BODYGUARD', 'SYSTEM'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterAgent(tag)}
                  style={{
                    background: filterAgent === tag ? 'var(--openbb-cyan)' : 'rgba(255, 255, 255, 0.05)',
                    color: filterAgent === tag ? '#000000' : 'var(--text-dim)',
                    border: '1px solid var(--openbb-border)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.60rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>

            <button className="btn-terminal" onClick={onClearLogs} title="Clear Terminal Logs">
              <Trash2 size={11} /> Clear
            </button>
          </div>
        </div>

        {/* Terminal Console View */}
        <div
          style={{
            background: 'linear-gradient(180deg, #05080E 0%, #030509 100%)',
            padding: '10px 14px',
            borderRadius: '6px',
            height: '240px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            border: '1px solid var(--openbb-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.8)',
          }}
        >
          {filteredLogs.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-dim)',
                gap: '8px',
              }}
            >
              <Radio size={20} className="spin-slow" style={{ color: 'var(--openbb-cyan)', opacity: 0.6 }} />
              <span>Listening for autonomous multi-agent cognitive events on /ws/telemetry...</span>
            </div>
          ) : (
            filteredLogs.map((l, idx) => {
              const colorInfo = getAgentColor(l.agent);
              const isError = l.level === 'ERROR';
              const isWarn = l.level === 'WARN';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    lineHeight: '1.4',
                    color: isError ? 'var(--openbb-crimson)' : isWarn ? 'var(--openbb-amber)' : 'var(--text-body)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                    paddingBottom: '3px',
                  }}
                >
                  {/* Timestamp */}
                  <span style={{ color: 'var(--text-dim)', flexShrink: 0, fontSize: '0.68rem' }}>
                    [{l.timestamp}]
                  </span>

                  {/* Agent Badge */}
                  {l.agent && (
                    <span
                      style={{
                        background: colorInfo.bg,
                        color: colorInfo.text,
                        border: `1px solid ${colorInfo.border}`,
                        padding: '0 5px',
                        borderRadius: '3px',
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {l.agent.toUpperCase()}
                    </span>
                  )}

                  {/* Level Pill if WARN or ERROR */}
                  {(isError || isWarn) && (
                    <span
                      style={{
                        background: isError ? 'rgba(255, 59, 48, 0.2)' : 'rgba(255, 183, 3, 0.2)',
                        color: isError ? 'var(--openbb-crimson)' : 'var(--openbb-amber)',
                        padding: '0 4px',
                        borderRadius: '3px',
                        fontSize: '0.60rem',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {l.level}
                    </span>
                  )}

                  {/* Message Content */}
                  <span style={{ flex: 1, wordBreak: 'break-word' }}>{l.message}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
