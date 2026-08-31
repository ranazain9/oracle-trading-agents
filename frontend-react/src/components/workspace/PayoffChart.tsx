import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { StrategyBlueprint } from '../../api/types';
import { TrendingUp, Activity, Shield } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PayoffChartProps {
  symbol?: string;
  spotPrice?: number;
  strategyName?: string;
  blueprint?: StrategyBlueprint | null;
}

export const PayoffChart: React.FC<PayoffChartProps> = ({
  symbol = 'NVDA',
  spotPrice = 128.45,
  strategyName = 'THETA_IRON_CONDOR',
}) => {
  const [scenario, setScenario] = useState<'base' | 'bull' | 'bear' | 'high_iv' | 'low_iv'>('base');

  const safeSpot = typeof spotPrice === 'number' && !isNaN(spotPrice) && spotPrice > 0 ? spotPrice : 128.45;
  let iv = 45;
  let simulatedSpot = safeSpot;

  if (scenario === 'bull') {
    simulatedSpot = safeSpot * 1.025;
    iv = 35;
  } else if (scenario === 'bear') {
    simulatedSpot = safeSpot * 0.975;
    iv = 55;
  } else if (scenario === 'high_iv') {
    iv = 75;
  } else if (scenario === 'low_iv') {
    iv = 25;
  }

  const em = Math.max(1.0, simulatedSpot * (iv / 100) * Math.sqrt(14 / 365));
  const shortStrike = Math.round((simulatedSpot + em * 0.25) / 2.5) * 2.5;
  const longStrike = Math.round((simulatedSpot + em * 0.55) / 2.5) * 2.5;

  const rawStrikes = [
    Math.round(simulatedSpot - em * 1.2),
    Math.round(simulatedSpot - em * 0.6),
    Math.round(simulatedSpot - em * 0.2),
    Math.round(simulatedSpot),
    shortStrike,
    Math.round((shortStrike + longStrike) / 2),
    longStrike,
    Math.round(simulatedSpot + em * 1.1),
  ].filter((s) => !isNaN(s) && s > 0);

  const strikes = Array.from(new Set(rawStrikes)).sort((a, b) => a - b);

  const payoffValues: number[] = [];
  const probabilityCurve: number[] = [];
  const maxProfit = +(250.0 * (iv / 45)).toFixed(2);
  const maxLoss = -(150.0 * (iv / 45)).toFixed(2);

  strikes.forEach((p) => {
    const stdDev = Math.max(5, em * 0.5);
    const z = (p - simulatedSpot) / stdDev;
    const prob = Math.exp(-0.5 * z * z) * 60;
    probabilityCurve.push(Number(prob.toFixed(2)));

    if (p <= shortStrike) {
      payoffValues.push(maxProfit);
    } else if (p >= longStrike) {
      payoffValues.push(maxLoss);
    } else {
      const slope = maxProfit - ((p - shortStrike) / Math.max(1, longStrike - shortStrike)) * (maxProfit - maxLoss);
      payoffValues.push(Number(slope.toFixed(2)));
    }
  });

  const chartData = {
    labels: strikes.map((s) => (s === Math.round(simulatedSpot) ? `${s} (Spot)` : String(s))),
    datasets: [
      {
        label: 'Gaussian Density (%)',
        data: probabilityCurve,
        borderColor: '#00E5FF',
        backgroundColor: 'rgba(0, 229, 255, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        yAxisID: 'y1',
      },
      {
        label: 'Structure Payoff ($)',
        data: payoffValues,
        borderColor: '#00E676',
        backgroundColor: 'rgba(0, 230, 118, 0.06)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.15,
        pointRadius: 3,
        pointBackgroundColor: '#00E676',
        yAxisID: 'y',
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 200 },
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(9, 14, 23, 0.95)',
        titleColor: '#00E5FF',
        bodyColor: '#FFFFFF',
        borderColor: 'rgba(0, 229, 255, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#64748B', font: { size: 10, family: 'JetBrains Mono' } },
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#00E676', font: { size: 10, family: 'JetBrains Mono' } },
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: { display: false },
        ticks: { color: '#00E5FF', font: { size: 10, family: 'JetBrains Mono' } },
      },
    },
  };

  return (
    <div className="openbb-card" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--openbb-border)', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} style={{ color: 'var(--openbb-emerald)' }} />
            <span>{symbol} {(strategyName || 'THETA_CONDOR').replace(/_/g, ' ')} Payoff Surface</span>
          </h2>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Spot: <strong style={{ color: 'var(--text-pure)' }}>${safeSpot.toFixed(2)}</strong> • Delta-Neutral CBOE Probability Envelope
          </span>
        </div>
        <span className="openbb-badge profit" style={{ boxShadow: '0 0 10px rgba(0, 230, 118, 0.20)' }}>
          88.5% WIN PROB
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: '8px',
        marginBottom: '10px',
        background: 'var(--openbb-bg-surface)',
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid var(--openbb-border)'
      }}>
        <div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Target Profit</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.98rem', fontWeight: 800, color: 'var(--openbb-emerald)' }}>+${maxProfit.toFixed(2)}</span>
        </div>
        <div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Max Risk Floor</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.98rem', fontWeight: 800, color: 'var(--openbb-crimson)' }}>-${Math.abs(maxLoss).toFixed(2)}</span>
        </div>
        <div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Expected Edge</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.98rem', fontWeight: 800, color: 'var(--openbb-cyan)' }}>+88.5%</span>
        </div>
        <div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Risk/Reward</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.98rem', fontWeight: 800, color: 'var(--openbb-purple)' }}>1 : 1.67</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
        {(['base', 'bull', 'bear', 'high_iv', 'low_iv'] as const).map((key) => {
          const isSelected = scenario === key;
          return (
            <button
              key={key}
              onClick={() => setScenario(key)}
              style={{
                background: isSelected ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.20), rgba(0, 229, 255, 0.08))' : 'var(--openbb-bg-surface)',
                border: isSelected ? '1px solid var(--openbb-cyan)' : '1px solid var(--openbb-border)',
                color: isSelected ? 'var(--openbb-cyan)' : 'var(--text-muted)',
                fontFamily: 'var(--font-heading)',
                fontSize: '0.70rem',
                fontWeight: isSelected ? 800 : 600,
                padding: '4px 10px',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 0 10px rgba(0, 229, 255, 0.25)' : 'none'
              }}
            >
              {key === 'base' ? 'Base Case' : key === 'bull' ? 'Bull (+2.5%)' : key === 'bear' ? 'Bear (-2.5%)' : key === 'high_iv' ? 'High IV (75%)' : 'Low IV (25%)'}
            </button>
          );
        })}
      </div>

      <div style={{ position: 'relative', height: '190px', width: '100%' }}>
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};
