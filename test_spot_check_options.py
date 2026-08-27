"""
Options Chain Data Spot-Check Script
Fetches raw option contracts from CBOE (via Yahoo Finance) for NVDA & AAPL,
and prints the raw bid, ask, spread width, open interest, volume, and implied volatility
side-by-side with our quantitative calculations.
"""
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

import yfinance as yf
import pandas as pd

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from tools.options_chain_tools import OptionsChainAnalyzer
from tools.liquidity_guard_tools import LiquidityGuard
from tools.greeks_calculator_tools import GreeksCalculator

def spot_check(symbol: str):
    print("\n" + "=" * 80)
    print(f"[*] OPTIONS CHAIN SPOT-CHECK FOR {symbol}")
    print("=" * 80)

    ticker = yf.Ticker(symbol)
    expirations = ticker.options
    if not expirations:
        print(f"No options available for {symbol}")
        return

    nearest_exp = expirations[0]
    opt_chain = ticker.option_chain(nearest_exp)
    calls = opt_chain.calls
    puts = opt_chain.puts

    hist = ticker.history(period="5d")
    current_price = float(hist["Close"].iloc[-1])

    # Find ATM Call
    calls["strike_diff"] = (calls["strike"] - current_price).abs()
    atm_call = calls.sort_values("strike_diff").iloc[0]

    # Find ATM Put
    puts["strike_diff"] = (puts["strike"] - current_price).abs()
    atm_put = puts.sort_values("strike_diff").iloc[0]

    print(f"• Underlying Spot Price : ${current_price:.2f}")
    print(f"• Nearest Expiration    : {nearest_exp}")
    print("-" * 80)
    print("RAW CBOE OPTION CHAIN DATA (ATM STRIKES):")
    print(f"  [ATM CALL Strike ${atm_call['strike']:.2f}]")
    print(f"    - Bid Price         : ${float(atm_call.get('bid', 0.0)):.2f}")
    print(f"    - Ask Price         : ${float(atm_call.get('ask', 0.0)):.2f}")
    print(f"    - Last Trade Price  : ${float(atm_call.get('lastPrice', 0.0)):.2f}")
    print(f"    - Open Interest     : {int(atm_call.get('openInterest', 0)):,} contracts")
    print(f"    - Daily Volume      : {int(atm_call.get('volume', 0)):,} contracts")
    print(f"    - Implied Vol (IV)  : {float(atm_call.get('impliedVolatility', 0.0))*100:.1f}%")

    print(f"\n  [ATM PUT Strike ${atm_put['strike']:.2f}]")
    print(f"    - Bid Price         : ${float(atm_put.get('bid', 0.0)):.2f}")
    print(f"    - Ask Price         : ${float(atm_put.get('ask', 0.0)):.2f}")
    print(f"    - Last Trade Price  : ${float(atm_put.get('lastPrice', 0.0)):.2f}")
    print(f"    - Open Interest     : {int(atm_put.get('openInterest', 0)):,} contracts")
    print(f"    - Daily Volume      : {int(atm_put.get('volume', 0)):,} contracts")
    print(f"    - Implied Vol (IV)  : {float(atm_put.get('impliedVolatility', 0.0))*100:.1f}%")

    # Run our pipeline tools on the same ticker
    skew = OptionsChainAnalyzer.get_options_skew(symbol)
    liq = LiquidityGuard.audit_liquidity_and_crush(symbol, current_price, 40.0, False)
    greeks = GreeksCalculator.calculate_greeks(current_price, float(atm_call["strike"]), float(atm_call.get("impliedVolatility", 0.40))*100, 7)

    print("-" * 80)
    print("OUR PIPELINE CALCULATED FIELDS:")
    print(f"  • Put/Call Vol Ratio  : {skew['put_call_volume_ratio']} ({skew['options_flow_sentiment']})")
    print(f"  • Bid-Ask Spread Width: {liq['bid_ask_spread_pct']}% (Liquidity Grade: {liq['liquidity_grade']})")
    print(f"  • Call Delta          : {greeks['call_delta']}")
    print(f"  • Theta Decay ($/day) : ${greeks['theta_per_day_usd']}/day")
    print(f"  • Vega Exposure       : ${greeks['vega_per_contract_usd']}/1% IV")
    print(f"  • Expected Move (±$)  : ±${greeks['expected_move_usd']}")
    print("=" * 80)

if __name__ == "__main__":
    spot_check("AAPL")
    spot_check("NVDA")
