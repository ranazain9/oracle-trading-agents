import React, { useState, useEffect, useRef } from 'react';
import { Play, Shield, Terminal, AlertTriangle, Search, Activity, Clock, Zap, Sparkles, MoreVertical, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      style={{
        background: 'linear-gradient(180deg, #0D1422 0%, #080C14 100%)',
        borderBottom: '1px solid var(--openbb-border)',
        padding: '6px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        minHeight: '44px',
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
      }}
    >
      {/* Left: Real-time Telemetry & Auto-Pilot Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, overflowX: 'auto' }}>
        {/* Market Status */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 7px',
            borderRadius: '9999px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
            fontWeight: 800,
            background: isMarketOpen ? 'rgba(0, 230, 118, 0.12)' : 'rgba(255, 183, 3, 0.12)',
            color: isMarketOpen ? 'var(--openbb-emerald)' : 'var(--openbb-amber)',
            border: `1px solid ${isMarketOpen ? 'rgba(0, 230, 118, 0.40)' : 'rgba(255, 183, 3, 0.40)'}`,
            whiteSpace: 'nowrap',
          }}
        >
          <span className={isMarketOpen ? 'pulse-dot-green' : 'pulse-dot-amber'} />
          <span>{isMarketOpen ? 'NYSE LIVE' : 'CLOSED'}</span>
        </div>

        {/* 24/7 Auto-Pilot Status */}
        <button
          onClick={onToggleAutoPilot}
          title="Click to toggle 24/7 Autonomous Auto-Pilot Mode"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 7px',
            borderRadius: '9999px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.62rem',
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
          <Zap size={10} style={{ color: isAutoPilotEnabled ? 'var(--openbb-cyan)' : 'var(--openbb-amber)' }} />
          <span>{isAutoPilotEnabled ? 'AUTO-PILOT' : 'MANUAL'}</span>
        </button>

        {/* Session Time Detail (Desktop/Tablet) */}
        <div
          className="mobile-hide"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-body)',
            fontSize: '0.66rem',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
          }}
        >
          <Clock size={11} style={{ color: 'var(--openbb-cyan)' }} />
          <span>{sessionDetail}</span>
        </div>

        {/* NY Clock (Desktop only) */}
        <div className="desktop-only" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', fontSize: '0.64rem', whiteSpace: 'nowrap' }}>
          NY: <strong style={{ color: 'var(--text-primary)' }}>{timeStr}</strong>
        </div>

        {health && (
          <span
            className="openbb-badge profit tablet-hide"
            style={{ fontSize: '0.58rem', background: 'rgba(0, 230, 118, 0.15)', whiteSpace: 'nowrap', padding: '1px 5px' }}
          >
            <Activity size={9} /> HEALTHY
          </span>
        )}
      </div>

      {/* Right Group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, position: 'relative' }} ref={menuRef}>
        {/* AI Copilot Trigger (Always Accessible) */}
        {onOpenCopilot && (
          <button
            onClick={onOpenCopilot}
            title="Open ORACLE AI Copilot Chat Desk"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '5px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.66rem',
              fontWeight: 800,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.22) 0%, rgba(59, 130, 246, 0.22) 100%)',
              color: 'var(--text-pure)',
              border: '1px solid rgba(0, 229, 255, 0.55)',
              boxShadow: '0 0 10px rgba(0, 229, 255, 0.30)',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Sparkles size={12} style={{ color: 'var(--openbb-cyan)' }} />
            <span>Copilot</span>
          </button>
        )}

        {/* Desktop Quick Actions */}
        <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button className="btn-terminal primary" onClick={onRunPipeline} title="Execute Autonomous Multi-Agent Pipeline" style={{ padding: '4px 7px', fontSize: '0.66rem' }}>
            <Play size={10} /> Run Pipeline
          </button>

          <button className="btn-terminal" onClick={onBodyguardScan} title="Run Real-Time Risk Bodyguard Scan" style={{ padding: '4px 7px', fontSize: '0.66rem' }}>
            <Shield size={10} style={{ color: 'var(--openbb-amber)' }} /> Bodyguard
          </button>

          <button className="btn-terminal" onClick={onOpenStateInspector} title="Inspect Multi-Agent State" style={{ padding: '4px 7px', fontSize: '0.66rem' }}>
            <Terminal size={10} style={{ color: 'var(--openbb-purple)' }} /> Inspector
          </button>

          <button className="btn-terminal danger" onClick={onKillSwitch} title="Emergency Portfolio Liquidate" style={{ padding: '4px 7px', fontSize: '0.66rem' }}>
            <AlertTriangle size={10} /> Kill
          </button>

          <button
            className="btn-terminal"
            onClick={onOpenCommandPalette}
            title="Command Palette (Ctrl+K / Cmd+K)"
            style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', padding: '4px 6px' }}
          >
            <Search size={10} style={{ color: 'var(--openbb-cyan)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.60rem', color: 'var(--text-muted)' }}>⌘K</span>
          </button>
        </div>

        {/* Mobile Quick Action Dropdown Trigger (< 768px) */}
        <button
          className="mobile-only"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: isMobileMenuOpen ? 'var(--openbb-bg-elevated)' : 'var(--openbb-bg-surface)',
            border: '1px solid var(--openbb-border-medium)',
            color: 'var(--text-pure)',
            padding: '5px 8px',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Terminal Actions Menu"
        >
          {isMobileMenuOpen ? <X size={14} /> : <MoreVertical size={14} />}
        </button>

        {/* Mobile Actions Dropdown Popover */}
        {isMobileMenuOpen && (
          <div
            className="openbb-card"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '6px',
              width: '210px',
              zIndex: 9999,
              background: 'linear-gradient(135deg, #111B2C 0%, #0A0F1A 100%)',
              border: '1px solid var(--openbb-border-medium)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.85)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '10px',
            }}
          >
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '2px' }}>
              Quick Actions
            </div>

            <button
              className="btn-terminal primary"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onRunPipeline();
              }}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 8px' }}
            >
              <Play size={12} /> Run Pipeline
            </button>

            <button
              className="btn-terminal"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onBodyguardScan();
              }}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 8px' }}
            >
              <Shield size={12} style={{ color: 'var(--openbb-amber)' }} /> Bodyguard Scan
            </button>

            <button
              className="btn-terminal"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenStateInspector();
              }}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 8px' }}
            >
              <Terminal size={12} style={{ color: 'var(--openbb-purple)' }} /> State Inspector
            </button>

            <button
              className="btn-terminal"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenCommandPalette();
              }}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 8px' }}
            >
              <Search size={12} style={{ color: 'var(--openbb-cyan)' }} /> Command Palette
            </button>

            <div style={{ height: '1px', background: 'var(--openbb-border)', margin: '2px 0' }} />

            <button
              className="btn-terminal danger"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onKillSwitch();
              }}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 8px' }}
            >
              <AlertTriangle size={12} /> Emergency Kill Switch
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

