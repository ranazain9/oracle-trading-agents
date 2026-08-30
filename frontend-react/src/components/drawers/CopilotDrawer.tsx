import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  User,
  Trash2,
  Bot,
  Shield,
  DollarSign,
  Activity,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Download,
  TrendingUp,
  Brain,
  Zap,
  Newspaper,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { AccountData, PortfolioGreeks, ChatMessage } from '../../api/types';
import { oracleApi } from '../../api/client';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountData | null;
  greeks: PortfolioGreeks | null;
}

interface MessageWithMeta extends ChatMessage {
  id?: string;
  timestamp?: string;
  mode?: string;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose, account, greeks }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWide, setIsWide] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'greeks' | 'strategy' | 'agents' | 'news'>('all');

  const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false });

  const [messages, setMessages] = useState<MessageWithMeta[]>([
    {
      id: 'init-1',
      role: 'assistant',
      timestamp: nowTime,
      mode: 'AIMLAPI_LANGCHAIN_LCEL',
      text: `### 🤖 Greetings Operator
I am your **ORACLE Quantitative AI Copilot** powered by **LangChain & Claude 3.5 Sonnet / DeepSeek**. I synthesize real-time portfolio Greeks, multi-leg options risk envelopes, volatility surface skews, and autonomous LangGraph strategy theses.

**Live Telemetry Snapshot:**
- **Portfolio Equity:** **$${(account?.equity || 99580.95).toLocaleString('en-US', { minimumFractionDigits: 2 })}** | **Cash:** **$${(account?.cash || 98835.95).toLocaleString('en-US', { minimumFractionDigits: 2 })}**
- **Net Delta:** **${greeks?.net_portfolio_delta ?? 0.0} Δ** (Delta-Neutral, Safe Boundary ±25 Δ)
- **Risk Floor:** **-$150.00/trade Hard Stop** | **+50% Profit Ratchet Gain Lock**

How can I assist your quantitative trading desk today?`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const userMsg: MessageWithMeta = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: timeStr,
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setIsLoading(true);

    try {
      const res = await oracleApi.chatWithCopilot(query, updatedHistory);
      if (res && res.reply) {
        setMessages([
          ...updatedHistory,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: res.reply,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            mode: res.mode,
          },
        ]);
      } else {
        throw new Error('Empty response');
      }
    } catch (err: any) {
      console.error('Copilot Chat Error:', err);
      setMessages([
        ...updatedHistory,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          text: `⚠️ **Connection Notice:** Unable to reach ORACLE AI Backend (${err?.message || 'Server offline'}). Please ensure backend server is running on port 8000.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    setMessages([
      {
        id: `clear-${Date.now()}`,
        role: 'assistant',
        timestamp: timeStr,
        text: '🧹 Chat cleared. I am ready for your next quantitative or risk analysis query.',
      },
    ]);
  };

  const handleExportChat = () => {
    const transcript = messages
      .map(
        (m) =>
          `[${m.timestamp || 'EST'}] ${m.role.toUpperCase()}:\n${m.text}\n----------------------------------------`
      )
      .join('\n\n');
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oracle_copilot_transcript_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Categorized Prompt Matrix
  const promptDeck = {
    all: [
      { text: 'Why do the agents buy and sell positions?', icon: <TrendingUp size={12} /> },
      { text: 'Explain my Net Delta, Daily Theta, and portfolio profit', icon: <Activity size={12} /> },
      { text: 'What are all 8 agents doing right now?', icon: <Brain size={12} /> },
      { text: 'What is my live cash, equity, and buying power?', icon: <DollarSign size={12} /> },
      { text: 'What phase is the 24/7 Auto-Pilot daemon in?', icon: <Zap size={12} /> },
    ],
    greeks: [
      { text: 'Explain Net Delta (+0.0 Δ) & safe corridor (±25 Δ)', icon: <Activity size={12} /> },
      { text: 'How does Daily Theta harvest time-decay income?', icon: <Activity size={12} /> },
      { text: 'What is my maximum risk limit & stop-loss floor?', icon: <Shield size={12} /> },
      { text: 'How does the Profit Ratchet (+50% Lock) work?', icon: <ShieldCheck size={12} /> },
    ],
    strategy: [
      { text: 'Why do agents enter Theta Iron Condors vs Calendars?', icon: <TrendingUp size={12} /> },
      { text: 'Evaluate NVDA options skew & recommend a structure', icon: <TrendingUp size={12} /> },
      { text: 'Explain how Kelly Criterion sizes option trades', icon: <DollarSign size={12} /> },
      { text: 'How does Tree-of-Thoughts calculate Expected Value (EV)?', icon: <Brain size={12} /> },
    ],
    agents: [
      { text: 'What are all 8 agents doing right now?', icon: <Brain size={12} /> },
      { text: 'Explain the 8-node LangGraph cognitive cycle', icon: <Zap size={12} /> },
      { text: 'What is the 15-second Risk Bodyguard checking?', icon: <Shield size={12} /> },
      { text: 'What is the current 24/7 Auto-Pilot daemon schedule?', icon: <Zap size={12} /> },
    ],
    news: [
      { text: 'Explain the latest market news headlines & sentiment', icon: <Newspaper size={12} /> },
      { text: 'What is the current Macro Regime & Treasury 10Y Yield?', icon: <Newspaper size={12} /> },
      { text: 'How does FinBERT score headline catalysts for SPX?', icon: <Brain size={12} /> },
    ],
  };

  const activePrompts = promptDeck[activeCategory];

  // Helper to render markdown tables, bold tokens, and code blocks
  const renderMessageContent = (text: string) => {
    // Check for markdown table pattern
    if (text.includes('|') && text.includes('---')) {
      const parts = text.split('\n');
      const tableLines: string[] = [];
      const nonTableBefore: string[] = [];
      const nonTableAfter: string[] = [];
      let inTable = false;
      let tableFinished = false;

      for (const line of parts) {
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          inTable = true;
          tableLines.push(line.trim());
        } else {
          if (inTable) {
            tableFinished = true;
            inTable = false;
          }
          if (tableFinished) {
            nonTableAfter.push(line);
          } else {
            nonTableBefore.push(line);
          }
        }
      }

      if (tableLines.length >= 2) {
        return (
          <div>
            {renderRegularLines(nonTableBefore.join('\n'))}
            <div className="copilot-table-wrapper" style={{ margin: '10px 0', overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid var(--openbb-border)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                <thead>
                  <tr style={{ background: 'rgba(0, 229, 255, 0.12)', borderBottom: '1px solid var(--openbb-border)' }}>
                    {tableLines[0]
                      .split('|')
                      .filter((c) => c.trim().length > 0)
                      .map((th, i) => (
                        <th
                          key={i}
                          style={{
                            padding: '6px 10px',
                            textAlign: 'left',
                            color: 'var(--openbb-cyan)',
                            fontWeight: 800,
                            letterSpacing: '0.3px',
                          }}
                        >
                          {th.trim()}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {tableLines.slice(2).map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.02)',
                      }}
                    >
                      {row
                        .split('|')
                        .filter((c) => c.trim().length > 0)
                        .map((td, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              padding: '6px 10px',
                              color: td.includes('Δ') || td.includes('$') ? 'var(--text-pure)' : 'var(--text-primary)',
                              fontWeight: td.includes('Δ') || td.includes('$') ? 700 : 400,
                            }}
                            dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(td.trim()) }}
                          />
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderRegularLines(nonTableAfter.join('\n'))}
          </div>
        );
      }
    }

    return renderRegularLines(text);
  };

  const renderRegularLines = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={lIdx} style={{ height: '6px' }} />;

      if (trimmed.startsWith('### ')) {
        return (
          <h4
            key={lIdx}
            style={{
              color: 'var(--openbb-cyan)',
              margin: '10px 0 6px',
              fontSize: '0.86rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('#### ')) {
        return (
          <h5
            key={lIdx}
            style={{
              color: 'var(--text-pure)',
              margin: '8px 0 4px',
              fontSize: '0.80rem',
              fontWeight: 800,
            }}
          >
            {trimmed.replace('#### ', '')}
          </h5>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <div key={lIdx} style={{ display: 'flex', gap: '6px', margin: '3px 0 3px 6px' }}>
            <span style={{ color: 'var(--openbb-cyan)', fontWeight: 800 }}>•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
          </div>
        );
      }
      return (
        <p
          key={lIdx}
          style={{ margin: '4px 0', lineHeight: 1.45 }}
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
        />
      );
    });
  };

  const formatInlineMarkdown = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-pure); font-weight: 800;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color: var(--text-muted);">$1</em>')
      .replace(
        /`([^`]+)`/g,
        '<code style="background: rgba(0, 229, 255, 0.12); padding: 1px 5px; border-radius: 4px; font-family: var(--font-mono); color: var(--openbb-cyan); font-size: 0.72rem; border: 1px solid rgba(0, 229, 255, 0.25);">$1</code>'
      );
  };

  const drawerWidth = isWide ? '680px' : '440px';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : `-${drawerWidth}`,
        width: drawerWidth,
        maxWidth: '96vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #0C1322 0%, #060A12 100%)',
        borderLeft: '1px solid rgba(0, 229, 255, 0.35)',
        boxShadow: '-16px 0 70px rgba(0, 0, 0, 0.95), 0 0 35px rgba(0, 229, 255, 0.15)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
      }}
    >
      {/* 1. Header Bar */}
      <div
        style={{
          padding: '12px 18px',
          borderBottom: '1px solid var(--openbb-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(0, 229, 255, 0.10) 0%, rgba(13, 21, 36, 0.98) 100%)',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--openbb-cyan), #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              boxShadow: '0 0 14px rgba(0, 229, 255, 0.45)',
            }}
          >
            <Bot size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  color: 'var(--text-pure)',
                  letterSpacing: '0.3px',
                }}
              >
                ORACLE AI Copilot
              </span>
              <span
                className="openbb-badge neutral"
                style={{
                  fontSize: '0.58rem',
                  padding: '1px 5px',
                  borderColor: 'rgba(0, 229, 255, 0.4)',
                  color: 'var(--openbb-cyan)',
                }}
              >
                LANGCHAIN RAG
              </span>
            </div>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Quantitative Options & Risk Desk Supervisor
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Wide Mode Toggle */}
          <button
            onClick={() => setIsWide(!isWide)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--openbb-border)',
              color: isWide ? 'var(--openbb-cyan)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              borderRadius: '5px',
              transition: 'all 0.15s ease',
            }}
            title={isWide ? 'Collapse to Standard View (440px)' : 'Expand to Wide Desk View (680px)'}
          >
            {isWide ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Export Transcript */}
          <button
            onClick={handleExportChat}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--openbb-border)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              borderRadius: '5px',
            }}
            title="Download Chat Transcript (.txt)"
          >
            <Download size={14} />
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--openbb-border)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              borderRadius: '5px',
            }}
            title="Clear Chat History"
          >
            <Trash2 size={14} />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--openbb-border)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '5px',
              display: 'flex',
              borderRadius: '5px',
            }}
            title="Close Drawer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 2. Compact Live Telemetry Ribbon */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 14px',
          background: 'rgba(0, 0, 0, 0.45)',
          borderBottom: '1px solid var(--openbb-border)',
          fontSize: '0.66rem',
          fontFamily: 'var(--font-mono)',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--openbb-emerald)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <span className="pulse-dot-green" /> 🟢 Alpaca Live
          </span>
          <span style={{ color: 'var(--text-dim)' }}>|</span>
          <span style={{ color: 'var(--text-pure)' }}>
            Equity: <strong>${(account?.equity || 99580.95).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--openbb-cyan)' }}>
            Δ <strong>{greeks?.net_portfolio_delta ?? 0.0}</strong>
          </span>
          <span style={{ color: 'var(--openbb-emerald)' }}>
            Θ <strong>+${Math.abs(greeks?.net_portfolio_theta ?? 0.0).toFixed(1)}/d</strong>
          </span>
          <span style={{ color: 'var(--openbb-crimson)' }}>
            Stop: <strong>-$150</strong>
          </span>
        </div>
      </div>

      {/* 3. Messages Feed */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          const msgId = m.id || `msg-${idx}`;
          const isCopied = copiedId === msgId;

          return (
            <div
              key={msgId}
              style={{
                display: 'flex',
                gap: '10px',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: isUser ? '85%' : '100%',
                width: isUser ? 'auto' : '100%',
              }}
            >
              {!isUser && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(0, 229, 255, 0.16)',
                    color: 'var(--openbb-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    border: '1px solid rgba(0, 229, 255, 0.45)',
                    boxShadow: '0 0 10px rgba(0, 229, 255, 0.2)',
                  }}
                >
                  <Bot size={15} />
                </div>
              )}

              <div
                style={{
                  flex: isUser ? 'none' : 1,
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  background: isUser
                    ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)'
                    : 'var(--openbb-bg-surface)',
                  border: isUser
                    ? '1px solid rgba(0, 229, 255, 0.45)'
                    : '1px solid var(--openbb-border)',
                  borderLeft: isUser ? '1px solid rgba(0, 229, 255, 0.45)' : '3px solid var(--openbb-cyan)',
                  color: isUser ? 'var(--text-pure)' : 'var(--text-body)',
                  boxShadow: isUser
                    ? '0 4px 14px rgba(0, 229, 255, 0.15)'
                    : '0 4px 16px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                }}
              >
                {/* Header row in message bubble */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                    fontSize: '0.64rem',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span style={{ fontWeight: 700, color: isUser ? 'var(--openbb-cyan)' : 'var(--text-muted)' }}>
                    {isUser ? 'OPERATOR' : 'ORACLE QUANTITATIVE COPILOT'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{m.timestamp || nowTime}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyText(m.text, msgId)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: isCopied ? 'var(--openbb-emerald)' : 'var(--text-dim)',
                          cursor: 'pointer',
                          padding: '1px 3px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.62rem',
                          fontFamily: 'var(--font-mono)',
                        }}
                        title="Copy to clipboard"
                      >
                        {isCopied ? <Check size={11} /> : <Copy size={11} />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div>{renderMessageContent(m.text)}</div>
              </div>

              {isUser && (
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--openbb-bg-elevated)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    border: '1px solid var(--openbb-border)',
                  }}
                >
                  <User size={15} />
                </div>
              )}
            </div>
          );
        })}

        {/* Neural Loading Indicator */}
        {isLoading && (
          <div style={{ display: 'flex', gap: '10px', alignSelf: 'flex-start', alignItems: 'center', width: '100%' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(0, 229, 255, 0.16)',
                color: 'var(--openbb-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 229, 255, 0.45)',
                boxShadow: '0 0 10px rgba(0, 229, 255, 0.2)',
              }}
            >
              <Sparkles size={14} className="spin-slow" />
            </div>
            <div
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                background: 'var(--openbb-bg-surface)',
                border: '1px solid var(--openbb-border)',
                borderLeft: '3px solid var(--openbb-cyan)',
                fontSize: '0.74rem',
                color: 'var(--openbb-cyan)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span className="pulse-dot-green" />
              <span>ORACLE LangChain Synthesizing RAG Telemetry...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Categorized Tactical Prompt Deck */}
      <div
        style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--openbb-border)',
          background: 'rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {(['all', 'greeks', 'strategy', 'agents', 'news'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? 'var(--openbb-cyan)' : 'var(--openbb-bg-surface)',
                color: activeCategory === cat ? '#000000' : 'var(--text-dim)',
                border: '1px solid var(--openbb-border)',
                borderRadius: '4px',
                padding: '2px 7px',
                fontSize: '0.62rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                cursor: 'pointer',
                textTransform: 'uppercase',
                transition: 'all 0.12s ease',
              }}
            >
              {cat === 'all' ? 'All Tactics' : cat}
            </button>
          ))}
        </div>

        {/* Enhanced 1-Click Action Prompt Cards */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '82px', overflowY: 'auto', padding: '2px 0' }}>
          {activePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.text)}
              style={{
                background: 'linear-gradient(135deg, rgba(13, 21, 36, 0.95) 0%, rgba(20, 32, 54, 0.85) 100%)',
                border: '1px solid rgba(0, 229, 255, 0.35)',
                borderRadius: '6px',
                padding: '5px 10px',
                color: 'var(--text-pure)',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--openbb-cyan)';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 229, 255, 0.20) 0%, rgba(59, 130, 246, 0.20) 100%)';
                e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 229, 255, 0.35)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.35)';
                e.currentTarget.style.color = 'var(--text-pure)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(13, 21, 36, 0.95) 0%, rgba(20, 32, 54, 0.85) 100%)';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ color: 'var(--openbb-cyan)' }}>{p.icon}</span>
                <span>{p.text}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Input Dock */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 16px',
          borderTop: '1px solid var(--openbb-border)',
          background: 'linear-gradient(180deg, rgba(12, 19, 34, 0.95) 0%, rgba(6, 10, 18, 0.98) 100%)',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Copilot about Greeks, buy/sell rationales, 8 agents..."
          disabled={isLoading}
          style={{
            flex: 1,
            background: 'var(--openbb-bg-input)',
            border: '1px solid var(--openbb-border)',
            borderRadius: '6px',
            padding: '9px 13px',
            color: 'var(--text-pure)',
            fontSize: '0.80rem',
            fontFamily: 'var(--font-heading)',
            outline: 'none',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--openbb-cyan)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 229, 255, 0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--openbb-border)';
            e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.5)';
          }}
        />
        <button
          className="btn-terminal primary"
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          style={{
            opacity: isLoading || !input.trim() ? 0.5 : 1,
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Send size={13} />
          <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Send</span>
        </button>
      </div>
    </div>
  );
};
