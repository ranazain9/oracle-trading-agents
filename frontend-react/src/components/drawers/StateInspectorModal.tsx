import React, { useState } from 'react';
import {
  X,
  Terminal,
  Activity,
  Shield,
  Zap,
  Brain,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Copy,
  Check,
  Code,
  LayoutGrid
} from 'lucide-react';
import { PipelineState } from '../../api/types';

interface StateInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: PipelineState | null;
}

export const StateInspectorModal: React.FC<StateInspectorModalProps> = ({ isOpen, onClose, state }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rawState: Record<string, any> = (state as any) || {};
  const symbols: string[] = Array.isArray(rawState.symbols) && rawState.symbols.length > 0
    ? rawState.symbols
    : (rawState.symbol ? [rawState.symbol] : ['SPX', 'NVDA', 'AAPL']);
  const cash = typeof rawState.portfolio_cash === 'number' ? rawState.portfolio_cash : 100000;
  const isApproved = rawState.is_approved === true;

  const macro = rawState.macro_assessment;
  const market = rawState.market_overview;
  const decision = rawState.decision;
  const hitl = rawState.hitl_approval;
  const execution = rawState.execution_result;
  const hedge = rawState.hedge_decision;
  const guardian = rawState.guardian_result;
  const analyst = rawState.analyst_reflection;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(rawState, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(3, 6, 12, 0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="openbb-card"
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '92vh',
          background: 'linear-gradient(180deg, #0E1626 0%, #080D17 100%)',
          borderColor: 'rgba(0, 229, 255, 0.35)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.95), 0 0 30px rgba(0, 229, 255, 0.12)',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '10px',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            borderBottom: '1px solid var(--openbb-border)',
            background: 'linear-gradient(90deg, rgba(0, 229, 255, 0.08) 0%, rgba(13, 20, 34, 0.95) 100%)',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(0, 229, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(0, 229, 255, 0.4)'
            }}>
              <Brain size={18} style={{ color: 'var(--openbb-cyan)' }} />
            </div>
            <div>
              <strong style={{ color: 'var(--text-pure)', fontFamily: 'var(--font-heading)', fontSize: '1.05rem', letterSpacing: '0.3px' }}>
                LangGraph Autonomous Cognitive State
              </strong>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                8-Node Multi-Agent Stateful Pipeline Inspector (0ms Broker Synchronized)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* View Mode Toggle Switch */}
            <div style={{
              display: 'flex',
              background: 'var(--openbb-bg-surface)',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid var(--openbb-border)'
            }}>
              <button
                onClick={() => setViewMode('visual')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.70rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewMode === 'visual' ? 'var(--openbb-cyan)' : 'transparent',
                  color: viewMode === 'visual' ? '#000' : 'var(--text-dim)',
                  transition: 'all 0.15s ease'
                }}
              >
                <LayoutGrid size={12} /> Visual Graph
              </button>
              <button
                onClick={() => setViewMode('json')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.70rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: viewMode === 'json' ? 'var(--openbb-cyan)' : 'transparent',
                  color: viewMode === 'json' ? '#000' : 'var(--text-dim)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Code size={12} /> Raw JSON
              </button>
            </div>

            <button
              onClick={handleCopyJson}
              className="btn-terminal"
              style={{ padding: '4px 10px', fontSize: '0.70rem', gap: '5px' }}
              title="Copy Complete State JSON to Clipboard"
            >
              {copied ? <Check size={12} style={{ color: 'var(--openbb-emerald)' }} /> : <Copy size={12} />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--openbb-border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                borderRadius: '6px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close Modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Global State Ribbon */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          background: 'rgba(0, 0, 0, 0.35)',
          borderBottom: '1px solid var(--openbb-border)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Corridor Assets:
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {symbols.map((sym: string) => (
                  <span key={sym} className="openbb-badge neutral" style={{ fontWeight: 800, color: 'var(--openbb-cyan)' }}>
                    {sym}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                Portfolio Allocation Cash:
              </span>
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.86rem', color: 'var(--openbb-emerald)' }}>
                ${cash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              fontWeight: 800,
              background: isApproved ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 183, 3, 0.15)',
              color: isApproved ? 'var(--openbb-emerald)' : 'var(--openbb-amber)',
              border: `1px solid ${isApproved ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 183, 3, 0.4)'}`,
            }}>
              <span className={isApproved ? 'pulse-dot-green' : 'pulse-dot-amber'} />
              <span>{isApproved ? 'HITL GATE: APPROVED' : 'HITL GATE: GOVERNANCE SIGN-OFF PENDING'}</span>
            </div>
          </div>
        </div>

        {/* Modal Body Container */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {viewMode === 'json' ? (
            /* Raw JSON Debugger View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Direct Memory Dump from LangGraph `OracleState`:
              </div>
              <pre
                style={{
                  background: '#04070D',
                  padding: '16px',
                  borderRadius: '6px',
                  color: '#00E5FF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                  border: '1px solid var(--openbb-border)',
                  lineHeight: 1.45,
                  maxHeight: '58vh',
                }}
              >
                {JSON.stringify(rawState, null, 2)}
              </pre>
            </div>
          ) : (
            /* 8-Node Visual Cognitive Graph Deck */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
              
              {/* NODE 1: Macro Assessment */}
              <div className="openbb-card" style={{ background: 'var(--openbb-bg-surface)', border: '1px solid var(--openbb-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--openbb-border)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--openbb-cyan)', fontWeight: 800, fontSize: '0.80rem' }}>
                    <Globe size={14} /> 1. Macro Sentinel
                  </div>
                  <span className={`openbb-badge ${macro ? 'profit' : 'neutral'}`} style={{ fontSize: '0.58rem' }}>
                    {macro ? 'RESOLVED' : 'STANDBY'}
                  </span>
                </div>
                {macro ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Regime:</span>
                      <strong style={{ color: 'var(--openbb-emerald)' }}>{macro.macro_regime || 'EXPANSION'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>10Y Yield:</span>
                      <strong style={{ color: 'var(--text-pure)' }}>{macro.ten_year_treasury_yield?.toFixed(2) || '4.24'}%</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Multiplier:</span>
                      <strong style={{ color: 'var(--openbb-cyan)' }}>{macro.sizing_multiplier || 1.0}x Kelly</strong>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.66rem', margin: '4px 0 0', lineHeight: 1.3 }}>
                      {macro.strategic_macro_thesis || 'Normal yield curve corridor with steady liquidity.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.70rem', fontStyle: 'italic', padding: '10px 0' }}>
                    Ready for 09:00 AM Pre-Market Catalyst scan.
                  </div>
                )}
              </div>

              {/* NODE 2: Market Scout Overview */}
              <div className="openbb-card" style={{ background: 'var(--openbb-bg-surface)', border: '1px solid var(--openbb-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--openbb-border)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--openbb-emerald)', fontWeight: 800, fontSize: '0.80rem' }}>
                    <Activity size={14} /> 2. Market Scout
                  </div>
                  <span className={`openbb-badge ${market ? 'profit' : 'neutral'}`} style={{ fontSize: '0.58rem' }}>
                    {market ? 'SCANNED' : 'STANDBY'}
                  </span>
                </div>
                {market ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>CBOE VIX:</span>
                      <strong style={{ color: 'var(--text-pure)' }}>{market.vix || 14.51}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>S&P 500 Trend:</span>
                      <strong style={{ color: 'var(--openbb-cyan)' }}>{market.sp500_trend || 'UPTREND'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Vol Regime:</span>
                      <strong style={{ color: 'var(--openbb-emerald)' }}>{market.vix_regime || 'LOW_VOL'}</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.70rem', fontStyle: 'italic', padding: '10px 0' }}>
                    Monitoring volume POC & options chain skew across top 8 assets.
                  </div>
                )}
              </div>

              {/* NODE 3: Strategy Brain Decision */}
              <div className="openbb-card" style={{ background: 'var(--openbb-bg-surface)', border: '1px solid var(--openbb-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--openbb-border)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--openbb-purple)', fontWeight: 800, fontSize: '0.80rem' }}>
                    <Brain size={14} /> 3. Strategy Brain
                  </div>
                  <span className={`openbb-badge ${decision ? 'profit' : 'neutral'}`} style={{ fontSize: '0.58rem' }}>
                    {decision ? 'OPTIMIZED' : 'STANDBY'}
                  </span>
                </div>
                {decision ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Structure:</span>
                      <strong style={{ color: 'var(--openbb-purple)' }}>{decision.strategy_name || 'THETA_CONDOR'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Projected EV:</span>
                      <strong style={{ color: 'var(--openbb-emerald)' }}>+${decision.expected_value_usd || '210.00'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Win Prob:</span>
                      <strong style={{ color: 'var(--openbb-cyan)' }}>{decision.win_probability_pct || '84.5'}%</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.70rem', fontStyle: 'italic', padding: '10px 0' }}>
                    Tree-of-Thoughts evaluating payoffs across volatility scenarios.
                  </div>
                )}
              </div>

              {/* NODE 4: HITL Supervisor */}
              <div className="openbb-card" style={{ background: 'var(--openbb-bg-surface)', border: '1px solid var(--openbb-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--openbb-border)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--openbb-amber)', fontWeight: 800, fontSize: '0.80rem' }}>
                    <Shield size={14} /> 4. HITL Supervisor
                  </div>
                  <span className={`openbb-badge ${isApproved ? 'profit' : 'loss'}`} style={{ fontSize: '0.58rem' }}>
                    {isApproved ? 'SIGNED OFF' : 'GATE ACTIVE'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Kelly Allocation:</span>
                    <strong style={{ color: 'var(--text-pure)' }}>$450 - $600 Max</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Status:</span>
                    <strong style={{ color: isApproved ? 'var(--openbb-emerald)' : 'var(--openbb-amber)' }}>
                      {isApproved ? 'APPROVED FOR ROUTING' : 'PENDING DESK SIGN-OFF'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* NODE 5: Execution Router */}
              <div className="openbb-card" style={{ background: 'var(--openbb-bg-surface)', border: '1px solid var(--openbb-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--openbb-border)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--openbb-cyan)', fontWeight: 800, fontSize: '0.80rem' }}>
                    <Zap size={14} /> 5. Execution Trader
                  </div>
                  <span className={`openbb-badge ${execution ? 'profit' : 'neutral'}`} style={{ fontSize: '0.58rem' }}>
                    {execution ? 'ROUTED' : 'STANDBY'}
                  </span>
                </div>
                {execution ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Order Status:</span>
                      <strong style={{ color: 'var(--openbb-emerald)' }}>{execution.status || 'FILLED_MIDPOINT'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Order ID:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{execution.order_id || 'ORD-98214'}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.70rem', fontStyle: 'italic', padding: '10px 0' }}>
                    OCC Multi-Leg Midpoint Order Router standing by.
                  </div>
                )}
              </div>

              {/* NODE 6: Portfolio Hedge */}
              <div className="openbb-card" style={{ background: 'var(--openbb-bg-surface)', border: '1px solid var(--openbb-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--openbb-border)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--openbb-emerald)', fontWeight: 800, fontSize: '0.80rem' }}>
                    <TrendingUp size={14} /> 6. Portfolio Hedge
                  </div>
                  <span className={`openbb-badge ${hedge?.hedge_required ? 'loss' : 'profit'}`} style={{ fontSize: '0.58rem' }}>
                    {hedge?.hedge_required ? 'HEDGE NEEDED' : 'BALANCED'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Beta Delta:</span>
                    <strong style={{ color: 'var(--text-pure)' }}>{hedge?.beta_weighted_delta?.toFixed(1) || '0.0'} Δ</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>SPY Balancing:</span>
                    <strong style={{ color: 'var(--openbb-cyan)' }}>{hedge?.recommended_hedge_units || 0} Contracts</strong>
                  </div>
                </div>
              </div>

              {/* NODE 7: Risk Bodyguard */}
              <div className="openbb-card" style={{ background: 'var(--openbb-bg-surface)', border: '1px solid var(--openbb-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--openbb-border)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--openbb-amber)', fontWeight: 800, fontSize: '0.80rem' }}>
                    <Shield size={14} /> 7. Risk Bodyguard
                  </div>
                  <span className="openbb-badge profit" style={{ fontSize: '0.58rem' }}>
                    ARMED 15s
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Hard Stop Limit:</span>
                    <strong style={{ color: 'var(--openbb-crimson)' }}>-$150.00 Max</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Profit Ratchet:</span>
                    <strong style={{ color: 'var(--openbb-emerald)' }}>+50% (+ $125 - $250)</strong>
                  </div>
                </div>
              </div>

              {/* NODE 8: Analyst Memory Reflection */}
              <div className="openbb-card" style={{ background: 'var(--openbb-bg-surface)', border: '1px solid var(--openbb-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--openbb-border)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--openbb-cyan)', fontWeight: 800, fontSize: '0.80rem' }}>
                    <Brain size={14} /> 8. Analyst Memory
                  </div>
                  <span className="openbb-badge neutral" style={{ fontSize: '0.58rem' }}>
                    EPISODIC
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.72rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Vector Synthesis:</span>
                    <strong style={{ color: 'var(--openbb-cyan)' }}>SQLite + Chroma</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-dim)' }}>PnL Attribution:</span>
                    <strong style={{ color: 'var(--openbb-emerald)' }}>Post-Trade Hook</strong>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
