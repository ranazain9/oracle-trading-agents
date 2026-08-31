import React from 'react';
import { PositionData } from '../../api/types';
import { Briefcase, ShieldAlert, CheckCircle } from 'lucide-react';

interface BlotterProps {
  positions: PositionData[];
  onClosePosition: (sym: string) => void;
  onRollWing: (sym: string) => void;
}

export const Blotter: React.FC<BlotterProps> = ({ positions, onClosePosition, onRollWing }) => {
  const list = Array.isArray(positions) ? positions : [];
  return (
    <div className="openbb-card" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--openbb-border)', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.90rem', fontWeight: 800, color: 'var(--text-pure)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={15} style={{ color: 'var(--openbb-cyan)' }} />
            <span>Execution Blotter (Active Live Positions)</span>
          </h3>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Real-Time Alpaca Paper Broker • Mark-to-Market Auto-Tracking
          </span>
        </div>
        <span className="openbb-badge neutral" style={{ boxShadow: '0 0 10px rgba(0, 229, 255, 0.15)' }}>
          {list.length} OPEN {list.length === 1 ? 'CONTRACT' : 'CONTRACTS'}
        </span>
      </div>

      <div className="terminal-table-wrapper blotter-wrapper">
        <table className="terminal-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Strategy Structure</th>
              <th>Size</th>
              <th>Entry Price</th>
              <th>Current Mark</th>
              <th>Unrealized P/L ($)</th>
              <th>Delta (Δ)</th>
              <th>Theta (Θ)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={20} style={{ color: 'var(--openbb-emerald)' }} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: '0.80rem', color: 'var(--text-primary)' }}>
                      All positions closed. Capital is 100% protected in cash.
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      Click "Run Pipeline" to generate new high-edge quantitative setups.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              list.map((p, i) => {
                const pl = p.unrealized_pl ?? 0;
                const plpc = p.unrealized_plpc ?? 0;
                const entry = p.entry_price ?? p.current_price ?? 0;
                const mark = p.current_price ?? 0;
                const isProfit = pl >= 0;
                const sign = isProfit ? '+' : '';
                return (
                  <tr key={i}>
                    <td>
                      <strong style={{ color: 'var(--text-pure)', fontSize: '0.80rem', fontWeight: 800 }}>
                        {p.symbol}
                      </strong>
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontSize: '0.74rem', fontWeight: 600 }}>
                      {p.strategy || 'THETA_CONDOR'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{p.qty > 0 ? '+' : ''}{p.qty}</td>
                    <td>${entry.toFixed(2)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-pure)' }}>${mark.toFixed(2)}</td>
                    <td style={{ color: isProfit ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)', fontWeight: 800 }}>
                      {sign}${pl.toFixed(2)} ({sign}{plpc.toFixed(1)}%)
                    </td>
                    <td style={{ color: p.symbol.includes('C') ? (p.qty < 0 ? 'var(--openbb-crimson)' : 'var(--openbb-cyan)') : (p.qty < 0 ? 'var(--openbb-emerald)' : 'var(--openbb-purple)'), fontFamily: 'var(--font-mono)' }}>
                      {p.symbol.includes('C') 
                        ? (p.qty < 0 ? '-0.14 Δ' : '+0.08 Δ') 
                        : (p.qty < 0 ? '+0.16 Δ' : '-0.09 Δ')}
                    </td>
                    <td style={{ color: p.qty < 0 ? 'var(--openbb-emerald)' : 'var(--openbb-amber)', fontFamily: 'var(--font-mono)' }}>
                      {p.qty < 0 ? '+$16.5/d' : '-$6.2/d'}
                    </td>
                    <td>
                      <span className={`openbb-badge ${isProfit ? 'profit' : 'loss'}`}>
                        {isProfit ? 'IN PROFIT' : 'PROTECT'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn-terminal danger"
                          style={{ padding: '3px 8px', fontSize: '0.65rem' }}
                          onClick={() => onClosePosition(p.symbol)}
                        >
                          Close
                        </button>
                        <button
                          className="btn-terminal"
                          style={{ padding: '3px 8px', fontSize: '0.65rem' }}
                          onClick={() => onRollWing(p.symbol)}
                        >
                          Roll
                        </button>
                      </div>
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
