import React from 'react';
import { Bot, Zap, Shield, CheckCircle, Brain, Globe, TrendingUp, Lock } from 'lucide-react';
import { StrategyOption } from '../../api/types';

interface AgentStrategyFlowProps {
  selectedSymbol: string;
  selectedStrategy: string;
  strategies: StrategyOption[];
  onSelectStrategy: (stratId: string) => void;
}

export const AgentStrategyFlow: React.FC<AgentStrategyFlowProps> = ({
  selectedSymbol,
  selectedStrategy,
  strategies,
  onSelectStrategy,
}) => {
  const pipelineSteps = [
    {
      step: 1,
      name: 'Macro Sentinel',
      role: 'Catalyst Radar',
      metric: 'Yield Normal (+15 bps)',
      sub: 'MSI: 0.50 (Risk-On)',
      icon: <Globe size={14} style={{ color: '#00E5FF' }} />,
      status: 'DONE',
    },
    {
      step: 2,
      name: 'Market Scout',
      role: 'Volume & Skew',
      metric: 'POC $126.50 / 25Δ Skew',
      sub: 'Call Sweeps Detected',
      icon: <TrendingUp size={14} style={{ color: '#3B82F6' }} />,
      status: 'DONE',
    },
    {
      step: 3,
      name: 'Strategy Brain',
      role: 'ToT Monte Carlo',
      metric: `${selectedStrategy.replace(/_/g, ' ')}`,
      sub: 'EV: +$110.00 (88.5% Edge)',
      icon: <Brain size={14} style={{ color: '#A855F7' }} />,
      status: 'ACTIVE',
    },
    {
      step: 4,
      name: 'HITL Supervisor',
      role: 'Capital Gate',
      metric: 'Kelly Sizing: $500.00',
      sub: 'Risk Floor: -$150 Max',
      icon: <Shield size={14} style={{ color: '#FFB703' }} />,
      status: 'PASS',
    },
    {
      step: 5,
      name: 'Execution Trader',
      role: 'OCC Router',
      metric: 'CBOE Strike Snapped',
      sub: 'Midpoint Limit (+$44 Saved)',
      icon: <Zap size={14} style={{ color: '#00E676' }} />,
      status: 'STANDBY',
    },
    {
      step: 6,
      name: 'Risk Bodyguard',
      role: '15s Ratchet',
      metric: '+50% Target Lock',
      sub: '-$150 Stop Enforced',
      icon: <Lock size={14} style={{ color: '#FF3D71' }} />,
      status: 'STANDBY',
    },
  ];

  const defaultStrategies = [
    { id: 'THETA_IRON_CONDOR', name: 'Iron Condor', tag: '4 Legs • High IV' },
    { id: 'CALENDAR_SPREAD', name: 'Calendar Spread', tag: '2 Legs • Low IV' },
    { id: 'VOLATILITY_STRADDLE', name: 'Vol Straddle', tag: '2 Legs • Catalyst' },
    { id: 'BULL_PUT_SPREAD', name: 'Bull Put Spread', tag: '2 Legs • Trend' },
    { id: 'BEAR_CALL_SPREAD', name: 'Bear Call Spread', tag: '2 Legs • Trend' },
    { id: 'JADE_LIZARD', name: 'Jade Lizard', tag: '3 Legs • Skew' },
    { id: 'RATIO_BACKSPREAD', name: 'Ratio Backspread', tag: '2 Legs • Breakout' },
  ];

  const stratList = Array.isArray(strategies) && strategies.length > 0 ? strategies : defaultStrategies;

  return (
    <div className="openbb-card" style={{ width: '100%', marginBottom: '12px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--openbb-border)',
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.90rem',
              fontWeight: 800,
              color: 'var(--text-pure)',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
          >
            <Bot size={16} style={{ color: 'var(--openbb-cyan)' }} />
            <span>Autonomous Cognitive Workflow Engine ({selectedSymbol})</span>
          </h3>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Real-time multi-agent handoff: Macro Sentinel → Scout → Strategy Brain (ToT) → HITL → Trader → Bodyguard
          </span>
        </div>
        <span className="openbb-badge profit" style={{ boxShadow: '0 0 10px rgba(0, 230, 118, 0.20)' }}>
          <CheckCircle size={11} /> PIPELINE SYNCHRONIZED
        </span>
      </div>

      {/* 6-Stage Pipeline Progression Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '8px',
          marginBottom: '12px',
          width: '100%',
        }}
      >
        {pipelineSteps.map((step) => {
          const isActive = step.status === 'ACTIVE';
          return (
            <div
              key={step.step}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)'
                  : 'var(--openbb-bg-surface)',
                border: isActive ? '1px solid var(--openbb-cyan)' : '1px solid var(--openbb-border)',
                borderRadius: '6px',
                padding: '9px 11px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '88px',
                position: 'relative',
                boxShadow: isActive ? '0 0 16px rgba(0, 229, 255, 0.15)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {step.icon}
                  <strong style={{ color: 'var(--text-pure)', fontSize: '0.75rem', fontWeight: 700 }}>
                    {step.step}. {step.name}
                  </strong>
                </div>
                {isActive ? (
                  <span className="openbb-badge neutral" style={{ fontSize: '0.58rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="pulse-dot-cyan" style={{ width: '5px', height: '5px' }} /> ACTIVE
                  </span>
                ) : (
                  <span
                    className={`openbb-badge ${
                      step.status === 'DONE' || step.status === 'PASS' ? 'profit' : 'warn'
                    }`}
                    style={{ fontSize: '0.58rem' }}
                  >
                    {step.status}
                  </span>
                )}
              </div>

              <div style={{ marginTop: '4px' }}>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.74rem', fontWeight: 700 }}>
                  {step.metric}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.66rem', fontFamily: 'var(--font-mono)' }}>
                  {step.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategy Selector Carousel / Row */}
      <div
        style={{
          background: 'var(--openbb-bg-surface)',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid var(--openbb-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Brain size={15} style={{ color: 'var(--openbb-purple)' }} />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-pure)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Brain Strategy Engines:
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1, justifyContent: 'flex-end' }}>
          {stratList.map((s: any) => {
            const isSelected = selectedStrategy === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStrategy(s.id)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.10) 100%)'
                    : 'var(--openbb-bg-widget)',
                  border: isSelected ? '1px solid var(--openbb-purple)' : '1px solid var(--openbb-border)',
                  color: isSelected ? 'var(--text-pure)' : 'var(--text-muted)',
                  borderRadius: '5px',
                  padding: '4px 10px',
                  fontSize: '0.70rem',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 0 12px rgba(168, 85, 247, 0.25)' : 'none',
                }}
              >
                <span>{s.name}</span>
                {isSelected && <span style={{ color: 'var(--openbb-emerald)', fontSize: '0.7rem' }}>●</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
