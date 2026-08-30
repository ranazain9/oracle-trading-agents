import React, { useState, useEffect } from 'react';
import { Search, Play, Shield, Terminal, MessageSquare, AlertTriangle, Sparkles, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRunPipeline: () => void;
  onBodyguardScan: () => void;
  onOpenStateInspector: () => void;
  onOpenCopilot: () => void;
  onKillSwitch: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onRunPipeline,
  onBodyguardScan,
  onOpenStateInspector,
  onOpenCopilot,
  onKillSwitch,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Run Autonomous AI Pipeline', desc: 'Execute 8-agent cognitive alpha cycle', icon: <Play size={15} style={{ color: 'var(--openbb-cyan)' }} />, act: onRunPipeline },
    { label: 'Bodyguard Risk Scan', desc: 'Audit open positions with 15s ratchet floor', icon: <Shield size={15} style={{ color: 'var(--openbb-amber)' }} />, act: onBodyguardScan },
    { label: 'Inspect Cognitive State', desc: 'View raw LangGraph state JSON graph', icon: <Terminal size={15} style={{ color: 'var(--openbb-purple)' }} />, act: onOpenStateInspector },
    { label: 'Open AI Copilot Desk', desc: 'Ask Copilot for trade thesis & Greek insights', icon: <Sparkles size={15} style={{ color: 'var(--openbb-cyan)' }} />, act: onOpenCopilot },
    { label: 'Emergency Portfolio Kill Switch', desc: 'Liquidate all open options positions instantly', icon: <AlertTriangle size={15} style={{ color: 'var(--openbb-crimson)' }} />, act: onKillSwitch },
  ];

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()) || a.desc.toLowerCase().includes(query.toLowerCase()));

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(3, 6, 12, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '14vh',
        paddingLeft: '16px',
        paddingRight: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="openbb-card fade-in-view"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'linear-gradient(180deg, #10192A 0%, #0A0F1A 100%)',
          border: '1px solid rgba(0, 229, 255, 0.35)',
          padding: 0,
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 229, 255, 0.15)',
          overflow: 'hidden',
          borderRadius: '10px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--openbb-border)', gap: '10px' }}>
          <Search size={17} style={{ color: 'var(--openbb-cyan)' }} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search action (e.g. Pipeline, Risk, Copilot)..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-pure)',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.94rem',
              fontWeight: 600,
              outline: 'none',
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '6px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              No matching commands found.
            </div>
          ) : (
            filtered.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  item.act();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 229, 255, 0.10)';
                  e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-pure)', fontSize: '0.84rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                    {item.label}
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: '0.70rem', fontFamily: 'var(--font-mono)' }}>
                    {item.desc}
                  </div>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  ↵ SELECT
                </span>
              </div>
            ))
          )}
        </div>

        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--openbb-border)',
          background: 'rgba(0, 0, 0, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.68rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)'
        }}>
          <span>ESC to exit</span>
          <span>ORACLE Cognitive Terminal v5.0</span>
        </div>
      </div>
    </div>
  );
};
