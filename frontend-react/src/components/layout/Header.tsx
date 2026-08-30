import React, { useState, useEffect } from 'react';
import { Play, Shield, Terminal, AlertTriangle, Search, Activity, Clock, Zap, Bot } from 'lucide-react';
import { SystemHealth } from '../../api/types';

interface HeaderProps {
  health: SystemHealth | null;
  isMarketOpen: boolean;
  isAutoPilotEnabled?: boolean;
  onToggleAutoPilot?: () => void;
  onRunPipeline: () => void;
  onBodyguardScan: () => void;
  onOpenStateInspector: () => void;
  onKillSwitch: () => void;
  onOpenCommandPalette: () => void;
  onOpenCopilot?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  isMarketOpen,
  isAutoPilotEnabled = true,
  onToggleAutoPilot,
  onRunPipeline,
  onBodyguardScan,
  onOpenStateInspector,
  onKillSwitch,
  onOpenCommandPalette,
  onOpenCopilot,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [sessionDetail, setSessionDetail] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      let estDate = now;
      try {
        const estStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
        estDate = new Date(estStr);
      } catch {}

      setTimeStr(estDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' EST');

      const day = estDate.getDay();
      const hour = estDate.getHours();
      const min = estDate.getMinutes();
      const totalMinutes = hour * 60 + min;

      const isWeekend = day === 0 || day === 6;
      const isRegularHours = !isWeekend && totalMinutes >= 570 && totalMinutes < 960;

      if (isRegularHours) {
        setSessionDetail('Live Session • Closes 04:00 PM EST');
      } else {
        if (day === 5 && totalMinutes >= 960) {
          setSessionDetail('Weekend • Opens Mon 09:30 AM EST');
        } else if (day === 6) {
          setSessionDetail('Weekend • Opens Mon 09:30 AM EST');
        } else if (day === 0) {
          setSessionDetail('Weekend • Opens Mon 09:30 AM EST');
        } else if (totalMinutes < 570) {
          setSessionDetail('Pre-Market • Opens 09:30 AM EST');
        } else {
          setSessionDetail('After-Hours • Opens Tomorrow 09:30 AM');
        }
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        background: 'linear-gradient(180deg, #0D1422 0%, #080C14 100%)',
        borderBottom: '1px solid var(--openbb-border)',
        padding: '6px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        minHeight: '44px',
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
        overflowX: 'auto',
      }}
    >
      {/* Left: Real-time Telemetry & Auto-Pilot Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Market Status */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: '9999px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 800,
            background: isMarketOpen ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 183, 3, 0.12)',
            color: isMarketOpen ? 'var(--openbb-emerald)' : 'var(--openbb-amber)',
            border: `1px solid ${isMarketOpen ? 'rgba(0, 230, 118, 0.40)' : 'rgba(255, 183, 3, 0.40)'}`,
            whiteSpace: 'nowrap',
          }}
        >
          <span className={isMarketOpen ? 'pulse-dot-green' : 'pulse-dot-amber'} />
          <span>{isMarketOpen ? 'NYSE/NASDAQ LIVE' : 'MARKET CLOSED'}</span>
        </div>

        {/* 24/7 Auto-Pilot Status */}
        <button
          onClick={onToggleAutoPilot}
          title="Click to toggle 24/7 Autonomous Auto-Pilot Mode"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: '9999px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 800,
            cursor: 'pointer',
            background: isAutoPilotEnabled
              ? 'linear-gradient(135deg, rgba(0, 230, 118, 0.18), rgba(0, 229, 255, 0.10))'
              : 'rgba(255, 183, 3, 0.12)',
            color: isAutoPilotEnabled ? 'var(--openbb-emerald)' : 'var(--openbb-amber)',
            border: `1px solid ${isAutoPilotEnabled ? 'rgba(0, 230, 118, 0.45)' : 'rgba(255, 183, 3, 0.35)'}`,
            boxShadow: isAutoPilotEnabled ? '0 0 10px rgba(0, 230, 118, 0.25)' : 'none',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
          }}
        >
          <Zap size={11} style={{ color: isAutoPilotEnabled ? 'var(--openbb-cyan)' : 'var(--openbb-amber)' }} />
          <span>{isAutoPilotEnabled ? '24/7 AUTO-PILOT' : 'MANUAL MODE'}</span>
        </button>

        {/* Session Time Detail */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-body)',
            fontSize: '0.68rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          <Clock size={12} style={{ color: 'var(--openbb-cyan)' }} />
          <span>{sessionDetail}</span>
        </div>

        {/* NY Clock */}
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.66rem', whiteSpace: 'nowrap' }}>
          NY: <strong style={{ color: 'var(--text-primary)' }}>{timeStr}</strong>
        </div>

        {health && (
          <span
            className="openbb-badge profit"
            style={{ fontSize: '0.60rem', background: 'rgba(0, 230, 118, 0.15)', whiteSpace: 'nowrap', padding: '1px 6px' }}
          >
            <Activity size={10} /> HEALTHY
          </span>
        )}
      </div>

      {/* Right: Action Buttons Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, whiteSpace: 'nowrap' }}>
        {/* AI Copilot Highlight Trigger */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            title="Open ORACLE AI Copilot Chat Desk"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '5px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.22) 0%, rgba(59, 130, 246, 0.22) 100%)',
              color: 'var(--text-pure)',
              border: '1px solid rgba(0, 229, 255, 0.55)',
              boxShadow: '0 0 12px rgba(0, 229, 255, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--openbb-cyan)';
              e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 229, 255, 0.6)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.55)';
              e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 229, 255, 0.35)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ color: 'var(--openbb-cyan)' }}>🤖</span>
            <span>AI Copilot</span>
          </button>
        )}

        <button className="btn-terminal primary" onClick={onRunPipeline} title="Execute Autonomous Multi-Agent Pipeline" style={{ padding: '4px 8px', fontSize: '0.68rem' }}>
          <Play size={11} /> Run Pipeline
        </button>

        <button className="btn-terminal" onClick={onBodyguardScan} title="Run Real-Time Risk Bodyguard Scan" style={{ padding: '4px 8px', fontSize: '0.68rem' }}>
          <Shield size={11} style={{ color: 'var(--openbb-amber)' }} /> Bodyguard
        </button>

        <button className="btn-terminal" onClick={onOpenStateInspector} title="Inspect Multi-Agent State" style={{ padding: '4px 8px', fontSize: '0.68rem' }}>
          <Terminal size={11} style={{ color: 'var(--openbb-purple)' }} /> Inspector
        </button>

        <button className="btn-terminal danger" onClick={onKillSwitch} title="Emergency Portfolio Liquidate" style={{ padding: '4px 8px', fontSize: '0.68rem' }}>
          <AlertTriangle size={11} /> Kill
        </button>

        <button
          className="btn-terminal"
          onClick={onOpenCommandPalette}
          title="Command Palette (Ctrl+K / Cmd+K)"
          style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', padding: '4px 7px' }}
        >
          <Search size={11} style={{ color: 'var(--openbb-cyan)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)' }}>⌘K</span>
        </button>
      </div>
    </header>
  );
};
