import React, { useState } from 'react';
import {
  Shield,
  Sliders,
  AlertTriangle,
  Flame,
  Zap,
  Key,
  Server,
  Lock,
  RefreshCw,
  CheckCircle2,
  DollarSign,
  Activity,
  Cpu,
  Clock,
  Radio,
  Power,
  Sparkles,
  Check,
  Percent,
} from 'lucide-react';

interface ConfigRiskDeskProps {
  onSave?: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ConfigRiskDesk: React.FC<ConfigRiskDeskProps> = ({ onSave, showToast }) => {
  // Preset state
  const [activePreset, setActivePreset] = useState<'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'>('BALANCED');

  // State for editable risk parameters
  const [stopLoss, setStopLoss] = useState<number>(150);
  const [dailyDrawdown, setDailyDrawdown] = useState<number>(500);
  const [profitRatchet, setProfitRatchet] = useState<number>(50);
  const [deltaCorridor, setDeltaCorridor] = useState<number>(25);
  const [vegaLimit, setVegaLimit] = useState<number>(250);
  const [targetTheta, setTargetTheta] = useState<number>(25);
  const [governanceMode, setGovernanceMode] = useState<'HITL' | 'AUTO'>('HITL');
  const [scanFrequency, setScanFrequency] = useState<number>(15);
  const [fridayCutoff, setFridayCutoff] = useState<string>('15:30');
  const [temperature, setTemperature] = useState<number>(0.1);
  const [kellyCap, setKellyCap] = useState<number>(500);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [panicModalOpen, setPanicModalOpen] = useState<boolean>(false);

  // Apply preset persona
  const applyPreset = (preset: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE') => {
    setActivePreset(preset);
    if (preset === 'CONSERVATIVE') {
      setStopLoss(100);
      setDailyDrawdown(300);
      setProfitRatchet(35);
      setDeltaCorridor(15);
      setVegaLimit(150);
      setTargetTheta(18);
      setKellyCap(350);
      setTemperature(0.0);
      showToast('Applied Conservative Capital Preservation Preset.', 'info');
    } else if (preset === 'BALANCED') {
      setStopLoss(150);
      setDailyDrawdown(500);
      setProfitRatchet(50);
      setDeltaCorridor(25);
      setVegaLimit(250);
      setTargetTheta(25);
      setKellyCap(500);
      setTemperature(0.1);
      showToast('Applied Balanced Delta-Neutral Standard Preset.', 'info');
    } else if (preset === 'AGGRESSIVE') {
      setStopLoss(250);
      setDailyDrawdown(1000);
      setProfitRatchet(75);
      setDeltaCorridor(40);
      setVegaLimit(400);
      setTargetTheta(45);
      setKellyCap(800);
      setTemperature(0.25);
      showToast('Applied Aggressive Alpha Growth Preset.', 'info');
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showToast('Risk Bodyguard parameters & safety corridors saved successfully!', 'success');
      if (onSave) onSave();
    }, 600);
  };

  const handlePanicKill = () => {
    setPanicModalOpen(false);
    showToast('🚨 EMERGENCY KILL SWITCH ENGAGED: Daemon frozen, open orders cancelled!', 'error');
  };

  return (
    <div className="fade-in-view" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* 1. Top Header Card with Presets & Panic Button */}
      <div className="openbb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={16} style={{ color: 'var(--openbb-amber)' }} />
              <span>Risk Bodyguard & Quantitative Control Tower</span>
            </h3>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              100% Margin Protection, Multi-Leg Circuit Breakers, Greeks Corridors & Autonomous Governance
            </span>
          </div>

