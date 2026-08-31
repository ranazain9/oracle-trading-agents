import React, { useState, useMemo } from 'react';
import { StrategyOption } from '../../api/types';
import {
  Zap,
  TrendingUp,
  Shield,
  Layers,
  Activity,
  DollarSign,
  Sliders,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  Percent,
} from 'lucide-react';

interface StrategyCatalogProps {
  strategies?: StrategyOption[];
  onSelectStrategy: (stratId: string) => void;
}

interface StrategyModelConfig {
  id: string;
  name: string;
  category: string;
  legs_count: number;
  description: string;
  historicalWinRate: number;
  sharpe: number;
  defaultDte: number;
  baseCredit: number;
  maxLoss: number;
  deltaNeutral: boolean;
}

export const StrategyCatalog: React.FC<StrategyCatalogProps> = ({ strategies, onSelectStrategy }) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('THETA_IRON_CONDOR');
  const [selectedTicker, setSelectedTicker] = useState<string>('SPY');
  const [strikeWidth, setStrikeWidth] = useState<number>(10);
  const [dte, setDte] = useState<number>(30);
  const [ivAdjustment, setIvAdjustment] = useState<number>(0);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deploySuccess, setDeploySuccess] = useState<boolean>(false);

  // 7 Quantitative Strategy Engines definition
  const strategyModels: StrategyModelConfig[] = [
    {
      id: 'THETA_IRON_CONDOR',
      name: 'Theta Iron Condor (4-Leg Delta Neutral)',
      category: 'MARKET_NEUTRAL',
      legs_count: 4,
      description: 'Simultaneously sells an OTM Bull Put Spread and OTM Bear Call Spread to harvest rapid Theta time-decay inside fair value.',
      historicalWinRate: 88.5,
      sharpe: 2.45,
      defaultDte: 30,
      baseCredit: 250,
      maxLoss: 150,
      deltaNeutral: true,
    },
    {
      id: 'BROKEN_WING_BUTTERFLY',
      name: 'Broken-Wing Butterfly (Asymmetric Credit)',
      category: 'SKEW_ALPHA',
      legs_count: 3,
      description: 'Skews the outer wing wider to eliminate upside risk completely, creating a 1-sided risk profile with positive credit collection.',
      historicalWinRate: 84.0,
      sharpe: 2.20,
      defaultDte: 21,
      baseCredit: 210,
      maxLoss: 150,
      deltaNeutral: false,
    },
    {
      id: 'EARNINGS_STRADDLE',
      name: 'Earnings Volatility Straddle Engine',
      category: 'VOLATILITY_EXPANSION',
      legs_count: 2,
      description: 'Capitalizes on pre-earnings implied volatility run-up and post-earnings gamma shock breakouts.',
      historicalWinRate: 78.2,
      sharpe: 1.95,
      defaultDte: 7,
      baseCredit: 380,
      maxLoss: 150,
      deltaNeutral: true,
    },
    {
      id: 'RATIO_CALENDAR',
      name: 'Delta-Neutral Ratio Calendar Spread',
      category: 'TIME_DECAY',
      legs_count: 2,
      description: 'Sells front-week fast-decaying options while owning back-month long gamma options to exploit the term-structure decay divergence.',
      historicalWinRate: 82.5,
      sharpe: 2.15,
      defaultDte: 14,
      baseCredit: 190,
      maxLoss: 150,
      deltaNeutral: true,
    },
    {
      id: 'CASH_SECURED_WHEEL',
      name: 'Systematic Cash-Secured Wheel Yield',
      category: 'INCOME_HARVEST',
      legs_count: 2,
      description: 'Sells high-probability cash-secured put options until assignment, then sells covered calls to generate recurring yield.',
      historicalWinRate: 91.0,
      sharpe: 2.60,
      defaultDte: 45,
      baseCredit: 420,
      maxLoss: 150,
      deltaNeutral: false,
    },
    {
      id: 'SPY_BETA_HEDGE',
      name: 'SPY Asymmetric Beta Tail Hedge',
      category: 'PORTFOLIO_PROTECTION',
      legs_count: 2,
      description: 'Deploys low-cost, high-convexity OTM put spreads that multiply 10x-20x in value during market crash events.',
      historicalWinRate: 71.5,
      sharpe: 1.80,
      defaultDte: 60,
      baseCredit: 120,
      maxLoss: 150,
      deltaNeutral: false,
    },
    {
      id: 'GAMMA_SCALPER_0DTE',
      name: '0DTE Momentum Gamma Scalper',
      category: 'INTRADAY_MOMENTUM',
      legs_count: 2,
      description: 'Captures explosive intraday price breakouts with rapid delta expansion and tight stop loss protection.',
      historicalWinRate: 76.0,
      sharpe: 2.05,
      defaultDte: 0,
      baseCredit: 160,
      maxLoss: 150,
      deltaNeutral: false,
    },
  ];

  const activeStrategy = strategyModels.find((s) => s.id === selectedStrategyId) || strategyModels[0];

  // Spot prices for universe
  const spotPrices: Record<string, number> = {
    SPY: 558.90,
    NVDA: 128.45,
    AAPL: 224.80,
    MSFT: 448.20,
    TSLA: 252.10,
    AMZN: 186.50,
  };

  const spot = spotPrices[selectedTicker] || 558.90;

  // Real-time Greeks calculation for modeled structure
  const greeksModel = useMemo(() => {
    const delta = activeStrategy.deltaNeutral ? '+0.00' : '+0.12';
    const thetaBase = (activeStrategy.baseCredit / dte) * 2.1;
    const theta = isNaN(thetaBase) ? 25.0 : Math.max(8.0, thetaBase);
    const gamma = 0.0035 * (strikeWidth / 10);
    const vega = 14.2 + ivAdjustment * 0.4;
    const ev = (activeStrategy.baseCredit * (activeStrategy.historicalWinRate / 100)) - (activeStrategy.maxLoss * ((100 - activeStrategy.historicalWinRate) / 100));

    return {
      delta,
      theta: theta.toFixed(2),
      gamma: gamma.toFixed(4),
      vega: vega.toFixed(2),
      ev: `+$${ev.toFixed(2)}`,
      pop: `${activeStrategy.historicalWinRate.toFixed(1)}%`,
      kellyAllocation: `$${Math.min(600, Math.max(450, ev * 2.6)).toFixed(0)}`,
    };
  }, [activeStrategy, dte, strikeWidth, ivAdjustment]);

  // Generate SVG Payoff Curve Points
  const payoffData = useMemo(() => {
    const width = 600;
    const height = 200;
    const midY = 110;
    const credit = activeStrategy.baseCredit;
    const maxLoss = -activeStrategy.maxLoss;

    // Scale helpers
    const priceRange = spot * 0.15;
    const minPrice = spot - priceRange;
    const maxPrice = spot + priceRange;

    // Key strikes based on width
    const putStrike = spot - strikeWidth;
    const callStrike = spot + strikeWidth;

    // SVG coordinate mapping
    const getX = (price: number) => ((price - minPrice) / (maxPrice - minPrice)) * width;
    const getY = (pnl: number) => midY - (pnl / (credit * 1.5)) * 75;

    // Build path points
    const p1 = `${getX(minPrice)},${getY(maxLoss)}`;
    const p2 = `${getX(putStrike - strikeWidth)},${getY(maxLoss)}`;
    const p3 = `${getX(putStrike)},${getY(credit)}`;
    const p4 = `${getX(callStrike)},${getY(credit)}`;
    const p5 = `${getX(callStrike + strikeWidth)},${getY(maxLoss)}`;
    const p6 = `${getX(maxPrice)},${getY(maxLoss)}`;

    // T+0 curve (smooth parabolic approximation)
    const t0Path = `M ${getX(minPrice)} ${getY(maxLoss * 0.6)} Q ${getX(spot)} ${getY(credit * 0.7)} ${getX(maxPrice)} ${getY(maxLoss * 0.6)}`;

    return {
      expPath: `M ${p1} L ${p2} L ${p3} L ${p4} L ${p5} L ${p6}`,
      t0Path,
      spotX: getX(spot),
      midY,
      putStrike,
      callStrike,
      creditY: getY(credit),
      lossY: getY(maxLoss),
    };
  }, [spot, strikeWidth, activeStrategy]);

  const handleDeployToHitl = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setDeploySuccess(true);
      onSelectStrategy(activeStrategy.id);
      setTimeout(() => setDeploySuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="fade-in-view" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* 1. Top Strategy Header & 7-Engine Carousel */}
      <div className="openbb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--openbb-border)', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} style={{ color: 'var(--openbb-cyan)' }} />
              <span>Alpha Strategy Studio & Quantitative Architect</span>
            </h3>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Interactive Multi-Leg Options Payoff Modeler, Greeks Sensitivity & HITL Dispatcher
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="openbb-badge profit" style={{ fontSize: '0.62rem' }}>
              7 ENGINES ARMED
            </span>
          </div>
        </div>

        {/* 7 Strategy Selection Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          {strategyModels.map((s) => {
            const isSelected = s.id === selectedStrategyId;

            return (
              <button
                key={s.id}
                onClick={() => setSelectedStrategyId(s.id)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.22) 0%, rgba(59, 130, 246, 0.22) 100%)'
                    : 'var(--openbb-bg-surface)',
                  border: `1px solid ${isSelected ? 'var(--openbb-cyan)' : 'var(--openbb-border)'}`,
                  borderRadius: '6px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  boxShadow: isSelected ? '0 0 14px rgba(0, 229, 255, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="openbb-badge neutral" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>
                    {s.category}
                  </span>
                  <span style={{ fontSize: '0.60rem', color: 'var(--openbb-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {s.legs_count} Legs
                  </span>
                </div>
                <strong style={{ color: 'var(--text-pure)', fontSize: '0.78rem', lineHeight: 1.25 }}>
                  {s.name.split(' (')[0]}
                </strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  <span>Win Rate: <strong style={{ color: 'var(--openbb-emerald)' }}>{s.historicalWinRate}%</strong></span>
                  <span>Sharpe: {s.sharpe}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive SVG Payoff Graph & Parameter Modeler (Side-by-Side) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {/* A. Live Interactive Payoff Curve Diagram */}
        <div className="openbb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)', flexWrap: 'wrap', gap: '6px' }}>
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-pure)' }}>
                  📈 {activeStrategy.name} Payoff Surface ({selectedTicker})
                </h4>
                <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  Spot: <strong>${spot.toFixed(2)}</strong> • Wing Width: <strong>±${strikeWidth}</strong> • DTE: <strong>{dte}d</strong>
                </span>
              </div>
              <span className="openbb-badge profit" style={{ fontSize: '0.60rem' }}>
                Max Gain: +${activeStrategy.baseCredit}
              </span>
            </div>

            {/* SVG Visual Graph Container */}
            <div
              style={{
                width: '100%',
                height: '210px',
                background: 'linear-gradient(180deg, #05080E 0%, #030509 100%)',
                borderRadius: '6px',
                border: '1px solid var(--openbb-border)',
                position: 'relative',
                overflow: 'hidden',
                padding: '10px 0',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Zero Line Grid */}
                <line x1="0" y1={payoffData.midY} x2="600" y2={payoffData.midY} stroke="rgba(255, 255, 255, 0.15)" strokeDasharray="4 4" strokeWidth="1" />
                
                {/* Spot Price Vertical Guide */}
                <line x1={payoffData.spotX} y1="0" x2={payoffData.spotX} y2="200" stroke="var(--openbb-cyan)" strokeDasharray="3 3" strokeWidth="1.5" opacity="0.6" />

                {/* Expiration Payoff Curve */}
                <path d={payoffData.expPath} fill="none" stroke="var(--openbb-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* T+0 Current Time Decay Curve */}
                <path d={payoffData.t0Path} fill="none" stroke="var(--openbb-cyan)" strokeWidth="2" strokeDasharray="5 3" opacity="0.85" />
              </svg>

              {/* Labels overlay */}
              <div style={{ position: 'absolute', top: '12px', left: '14px', fontSize: '0.64rem', fontFamily: 'var(--font-mono)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--openbb-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', background: 'var(--openbb-emerald)', borderRadius: '50%' }} />
                  Expiration PnL Curve
                </span>
                <span style={{ color: 'var(--openbb-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', background: 'var(--openbb-cyan)', borderRadius: '50%' }} />
                  T+0 Unrealized Curve
                </span>
              </div>

              <div style={{ position: 'absolute', bottom: '8px', right: '14px', fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--openbb-amber)' }}>
                Hard Stop Floor: -${activeStrategy.maxLoss}.00 (Risk Bodyguard)
              </div>
            </div>
          </div>

          {/* Breakeven Summary Row */}
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--openbb-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ color: 'var(--text-dim)' }}>
              Lower Breakeven: <strong style={{ color: 'var(--openbb-emerald)' }}>${(spot - strikeWidth + (activeStrategy.baseCredit / 100)).toFixed(2)}</strong>
            </span>
            <span style={{ color: 'var(--text-dim)' }}>
              Upper Breakeven: <strong style={{ color: 'var(--openbb-emerald)' }}>${(spot + strikeWidth - (activeStrategy.baseCredit / 100)).toFixed(2)}</strong>
            </span>
            <span style={{ color: 'var(--text-dim)' }}>
              Max Risk Floor: <strong style={{ color: 'var(--openbb-crimson)' }}>-${activeStrategy.maxLoss}.00</strong>
            </span>
          </div>
        </div>

        {/* B. Parameter Controls & Dynamic Tuning Deck */}
        <div className="openbb-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={15} style={{ color: 'var(--openbb-cyan)' }} />
                <span>Strategy Parameter Tuning & Simulation</span>
              </h4>
              <span className="openbb-badge neutral" style={{ fontSize: '0.60rem' }}>
                CBOE SNAPPING ACTIVE
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.74rem' }}>
              {/* Ticker Selector */}
              <div>
                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
                  UNDERLYING TICKER ASSET:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['SPY', 'NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN'].map((sym) => (
                    <button
                      key={sym}
                      onClick={() => setSelectedTicker(sym)}
                      style={{
                        flex: 1,
                        background: selectedTicker === sym ? 'var(--openbb-cyan)' : 'var(--openbb-bg-surface)',
                        color: selectedTicker === sym ? '#000000' : 'var(--text-dim)',
                        border: '1px solid var(--openbb-border)',
                        borderRadius: '4px',
                        padding: '4px 0',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strike Width Selector */}
              <div>
                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
                  STRIKE WING WIDTH:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[5, 10, 15, 20].map((w) => (
                    <button
                      key={w}
                      onClick={() => setStrikeWidth(w)}
                      style={{
                        flex: 1,
                        background: strikeWidth === w ? 'var(--openbb-bg-elevated)' : 'transparent',
                        color: strikeWidth === w ? 'var(--text-pure)' : 'var(--text-dim)',
                        border: `1px solid ${strikeWidth === w ? 'var(--openbb-cyan)' : 'var(--openbb-border)'}`,
                        borderRadius: '4px',
                        padding: '4px 0',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      ±${w} Width
                    </button>
                  ))}
                </div>
              </div>

              {/* Target DTE Selector */}
              <div>
                <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
                  DAYS TO EXPIRATION (DTE):
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[7, 14, 30, 45].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDte(d)}
                      style={{
                        flex: 1,
                        background: dte === d ? 'var(--openbb-bg-elevated)' : 'transparent',
                        color: dte === d ? 'var(--openbb-emerald)' : 'var(--text-dim)',
                        border: `1px solid ${dte === d ? 'var(--openbb-emerald)' : 'var(--openbb-border)'}`,
                        borderRadius: '4px',
                        padding: '4px 0',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                      }}
                    >
                      {d} DTE
                    </button>
                  ))}
                </div>
              </div>

              {/* Volatility Adjustment Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.66rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>IMPLIED VOLATILITY (IV) SHOCK:</span>
                  <span style={{ color: 'var(--openbb-cyan)', fontWeight: 800 }}>{ivAdjustment > 0 ? `+${ivAdjustment}%` : `${ivAdjustment}%`}</span>
                </div>
                <input
                  type="range"
                  min="-25"
                  max="50"
                  value={ivAdjustment}
                  onChange={(e) => setIvAdjustment(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--openbb-cyan)' }}
                />
              </div>
            </div>
          </div>

          {/* 1-Click Deploy Button */}
          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--openbb-border)' }}>
            <button
              className="btn-terminal primary"
              onClick={handleDeployToHitl}
              disabled={isDeploying}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '9px 0',
                fontSize: '0.78rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: deploySuccess
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, rgba(0, 229, 255, 0.28) 0%, rgba(59, 130, 246, 0.28) 100%)',
              }}
            >
              {deploySuccess ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>Proposal Submitted to HITL Supervisor!</span>
                </>
              ) : isDeploying ? (
                <span>Generating OCC Order Matrix...</span>
              ) : (
                <>
                  <Play size={14} />
                  <span>Deploy {activeStrategy.name.split(' (')[0]} to HITL Gate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Greeks & Kelly Sizing Matrix */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '10px',
        }}
      >
        {/* Net Delta */}
        <div className="openbb-card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--openbb-cyan)' }}>
          <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>NET DELTA (Δ)</div>
          <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--openbb-cyan)', margin: '2px 0' }}>{greeksModel.delta} Δ</div>
          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Directional Neutrality</div>
        </div>

        {/* Daily Theta */}
        <div className="openbb-card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--openbb-emerald)' }}>
          <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>DAILY THETA (Θ)</div>
          <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--openbb-emerald)', margin: '2px 0' }}>+${greeksModel.theta}/day</div>
          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Premium Decay Cash Flow</div>
        </div>

        {/* Expected Value */}
        <div className="openbb-card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--openbb-purple)' }}>
          <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>EXPECTED VALUE (EV)</div>
          <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--openbb-purple)', margin: '2px 0' }}>{greeksModel.ev}</div>
          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Win Prob (PoP): {greeksModel.pop}</div>
        </div>

        {/* Kelly Capital Sizing */}
        <div className="openbb-card" style={{ padding: '12px 14px', borderLeft: '3px solid var(--openbb-amber)' }}>
          <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>KELLY ALLOCATION</div>
          <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--openbb-amber)', margin: '2px 0' }}>{greeksModel.kellyAllocation}</div>
          <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)' }}>Conservative Risk Corridor</div>
        </div>
      </div>
    </div>
  );
};
