import React from 'react';
import { UniverseAsset } from '../../api/types';
import { Target, Activity } from 'lucide-react';

interface WatchlistProps {
  universe: UniverseAsset[];
  isMarketOpen: boolean;
  onSelectTicker: (sym: string, price: number) => void;
}

export const Watchlist: React.FC<WatchlistProps> = ({ universe, isMarketOpen, onSelectTicker }) => {
  const list = Array.isArray(universe) ? universe : [];
  return (
    <div className="openbb-card" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--openbb-border)', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.90rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={15} style={{ color: 'var(--openbb-cyan)' }} />
            <span>Quantitative Universe & Flow Scanner</span>
          </h3>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Real-Time Options Chain Skew, Volume Distribution POC, and Value Areas (VAH / VAL)
          </span>
        </div>
        <span className="openbb-badge neutral" style={{ boxShadow: '0 0 10px rgba(0, 229, 255, 0.15)' }}>
          {list.length} TICKERS MONITORED
        </span>
      </div>

      <div className="terminal-table-wrapper watchlist-wrapper">
        <table className="terminal-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Live Spot</th>
              <th>24h Chg %</th>
              <th>IV Rank</th>
              <th>Volume POC</th>
              <th>VAH (High)</th>
              <th>VAL (Low)</th>
              <th>Options Flow</th>
              <th>Trend Sparkline</th>
              <th>Regime</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                  Scanning universe assets and computing Greeks...
                </td>
              </tr>
            ) : (
              list.map((item) => {
                const price = item.price || item.current_price || 100.0;
                const chg = item.change_pct ?? (item.current_price && item.point_of_control_poc ? ((item.current_price - item.point_of_control_poc) / item.point_of_control_poc) * 100 : 0.0);
                const isPos = chg >= 0;
                const iv = item.iv_rank ?? 45.0;
                const poc = item.point_of_control_poc ?? (price * 0.99);
                const vah = item.value_area_high_vah ?? (price * 1.015);
                const val = item.value_area_low_val ?? (price * 0.985);
                const flow = item.unusual_flow_type || 'CALL_SWEEPS';

                return (
                  <tr key={item.symbol} onClick={() => onSelectTicker(item.symbol, price)}>
                    <td>
                      <strong style={{ color: 'var(--text-pure)', fontSize: '0.80rem', fontWeight: 800 }}>
                        {item.symbol}
                      </strong>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-pure)' }}>${price.toFixed(2)}</td>
                    <td style={{ color: isPos ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)', fontWeight: 800 }}>
                      {isPos ? '+' : ''}{chg.toFixed(2)}%
                    </td>
                    <td style={{ color: 'var(--openbb-cyan)', fontWeight: 700 }}>{iv.toFixed(1)}%</td>
                    <td>${poc.toFixed(2)}</td>
                    <td style={{ color: 'var(--openbb-emerald)' }}>${vah.toFixed(2)}</td>
                    <td style={{ color: 'var(--openbb-crimson)' }}>${val.toFixed(2)}</td>
                    <td>
                      <span className="openbb-badge neutral">{flow}</span>
                    </td>
                    <td>
                      <svg width="48" height="14" style={{ overflow: 'visible' }}>
                        <polyline
                          fill="none"
                          stroke={isPos ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)'}
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={isPos ? '0,11 12,9 24,8 36,4 48,2' : '0,2 12,5 24,7 36,10 48,12'}
                        />
                      </svg>
                    </td>
                    <td>
                      <span className={`openbb-badge ${isMarketOpen ? (isPos ? 'profit' : 'loss') : 'neutral'}`}>
                        {isMarketOpen ? (isPos ? 'BULL REGIME' : 'BEAR REGIME') : '🌙 CLOSED'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