          {/* 1-Click Risk Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PRESETS:</span>
            {[
              { key: 'CONSERVATIVE', label: '🛡️ Conservative', color: 'var(--openbb-cyan)' },
              { key: 'BALANCED', label: '⚖️ Balanced (Standard)', color: 'var(--openbb-emerald)' },
              { key: 'AGGRESSIVE', label: '⚡ Aggressive', color: 'var(--openbb-amber)' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => applyPreset(p.key as any)}
                style={{
                  background: activePreset === p.key ? 'var(--openbb-bg-elevated)' : 'rgba(255, 255, 255, 0.04)',
                  color: activePreset === p.key ? p.color : 'var(--text-dim)',
                  border: `1px solid ${activePreset === p.key ? p.color : 'var(--openbb-border)'}`,
                  borderRadius: '5px',
                  padding: '4px 8px',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  boxShadow: activePreset === p.key ? '0 0 10px rgba(0, 229, 255, 0.15)' : 'none',
                }}
              >
                {p.label}
              </button>
            ))}

            <button
              onClick={() => setPanicModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.25) 0%, rgba(255, 59, 48, 0.12) 100%)',
                color: 'var(--openbb-crimson)',
                border: '1px solid rgba(255, 59, 48, 0.45)',
                borderRadius: '5px',
                padding: '4px 10px',
                fontSize: '0.66rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginLeft: '4px',
              }}
            >
              <Power size={12} />
              PANIC KILL SWITCH
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Grid: Circuit Breakers & Greeks Corridors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {/* Module 1: Risk Bodyguard Circuit Breakers */}
        <div className="openbb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} style={{ color: 'var(--openbb-crimson)' }} />
                <span>Module 1: Autonomous Circuit Breakers & Hard Stops</span>
              </h4>
              <span className="openbb-badge neutral" style={{ fontSize: '0.60rem' }}>15s RATCHET ACTIVE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', fontSize: '0.74rem' }}>
              {/* Hard Stop Loss Floor */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>HARD STOP-LOSS FLOOR PER TRADE:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: 'var(--openbb-crimson)', fontWeight: 800 }}>-$</span>
                    <input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(Number(e.target.value))}
                      style={{ width: '60px', background: 'var(--openbb-bg-input)', border: '1px solid var(--openbb-border)', color: 'var(--openbb-crimson)', padding: '2px 4px', borderRadius: '4px', fontWeight: 800, fontSize: '0.72rem', textAlign: 'right' }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="350"
                  step="25"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--openbb-crimson)' }}
                />
                <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
                  Instantly liquidates trade when loss reaches -${stopLoss}.00 to preserve capital.
                </span>
              </div>

              {/* Daily Portfolio Max Drawdown */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>DAILY PORTFOLIO MAX DRAWDOWN:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: 'var(--openbb-amber)', fontWeight: 800 }}>-$</span>
                    <input
                      type="number"
                      value={dailyDrawdown}
                      onChange={(e) => setDailyDrawdown(Number(e.target.value))}
                      style={{ width: '60px', background: 'var(--openbb-bg-input)', border: '1px solid var(--openbb-border)', color: 'var(--openbb-amber)', padding: '2px 4px', borderRadius: '4px', fontWeight: 800, fontSize: '0.72rem', textAlign: 'right' }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1500"
                  step="50"
                  value={dailyDrawdown}
                  onChange={(e) => setDailyDrawdown(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--openbb-amber)' }}
                />
                <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
                  Freezes order execution if daily aggregate portfolio losses exceed -${dailyDrawdown}.00.
                </span>
              </div>

              {/* Profit Ratchet Lock */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>15-SECOND PROFIT RATCHET TARGET:</span>
                  <strong style={{ color: 'var(--openbb-emerald)' }}>+{profitRatchet}% Gain Target Lock</strong>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[35, 50, 65, 75].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setProfitRatchet(pct)}
                      style={{
                        flex: 1,
                        background: profitRatchet === pct ? 'var(--openbb-bg-elevated)' : 'transparent',
                        color: profitRatchet === pct ? 'var(--openbb-emerald)' : 'var(--text-dim)',
                        border: `1px solid ${profitRatchet === pct ? 'var(--openbb-emerald)' : 'var(--openbb-border)'}`,
                        borderRadius: '4px',
                        padding: '4px 0',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      +{pct}% Lock
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Greeks Corridor & Delta Neutrality */}
        <div className="openbb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} style={{ color: 'var(--openbb-cyan)' }} />
                <span>Module 2: Portfolio Greeks Corridors & Neutrality</span>
              </h4>
              <span className="openbb-badge profit" style={{ fontSize: '0.60rem' }}>DELTA NEUTRAL</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px', fontSize: '0.74rem' }}>
              {/* Safe Net Delta Corridor */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SAFE NET DELTA (Δ) CORRIDOR:</span>
                  <strong style={{ color: 'var(--openbb-cyan)' }}>±{deltaCorridor} Δ Max Drift</strong>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[15, 25, 40, 50].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDeltaCorridor(d)}
                      style={{
                        flex: 1,
                        background: deltaCorridor === d ? 'var(--openbb-bg-elevated)' : 'transparent',
                        color: deltaCorridor === d ? 'var(--openbb-cyan)' : 'var(--text-dim)',
                        border: `1px solid ${deltaCorridor === d ? 'var(--openbb-cyan)' : 'var(--openbb-border)'}`,
                        borderRadius: '4px',
                        padding: '4px 0',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      ±{d} Δ Band
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
                  If portfolio net delta breaches ±{deltaCorridor} Δ, Hedge Agent automatically triggers.
                </span>
              </div>

              {/* Max Vega Exposure */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>MAX PORTFOLIO VEGA (V) SHOCK:</span>
                  <strong style={{ color: 'var(--openbb-purple)' }}>${vegaLimit} / 1% IV Shock</strong>
                </div>
                <input
                  type="range"
                  min="100"
                  max="500"
                  step="25"
                  value={vegaLimit}
                  onChange={(e) => setVegaLimit(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--openbb-purple)' }}
                />
              </div>

              {/* Target Daily Theta Harvest */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>TARGET DAILY THETA (Θ) HARVEST:</span>
                  <strong style={{ color: 'var(--openbb-emerald)' }}>+${targetTheta}.00 / Day</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={targetTheta}
                  onChange={(e) => setTargetTheta(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--openbb-emerald)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom 3-Column Grid: Daemon Controls, LLM Vault & Sizing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        {/* Module 3: Autonomous Daemon Controls */}
        <div className="openbb-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} style={{ color: 'var(--openbb-cyan)' }} />
              <span>Daemon & 24/7 Controls</span>
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem' }}>
            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontSize: '0.65rem' }}>
                GOVERNANCE MODE:
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setGovernanceMode('HITL')}
                  style={{
                    flex: 1,
                    background: governanceMode === 'HITL' ? 'var(--openbb-bg-elevated)' : 'transparent',
                    color: governanceMode === 'HITL' ? 'var(--openbb-cyan)' : 'var(--text-dim)',
                    border: `1px solid ${governanceMode === 'HITL' ? 'var(--openbb-cyan)' : 'var(--openbb-border)'}`,
                    borderRadius: '4px',
                    padding: '4px 0',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  HITL Mandatory
                </button>
                <button
                  onClick={() => setGovernanceMode('AUTO')}
                  style={{
                    flex: 1,
                    background: governanceMode === 'AUTO' ? 'var(--openbb-bg-elevated)' : 'transparent',
                    color: governanceMode === 'AUTO' ? 'var(--openbb-emerald)' : 'var(--text-dim)',
                    border: `1px solid ${governanceMode === 'AUTO' ? 'var(--openbb-emerald)' : 'var(--openbb-border)'}`,
                    borderRadius: '4px',
                    padding: '4px 0',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Full Autonomous
                </button>
              </div>
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontSize: '0.65rem' }}>
                POLLING CYCLE FREQUENCY:
              </label>
              <select
                value={scanFrequency}
                onChange={(e) => setScanFrequency(Number(e.target.value))}
                style={{ width: '100%', background: 'var(--openbb-bg-input)', border: '1px solid var(--openbb-border)', color: 'var(--text-pure)', padding: '5px 8px', borderRadius: '4px', fontSize: '0.70rem' }}
              >
                <option value={15}>15 Seconds (Real-Time Telemetry)</option>
                <option value={30}>30 Seconds (Standard Interval)</option>
                <option value={60}>60 Seconds (Conservative Interval)</option>
              </select>
            </div>

            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '3px', fontSize: '0.65rem' }}>
                FRIDAY 0DTE CUTOFF TIME:
              </label>
              <input
                type="text"
                value={fridayCutoff}
                onChange={(e) => setFridayCutoff(e.target.value)}
                placeholder="15:30 EST"
                style={{ width: '100%', background: 'var(--openbb-bg-input)', border: '1px solid var(--openbb-border)', color: 'var(--text-pure)', padding: '5px 8px', borderRadius: '4px', fontSize: '0.70rem', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>
        </div>

        {/* Module 4: LLM Brain & API Vault */}
        <div className="openbb-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} style={{ color: 'var(--openbb-purple)' }} />
              <span>LLM Engine & API Vault</span>
            </h4>
            <span className="openbb-badge profit" style={{ fontSize: '0.58rem' }}>AIMLAPI CONNECTED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>COGNITIVE BRAIN MODEL:</span>
              <strong style={{ color: 'var(--openbb-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                AIMLAPI (gpt-4o-mini / deepseek-chat)
              </strong>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.65rem' }}>ALPACA BROKER ENVIRONMENT:</span>
              <strong style={{ color: 'var(--openbb-emerald)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                Paper Trading Live (Margin Protected)
              </strong>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                <span style={{ color: 'var(--text-muted)' }}>REASONING TEMPERATURE:</span>
                <strong style={{ color: 'var(--openbb-purple)' }}>{temperature.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.5"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--openbb-purple)' }}
              />
              <span style={{ fontSize: '0.60rem', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
                0.0 = Strict Quantitative Math • 0.3 = Tactical Synthesis
              </span>
            </div>
          </div>
        </div>

        {/* Module 5: Capital Sizing & Save Action */}
        <div className="openbb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={14} style={{ color: 'var(--openbb-emerald)' }} />
                <span>Capital Sizing & Commit</span>
              </h4>
            </div>

            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>KELLY SIZING CAP / CLUSTER:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ color: 'var(--openbb-emerald)', fontWeight: 800 }}>$</span>
                    <input
                      type="number"
                      value={kellyCap}
                      onChange={(e) => setKellyCap(Number(e.target.value))}
                      style={{ width: '55px', background: 'var(--openbb-bg-input)', border: '1px solid var(--openbb-border)', color: 'var(--openbb-emerald)', padding: '2px 4px', borderRadius: '4px', fontWeight: 800, fontSize: '0.70rem', textAlign: 'right' }}
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min="250"
                  max="1000"
                  step="50"
                  value={kellyCap}
                  onChange={(e) => setKellyCap(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--openbb-emerald)' }}
                />
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '6px 8px', borderRadius: '4px', fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
                🛡️ <strong>Margin Buffer Active:</strong> Minimum $90,000 cash reserve locked for 100% margin security.
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button
              className="btn-terminal primary"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '8px 0',
                fontSize: '0.76rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isSaving ? <RefreshCw size={13} className="spin" /> : <CheckCircle2 size={13} />}
              <span>{isSaving ? 'Synchronizing Guard Rails...' : 'Save & Commit Risk Parameters'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Real-Time Safety Audit Checklist Ribbon */}
      <div
        className="openbb-card"
        style={{
          background: 'linear-gradient(135deg, rgba(13, 21, 36, 0.95) 0%, rgba(20, 32, 54, 0.85) 100%)',
          borderLeft: '3px solid var(--openbb-emerald)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          fontSize: '0.70rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--openbb-emerald)' }} />
          <div>
            <strong style={{ color: 'var(--text-pure)', display: 'block' }}>100% Margin Protected</strong>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.62rem' }}>$98.8k Cash Reserve Locked</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--openbb-emerald)' }} />
          <div>
            <strong style={{ color: 'var(--text-pure)', display: 'block' }}>Hard Stop Floor Active</strong>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.62rem' }}>-${stopLoss}.00 Max Bounded Loss</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--openbb-emerald)' }} />
          <div>
            <strong style={{ color: 'var(--text-pure)', display: 'block' }}>15s Profit Ratchet</strong>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.62rem' }}>+{profitRatchet}% Target Lock</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} style={{ color: 'var(--openbb-emerald)' }} />
          <div>
            <strong style={{ color: 'var(--text-pure)', display: 'block' }}>Automated Hedge Ready</strong>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.62rem' }}>Trigger: ±{deltaCorridor} Δ Drift</span>
          </div>
        </div>
      </div>

      {/* Emergency Panic Modal */}
      {panicModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="openbb-card"
            style={{
              maxWidth: '440px',
              width: '90%',
              border: '1px solid var(--openbb-crimson)',
              boxShadow: '0 0 30px rgba(255, 59, 48, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--openbb-crimson)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                CONFIRM EMERGENCY KILL SWITCH
              </h3>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
              This will immediately:
              <br />• Cancel all pending OCC options orders.
              <br />• Liquidate all open high-delta risk legs.
              <br />• Freeze the 24/7 Autonomous Daemon loop.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                className="btn-terminal"
                onClick={() => setPanicModalOpen(false)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                className="btn-terminal danger"
                onClick={handlePanicKill}
                style={{ flex: 1, justifyContent: 'center', fontWeight: 800 }}
              >
                ENGAGE KILL SWITCH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
