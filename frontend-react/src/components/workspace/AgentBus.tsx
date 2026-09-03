import React, { useState } from 'react';
import {
  Terminal,
  Activity,
  Radio,
  Shield,
  Brain,
  Zap,
  Bot,
  Lock,
  Cpu,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface AgentBusProps {
  onOpenStateInspector: () => void;
  onNavigateToTab: (tab: any) => void;
}

export const AgentBus: React.FC<AgentBusProps> = ({ onOpenStateInspector, onNavigateToTab }) => {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const nodes = [
    {
      id: 1,
      title: '1. Macro Sentinel',
      role: 'Macro Regime & Yield Curve',
      state: 'STANDBY',
      tag: 'MSI: 0.50 Risk-On',
      tab: 'agents',
      color: '#FFB703',
      bg: 'rgba(255, 183, 3, 0.08)',
      border: 'rgba(255, 183, 3, 0.35)',
      detail: 'Yield curve +15 bps normal. Sizing multiplier: 1.0x (100% capital allowance).',
    },
    {
      id: 2,
      title: '2. Market Scout',
      role: 'Volume POC & 25Δ Skew',
      state: 'ACTIVE',
      tag: '8 Assets Scanned',
      tab: 'signals',
      color: '#00E5FF',
      bg: 'rgba(0, 229, 255, 0.08)',
      border: 'rgba(0, 229, 255, 0.40)',
      detail: 'Scanned 8 universe assets. SPY Point of Control ($556.20) in 70% fair value range.',
    },
    {
      id: 3,
      title: '3. Strategy Brain',
      role: 'ToT Monte Carlo Matrix',
      state: 'ACTIVE',
      tag: '88.5% Win Edge',
      tab: 'strategies',
      color: '#A855F7',
      bg: 'rgba(168, 85, 247, 0.08)',
      border: 'rgba(168, 85, 247, 0.40)',
      detail: 'Evaluated 3 ToT branches on SPY. Selected Theta Iron Condor (+ $210.00 EV).',
    },
    {
      id: 4,
      title: '4. Risk Validator',
      role: 'Deterministic 5-Rule Veto',
      state: 'ACTIVE',
      tag: 'Veto Gate PASS',
      tab: 'agents',
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.35)',
      detail: '5 deterministic mathematical veto rules enforced: Kelly boundary, hard stop, and assignment guard.',
    },
    {
      id: 5,
      title: '5. HITL Supervisor',
      role: 'Risk Budget & Gatekeeper',
      state: 'STANDBY',
      tag: 'Gov PASS',
      tab: 'agents',
      color: '#00E676',
      bg: 'rgba(0, 230, 118, 0.08)',
      border: 'rgba(0, 230, 118, 0.35)',
      detail: 'All OCC risk gates verified. Order cluster budget bounded within $450-$600.',
    },
    {
      id: 6,
      title: '6. Order Router',
      role: 'CBOE Midpoint Execution',
      state: 'STANDBY',
      tag: 'Midpoint Guard',
      tab: 'dashboard',
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.08)',
      border: 'rgba(59, 130, 246, 0.35)',
      detail: 'Midpoint algorithmic routing armed. 0% adverse selection defense active.',
    },
    {
      id: 7,
      title: '7. Portfolio Hedge',
      role: 'Delta Neutrality Guard',
      state: 'ACTIVE',
      tag: 'Δ 0.0 Neutral',
      tab: 'agents',
      color: '#6366F1',
      bg: 'rgba(99, 102, 241, 0.08)',
      border: 'rgba(99, 102, 241, 0.40)',
      detail: 'Net Delta monitored at 0.0 Δ (Within ±25 Δ safe corridor). No beta hedge needed.',
    },
    {
      id: 8,
      title: '8. Risk Bodyguard',
      role: 'Stop Loss & Profit Ratchet',
      state: 'ACTIVE',
      tag: '-$150 Stop Floor',
      tab: 'dashboard',
      color: '#FF3B30',
      bg: 'rgba(255, 59, 48, 0.08)',
      border: 'rgba(255, 59, 48, 0.40)',
      detail: 'Circuit breaker active: -$150.00 hard floor per trade. +50% profit ratchet arming.',
    },
    {
      id: 9,
      title: '9. AI Memory',
      role: 'Episodic Vector Ledger',
      state: 'ACTIVE',
      tag: 'Ledger Synced',
      tab: 'monitor',
      color: '#94A3B8',
      bg: 'rgba(148, 163, 184, 0.08)',
      border: 'rgba(148, 163, 184, 0.35)',
      detail: '30 closed trades recorded. Vectorized trade memories committed to SQLite ledger.',
    },
    {
      id: 10,
      title: '10. AI Copilot Desk',
      role: 'Operator Supervisory Bridge',
      state: 'ACTIVE',
      tag: 'Interactive Live',
      tab: 'dashboard',
      color: '#00E5FF',
      bg: 'rgba(0, 229, 255, 0.08)',
      border: 'rgba(0, 229, 255, 0.40)',
      detail: 'Real-time conversational quantitative desk supervisor with strict portfolio risk guardrails.',
    },
  ];

  // Simulated live cognitive stream logs
  const cognitiveLogs = [
    { time: '14:28:14', agent: 'BODYGUARD', text: 'Enforcing -$150.00 stop-loss floor across 3 open positions. Profit ratchet armed at +50%.' },
    { time: '14:28:12', agent: 'HEDGE', text: 'Portfolio Net Delta is 0.0 Δ (Safe Corridor ±25). No hedging rebalance required.' },
    { time: '14:28:10', agent: 'BRAIN', text: 'Evaluated 3 ToT branches on SPY -> Range-Bound Theta Condor has 88.5% PoP (+$210 EV).' },
    { time: '14:28:08', agent: 'SCOUT', text: '14-Day Volume Profile POC scanned at $556.20. Spot $558.90 is inside 70% Value Area.' },
  ];

  return (
    <div className="openbb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.90rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🤖</span> <span>LangGraph 10-Agent Autonomous Decision Bus</span>
            </h3>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Autonomous Cognitive Pipeline • Active Runtime State
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="openbb-badge profit" style={{ fontSize: '0.58rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="pulse-dot-green" /> 7 ACTIVE • 3 STANDBY
            </span>
            <button className="btn-terminal primary" onClick={onOpenStateInspector} style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
              <Terminal size={11} /> State Tree
            </button>
          </div>
        </div>

        {/* 8-Node Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '8px',
            width: '100%',
          }}
        >
          {nodes.map((node, i) => {
            const isHovered = hoveredNode === node.id;
            const isActive = node.state === 'ACTIVE';

            return (
              <div
                key={i}
                onClick={() => onNavigateToTab(node.tab)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  background: isHovered ? node.bg : 'var(--openbb-bg-surface)',
                  border: `1px solid ${isHovered ? node.color : node.border}`,
                  borderRadius: '6px',
                  padding: '8px 9px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  cursor: 'pointer',
                  minWidth: 0,
                  transition: 'all 0.15s ease',
                  boxShadow: isHovered ? `0 0 12px ${node.color}33` : 'none',
                  position: 'relative',
                }}
              >
                {/* Title & State Pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isHovered ? node.color : 'var(--text-pure)', fontFamily: 'var(--font-heading)' }}>
                    {node.title}
                  </span>
                  {isActive ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.54rem',
                        fontWeight: 800,
                        color: 'var(--openbb-emerald)',
                        background: 'rgba(0, 230, 118, 0.15)',
                        border: '1px solid rgba(0, 230, 118, 0.35)',
                        padding: '1px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      <span className="pulse-dot-green" style={{ width: '4px', height: '4px' }} /> ACTIVE
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.54rem',
                        fontWeight: 700,
                        color: 'var(--text-dim)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '1px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      STANDBY
                    </span>
                  )}
                </div>

                {/* Role */}
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {node.role}
                </div>

                {/* Bottom Tag */}
                <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: node.color, fontWeight: 800, marginTop: '2px' }}>
                  {node.tag}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Hover Detail Banner */}
        <div
          style={{
            marginTop: '10px',
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid var(--openbb-border)',
            borderRadius: '5px',
            padding: '6px 10px',
            fontSize: '0.68rem',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {hoveredNode != null ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-pure)' }}>
              <span style={{ color: nodes[hoveredNode - 1].color, fontWeight: 800 }}>[{nodes[hoveredNode - 1].title}]</span>
              <span>{nodes[hoveredNode - 1].detail}</span>
            </div>
          ) : (
            <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={12} style={{ color: 'var(--openbb-cyan)' }} />
              <span>Hover over any agent node to inspect its live mathematical parameters.</span>
            </div>
          )}
          <span style={{ fontSize: '0.60rem', color: 'var(--openbb-cyan)', cursor: 'pointer', flexShrink: 0 }}>
            Click to open desk →
          </span>
        </div>
      </div>

      {/* Real-Time Autonomous Cognitive Activity Console (Fills the height) */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
          <span>LIVE AUTONOMOUS DECISION STREAM:</span>
          <span style={{ color: 'var(--openbb-emerald)' }}>● 15s Cognitive Bus</span>
        </div>

        <div
          style={{
            background: 'linear-gradient(180deg, #05080E 0%, #030509 100%)',
            border: '1px solid var(--openbb-border)',
            borderRadius: '5px',
            padding: '8px 10px',
            height: '110px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.66rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.8)',
          }}
        >
          {cognitiveLogs.map((log, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: '1.35', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', paddingBottom: '2px' }}>
              <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>[{log.time}]</span>
              <span style={{ color: log.agent === 'BODYGUARD' ? 'var(--openbb-crimson)' : log.agent === 'BRAIN' ? 'var(--openbb-purple)' : 'var(--openbb-cyan)', fontWeight: 800, flexShrink: 0 }}>
                [{log.agent}]
              </span>
              <span style={{ color: 'var(--text-body)', wordBreak: 'break-word' }}>{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
