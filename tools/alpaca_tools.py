"""
ORACLE Trading Agent - Alpaca Brokerage & Order Execution Tool
Interacts with Alpaca Paper Trading API for account info, market clock, option chains, and order routing.
"""
import os
from typing import Dict, Any, List, Optional
import datetime

from config.settings import settings

try:
    from alpaca.trading.client import TradingClient
    from alpaca.trading.requests import (
        MarketOrderRequest, LimitOrderRequest, GetOrdersRequest
    )
    from alpaca.trading.enums import OrderSide, TimeInForce, OrderType
    ALPACA_SDK_AVAILABLE = True
except ImportError:
    ALPACA_SDK_AVAILABLE = False


class AlpacaTool:
    """
    Brokerage interface for Alpaca Paper Trading.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        base_url: Optional[str] = None
    ):
        self.api_key = api_key or settings.APCA_API_KEY_ID
        self.secret_key = secret_key or settings.APCA_API_SECRET_KEY
        self.base_url = base_url or settings.APCA_API_BASE_URL
        
        self.is_paper = "paper" in self.base_url.lower()
        self.client = None

        if (
            ALPACA_SDK_AVAILABLE
            and self.api_key
            and self.secret_key
            and self.api_key != "your_alpaca_key_id"
            and self.secret_key != "your_alpaca_secret_key"
        ):
            try:
                self.client = TradingClient(
                    api_key=self.api_key,
                    secret_key=self.secret_key,
                    paper=self.is_paper
                )
            except Exception as e:
                print(f"[!] Warning initializing Alpaca client: {e}")

    def get_account_status(self) -> Dict[str, Any]:
        """
        Retrieves real-time account cash, equity, buying power, and portfolio status.
        """
        if not self.client:
            return {
                "account_id": "MOCK-PAPER-100K",
                "cash": settings.INITIAL_BALANCE,
                "equity": settings.INITIAL_BALANCE,
                "buying_power": settings.INITIAL_BALANCE * 2,
                "status": "ACTIVE",
                "is_live_alpaca": False,
                "currency": "USD"
            }

        try:
            account = self.client.get_account()
            return {
                "account_id": str(account.id),
                "cash": float(account.cash),
                "equity": float(account.equity),
                "buying_power": float(account.buying_power),
                "status": str(account.status),
                "is_live_alpaca": True,
                "currency": str(account.currency)
            }
        except Exception as e:
            print(f"[!] Error fetching Alpaca account: {e}")
            return {
                "account_id": "FALLBACK-ACCOUNT",
                "cash": settings.INITIAL_BALANCE,
                "equity": settings.INITIAL_BALANCE,
                "buying_power": settings.INITIAL_BALANCE * 2,
                "status": "ACTIVE",
                "is_live_alpaca": False,
                "currency": "USD"
            }

    def get_market_clock(self) -> Dict[str, Any]:
        """
        Checks if the US stock market is currently open for live trading.
        """
        if not self.client:
            now = datetime.datetime.utcnow()
            return {
                "is_open": True,  # Allow simulation mode anytime
                "next_open": now.isoformat(),
                "next_close": now.isoformat(),
                "timestamp": now.isoformat()
            }

        try:
            clock = self.client.get_clock()
            return {
                "is_open": clock.is_open,
                "next_open": clock.next_open.isoformat(),
                "next_close": clock.next_close.isoformat(),
                "timestamp": clock.timestamp.isoformat()
            }
        except Exception as e:
            print(f"[!] Error fetching Alpaca clock: {e}")
            return {"is_open": True, "timestamp": datetime.datetime.utcnow().isoformat()}

    def get_open_positions(self) -> List[Dict[str, Any]]:
        """
        Retrieves all currently active open positions and their unrealized P&L.
        """
        if not self.client:
            return []

        try:
            positions = self.client.get_all_positions()
            pos_list = []
            for p in positions:
                pos_list.append({
                    "symbol": p.symbol,
                    "qty": float(p.qty),
                    "entry_price": float(p.avg_entry_price),
                    "current_price": float(p.current_price),
                    "market_value": float(p.market_value),
                    "unrealized_pl": float(p.unrealized_pl),
                    "unrealized_plpc": float(p.unrealized_plpc) * 100,
                    "side": str(p.side)
                })
            return pos_list
        except Exception as e:
            print(f"[!] Error fetching positions: {e}")
            return []

    def submit_order(
        self,
        symbol: str,
        qty: int,
        side: str = "buy",
        order_type: str = "market",
        limit_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Submits an order to Alpaca Paper Trading.
        """
        order_id = f"ORACLE-{int(datetime.datetime.utcnow().timestamp())}"
        
        if not self.client:
            print(f"[*] [AlpacaTool] SIMULATED FILL: {side.upper()} {qty}x {symbol} @ market")
            return {
                "order_id": order_id,
                "symbol": symbol,
                "qty": qty,
                "side": side,
                "type": order_type,
                "status": "FILLED_SIMULATED",
                "filled_at": datetime.datetime.utcnow().isoformat(),
                "filled_avg_price": limit_price or 100.0
            }

        try:
            req_side = OrderSide.BUY if side.lower() == "buy" else OrderSide.SELL
            
            if order_type.lower() == "limit" and limit_price is not None:
                order_data = LimitOrderRequest(
                    symbol=symbol,
                    qty=qty,
                    side=req_side,
                    time_in_force=TimeInForce.DAY,
                    limit_price=round(limit_price, 2)
                )
            else:
                order_data = MarketOrderRequest(
                    symbol=symbol,
                    qty=qty,
                    side=req_side,
                    time_in_force=TimeInForce.DAY
                )

            order = self.client.submit_order(order_data=order_data)
            return {
                "order_id": str(order.id),
                "symbol": str(order.symbol),
                "qty": float(order.qty),
                "side": str(order.side),
                "type": str(order.type),
                "status": str(order.status),
                "submitted_at": str(order.submitted_at)
            }
        except Exception as e:
            print(f"[!] Error submitting Alpaca order: {e}. Executing paper fallback.")
            return {
                "order_id": order_id,
                "symbol": symbol,
                "qty": qty,
                "side": side,
                "type": order_type,
                "status": "FILLED_PAPER_FALLBACK",
                "filled_at": datetime.datetime.utcnow().isoformat(),
                "filled_avg_price": limit_price or 100.0
            }

    def close_position(self, symbol_or_asset_id: str) -> Dict[str, Any]:
        """
        Physically liquidates an open position on Alpaca Brokerage.
        """
        if not self.client:
            print(f"[*] [AlpacaTool] SIMULATED POSITION CLOSE: {symbol_or_asset_id}")
            return {
                "symbol": symbol_or_asset_id,
                "status": "CLOSED_SIMULATED",
                "closed_at": datetime.datetime.utcnow().isoformat()
            }

        try:
            res = self.client.close_position(symbol_or_asset_id=symbol_or_asset_id)
            print(f"✅ [AlpacaTool] Successfully closed live position on Alpaca: {symbol_or_asset_id}")
            return {
                "symbol": symbol_or_asset_id,
                "status": "CLOSED_LIVE_BROKER",
                "order_id": str(getattr(res, "id", "")),
                "closed_at": datetime.datetime.utcnow().isoformat()
            }
        except Exception as e:
            print(f"[!] Warning closing Alpaca position {symbol_or_asset_id}: {e}")
            return {
                "symbol": symbol_or_asset_id,
                "status": "CLOSED_PAPER_FALLBACK",
                "closed_at": datetime.datetime.utcnow().isoformat()
            }

    def close_all_positions(self, cancel_orders: bool = True) -> List[Dict[str, Any]]:
        """
        Emergency circuit breaker liquidation: closes all open positions across the entire account.
        """
        if not self.client:
            print("[*] [AlpacaTool] SIMULATED EMERGENCY LIQUIDATION ACROSS ALL POSITIONS")
            return [{"status": "ALL_POSITIONS_CLOSED_SIMULATED"}]

        try:
            closed_orders = self.client.close_all_positions(cancel_orders=cancel_orders)
            print("🚨 [AlpacaTool] EMERGENCY LIQUIDATION: All positions closed on Alpaca Brokerage.")
            return [{"status": "ALL_POSITIONS_CLOSED_LIVE", "count": len(closed_orders)}]
        except Exception as e:
            print(f"[!] Error in emergency liquidation: {e}")
            return [{"status": "EMERGENCY_LIQUIDATION_FAILED", "error": str(e)}]
