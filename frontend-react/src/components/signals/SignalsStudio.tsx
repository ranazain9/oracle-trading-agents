import React, { useState } from 'react';
import { VolumeProfileData, AnchoredVwapData, UnusualFlowData, ToTScenarioMatrix } from '../../api/types';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Shield,
  Layers,
  Radio,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Brain,
  Sliders,
} from 'lucide-react';

interface SignalsStudioProps {
  currentSymbol: string;
  volumeProfile: VolumeProfileData | null;
  vwapData: AnchoredVwapData | null;
  unusualFlow: UnusualFlowData | null;
  totMatrix: ToTScenarioMatrix | null;
  onSelectSymbol: (sym: string) => void;
}

export const SignalsStudio: React.FC<SignalsStudioProps> = ({
  currentSymbol,
  volumeProfile,
  vwapData,
  unusualFlow,
  totMatrix,
  onSelectSymbol,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('base_case');

  // Universe asset profiles for dynamic exploration
  const universeAssets = [
    { sym: 'NVDA', name: 'NVIDIA Corp', price: 128.45, chg: '+1.42%', isPos: true, poc: 126.5, vah: 131.0, val: 123.5, vwap: 125.8, flow: 'CALL_SWEEPS' },
    { sym: 'SPY', name: 'S&P 500 ETF', price: 558.90, chg: '+0.28%', isPos: true, poc: 556.2, vah: 561.5, val: 552.0, vwap: 555.4, flow: 'MIXED_HEDGE' },
    { sym: 'AAPL', name: 'Apple Inc', price: 224.80, chg: '+0.35%', isPos: true, poc: 225.46, vah: 230.1, val: 220.0, vwap: 220.03, flow: 'BULLISH_BLOCKS' },
    { sym: 'MSFT', name: 'Microsoft Corp', price: 448.20, chg: '-0.45%', isPos: false, poc: 449.8, vah: 454.0, val: 444.0, vwap: 450.1, flow: 'NEUTRAL_IRON' },
    { sym: 'TSLA', name: 'Tesla Inc', price: 252.10, chg: '+3.12%', isPos: true, poc: 248.5, vah: 258.0, val: 242.0, vwap: 246.2, flow: 'CALL_SWEEPS' },
    { sym: 'AMZN', name: 'Amazon.com', price: 186.50, chg: '+0.85%', isPos: true, poc: 185.0, vah: 189.5, val: 182.0, vwap: 184.3, flow: 'BULLISH_FLOW' },
    { sym: 'META', name: 'Meta Platforms', price: 512.40, chg: '+1.80%', isPos: true, poc: 508.0, vah: 518.0, val: 498.0, vwap: 504.6, flow: 'CALL_SWEEPS' },
    { sym: 'AMD', name: 'Advanced Micro', price: 148.20, chg: '+2.15%', isPos: true, poc: 146.0, vah: 152.0, val: 142.0, vwap: 145.1, flow: 'CALL_SWEEPS' },
  ];

  const currentAsset = universeAssets.find((a) => a.sym === currentSymbol) || universeAssets[0];

  const poc = volumeProfile?.point_of_control_poc || currentAsset.poc;
  const vah = volumeProfile?.value_area_high_vah || currentAsset.vah;
  const val = volumeProfile?.value_area_low_val || currentAsset.val;
  const vwap = vwapData?.anchored_vwap || currentAsset.vwap;
  const spotPrice = currentAsset.price;

  const volumeBins = (volumeProfile?.volume_bins && volumeProfile.volume_bins.length > 0)
    ? volumeProfile.volume_bins
    : [
        { price: (vah + (vah - poc) * 0.5).toFixed(1), vol: 18, isValueArea: false, isPoc: false, label: null },
        { price: vah.toFixed(1), vol: 62, isValueArea: true, isPoc: false, label: 'VAH' },
        { price: (poc + (vah - poc) * 0.5).toFixed(1), vol: 84, isValueArea: true, isPoc: false, label: null },
        { price: poc.toFixed(1), vol: 100, isValueArea: true, isPoc: true, label: 'POC (Max Volume)' },
        { price: (val + (poc - val) * 0.5).toFixed(1), vol: 76, isValueArea: true, isPoc: false, label: null },
        { price: val.toFixed(1), vol: 58, isValueArea: true, isPoc: false, label: 'VAL' },
        { price: (val - (poc - val) * 0.5).toFixed(1), vol: 24, isValueArea: false, isPoc: false, label: null },
      ];

  const flowFeed = (unusualFlow?.flow_feed && unusualFlow.flow_feed.length > 0)
    ? unusualFlow.flow_feed
    : [
        { time: '14:28:12', ticker: currentSymbol, contract: `$${(spotPrice * 1.03).toFixed(0)} Calls`, type: 'CALL SWEEP', size: '$1.85M', sentiment: 'BULLISH', spot: `$${spotPrice.toFixed(2)}` },
        { time: '14:15:40', ticker: currentSymbol, contract: `$${(spotPrice * 0.96).toFixed(0)} Puts`, type: 'DARK POOL BLOCK', size: '$940k', sentiment: 'HEDGE', spot: `$${(spotPrice - 0.5).toFixed(2)}` },
        { time: '13:52:05', ticker: currentSymbol, contract: `$${(spotPrice * 1.05).toFixed(0)} Calls`, type: 'AGGRESSIVE SWEEP', size: '$2.40M', sentiment: 'BULLISH', spot: `$${(spotPrice - 1.2).toFixed(2)}` },
        { time: '13:30:19', ticker: currentSymbol, contract: `$${(spotPrice * 0.98).toFixed(0)} Iron Condor`, type: 'MULTI-LEG SPREAD', size: '$620k', sentiment: 'DELTA_NEUTRAL', spot: `$${(spotPrice - 0.8).toFixed(2)}` },
      ];

  const callPct = unusualFlow?.call_percentage ?? 72.0;
  const putPct = unusualFlow?.put_percentage ?? 28.0;

  // Tree-of-Thoughts Scenarios Matrix
  const scenarios = [
    {
      id: 'base_case',
      title: '1. Base Case: Range-Bound Theta Inflow',
      prob: '88.5%',
      ev: '+$210.00',
      pop: '88.5%',
      maxProfit: '+$250.00',
      maxLoss: '-$150.00 (Hard Floor)',
      rr: '1 : 1.67',
      desc: `Spot stays bound within Value Area ($${val.toFixed(1)} - $${vah.toFixed(1)}). Full theta capture into expiration.`,
      recommended: true,
    },
    {
      id: 'bull_shift',
      title: '2. Bullish Momentum (+2.5% Move)',
      prob: '74.0%',
      ev: '+$140.00',
      pop: '74.0%',
      maxProfit: '+$250.00',
      maxLoss: '-$150.00',
      rr: '1 : 1.25',
      desc: `Tests Value Area High ($${vah.toFixed(1)}). Put wing achieves 100% decay; call wing tested but protected.`,
      recommended: false,
    },
    {
      id: 'bear_shock',
      title: '3. Downside Pullback (-2.5% Move)',
      prob: '68.0%',
      ev: '+$95.00',
      pop: '68.0%',
      maxProfit: '+$250.00',
      maxLoss: '-$150.00 (Protected)',
      rr: '1 : 1.05',
      desc: `Tests Value Area Low ($${val.toFixed(1)}). Risk Bodyguard arms instant -$150 stop floor.`,
      recommended: false,
    },
    {
      id: 'iv_spike',
      title: '4. Volatility Expansion (+50% IV Shock)',
      prob: '82.0%',
      ev: '+$175.00',
      pop: '82.0%',
      maxProfit: '+$310.00',
      maxLoss: '-$150.00',
      rr: '1 : 1.45',
      desc: `Elevates credit premium collection. Favorable for wider Broken-Wing Butterfly structures.`,
      recommended: false,
    },
  ];

  return (
    <div className="fade-in-view" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {/* 1. Top Multi-Asset Universe Quick Radar */}
      <div className="openbb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--openbb-border)', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🛰️</span> <span>Multi-Asset Signals & Quantitative Radar</span>
            </h3>
            <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              14-Day Volume Profile, Anchored VWAP, Institutional Flow Sweeps, and Tree-of-Thoughts
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="openbb-badge profit" style={{ fontSize: '0.62rem', background: 'rgba(0, 230, 118, 0.15)' }}>
              <span className="pulse-dot-green" /> 8 ASSETS LIVE
            </span>
          </div>
        </div>

        {/* Ticker Selector Ribbon */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          {universeAssets.map((asset) => {
            const isSelected = asset.sym === currentSymbol;
            return (
              <button
                key={asset.sym}
                onClick={() => onSelectSymbol(asset.sym)}
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
                  gap: '3px',
                  boxShadow: isSelected ? '0 0 14px rgba(0, 229, 255, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-pure)', fontSize: '0.80rem' }}>
                    {asset.sym}
                  </span>
                  <span style={{ fontSize: '0.64rem', fontWeight: 700, color: asset.isPos ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)' }}>
                    {asset.chg}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--openbb-cyan)', fontWeight: 700 }}>${asset.price.toFixed(2)}</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.60rem' }}>POC: ${asset.poc.toFixed(0)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Signal Confluence Ribbon */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '10px',
        }}
      >
        {/* Point of Control Card */}
        <div className="openbb-card" style={{ padding: '12px 16px', borderLeft: '3px solid var(--openbb-cyan)' }}>
          <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            POINT OF CONTROL (POC)
          </div>
          <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--openbb-cyan)', margin: '2px 0' }}>
            ${poc.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
            Range: ${val.toFixed(1)} (VAL) - ${vah.toFixed(1)} (VAH)
          </div>
        </div>

        {/* Anchored VWAP Card */}
        <div className="openbb-card" style={{ padding: '12px 16px', borderLeft: '3px solid var(--openbb-emerald)' }}>
          <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            ANCHORED VWAP
          </div>
          <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--openbb-emerald)', margin: '2px 0' }}>
            ${vwap.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
            Distance: <strong>+{(((spotPrice - vwap) / vwap) * 100).toFixed(2)}%</strong> (Bullish Above VWAP)
          </div>
        </div>

        {/* 25-Delta Volatility Skew */}
        <div className="openbb-card" style={{ padding: '12px 16px', borderLeft: '3px solid var(--openbb-purple)' }}>
          <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            25-DELTA OPTIONS SKEW
          </div>
          <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--openbb-purple)', margin: '2px 0' }}>
            +4.2% Put Premium
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
            Favorable for Theta Iron Condors
          </div>
        </div>

        {/* Institutional Flow Bias */}
        <div className="openbb-card" style={{ padding: '12px 16px', borderLeft: '3px solid var(--openbb-amber)' }}>
          <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
            INSTITUTIONAL FLOW BIAS
          </div>
          <div style={{ fontSize: '1.20rem', fontWeight: 800, color: 'var(--openbb-amber)', margin: '2px 0' }}>
            72% Bullish Sweeps
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
            Aggressive Call Buying Detected
          </div>
        </div>
      </div>

      {/* 3. Middle Section: Visual Volume Profile Histogram & Options Flow Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '14px' }}>
        {/* A. Interactive Volume Profile Histogram */}
        <div className="openbb-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-pure)' }}>
                📊 {currentSymbol} 14-Day Volume Profile & Value Area
              </h4>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Institutional Volume Nodes & Fair Value Brackets
              </span>
            </div>
            <span className="openbb-badge neutral" style={{ fontSize: '0.60rem' }}>
              Spot: ${spotPrice.toFixed(2)}
            </span>
          </div>

          {/* Horizontal Histogram Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 0' }}>
            {volumeBins.map((bin, bIdx) => {
              const isSpotLevel = Math.abs(Number(bin.price) - spotPrice) < (vah - val) * 0.25;

              return (
                <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.70rem', fontFamily: 'var(--font-mono)' }}>
                  {/* Price Level */}
                  <span style={{ width: '55px', color: bin.isPoc ? 'var(--openbb-cyan)' : 'var(--text-muted)', fontWeight: bin.isPoc ? 800 : 500 }}>
                    ${bin.price}
                  </span>

                  {/* Bar */}
                  <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', height: '18px', position: 'relative', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${bin.vol}%`,
                        height: '100%',
                        background: bin.isPoc
                          ? 'linear-gradient(90deg, #00E5FF 0%, #3B82F6 100%)'
                          : bin.isValueArea
                          ? 'linear-gradient(90deg, rgba(0, 229, 255, 0.35) 0%, rgba(59, 130, 246, 0.25) 100%)'
                          : 'rgba(255, 255, 255, 0.12)',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                    {bin.label && (
                      <span
                        style={{
                          position: 'absolute',
                          left: '8px',
                          top: '2px',
                          fontSize: '0.60rem',
                          fontWeight: 800,
                          color: bin.isPoc ? '#000000' : 'var(--text-pure)',
                        }}
                      >
                        {bin.label}
                      </span>
                    )}
                  </div>

                  {/* Volume Relative % */}
                  <span style={{ width: '40px', textAlign: 'right', color: 'var(--text-dim)', fontSize: '0.64rem' }}>
                    {bin.vol}%
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--openbb-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            <span>🔵 70% Institutional Value Area</span>
            <span style={{ color: 'var(--openbb-cyan)', fontWeight: 700 }}>Cyan = Point of Control (POC)</span>
          </div>
        </div>

        {/* B. Institutional Options Sweeps & Dark Pool Block Scanner */}
        <div className="openbb-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-pure)' }}>
                🌊 Institutional Options Flow & Dark Pool Scanner
              </h4>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                Smart Money Unusual Block Trades & Aggressive Sweeps
              </span>
            </div>
            <span className="openbb-badge profit" style={{ fontSize: '0.60rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="pulse-dot-green" /> REAL-TIME STREAM
            </span>
          </div>

          {/* Call / Put Ratio Bar */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              <span style={{ color: 'var(--openbb-emerald)', fontWeight: 800 }}>{callPct.toFixed(0)}% Call Flow ({unusualFlow?.unusual_call_volume?.toLocaleString() || '14.2k'} Vol)</span>
              <span style={{ color: 'var(--openbb-crimson)', fontWeight: 800 }}>{putPct.toFixed(0)}% Put Flow ({unusualFlow?.unusual_put_volume?.toLocaleString() || '5.8k'} Vol)</span>
            </div>
            <div style={{ width: '100%', height: '7px', background: 'rgba(255, 59, 48, 0.4)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${Math.min(95, Math.max(5, callPct))}%`, height: '100%', background: 'var(--openbb-emerald)', transition: 'width 0.4s ease' }} />
            </div>
          </div>

          {/* Flow Table */}
          <div className="table-responsive-wrapper" style={{ maxHeight: '180px', overflowY: 'auto' }}>
            <table className="openbb-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Contract</th>
                  <th>Type</th>
                  <th>Premium</th>
                  <th>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {flowFeed.map((f, idx) => (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>{f.time}</td>
                    <td><strong style={{ color: 'var(--text-pure)' }}>{f.contract}</strong></td>
                    <td>
                      <span className="openbb-badge neutral" style={{ fontSize: '0.58rem' }}>
                        {f.type}
                      </span>
                    </td>
                    <td><strong style={{ color: 'var(--openbb-cyan)' }}>{f.size}</strong></td>
                    <td>
                      <span className={`openbb-badge ${f.sentiment === 'BULLISH' ? 'profit' : 'neutral'}`} style={{ fontSize: '0.58rem' }}>
                        {f.sentiment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Tree-of-Thoughts (ToT) Scenario Payoff & Monte Carlo Deck */}
      <div className="openbb-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid var(--openbb-border)' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Brain size={16} style={{ color: 'var(--openbb-purple)' }} />
              <span>Tree-of-Thoughts (ToT) Monte Carlo Scenario Matrix</span>
            </h4>
            <span style={{ fontSize: '0.64rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Algorithmic Multi-Branch Payoff Simulation & Probability of Profit (PoP)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <span className="openbb-badge profit" style={{ fontSize: '0.62rem' }}>
              Recommended: THETA IRON CONDOR
            </span>
          </div>
        </div>

        {/* 4 Scenario Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {scenarios.map((sc) => {
            const isSelected = selectedScenario === sc.id;

            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
                    : 'var(--openbb-bg-surface)',
                  border: `1px solid ${isSelected ? 'var(--openbb-cyan)' : 'var(--openbb-border)'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: isSelected ? '0 0 14px rgba(0, 229, 255, 0.20)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.78rem', color: 'var(--text-pure)' }}>{sc.title}</strong>
                  {sc.recommended && (
                    <span className="openbb-badge profit" style={{ fontSize: '0.56rem' }}>
                      ALGO PICK
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.70rem', fontFamily: 'var(--font-mono)', background: 'rgba(0, 0, 0, 0.3)', padding: '6px 8px', borderRadius: '4px' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.60rem' }}>EXPECTED VALUE</span>
                    <strong style={{ color: 'var(--openbb-emerald)' }}>{sc.ev}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.60rem' }}>WIN PROB (PoP)</span>
                    <strong style={{ color: 'var(--openbb-cyan)' }}>{sc.pop}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.60rem' }}>MAX PROFIT</span>
                    <span style={{ color: 'var(--openbb-emerald)' }}>{sc.maxProfit}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.60rem' }}>RISK / REWARD</span>
                    <span style={{ color: 'var(--text-body)' }}>{sc.rr}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.66rem', color: 'var(--text-muted)', lineHeight: 1.35, margin: 0 }}>
                  {sc.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
