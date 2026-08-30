/**
 * Complete REST API Client for ORACLE Multi-Agent Options Fund (All 35 Endpoints)
 */

import {
  SystemHealth,
  PipelineRunResponse,
  PipelineState,
  MacroSentinelData,
  PortfolioHedgeData,
  HitlProposal,
  HitlHistoryRecord,
  AccountData,
  PositionData,
  PortfolioGreeks,
  StrategyOption,
  StrategyBlueprint,
  UniverseAsset,
  VolumeProfileData,
  AnchoredVwapData,
  UnusualFlowData,
  ToTScenarioMatrix,
  ClosedTradeRecord,
  TradeStatsData,
  DashboardBootstrapData,
} from './types';

const API_BASE = '/api/v1';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('/api') || endpoint.startsWith('/health') ? endpoint : `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorBody || res.statusText}`);
  }

  return res.json();
}

export const oracleApi = {
  // Master High-Speed Bootstrap Aggregator (<2ms from memory)
  getDashboardBootstrap: () => request<DashboardBootstrapData>('/dashboard/bootstrap'),

  // 1. System
  getHealth: () => request<SystemHealth>('/health'),

  // 2. Pipeline Orchestration
  getPipelineStatus: () => request<{ active: boolean; current_run_id?: string; timestamp: string }>('/pipeline/status'),
  runPipeline: (symbol = 'NVDA') =>
    request<PipelineRunResponse>('/pipeline/run', {
      method: 'POST',
      body: JSON.stringify({ symbol }),
    }),
  getLatestPipelineState: () => request<PipelineState>('/pipeline/latest-state'),
  cancelPipeline: () => request<{ status: string }>('/pipeline/cancel', { method: 'POST' }),

  // 3. Agent Diagnostics
  getMacroSentinel: () => request<MacroSentinelData>('/agents/macro'),
  getPortfolioHedgeEvaluation: () => request<PortfolioHedgeData>('/agents/hedge/evaluate'),
  runBodyguardScan: () => request<{ scanned_positions_count: number; liquidations_triggered: number }>('/agents/bodyguard/scan', { method: 'POST' }),
  getAnalystReflections: () => request<{ reflections_count: number; items: any[] }>('/agents/analyst/reflections'),

  // 4. HITL Governance
  getPendingProposals: () => request<HitlProposal[]>('/hitl/pending'),
  getHitlHistory: () => request<HitlHistoryRecord[]>('/hitl/history'),
  approveHitlProposal: (proposalId: string, notes = 'Signed off via React Terminal') =>
    request<{ status: string }>(`/hitl/approve/${proposalId}`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),
  rejectHitlProposal: (proposalId: string, reason = 'Rejected by Risk Officer') =>
    request<{ status: string }>(`/hitl/reject/${proposalId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // 5. Portfolio & Risk
  getAccount: () => request<AccountData>('/portfolio/account'),
  getPositions: () => request<PositionData[]>('/portfolio/positions'),
  getPortfolioGreeks: () => request<PortfolioGreeks>('/portfolio/greeks'),
  closePosition: (symbol: string, reason = 'Operator Manual Liquidation') =>
    request<{ status: string }>(`/portfolio/close/${symbol}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  emergencyKillSwitch: (reason = 'React Terminal Emergency Kill Switch') =>
    request<{ status: string }>('/portfolio/kill-switch', {
      method: 'POST',
      body: JSON.stringify({ confirmation_code: 'CONFIRM_KILL_SWITCH', reason }),
    }),

  // 6. Alpha Strategies
  getStrategiesList: () => request<StrategyOption[]>('/strategies/list'),
  calculateStrategyBlueprint: (
    symbol: string,
    strategy: string,
    spotPrice: number,
    riskBudget = 600.0,
    targetProfit = 250.0,
    stopLoss = 150.0
  ) =>
    request<StrategyBlueprint>('/strategies/calculate', {
      method: 'POST',
      body: JSON.stringify({
        symbol,
        strategy,
        spot_price: spotPrice,
        risk_budget_usd: riskBudget,
        target_profit_usd: targetProfit,
        stop_loss_usd: stopLoss,
      }),
    }),
  rollStrategyWing: (symbol: string, strategy: string, untestedWingAction = 'ROLL_INWARD') =>
    request<{ action_taken: string }>(`/strategies/roll-wing`, {
      method: 'POST',
      body: JSON.stringify({ symbol, strategy, untested_wing_action: untestedWingAction }),
    }),

  // 7. Signals & Alternative Data
  getUniverse: () => request<UniverseAsset[]>('/signals/universe'),
  getVolumeProfile: (symbol = 'NVDA') => request<VolumeProfileData>(`/signals/volume-profile?symbol=${symbol}`),
  getAnchoredVwap: (symbol = 'NVDA') => request<AnchoredVwapData>(`/signals/anchored-vwap?symbol=${symbol}`),
  getSentiment: (symbol = 'NVDA') => request<{ sentiment_score: number; sentiment_label: string }>(`/signals/sentiment?symbol=${symbol}`),
  getUnusualFlow: (symbol = 'NVDA') => request<UnusualFlowData>(`/signals/unusual-flow?symbol=${symbol}`),
  getToTMatrix: (symbol = 'NVDA', price = 225.0) => request<ToTScenarioMatrix>(`/signals/tot-matrix?symbol=${symbol}&price=${price}`),
  getNews: (symbols?: string[]) => {
    const query = symbols && symbols.length ? `?symbols=${symbols.join(',')}` : '';
    return request<import('./types').NewsItem[]>(`/signals/news${query}`);
  },

  // 8. Trades & Analytics
  getTradesHistory: () => request<ClosedTradeRecord[]>('/trades/history'),
  getTradeStats: () => request<TradeStatsData>('/trades/stats'),
  exportTrades: (format: 'json' | 'csv' = 'json') =>
    request<{ exported_records_count: number; download_url?: string }>('/trades/export', {
      method: 'POST',
      body: JSON.stringify({ format }),
    }),

  // 9. 24/7 Autonomous Daemon
  getDaemonStatus: () => request<import('./types').DaemonStatusData>('/daemon/status'),
  toggleDaemonAutoPilot: (enabled?: boolean) =>
    request<{ success: boolean; auto_pilot_enabled: boolean; mode: string }>('/daemon/toggle', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    }),
  runDaemonCycle: () =>
    request<{ success: boolean; message: string; result: any }>('/daemon/run-cycle', {
      method: 'POST',
    }),

  // 10. AI Copilot Chat Agent
  chatWithCopilot: (message: string, history: { role: string; text: string }[] = []) =>
    request<import('./types').CopilotChatResponse>('/copilot/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    }),
};
