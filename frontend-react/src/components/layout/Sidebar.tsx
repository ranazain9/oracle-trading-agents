import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Bot,
  Zap,
  History,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Radio,
  Cpu,
  Shield,
  Activity,
} from 'lucide-react';

export type TabKey = 'dashboard' | 'signals' | 'agents' | 'strategies' | 'monitor' | 'settings';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenCopilot: () => void;
  positionsCount?: number;
  universeCount?: number;
  pendingProposalsCount?: number;
  strategiesCount?: number;
  realizedPnlUsd?: number;
  isWsConnected?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenCopilot,
  positionsCount = 3,
  universeCount = 8,
  pendingProposalsCount = 0,
  strategiesCount = 7,
  realizedPnlUsd,
  isWsConnected = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Dynamic real badge calculations
  const pnlBadge =
    realizedPnlUsd != null
      ? realizedPnlUsd >= 0
        ? `+$${realizedPnlUsd.toFixed(0)}`
        : `-$${Math.abs(realizedPnlUsd).toFixed(0)}`
      : '+$1.3k';

  const hitlBadge = pendingProposalsCount > 0 ? `${pendingProposalsCount} HITL` : '8 Idle';

  const navItems: {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeType?: 'cyan' | 'emerald' | 'amber' | 'purple';
    shortcut: string;
  }[] = [
    {
      key: 'dashboard',
      label: 'Workspace',
      icon: <LayoutDashboard size={17} />,
      badge: `${positionsCount} ${positionsCount === 1 ? 'Leg' : 'Legs'}`,
      badgeType: 'cyan',
      shortcut: '1',
    },
    {
      key: 'signals',
      label: 'Signals & Radar',
      icon: <TrendingUp size={17} />,
      badge: `${universeCount} Live`,
      badgeType: 'emerald',
      shortcut: '2',
    },
    {
      key: 'agents',
      label: 'Agents & HITL',
      icon: <Bot size={17} />,
      badge: hitlBadge,
      badgeType: pendingProposalsCount > 0 ? 'amber' : 'cyan',
      shortcut: '3',
    },
    {
      key: 'strategies',
      label: 'Strategy Studio',
      icon: <Zap size={17} />,
      badge: `${strategiesCount} Armed`,
      badgeType: 'purple',
      shortcut: '4',
    },
    {
      key: 'monitor',
      label: 'Ledger & Stream',
      icon: <History size={17} />,
      badge: pnlBadge,
      badgeType: (realizedPnlUsd ?? 1) >= 0 ? 'emerald' : 'amber',
      shortcut: '5',
    },
    {
      key: 'settings',
      label: 'Config & Risk',
      icon: <Settings size={17} />,
      badge: 'Safe',
      badgeType: 'emerald',
      shortcut: '6',
    },
  ];

  const getBadgeStyle = (type?: string) => {
    switch (type) {
      case 'emerald':
        return { bg: 'rgba(0, 230, 118, 0.15)', text: 'var(--openbb-emerald)', border: 'rgba(0, 230, 118, 0.35)' };
      case 'amber':
        return { bg: 'rgba(255, 183, 3, 0.15)', text: 'var(--openbb-amber)', border: 'rgba(255, 183, 3, 0.4)' };
      case 'purple':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: 'var(--openbb-purple)', border: 'rgba(168, 85, 247, 0.4)' };
      default:
        return { bg: 'rgba(0, 229, 255, 0.15)', text: 'var(--openbb-cyan)', border: 'rgba(0, 229, 255, 0.35)' };
    }
  };

  return (
    <aside
      style={{
        width: isCollapsed ? '68px' : '224px',
        minWidth: isCollapsed ? '68px' : '224px',
        maxWidth: isCollapsed ? '68px' : '224px',
        background: 'linear-gradient(180deg, #090E17 0%, #05080E 100%)',
        borderRight: '1px solid var(--openbb-border)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isCollapsed ? '16px 8px' : '16px 12px',
        height: '100vh',
        flexShrink: 0,
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div>
        {/* Brand Header with Collapse Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            paddingBottom: '14px',
            borderBottom: '1px solid var(--openbb-border)',
            position: 'relative',
          }}
        >
          {!isCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              {/* Glowing Logo Icon */}
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '7px',
                  background: 'linear-gradient(135deg, var(--openbb-cyan), #2563EB)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  color: '#000000',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.90rem',
                  boxShadow: '0 0 16px rgba(0, 229, 255, 0.50)',
                  flexShrink: 0,
                }}
              >
                Ω
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-pure)', letterSpacing: '0.4px' }}>
                    ORACLE
                  </span>
                  <span
                    style={{
                      fontSize: '0.56rem',
                      background: 'rgba(0, 229, 255, 0.15)',
                      color: 'var(--openbb-cyan)',
                      border: '1px solid rgba(0, 229, 255, 0.35)',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      fontWeight: 800,
                    }}
                  >
                    PRO 5.0
                  </span>
                </div>
                <div style={{ fontSize: '0.60rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  Quant Alpha Terminal
                </div>
              </div>
            </div>
          ) : null}

          {/* Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              background: isCollapsed ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${isCollapsed ? 'rgba(0, 229, 255, 0.4)' : 'var(--openbb-border)'}`,
              borderRadius: '6px',
              color: isCollapsed ? 'var(--openbb-cyan)' : 'var(--text-dim)',
              width: isCollapsed ? '32px' : '20px',
              height: isCollapsed ? '32px' : '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.15s ease',
              marginLeft: isCollapsed ? 0 : '4px',
            }}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '14px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            const badgeStyle = getBadgeStyle(item.badgeType);

            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                title={isCollapsed ? `${item.label} [Alt+${item.shortcut}]` : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'space-between',
                  gap: '8px',
                  padding: isCollapsed ? '9px 0' : '8px 10px',
                  borderRadius: '6px',
                  background: isActive
                    ? 'linear-gradient(90deg, rgba(0, 229, 255, 0.16), rgba(0, 229, 255, 0.03))'
                    : 'transparent',
                  borderLeft: isActive ? '3px solid var(--openbb-cyan)' : '3px solid transparent',
                  borderTop: isActive ? '1px solid rgba(0, 229, 255, 0.20)' : '1px solid transparent',
                  borderRight: isActive ? '1px solid rgba(0, 229, 255, 0.20)' : '1px solid transparent',
                  borderBottom: isActive ? '1px solid rgba(0, 229, 255, 0.20)' : '1px solid transparent',
                  color: isActive ? 'var(--text-pure)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.80rem',
                  fontWeight: isActive ? 800 : 500,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 0 14px rgba(0, 229, 255, 0.12)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span
                    style={{
                      color: isActive ? 'var(--openbb-cyan)' : 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(0, 229, 255, 0.4))' : 'none',
                    }}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {/* Dynamic Status Badge */}
                {!isCollapsed && item.badge && (
                  <span
                    style={{
                      background: badgeStyle.bg,
                      color: badgeStyle.text,
                      border: `1px solid ${badgeStyle.border}`,
                      padding: '1px 5px',
                      borderRadius: '3px',
                      fontSize: '0.58rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Telemetry Pod & AI Copilot Button */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--openbb-border)', paddingTop: '10px' }}>
        {/* Mini Telemetry Status Pod */}
        {!isCollapsed ? (
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--openbb-border)',
              borderRadius: '5px',
              padding: '6px 8px',
              fontSize: '0.62rem',
              fontFamily: 'var(--font-mono)',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className={isWsConnected ? 'pulse-dot-green' : 'pulse-dot-amber'} /> WS STREAM
              </span>
              <span style={{ color: isWsConnected ? 'var(--openbb-emerald)' : 'var(--openbb-amber)', fontWeight: 800 }}>
                {isWsConnected ? '15s ACTIVE' : 'OFFLINE'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Cpu size={10} style={{ color: 'var(--openbb-cyan)' }} /> LLM BRAIN
              </span>
              <span style={{ color: 'var(--openbb-cyan)', fontWeight: 800 }}>⚡ 1.6s</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span className={isWsConnected ? 'pulse-dot-green' : 'pulse-dot-amber'} title={isWsConnected ? 'Telemetry & Broker Live' : 'Offline'} />
          </div>
        )}

        {/* AI Copilot Button */}
        <button
          onClick={onOpenCopilot}
          title={isCollapsed ? 'AI Copilot Desk [Alt+C]' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%)',
            color: '#000000',
            fontFamily: 'var(--font-heading)',
            fontSize: isCollapsed ? '0.70rem' : '0.80rem',
            fontWeight: 800,
            padding: isCollapsed ? '8px 0' : '8px 10px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            boxShadow: '0 4px 16px rgba(0, 229, 255, 0.35)',
            transition: 'all 0.15s ease',
          }}
        >
          <Sparkles size={15} />
          {!isCollapsed && <span>AI Copilot Desk</span>}
        </button>
      </div>
    </aside>
  );
};
