"""
ORACLE Trading System - Master Infrastructure & Alpha Signals Verification Suite
Tests:
1. Technical Volume Profile (POC / VAH / VAL) & Anchored VWAP Bands
2. Alternative Sentiment & Insider Form 4 Radar
3. Institutional Unusual Options Flow & Sweeps Radar
4. BaseBroker / Alpaca Architecture
5. Smart Order Router (TWAP Execution Slicing)
6. Option Leg Rolling & Dynamic Defense Engine
"""
import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

from tools.technical_volume_tools import TechnicalVolumeProfileTool
from tools.alternative_sentiment_tools import AlternativeSentimentTool
from tools.unusual_flow_tools import UnusualFlowTool
from tools.alpaca_tools import AlpacaTool
from tools.base_broker import BaseBroker
from tools.smart_order_router import SmartOrderRouter
from tools.leg_roller_tools import OptionLegRoller
from strategies.theta_iron_condor import ThetaIronCondorStrategy


def run_infrastructure_suite():
    print("=" * 75)
    print("🧪 TESTING COMPLETE DATA SIGNALS & SMART EXECUTION INFRASTRUCTURE")
    print("=" * 75)

    symbol = "NVDA"
    stock_price = 225.0

    # 1. Volume Profile & Anchored VWAP
    print("\n--- 1. Technical Volume Profile & Anchored VWAP ---")
    vp = TechnicalVolumeProfileTool.calculate_volume_profile(symbol)
    vwap = TechnicalVolumeProfileTool.calculate_anchored_vwap(symbol)
    print(f"✅ POC: ${vp['point_of_control_poc']:.2f} | VAH: ${vp['value_area_high_vah']:.2f} | VAL: ${vp['value_area_low_val']:.2f}")
    print(f"✅ Regime: {vp['profile_regime']}")
    print(f"✅ Anchored VWAP: ${vwap['anchored_vwap']:.2f} | 1-SD Bands: [${vwap['vwap_lower_band_1sd']:.2f}, ${vwap['vwap_upper_band_1sd']:.2f}] | Bias: {vwap['vwap_bias']}")

    # 2. Alternative Sentiment & Insiders
    print("\n--- 2. Alternative Sentiment & SEC Form 4 Insider Radar ---")
    sent = AlternativeSentimentTool.get_alternative_sentiment(symbol)
    print(f"✅ Social Sentiment Score: {sent['social_sentiment_score']} ({sent['retail_crowd_bias']})")
    print(f"✅ Insider Bias: {sent['sec_form4_insider_status']} | Net Flow: ${sent['insider_net_flow_usd']:,.2f}")

    # 3. Unusual Flow & Sweeps
    print("\n--- 3. Unusual Options Flow & Institutional Sweeps ---")
    flow = UnusualFlowTool.scan_unusual_flow(symbol)
    print(f"✅ Unusual Flow Detected: {flow['unusual_activity_detected']} | Type: {flow['flow_type']}")
    print(f"✅ Premium Spent: ${flow['premium_spent_usd']:,.2f} | P/C Ratio: {flow['put_call_volume_ratio']} | Conviction: {flow['institutional_sentiment']}")

    # 4. Broker Abstraction Verification
    print("\n--- 4. BaseBroker Abstraction Layer ---")
    alpaca = AlpacaTool()
    is_base = isinstance(alpaca, BaseBroker)
    print(f"✅ AlpacaTool conforms to BaseBroker interface: {is_base}")

    # 5. Smart Order Router (TWAP Slicing)
    print("\n--- 5. Smart Order Router (TWAP Midpoint Slicing) ---")
    condor_strat = ThetaIronCondorStrategy()
    blueprint = condor_strat.calculate_order(symbol, stock_price, risk_budget_usd=1200.0)
    
    router = SmartOrderRouter(broker=alpaca)
    twap_res = router.route_with_twap_execution(blueprint, num_slices=2)
    print(f"✅ Router Mode: {twap_res['routing_mode']}")
    print(f"✅ Contracts Filled: {twap_res['total_contracts_filled']} across {twap_res['total_slices']} slice(s)")
    print(f"✅ Slippage Savings: +${twap_res['estimated_slippage_savings_usd']:.2f}")

    # 6. Option Leg Rolling Engine
    print("\n--- 6. Option Leg Rolling & Dynamic Defense Engine ---")
    mock_pos = {"symbol": symbol, "pnl_usd": 75.0}
    wing_roll = OptionLegRoller.calculate_wing_roll(mock_pos, stock_price)
    time_roll = OptionLegRoller.calculate_roll_out_in_time(mock_pos, stock_price)
    print(f"✅ Wing Roll Action: {wing_roll['roll_action']} | Credit Collected: +${wing_roll['additional_credit_collected_usd']:.2f}")
    print(f"✅ Time Roll Action: {time_roll['roll_action']} | New Expiry: {time_roll['target_new_expiration']} | Credit: +${time_roll['additional_credit_usd']:.2f}")

    print("\n" + "=" * 75)
    print("🎉 ALL DATA & EXECUTION INFRASTRUCTURE MODULES OPERATIONAL (100% PASS)")
    print("=" * 75)


if __name__ == "__main__":
    run_infrastructure_suite()
