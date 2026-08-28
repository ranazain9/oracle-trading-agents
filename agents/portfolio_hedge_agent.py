"""
ORACLE Trading Agent - Portfolio Hedge & Tail-Risk Agent (Agent 5)
Calculates portfolio-wide Greek risk budgets and formulates asymmetric hedges.
"""
import os
import json
import re
import requests
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from config.settings import settings
from tools.portfolio_greeks_tools import PortfolioGreeksTool
from prompts.expanded_agent_prompts import (
    PORTFOLIO_HEDGE_SYSTEM_PROMPT,
    PORTFOLIO_HEDGE_USER_TEMPLATE
)


class HedgeDecision(BaseModel):
    """
    Pydantic Schema for Tail-Risk Hedge Decision
    """
    decision: str = Field(default="HOLD_CURRENT_RISK", description="EXECUTE_HEDGE or HOLD_CURRENT_RISK")
    recommended_structure: str = Field(default="NONE", description="BEAR_PUT_SPREAD, BULL_CALL_SPREAD, or NONE")
    urgency_rating: str = Field(default="LOW", description="HIGH, MEDIUM, or LOW")
    risk_commentary: str = Field(default="Portfolio Greeks are within acceptable risk limits.", description="Hedging narrative")
    tail_risk_hedge_payload: Dict[str, Any] = Field(default_factory=dict, description="Execution parameters for hedge")
    portfolio_greeks: Dict[str, Any] = Field(default_factory=dict, description="Live portfolio Greek metrics")


class PortfolioHedgeAgent:
    """
    Agent 5: Portfolio Greek Balancer & Tail-Risk Guardian
    """

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, model: Optional[str] = None):
        self.api_key = (api_key or settings.AIML_API_KEY or "").strip('\"\'')
        self.base_url = base_url or settings.AIML_BASE_URL
        self.model = model or settings.AI_MODEL

    def evaluate_portfolio_hedge(self) -> HedgeDecision:
        """
        Assesses live portfolio Greeks and synthesizes tail-risk hedge if required.
        """
        greeks = PortfolioGreeksTool.calculate_portfolio_greeks()
        hedge_payload = PortfolioGreeksTool.synthesize_tail_risk_hedge(greeks)
        
        # If API key is available, query LLM for strategic narrative
        if self.api_key:
            try:
                prompt = PORTFOLIO_HEDGE_USER_TEMPLATE.format(
                    total_positions=greeks.get("total_open_positions_count", 0),
                    total_market_value=greeks.get("total_portfolio_market_value_usd", 0.0),
                    net_delta=greeks.get("net_portfolio_delta", 0.0),
                    net_gamma=greeks.get("net_portfolio_gamma", 0.0),
                    net_theta=greeks.get("net_portfolio_theta_daily_usd", 0.0),
                    net_vega=greeks.get("net_portfolio_vega_usd", 0.0),
                    spy_price=greeks.get("spy_benchmark_price", 590.0),
                    requires_hedge="YES" if greeks.get("requires_hedge") else "NO",
                    recommended_hedge_bias=greeks.get("recommended_hedge_bias", "BALANCED")
                )

                url = f"{self.base_url.rstrip('/')}/chat/completions"
                headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": PORTFOLIO_HEDGE_SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.1,
                    "response_format": {"type": "json_object"}
                }

                resp = requests.post(url, headers=headers, json=payload, timeout=20)
                if resp.status_code == 200:
                    raw_content = resp.json()["choices"][0]["message"]["content"].strip()
                    cleaned = re.sub(r"^```json\s*", "", raw_content)
                    cleaned = re.sub(r"\s*```$", "", cleaned).strip()
                    parsed = json.loads(cleaned)

                    return HedgeDecision(
                        decision="EXECUTE_HEDGE" if greeks.get("requires_hedge") else parsed.get("decision", "HOLD_CURRENT_RISK"),
                        recommended_structure=hedge_payload.get("hedge_structure", "NONE"),
                        urgency_rating=parsed.get("urgency_rating", "LOW"),
                        risk_commentary=parsed.get("risk_commentary", hedge_payload.get("rationale", "")),
                        tail_risk_hedge_payload=hedge_payload,
                        portfolio_greeks=greeks
                    )
            except Exception:
                pass

        # Deterministic fallback
        return HedgeDecision(
            decision="EXECUTE_HEDGE" if greeks.get("requires_hedge") else "HOLD_CURRENT_RISK",
            recommended_structure=hedge_payload.get("hedge_structure", "NONE"),
            urgency_rating="HIGH" if greeks.get("requires_hedge") else "LOW",
            risk_commentary=hedge_payload.get("rationale", "Portfolio Greek profile is well-balanced."),
            tail_risk_hedge_payload=hedge_payload,
            portfolio_greeks=greeks
        )
