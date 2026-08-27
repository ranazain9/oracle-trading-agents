"""
ORACLE Trading System - Sector Correlation & Portfolio Concentration Guard
Prevents opening multiple simultaneous positions in the same high-beta sector.
"""
import json
from pathlib import Path
from typing import Dict, Any, List

SECTOR_MAP = {
    "NVDA": "SEMICONDUCTORS",
    "AMD": "SEMICONDUCTORS",
    "AAPL": "MEGA_CAP_TECH",
    "MSFT": "MEGA_CAP_TECH",
    "GOOGL": "MEGA_CAP_TECH",
    "META": "MEGA_CAP_TECH",
    "TSLA": "CONSUMER_CYCLICAL",
    "AMZN": "CONSUMER_CYCLICAL",
    "NFLX": "MEDIA_STREAMING",
    "SPY": "BROAD_MARKET_INDEX"
}

class SectorGuard:
    """
    Audits active open positions to prevent sector concentration risk.
    """

    @staticmethod
    def get_sector(symbol: str) -> str:
        return SECTOR_MAP.get(symbol.upper(), "GENERAL_EQUITY")

    @staticmethod
    def check_sector_allocation(candidate_symbol: str, max_open_per_sector: int = 1) -> Dict[str, Any]:
        """
        Checks data/trades.json for existing open trades in the candidate's sector.
        """
        candidate_sector = SectorGuard.get_sector(candidate_symbol)
        trades_file = Path(__file__).resolve().parent.parent / "data" / "trades.json"

        if not trades_file.exists():
            return {
                "is_sector_permitted": True,
                "candidate_sector": candidate_sector,
                "active_sector_count": 0,
                "reason": f"Sector {candidate_sector} is fully available (0 active trades)."
            }

        try:
            with open(trades_file, "r") as f:
                trades = json.load(f)

            # Filter for ACTIVE / OPEN trades
            open_trades = [t for t in trades if t.get("status", "").upper() in ["OPEN", "OPEN_ACTIVE", "ACTIVE"]]
            
            # Count existing trades in this sector
            sector_counts = {}
            for t in open_trades:
                sym = t.get("symbol", "")
                sec = SectorGuard.get_sector(sym)
                sector_counts[sec] = sector_counts.get(sec, 0) + 1

            current_count = sector_counts.get(candidate_sector, 0)

            # Exclude broad market index from strict 1-trade cap
            if candidate_sector != "BROAD_MARKET_INDEX" and current_count >= max_open_per_sector:
                return {
                    "is_sector_permitted": False,
                    "candidate_sector": candidate_sector,
                    "active_sector_count": current_count,
                    "reason": f"Sector {candidate_sector} already holds {current_count} active position(s). Max allowed is {max_open_per_sector}."
                }

            return {
                "is_sector_permitted": True,
                "candidate_sector": candidate_sector,
                "active_sector_count": current_count,
                "reason": f"Sector {candidate_sector} approved ({current_count}/{max_open_per_sector} active)."
            }

        except Exception:
            return {
                "is_sector_permitted": True,
                "candidate_sector": candidate_sector,
                "active_sector_count": 0,
                "reason": "Default approval (fallback)."
            }
