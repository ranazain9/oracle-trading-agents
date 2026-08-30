/**
 * Exact Type Definitions matching FastAPI Endpoints
 */

export interface SystemHealth {
  status: string;
  version: string;
  timestamp: string;
}

export interface PipelineRunResponse {
  run_id: string;
  status: string;
  dispatched_at: string;
}

export interface PipelineState {
  current_step: string;
  active_agents: string[];
  execution_history?: any[];
  [key: string]: any;
}

export interface MacroSentinelData {
  macro_regime?: string;
  macro_shock_index?: number;
  macro_conviction_score?: number;
  max_allocation_multiplier?: number;
  sizing_multiplier?: number;
  is_yield_curve_inverted?: boolean;
  strategic_macro_thesis?: string;
  ten_year_treasury_yield?: number;
  raw_macro_data?: {
    event_summary?: string;
    ten_year_treasury_yield?: number;
    fed_funds_rate_environment?: string;
  };
}

export interface PortfolioHedgeData {
  hedge_required?: boolean;
  decision?: string;
  recommended_structure?: string;
  urgency_rating?: string;
  risk_commentary?: string;
  beta_weighted_delta?: number;
  recommended_hedge_units?: number;
  portfolio_greeks?: Record<string, any>;
}

export interface HitlProposal {
  proposal_id: string;
  symbol: string;
  strategy: string;
  strikes?: number[];
  allocation_usd?: number;
  reasoning?: string;
  status?: string;
}

export interface HitlHistoryRecord {
  proposal_id: string;
  status: string;
  operator_name?: string;
  notes?: string;
  timestamp?: string;
}

export interface AccountData {
  equity?: number;
  cash?: number;
  buying_power?: number;
  status?: string;
  is_paper?: boolean;
  account_number?: string;
  currency?: string;
}

export interface PositionData {
  symbol: string;
  strategy?: string;
  qty: number;
  entry_price?: number;
  current_price: number;
  unrealized_pl?: number;
  unrealized_plpc?: number;
  market_value?: number;
  asset_class?: string;
  delta?: number;
  theta?: number;
}

export interface PortfolioGreeks {
  net_portfolio_delta?: number;
  net_portfolio_gamma?: number;
  net_portfolio_theta?: number;
  net_portfolio_theta_daily_usd?: number;
  net_portfolio_vega_usd?: number;
  total_open_positions_count?: number;
  total_portfolio_market_value_usd?: number;
  spy_benchmark_price?: number;
  requires_hedge?: boolean;
  recommended_hedge_bias?: string;
}

export interface StrategyOption {
  id: string;
  name: string;
  category: string;
  legs_count: number;
  description: string;
  ideal_iv_regime?: string;
}

export interface StrategyBlueprint {
  symbol: string;
  strategy: string;
  spot_price: number;
  profit_target_usd: number;
  stop_loss_usd: number;
  legs: {
    side: string;
    strike: number;
    type: string;
    action: string;
  }[];
}

export interface UniverseAsset {
  symbol: string;
  current_price: number;
  price?: number;
  change_pct?: number;
  iv_rank?: number;
  has_earnings_within_5d?: boolean;
  earnings_date?: string;
  news_sentiment_score?: number;
  news_sentiment_label?: string;
  point_of_control_poc?: number;
  value_area_high_vah?: number;
  value_area_low_val?: number;
  unusual_flow_type?: string;
  institutional_conviction?: string;
}

export interface VolumeBin {
  price: string;
  vol: number;
  volume_raw?: number;
  isValueArea: boolean;
  isPoc: boolean;
  label?: string | null;
}

export interface VolumeProfileData {
  symbol: string;
  current_price: number;
  point_of_control_poc: number;
  value_area_high_vah: number;
  value_area_low_val: number;
  profile_regime: string;
  total_volume_analyzed?: number;
  volume_bins?: VolumeBin[];
}

export interface AnchoredVwapData {
  symbol: string;
  current_price: number;
  anchored_vwap: number;
  trend_distance_pct?: number;
  vwap_bias: string;
}

export interface FlowFeedItem {
  time: string;
  ticker: string;
  contract: string;
  type: string;
  size: string;
  sentiment: string;
  spot?: string;
}

export interface UnusualFlowData {
  symbol: string;
  flow_type: string;
  unusual_call_volume?: number;
  unusual_put_volume?: number;
  call_percentage?: number;
  put_percentage?: number;
  put_call_volume_ratio?: number;
  premium_spent_usd?: number;
  institutional_sentiment: string;
  flow_feed?: FlowFeedItem[];
}

export interface ToTScenarioBranch {
  scenario: string;
  spot_projection?: number;
  branch_payoff_usd: number;
  estimated_probability_pct: number;
}

export interface ToTScenarioMatrix {
  symbol: string;
  stock_price?: number;
  highest_ev_strategy: string;
  highest_ev_amount_usd: number;
  payoff_matrix?: any;
  scenario_probabilities?: Record<string, number>;
  ev_rankings?: any[];
}

export interface ClosedTradeRecord {
  symbol: string;
  strategy?: string;
  status: string;
  pnl_usd?: number;
  exit_reason?: string;
  entry_date?: string;
  date?: string;
  exit_date?: string;
}

export interface TradeStatsData {
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
  win_rate_percent?: number;
  profit_factor?: number;
  sharpe_ratio?: number;
  cumulative_realized_pnl_usd?: number;
  max_drawdown_percent?: number;
}

export interface TelemetryLogMessage {
  timestamp: string;
  level: string;
  agent?: string;
  message: string;
}

export interface NewsItem {
  symbol: string;
  headline: string;
  source: string;
  sentiment_score: number;
  sentiment_label: string;
  timestamp?: string;
}

export interface DaemonRunRecord {
  id?: number;
  run_id: string;
  phase: string;
  timestamp: string;
  status: string;
  summary?: string;
  details?: string;
}

export interface DaemonStatusData {
  auto_pilot_enabled: boolean;
  is_running: boolean;
  current_phase: string;
  status_message: string;
  today_cycles_run: number;
  market_open_executed_today?: boolean;
  post_market_executed_today?: boolean;
  last_run_timestamp?: string;
  next_scheduled_event: string;
  recent_runs?: DaemonRunRecord[];
}

export interface DashboardBootstrapData {
  health?: SystemHealth;
  account?: AccountData;
  greeks?: PortfolioGreeks;
  positions?: PositionData[];
  universe?: UniverseAsset[];
  macro?: MacroSentinelData;
  hedge?: PortfolioHedgeData;
  stats?: TradeStatsData;
  trades?: ClosedTradeRecord[];
  pending_proposals?: HitlProposal[];
  hitl_history?: HitlHistoryRecord[];
  strategies?: StrategyOption[];
  news?: NewsItem[];
  daemon?: DaemonStatusData;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface CopilotChatResponse {
  reply: string;
  timestamp: string;
  mode: string;
  context_included: boolean;
}

