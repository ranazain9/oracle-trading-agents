"""
ORACLE Trading System - Abstract Broker Interface (BaseBroker)
Standardizes multi-broker connectivity for Alpaca, Interactive Brokers (IBKR), Tradier, and Schwab.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from strategies.base_strategy import StrategyOrderBlueprint


class BaseBroker(ABC):
    """
    Abstract Base Class for Brokerage Interfaces
    """

    @abstractmethod
    def get_account_status(self) -> Dict[str, Any]:
        """
        Retrieves buying power, cash, equity, and margin portfolio status.
        """
        pass

    @abstractmethod
    def get_open_positions(self) -> List[Dict[str, Any]]:
        """
        Retrieves all currently open option and stock positions.
        """
        pass

    @abstractmethod
    def submit_order(
        self,
        symbol: str,
        qty: int,
        side: str,
        order_type: str = "market",
        time_in_force: str = "day",
        limit_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Submits an individual order leg.
        """
        pass

    @abstractmethod
    def close_position(self, symbol: str) -> Dict[str, Any]:
        """
        Liquidates or closes an active position.
        """
        pass
