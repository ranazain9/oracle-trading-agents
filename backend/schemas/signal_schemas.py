"""
ORACLE Trading System - Market Signals Schemas
Schemas for Volume Profile, Anchored VWAP, Sentiments, and Unusual Flow.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AssetUniverseDataSchema(BaseModel):
    """
    Complete screened asset intelligence packet
    """
    symbol: str
    current_price: float
    iv_rank: float
    has_earnings_within_5d: bool
    earnings_date: str
    news_sentiment_score: float
    social_sentiment_score: float
    retail_crowd_bias: str
    insider_status: str
    unusual_flow_type: str
    institutional_conviction: str
    point_of_control_poc: float
    value_area_high_vah: float
    value_area_low_val: float
    volume_profile_regime: str
    anchored_vwap: float
    vwap_bias: str
    put_call_volume_ratio: float
    call_delta: float
    theta_per_day_usd: float
    vega_per_contract_usd: float
    expected_move_usd: float
    expected_move_pct: float
    upper_breakeven: float
    lower_breakeven: float
    is_breakeven_feasible: bool
    bid_ask_spread_pct: float
    open_interest: int
    liquidity_grade: str
    iv_crush_risk_score: float
    vol_25delta_skew_index: float
    vol_25delta_skew_regime: str
    tot_highest_ev_strategy: str
    tot_highest_ev_usd: float
    tot_payoff_matrix: Dict[str, Any]


class VolumeProfileSchema(BaseModel):
    """
    14-day Volume Profile (POC/VAH/VAL) with real volume bins
    """
    symbol: str
    current_price: float
    point_of_control_poc: float
    value_area_high_vah: float
    value_area_low_val: float
    profile_regime: str
    total_volume_analyzed: int
    volume_bins: Optional[List[Dict[str, Any]]] = None


class AnchoredVWAPSchema(BaseModel):
    """
    Anchored VWAP standard deviation bands
    """
    symbol: str
    current_price: float
    anchored_vwap: float
    trend_distance_pct: Optional[float] = None
    vwap_upper_band_1sd: float
    vwap_lower_band_1sd: float
    vwap_upper_band_2sd: float
    vwap_lower_band_2sd: float
    vwap_bias: str


class SentimentSchema(BaseModel):
    """
    Social sentiment polarity & SEC Form 4 insider flow
    """
    symbol: str
    social_sentiment_score: float
    retail_crowd_bias: str
    sec_form4_insider_status: str
    insider_net_flow_usd: float
    retail_sentiment_warning: str


class UnusualFlowSchema(BaseModel):
    """
    Options sweep prints and block trade scanner
    """
    symbol: str
    timestamp: str
    unusual_activity_detected: bool
    flow_type: str
    dominant_strike: Optional[float] = None
    dominant_expiry: str
    premium_spent_usd: Optional[float] = None
    put_call_volume_ratio: float
    institutional_sentiment: str
    unusual_call_volume: Optional[int] = None
    unusual_put_volume: Optional[int] = None
    call_percentage: Optional[float] = None
    put_percentage: Optional[float] = None
    flow_feed: Optional[List[Dict[str, Any]]] = None


class ToTMatrixSchema(BaseModel):
    """
    Tree-of-Thoughts 3-scenario payoff simulation
    """
    symbol: str
    stock_price: float
    highest_ev_strategy: str
    highest_ev_amount_usd: float
    payoff_matrix: Dict[str, Any]
