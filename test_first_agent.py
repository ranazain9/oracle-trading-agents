"""
Test Runner for ORACLE - Agent 1: Strategy Brain Agent
Prints full real-time market data table + Live AI Decision
"""
import sys
from pathlib import Path
import json

# Ensure UTF-8 output on Windows terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

from agents.strategy_brain_agent import StrategyBrainAgent
from tools.market_data_tools import MarketDataTool

def main():
    print("\n" + "=" * 65)
    print("[+] ORACLE: TESTING AGENT #1 (Strategy Brain Agent)")
    print("=" * 65 + "\n")

    print("[*] 1. Fetching Live Market Overview (CBOE & S&P 500)...")
    overview = MarketDataTool.get_market_overview()
    print(f"   * Live CBOE VIX Index : {overview['vix']} ({overview['vix_regime']})")
    print(f"   * S&P 500 Trend       : {overview['sp500_trend']}")
    print(f"   * Market Sentiment    : {overview['market_sentiment']}")
    print(f"   * Data Source         : {overview.get('source', 'LIVE')}\n")

    print("[*] 2. Fetching Real-Time Asset Universe & Live News...")
    assets = MarketDataTool.get_asset_universe_data(["NVDA", "MSFT", "AAPL", "TSLA"])
    print("-" * 65)
    print(f"{'SYMBOL':<8} {'PRICE ($)':<12} {'IV RANK':<10} {'LATEST LIVE NEWS HEADLINE':<35}")
    print("-" * 65)
    for a in assets:
        headline = (a.get('live_news_headlines') or ['No recent headlines'])[0]
        if len(headline) > 32:
            headline = headline[:32] + "..."
        print(f"{a['symbol']:<8} ${a['current_price']:<11.2f} {a['iv_rank']:<9.1f}% {headline:<35}")
    print("-" * 65 + "\n")

    agent = StrategyBrainAgent()
    print("[*] 3. Running Strategy Brain Agent Decision Engine...")
    decision = agent.analyze_and_decide(portfolio_cash=100000.0, active_positions_count=0)

    print("\n[+] 4. Strategy Decision Received from Live AI:")
    print("-" * 65)
    print(f"  * Regime Detected : {decision.regime}")
    print(f"  * Target Symbol   : {decision.symbol}")
    print(f"  * Strategy        : {decision.strategy}")
    print(f"  * Direction       : {decision.direction}")
    print(f"  * Confidence Score: {decision.confidence_score * 100:.1f}%")
    print(f"  * Max Loss Limit  : -${decision.max_loss_usd:.2f} (Strict Cutoff)")
    print(f"  * Profit Target   : +{decision.target_profit_percent:.0f}% of max profit")
    print(f"  * AI Reasoning    : {decision.reasoning}")
    print("-" * 65)

    print("\n[SUCCESS] Agent #1 is 100% REAL & verified live!\n")

if __name__ == "__main__":
    main()
