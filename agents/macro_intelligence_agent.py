"""
ORACLE Trading Agent - Macro Intelligence Agent (Agent 4)
Assesses macroeconomic environment, Fed rates, yield curves, and calendar catalysts.
"""
import os
import json
import re
import requests
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from config.settings import settings
from tools.macro_sentiment_tools import MacroSentimentTool
from prompts.expanded_agent_prompts import (
    MACRO_INTELLIGENCE_SYSTEM_PROMPT,
    MACRO_INTELLIGENCE_USER_TEMPLATE
)


class MacroAssessment(BaseModel):
    """
    Pydantic Schema for Macroeconomic Intelligence Assessment
    """
    macro_regime: str = Field(default="RISK_ON_EXPANSION", description="Global macro regime")
    macro_shock_index: float = Field(default=0.15, description="Shock probability index 0.0-1.0")
    macro_conviction_score: float = Field(default=0.85, description="Confidence in macro reading")
    max_allocation_multiplier: float = Field(default=1.0, description="Kelly sizing multiplier (0.25 - 1.0)")
    strategic_macro_thesis: str = Field(default="Macro liquidity is stable.", description="Macro narrative")
    raw_macro_data: Dict[str, Any] = Field(default_factory=dict, description="Underlying yield & event metrics")


class MacroIntelligenceAgent:
    """
    Agent 4: Macro & Catalyst Sentinel
    Provides pre-trade macroeconomic gatekeeping and dynamically sizes risk budgets.
    """

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, model: Optional[str] = None):
        self.api_key = (api_key or settings.AIML_API_KEY or "").strip('\"\'')
        self.base_url = base_url or settings.AIML_BASE_URL
        self.model = model or settings.AI_MODEL

    def evaluate_macro_regime(self) -> MacroAssessment:
        """
        Gathers live Treasury yield data, calculates MSI, and queries LLM for strategic narrative.
        """
        raw_data = MacroSentimentTool.calculate_macro_shock_index()
        
        # If API key is available, generate AI narrative
        if self.api_key:
            try:
                prompt = MACRO_INTELLIGENCE_USER_TEMPLATE.format(
                    current_date=raw_data.get("timestamp", "")[:10],
                    day_of_week="Trading Day",
                    fed_funds_rate=raw_data.get("fed_funds_rate", "5.25%"),
                    ten_year_yield=raw_data.get("ten_year_yield", "4.25%"),
                    yield_curve_spread=raw_data.get("yield_curve_spread", 0.0),
                    yield_curve_status=raw_data.get("yield_curve_status", "NORMAL"),
                    upcoming_catalyst=raw_data.get("upcoming_catalyst", "None"),
                    high_volatility_warning=raw_data.get("high_volatility_warning", False),
                    macro_shock_index=raw_data.get("macro_shock_index", 0.15)
                )

                url = f"{self.base_url.rstrip('/')}/chat/completions"
                headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": MACRO_INTELLIGENCE_SYSTEM_PROMPT},
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

                    return MacroAssessment(
                        macro_regime=parsed.get("macro_regime", raw_data.get("macro_regime", "RISK_ON_EXPANSION")),
                        macro_shock_index=raw_data.get("macro_shock_index", 0.15),
                        macro_conviction_score=float(parsed.get("macro_conviction_score", 0.85)),
                        max_allocation_multiplier=float(parsed.get("max_allocation_multiplier", raw_data.get("max_allocation_multiplier", 1.0))),
                        strategic_macro_thesis=parsed.get("strategic_macro_thesis", raw_data.get("recommendation", "")),
                        raw_macro_data=raw_data
                    )
            except Exception:
                pass

        # Fallback to deterministic quantification
        return MacroAssessment(
            macro_regime=raw_data.get("macro_regime", "RISK_ON_EXPANSION"),
            macro_shock_index=raw_data.get("macro_shock_index", 0.15),
            macro_conviction_score=0.90,
            max_allocation_multiplier=raw_data.get("max_allocation_multiplier", 1.0),
            strategic_macro_thesis=raw_data.get("recommendation", "Macro conditions are within normal variance."),
            raw_macro_data=raw_data
        )
