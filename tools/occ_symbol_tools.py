"""
ORACLE Trading System - CBOE Strike Grid Snapping & OCC Option Symbol Engine
Snaps calculated strikes to real exchange intervals and formats standard OCC Option Contract Identifiers.
"""
import datetime
from typing import Tuple, Dict, Any

class OCCSymbolFormatter:
    """
    Standardizes strike intervals and generates official OCC Option Symbols.
    """

    @staticmethod
    def snap_strike(stock_price: float, raw_strike: float) -> float:
        """
        Snaps a calculated strike to the nearest exchange-standard strike interval:
        - Under $50: $1.00 intervals
        - $50 to $200: $2.50 intervals
        - Above $200: $5.00 intervals (e.g. $505.06 -> $505.00, $228.30 -> $230.00)
        """
        p = float(stock_price)
        s = float(raw_strike)

        if p < 50.0:
            interval = 1.0
        elif p <= 200.0:
            interval = 2.5
        else:
            interval = 5.0

        snapped = round(s / interval) * interval
        return round(snapped, 2)

    @staticmethod
    def format_occ_symbol(
        root_symbol: str,
        expiration_date: Any,
        option_type: str,
        strike_price: float
    ) -> str:
        """
        Formats compact standard OCC option symbol accepted by Alpaca and major brokers:
        Format: ROOT + YYMMDD + TYPE ('C' or 'P') + STRIKE (8 digits: 5 dollars + 3 cents)
        Example: AAPL, 2026-08-28, CALL, $315.00 -> 'AAPL260828C00315000'
        Example: MSFT, 2026-08-28, PUT,  $500.00 -> 'MSFT260828P00500000'
        """
        root = root_symbol.upper().strip()
        if isinstance(expiration_date, str):
            clean_date = expiration_date.replace("-", "")
            if len(clean_date) == 8: # YYYYMMDD
                yymmdd = clean_date[2:]
            elif len(clean_date) == 6: # YYMMDD
                yymmdd = clean_date
            else:
                yymmdd = datetime.date.today().strftime("%y%m%d")
        elif hasattr(expiration_date, "strftime"):
            yymmdd = expiration_date.strftime("%y%m%d")
        else:
            yymmdd = datetime.date.today().strftime("%y%m%d")

        opt_char = "C" if str(option_type).upper().startswith("C") else "P"
        
        # Strike format: 5 digits for dollar, 3 digits for cents (e.g. 315.00 -> 00315000)
        strike_int = int(round(strike_price * 1000))
        strike_str = f"{strike_int:08d}"

        return f"{root}{yymmdd}{opt_char}{strike_str}"

    @staticmethod
    def get_nearest_weekly_expiration() -> datetime.date:
        """
        Returns the nearest upcoming Friday expiration date.
        """
        today = datetime.date.today()
        # Friday is weekday 4
        days_ahead = (4 - today.weekday()) % 7
        if days_ahead == 0:
            days_ahead = 7  # If today is Friday, target next Friday for weekly options
        return today + datetime.timedelta(days=days_ahead)
