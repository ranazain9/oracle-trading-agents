"""
ORACLE Trading Agent - Post-Trade Performance & Reflection Analyst (Agent 6)
Analyzes trade execution, Greek PnL attribution, and persists learnings to long-term memory.
"""
import os
import json
import re
import datetime
import requests
from pathlib import Path
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

from config.settings import settings
from prompts.expanded_agent_prompts import (
    POST_TRADE_ANALYST_SYSTEM_PROMPT,
    POST_TRADE_ANALYST_USER_TEMPLATE
)


class TradeReflection(BaseModel):
    """
    Pydantic Schema for Post-Trade Reflection & Memory Synthesis
    """
    trade_outcome_category: str = Field(default="OPTIMAL_ALPHA", description="Outcome category")
    primary_pnl_driver: str = Field(default="THETA_DECAY", description="Delta, Theta, or Volatility driver")
    execution_grade: str = Field(default="A", description="A, B, C, or F")
    core_lesson: str = Field(default="Disciplined strike placement captured expected premium.", description="Learned insight")
    timestamp: str = Field(default_factory=lambda: datetime.datetime.utcnow().isoformat())


class PostTradeAnalystAgent:
    """
    Agent 6: Trade Performance Auditor & Long-Term Memory Synthesis
    """

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, model: Optional[str] = None):
        self.api_key = (api_key or settings.AIML_API_KEY or "").strip('\"\'')
        self.base_url = base_url or settings.AIML_BASE_URL
        self.model = model or settings.AI_MODEL
        self.memory_path = Path(__file__).resolve().parent.parent / "data" / "trade_memory.json"

    def analyze_trade_event(self, trade_data: Dict[str, Any]) -> TradeReflection:
        """
        Runs post-mortem on a trade or position exit event and updates persistent memory.
        """
        symbol = trade_data.get("symbol", "NVDA")
        strategy = trade_data.get("strategy", "EARNINGS_STRADDLE")
        pnl = float(trade_data.get("pnl_usd", 0.0))
        return_pct = float(trade_data.get("return_pct", 0.0))
        exit_reason = trade_data.get("exit_reason", "MONITORING_CYCLE")
        holding_days = int(trade_data.get("holding_period_days", 1))
        entry_iv = float(trade_data.get("entry_iv_rank", 45.0))
        exit_iv = float(trade_data.get("exit_iv_rank", 40.0))

        # Query LLM if available
        reflection = None
        if self.api_key:
            try:
                prompt = POST_TRADE_ANALYST_USER_TEMPLATE.format(
                    symbol=symbol,
                    strategy=strategy,
                    pnl_usd=pnl,
                    return_pct=return_pct,
                    exit_reason=exit_reason,
                    holding_period_days=holding_days,
                    entry_iv_rank=entry_iv,
                    exit_iv_rank=exit_iv
                )

                url = f"{self.base_url.rstrip('/')}/chat/completions"
                headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
                payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": POST_TRADE_ANALYST_SYSTEM_PROMPT},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.2,
                    "response_format": {"type": "json_object"}
                }

                resp = requests.post(url, headers=headers, json=payload, timeout=20)
                if resp.status_code == 200:
                    raw_content = resp.json()["choices"][0]["message"]["content"].strip()
                    cleaned = re.sub(r"^```json\s*", "", raw_content)
                    cleaned = re.sub(r"\s*```$", "", cleaned).strip()
                    parsed = json.loads(cleaned)

                    reflection = TradeReflection(
                        trade_outcome_category=parsed.get("trade_outcome_category", "OPTIMAL_ALPHA"),
                        primary_pnl_driver=parsed.get("primary_pnl_driver", "THETA_DECAY"),
                        execution_grade=parsed.get("execution_grade", "A"),
                        core_lesson=parsed.get("core_lesson", "Strategy performed according to mathematical expectation.")
                    )
            except Exception:
                pass

        if not reflection:
            # Deterministic fallback
            outcome = "OPTIMAL_ALPHA" if pnl >= 0 else "STOPPED_OUT_DISCIPLINE"
            driver = "THETA_DECAY" if "CONDOR" in strategy or "STRADDLE" in strategy else "DELTA_DIRECTIONAL"
            grade = "A" if pnl >= 0 else "B"
            lesson = f"{strategy} on {symbol} executed with realized PnL of ${pnl:.2f}. Risk controls respected."
            reflection = TradeReflection(
                trade_outcome_category=outcome,
                primary_pnl_driver=driver,
                execution_grade=grade,
                core_lesson=lesson
            )

        # Append to persistent memory
        self._append_to_memory(symbol, strategy, pnl, reflection)
        return reflection

    def _append_to_memory(self, symbol: str, strategy: str, pnl: float, reflection: TradeReflection):
        """Appends reflection entry to data/trade_memory.json."""
        self.memory_path.parent.mkdir(parents=True, exist_ok=True)
        memory = []
        if self.memory_path.exists():
            try:
                with open(self.memory_path, "r") as f:
                    memory = json.load(f)
            except Exception:
                memory = []

        memory.append({
            "timestamp": reflection.timestamp,
            "symbol": symbol,
            "strategy": strategy,
            "pnl_usd": pnl,
            "outcome": reflection.trade_outcome_category,
            "primary_driver": reflection.primary_pnl_driver,
            "grade": reflection.execution_grade,
            "lesson": reflection.core_lesson
        })

        # Keep last 50 reflections
        memory = memory[-50:]

        try:
            with open(self.memory_path, "w") as f:
                json.dump(memory, f, indent=2)
        except Exception:
            pass
