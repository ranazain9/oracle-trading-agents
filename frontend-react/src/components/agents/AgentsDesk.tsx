import React from 'react';
import { MacroSentinelData, PortfolioHedgeData, HitlProposal, HitlHistoryRecord, DaemonStatusData } from '../../api/types';
import { Zap, Clock, Shield, Activity, Calendar, Play, CheckCircle } from 'lucide-react';

interface AgentsDeskProps {
  macro: MacroSentinelData | null;
  hedge: PortfolioHedgeData | null;
  pendingProposals: HitlProposal[];
  hitlHistory: HitlHistoryRecord[];
  daemonStatus?: DaemonStatusData | null;
  onApproveProposal: (id: string) => void;
  onRejectProposal: (id: string) => void;
  onToggleAutoPilot?: () => void;
  onRunImmediateCycle?: () => void;
}

export const AgentsDesk: React.FC<AgentsDeskProps> = ({
  macro,
  hedge,
  pendingProposals,
  hitlHistory,
  daemonStatus,
  onApproveProposal,
  onRejectProposal,
  onToggleAutoPilot,
  onRunImmediateCycle,
}) => {
  const proposals = Array.isArray(pendingProposals) ? pendingProposals : [];
  const history = Array.isArray(hitlHistory) ? hitlHistory : [];

  const isAutoPilotOn = daemonStatus?.auto_pilot_enabled ?? true;
  const currentPhase = daemonStatus?.current_phase || 'OVERNIGHT_STANDBY';
  const nextEvent = daemonStatus?.next_scheduled_event || '09:30 AM EST';
  const statusMsg = daemonStatus?.status_message || 'Auto-Pilot standing by for next market session.';
  const cyclesToday = daemonStatus?.today_cycles_run ?? 0;

  const agents = [
    { id: 1, name: 'Macro Sentinel', role: 'Catalyst & Treasury Radar', regime: 'Yield Curve Ingest', icon: '🌐' },
    { id: 2, name: 'Market Scout', role: 'Volume POC & Options Skew', regime: '8-Asset Scanner', icon: '📊' },
    { id: 3, name: 'Strategy Brain', role: 'ToT Scenarios & Red Team', regime: 'temp=0.0 Stress Test', icon: '🧠' },
    { id: 4, name: 'HITL Supervisor', role: 'Capital Governance Gate', regime: 'Kelly Corridor ($450-$600)', icon: '🏛️' },
    { id: 5, name: 'Execution Trader', role: 'OCC Multi-Leg Midpoint Router', regime: 'Slippage Shield', icon: '⚡' },
    { id: 6, name: 'Portfolio Hedge', role: 'Net Greek Delta-Neutral Balancer', regime: 'Beta-Weighted Hedge', icon: '🛡️' },
    { id: 7, name: 'Risk Bodyguard', role: '60s/15s Active Profit Ratchet', regime: '+50% Lock / -$150 Stop', icon: '🚨' },
    { id: 8, name: 'Analyst Memory', role: 'Episodic Long-Term Memory Synthesis', regime: 'Vectorized PnL Attribution', icon: '📈' },
  ];

  const timelinePhases = [
    {
      time: '09:00 AM EST',
      title: 'Pre-Market Diagnostics',
      desc: 'Treasury 10Y/2Y curve, MSI index, and catalyst scans.',
      phaseKey: 'PRE_MARKET_AUDIT',
      icon: <Clock size={14} style={{ color: 'var(--openbb-cyan)' }} />
    },
    {
      time: '09:30 AM EST',
      title: 'Opening Bell Execution',
      desc: '8-Node LangGraph autonomous trade generation & CBOE routing.',
      phaseKey: 'MARKET_OPEN_EXECUTION',
      icon: <Zap size={14} style={{ color: 'var(--openbb-emerald)' }} />
    },
    {
      time: '09:35 - 04:00 PM',
      title: 'Intraday Risk Bodyguard',
      desc: 'Continuous 15s profit ratchet & -$150 stop floor enforcement.',
      phaseKey: 'INTRADAY_GUARDIAN',
      icon: <Shield size={14} style={{ color: 'var(--openbb-amber)' }} />
    },
    {
      time: '04:30 PM EST',
      title: 'Post-Market Tearsheet',
      desc: 'Performance audit, vector memory synthesis, and daily report.',
      phaseKey: 'POST_MARKET_AUDIT',
      icon: <Calendar size={14} style={{ color: 'var(--openbb-purple)' }} />
    }
  ];

  return (
    <div className="fade-in-view" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* 24/7 Autonomous Market Lifecycle Card */}
      <div className="openbb-card" style={{
        background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, rgba(15, 23, 38, 0.95) 100%)',
        border: '1px solid rgba(0, 229, 255, 0.35)',
        boxShadow: '0 4px 20px rgba(0, 229, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--openbb-border)', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Zap size={16} style={{ color: 'var(--openbb-cyan)' }} />
              <span>24/7 Autonomous Market Operations & Auto-Pilot Daemon</span>
            </h3>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Self-driving trading lifecycle tracking US Market exchange sessions (NYSE / NASDAQ / CBOE)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={onToggleAutoPilot}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.70rem',
                fontWeight: 800,
                cursor: 'pointer',
                background: isAutoPilotOn
                  ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.25), rgba(0, 229, 255, 0.15))'
                  : 'rgba(255, 183, 3, 0.15)',
                color: isAutoPilotOn ? 'var(--openbb-emerald)' : 'var(--openbb-amber)',
                border: `1px solid ${isAutoPilotOn ? 'rgba(0, 230, 118, 0.5)' : 'rgba(255, 183, 3, 0.4)'}`,
                boxShadow: isAutoPilotOn ? '0 0 14px rgba(0, 230, 118, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Zap size={12} />
              <span>{isAutoPilotOn ? '24/7 AUTO-PILOT ACTIVE' : 'PAUSED (MANUAL MODE)'}</span>
            </button>

            {onRunImmediateCycle && (
              <button className="btn-terminal primary" onClick={onRunImmediateCycle} title="Trigger Full Autonomous Cycle Now">
                <Play size={12} /> Run Full Cycle
              </button>
            )}
          </div>
        </div>

        {/* Phase Status Banner */}
        <div style={{
          background: 'var(--openbb-bg-surface)',
          padding: '10px 14px',
          borderRadius: '6px',
          border: '1px solid var(--openbb-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
              Current Lifecycle Phase
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.90rem', fontWeight: 800, color: 'var(--openbb-cyan)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span className={isAutoPilotOn ? 'pulse-dot-green' : 'pulse-dot-amber'} style={{ width: '6px', height: '6px' }} />
              <span>{currentPhase.replace(/_/g, ' ')}</span>
            </div>
            <div style={{ fontSize: '0.70rem', color: 'var(--text-body)', marginTop: '2px' }}>
              {statusMsg}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Next Trigger Event
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-pure)' }}>
                {nextEvent}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Cycles Run Today
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', fontWeight: 800, color: 'var(--openbb-emerald)' }}>
                {cyclesToday} {cyclesToday === 1 ? 'Cycle' : 'Cycles'}
              </div>
            </div>
          </div>
        </div>

        {/* 4-Stage Daily Schedule Timeline */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px' }}>
          {timelinePhases.map((phase, idx) => {
            const isActive = currentPhase === phase.phaseKey;
            return (
              <div
                key={idx}
                style={{
                  background: isActive ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.14), rgba(0, 229, 255, 0.04))' : 'var(--openbb-bg-surface)',
                  border: isActive ? '1px solid var(--openbb-cyan)' : '1px solid var(--openbb-border)',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '85px',
                  boxShadow: isActive ? '0 0 16px rgba(0, 229, 255, 0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {phase.icon}
                    <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--openbb-cyan)' }}>
                      {phase.time}
                    </span>
                  </div>
                  {isActive && (
                    <span className="openbb-badge profit" style={{ fontSize: '0.55rem' }}>
                      ACTIVE
                    </span>
                  )}
                </div>
                <div style={{ marginTop: '4px' }}>
                  <div style={{ color: 'var(--text-pure)', fontSize: '0.78rem', fontWeight: 700 }}>
                    {phase.title}
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                    {phase.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8-Agent Deck */}
      <div className="openbb-card">
        <div style={{ marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-pure)' }}>
            8-Node Autonomous Multi-Agent Cognitive Architecture
          </h3>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Deep inspection of all 8 AI trading agents
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
          {agents.map((a) => (
            <div key={a.id} className="openbb-card" style={{ background: 'var(--openbb-bg-surface)', padding: '8px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-pure)' }}>
                  {a.icon} {a.name}
                </span>
                <span className="openbb-badge profit" style={{ fontSize: '0.58rem' }}>ONLINE</span>
              </div>
              <div style={{ fontSize: '0.70rem', color: 'var(--text-pure)', marginTop: '2px' }}>{a.role}</div>
              <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--openbb-emerald)', marginTop: '4px' }}>
                {a.regime}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostics & HITL Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '10px' }}>
        {/* Macro & Hedge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="openbb-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-pure)', marginBottom: '8px' }}>
              🌐 Macro Intelligence Sentinel
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Macro Regime:</span>
                <span className="openbb-badge profit">{macro?.macro_regime || 'RISK_ON_EXPANSION'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>10Y Treasury Yield (^TNX):</span>
                <strong style={{ color: 'var(--text-pure)' }}>{macro?.ten_year_treasury_yield?.toFixed(2) || '4.25'}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Yield Curve Spread:</span>
                <strong style={{ color: macro?.is_yield_curve_inverted ? 'var(--openbb-crimson)' : 'var(--openbb-emerald)' }}>
                  {macro?.is_yield_curve_inverted ? 'INVERTED' : 'NORMAL (+0.15%)'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Macro Sizing Multiplier:</span>
                <strong style={{ color: 'var(--openbb-cyan)' }}>{macro?.sizing_multiplier?.toFixed(1) || '1.0'}x Kelly</strong>
              </div>
            </div>
          </div>

          <div className="openbb-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-pure)', marginBottom: '8px' }}>
              🛡️ Portfolio Greek Risk Balancer
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Hedge Decision:</span>
                <span className={`openbb-badge ${hedge?.hedge_required ? 'loss' : 'profit'}`}>
                  {hedge?.decision || 'HOLD_CURRENT_RISK'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>Beta-Weighted Delta:</span>
                <strong style={{ color: 'var(--text-pure)' }}>{hedge?.beta_weighted_delta?.toFixed(1) || '0.0'} Δ</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-dim)' }}>SPY Unit Balance:</span>
                <strong style={{ color: 'var(--openbb-cyan)' }}>{hedge?.recommended_hedge_units || 0} Contracts</strong>
              </div>
            </div>
          </div>
        </div>

        {/* HITL Governance Queue & History */}
        <div className="openbb-card">
          <div style={{ marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-pure)' }}>
              🏛️ HITL Governance Desk
            </h3>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Pending Capital Proposals & Audit History
            </span>
          </div>

          <strong style={{ fontSize: '0.75rem', color: 'var(--openbb-cyan)', textTransform: 'uppercase' }}>
            Pending Sign-Off Queue:
          </strong>
          <div style={{ marginTop: '6px', marginBottom: '12px' }}>
            {proposals.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px', fontSize: '0.75rem', background: 'var(--openbb-bg-surface)', borderRadius: '4px' }}>
                No proposals currently pending sign-off. Governance queue is clean.
              </div>
            ) : (
              proposals.map((p) => (
                <div key={p.proposal_id} className="openbb-card" style={{ border: '1px solid var(--openbb-cyan)', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--text-pure)', fontSize: '0.82rem' }}>Proposal: {p.proposal_id} ({p.symbol})</strong>
                    <span className="openbb-badge neutral">{p.strategy}</span>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0' }}>{p.reasoning}</p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <button className="btn-terminal primary" onClick={() => onApproveProposal(p.proposal_id)}>✓ Approve</button>
                    <button className="btn-terminal danger" onClick={() => onRejectProposal(p.proposal_id)}>✕ Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>

          <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Recent Governance Audit Log:
          </strong>
          <div className="terminal-table-wrapper hitl-wrapper" style={{ marginTop: '6px' }}>
            <table className="terminal-table">
              <thead>
                <tr>
                  <th>Proposal ID</th>
                  <th>Status</th>
                  <th>Operator</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No audit history yet.</td></tr>
                ) : (
                  history.map((h, idx) => (
                    <tr key={idx}>
                      <td><strong style={{ color: 'var(--text-pure)' }}>{h.proposal_id}</strong></td>
                      <td>
                        <span className={`openbb-badge ${h.status === 'APPROVED' ? 'profit' : 'loss'}`}>
                          {h.status}
                        </span>
                      </td>
                      <td>{h.operator_name || 'Desk Officer'}</td>
                      <td className="wrap-cell">{h.notes || 'Automated policy check'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
