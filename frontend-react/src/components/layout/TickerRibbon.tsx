import React from 'react';

interface TickerRibbonProps {
  onSelectTicker: (sym: string, price: number) => void;
}

export const TickerRibbon: React.FC<TickerRibbonProps> = ({ onSelectTicker }) => {
  const tickers = [
    { sym: 'SPX', price: 5183.45, chg: '+1.12%', isPos: true, points: '0,10 8,8 16,9 24,4 32,5 36,2' },
    { sym: 'NDX', price: 18230.15, chg: '+0.95%', isPos: true, points: '0,9 8,7 16,10 24,3 32,4 36,1' },
    { sym: 'NVDA', price: 128.45, chg: '+1.42%', isPos: true, points: '0,8 8,10 16,6 24,7 32,3 36,2' },
    { sym: 'AAPL', price: 224.80, chg: '+0.35%', isPos: true, points: '0,6 8,7 16,5 24,4 32,4 36,3' },
    { sym: 'MSFT', price: 448.20, chg: '-0.45%', isPos: false, points: '0,3 8,5 16,4 24,8 32,7 36,10' },
    { sym: 'TSLA', price: 252.10, chg: '+3.12%', isPos: true, points: '0,11 8,9 16,7 24,5 32,3 36,1' },
    { sym: 'AMZN', price: 186.50, chg: '+0.85%', isPos: true, points: '0,7 8,8 16,6 24,5 32,4 36,2' },
    { sym: 'SPY', price: 558.90, chg: '+0.28%', isPos: true, points: '0,8 8,7 16,6 24,6 32,5 36,4' },
  ];

  return (
    <section style={{
      background: '#090E17',
      borderBottom: '1px solid var(--openbb-border)',
      padding: '5px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflowX: 'auto',
      flexShrink: 0,
      width: '100%'
    }}>
      {tickers.map((t) => (
        <div
          key={t.sym}
          onClick={() => onSelectTicker(t.sym, t.price)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '3px 10px',
            borderRadius: '5px',
            background: 'var(--openbb-bg-widget)',
            border: '1px solid var(--openbb-border)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--openbb-border-focus)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--openbb-border)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-pure)', fontSize: '0.76rem' }}>
            {t.sym}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontSize: '0.72rem', fontWeight: 600 }}>
            ${t.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <svg width="34" height="12" style={{ overflow: 'visible' }}>
            <polyline
              fill="none"
              stroke={t.isPos ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)'}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={t.points}
            />
          </svg>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 800,
            fontSize: '0.68rem',
            color: t.isPos ? 'var(--openbb-emerald)' : 'var(--openbb-crimson)',
            background: t.isPos ? 'var(--openbb-emerald-subtle)' : 'var(--openbb-crimson-subtle)',
            padding: '1px 5px',
            borderRadius: '3px'
          }}>
            {t.chg}
          </span>
        </div>
      ))}
      <div style={{ marginLeft: 'auto', border: 'none', background: 'transparent', flexShrink: 0 }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Real-Time OCC Options Engine • High-Frequency Feed
        </span>
      </div>
    </section>
  );
};
