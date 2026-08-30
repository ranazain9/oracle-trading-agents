import React, { useState } from 'react';
import { NewsItem } from '../../api/types';
import { Newspaper, Radio, Filter, RefreshCw } from 'lucide-react';

interface NewsSentimentTableProps {
  news: NewsItem[];
  onSelectTicker?: (sym: string) => void;
}

export const NewsSentimentTable: React.FC<NewsSentimentTableProps> = ({ news, onSelectTicker }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const rawList = Array.isArray(news) ? news : [];

  // Filter list
  const filteredList = selectedFilter === 'ALL'
    ? rawList
    : rawList.filter(item => item.symbol.toUpperCase() === selectedFilter.toUpperCase());

  // Aggregate stats
  const bullCount = rawList.filter(n => (n.sentiment_label || '').includes('BULL') || (n.sentiment_score ?? 0) > 0.2).length;
  const bearCount = rawList.filter(n => (n.sentiment_label || '').includes('BEAR') || (n.sentiment_score ?? 0) < -0.2).length;
  const neutralCount = rawList.length - bullCount - bearCount;

  const availableSymbols = Array.from(new Set(rawList.map(n => n.symbol))).slice(0, 6);

  return (
    <div className="openbb-card" style={{ width: '100%' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--openbb-border)',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.92rem',
              fontWeight: 800,
              color: 'var(--text-pure)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Newspaper size={16} style={{ color: 'var(--openbb-cyan)' }} />
            <span>Macro Intelligence & 24/7 News Sentiment NLP</span>
          </h3>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            Real-Time Financial RSS Feeds & Quantitative FinBERT Scoring
          </span>
        </div>

        {/* Status Badge & Sentiment Breakdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--openbb-emerald)', fontWeight: 700 }}>
              ▲ {bullCount} Bull
            </span>
            <span style={{ color: 'var(--openbb-crimson)', fontWeight: 700 }}>
              ▼ {bearCount} Bear
            </span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            fontWeight: 800,
            background: 'rgba(0, 229, 255, 0.12)',
            color: 'var(--openbb-cyan)',
            border: '1px solid rgba(0, 229, 255, 0.35)',
            boxShadow: '0 0 10px rgba(0, 229, 255, 0.15)'
          }}>
            <span className="pulse-dot-green" />
            <span>24/7 LIVE STREAM</span>
          </div>
        </div>
      </div>

      {/* Filter Pill Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px', marginRight: '4px' }}>
          <Filter size={11} /> Filter:
        </span>
        <button
          onClick={() => setSelectedFilter('ALL')}
          style={{
            padding: '2px 8px',
            fontSize: '0.65rem',
            fontFamily: 'var(--font-mono)',
            borderRadius: '4px',
            border: '1px solid var(--openbb-border)',
            background: selectedFilter === 'ALL' ? 'var(--openbb-cyan)' : 'var(--openbb-bg-surface)',
            color: selectedFilter === 'ALL' ? '#000' : 'var(--text-dim)',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          ALL ({rawList.length})
        </button>
        {availableSymbols.map(sym => (
          <button
            key={sym}
            onClick={() => setSelectedFilter(sym)}
            style={{
              padding: '2px 8px',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-mono)',
              borderRadius: '4px',
              border: '1px solid var(--openbb-border)',
              background: selectedFilter === sym ? 'var(--openbb-cyan)' : 'var(--openbb-bg-surface)',
              color: selectedFilter === sym ? '#000' : 'var(--text-dim)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {sym}
          </button>
        ))}
      </div>

      {/* News Table */}
      <div className="terminal-table-wrapper" style={{ height: '220px', maxHeight: '220px' }}>
        <table className="terminal-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Headline Catalyst</th>
              <th>Source</th>
              <th>Sentiment Score</th>
              <th>Classification</th>
              <th>Stream</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <Radio size={18} style={{ color: 'var(--openbb-cyan)', animation: 'pulse 1.5s infinite' }} />
                    <span>Aggregating 24/7 financial RSS feeds and scoring live headlines...</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredList.map((item, idx) => {
                const score = item.sentiment_score ?? 0;
                const label = item.sentiment_label || (score > 0.15 ? 'BULLISH' : score < -0.15 ? 'BEARISH' : 'NEUTRAL');
                const isBull = label.includes('BULL');
                const isBear = label.includes('BEAR');
                const badgeClass = isBull ? 'profit' : isBear ? 'loss' : 'neutral';

                return (
                  <tr
                    key={idx}
                    onClick={() => onSelectTicker && onSelectTicker(item.symbol)}
                    style={{ cursor: onSelectTicker ? 'pointer' : 'default' }}
                    title={`Click to analyze ${item.symbol}`}
                  >
                    <td>
                      <strong style={{ color: 'var(--text-pure)', fontSize: '0.80rem', fontWeight: 800 }}>
                        {item.symbol}
                      </strong>
                    </td>
                    <td className="wrap-cell" style={{ maxWidth: '340px', minWidth: '220px', color: 'var(--text-primary)' }}>
                      {item.headline}
                    </td>
                    <td>
                      <span style={{ color: 'var(--openbb-cyan)', fontSize: '0.68rem', fontWeight: 600 }}>
                        {item.source || 'Yahoo Finance'}
                      </span>
                    </td>
                    <td style={{ color: isBull ? 'var(--openbb-emerald)' : isBear ? 'var(--openbb-crimson)' : 'var(--text-body)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      {score > 0 ? '+' : ''}{score.toFixed(2)}
                    </td>
                    <td>
                      <span className={`openbb-badge ${badgeClass}`}>
                        {label}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
                      {item.timestamp || 'Live 24/7'}
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
