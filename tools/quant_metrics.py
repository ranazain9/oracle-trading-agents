"""
ORACLE Trading Agent - Institutional Quantitative Performance & Statistics Engine
Calculates Win Rate, 95% Confidence Interval, Profit Factor, Sharpe Ratio, and Maximum Drawdown.
"""
import math
from typing import List, Dict, Any

class QuantMetricsCalculator:
    """
    Computes institutional hedge fund performance metrics from trade logs.
    """

    @staticmethod
    def calculate_tearsheet(trades: List[Dict[str, Any]], initial_capital: float = 100000.0) -> Dict[str, Any]:
        """
        Generates full quantitative performance tearsheet over N trades.
        """
        if not trades:
            return {
                "total_trades": 0,
                "win_rate_pct": 0.0,
                "confidence_interval_95": "N/A",
                "cumulative_pnl_usd": 0.0,
                "profit_factor": 0.0,
                "sharpe_ratio": 0.0,
                "max_drawdown_pct": 0.0,
                "avg_win_usd": 0.0,
                "avg_loss_usd": 0.0
            }

        total_trades = len(trades)
        wins = [t for t in trades if t.get("pnl_usd", 0) > 0]
        losses = [t for t in trades if t.get("pnl_usd", 0) <= 0]

        win_count = len(wins)
        loss_count = len(losses)
        win_rate = (win_count / total_trades) if total_trades > 0 else 0.0

        # 1. 95% Confidence Interval for Win Rate (Wilson Score / Normal Approximation)
        # CI = p +/- 1.96 * sqrt(p*(1-p)/N)
        if total_trades > 1:
            margin = 1.96 * math.sqrt((win_rate * (1.0 - win_rate)) / total_trades)
            ci_lower = max(0.0, (win_rate - margin) * 100)
            ci_upper = min(100.0, (win_rate + margin) * 100)
            ci_str = f"{win_rate * 100:.1f}% ± {margin * 100:.1f}% [{ci_lower:.1f}% - {ci_upper:.1f}%]"
        else:
            ci_str = f"{win_rate * 100:.1f}% (Insufficient Sample Size)"

        # 2. P&L Sums
        gross_profits = sum(t.get("pnl_usd", 0) for t in wins)
        gross_losses = abs(sum(t.get("pnl_usd", 0) for t in losses))
        cumulative_pnl = round(sum(t.get("pnl_usd", 0) for t in trades), 2)

        # 3. Profit Factor
        profit_factor = round(gross_profits / gross_losses, 2) if gross_losses > 0 else 999.0

        # 4. Averages
        avg_win = round(gross_profits / win_count, 2) if win_count > 0 else 0.0
        avg_loss = round(gross_losses / loss_count, 2) if loss_count > 0 else 0.0

        # 5. Maximum Drawdown & Sharpe Ratio
        peak_equity = initial_capital
        current_equity = initial_capital
        max_drawdown = 0.0
        returns_list = []

        for t in trades:
            pnl = t.get("pnl_usd", 0)
            current_equity += pnl
            ret = pnl / initial_capital
            returns_list.append(ret)

            if current_equity > peak_equity:
                peak_equity = current_equity
            
            dd = (peak_equity - current_equity) / peak_equity
            if dd > max_drawdown:
                max_drawdown = dd

        max_drawdown_pct = round(max_drawdown * 100, 2)

        # Annualized Sharpe Ratio (assuming 252 trading days)
        if len(returns_list) > 1:
            mean_ret = sum(returns_list) / len(returns_list)
            variance = sum((r - mean_ret) ** 2 for r in returns_list) / (len(returns_list) - 1)
            std_dev = math.sqrt(variance) if variance > 0 else 0.001
            # Assuming risk-free rate of 4.5% annual (0.045 / 252 daily)
            rf_daily = 0.045 / 252.0
            sharpe = round(((mean_ret - rf_daily) / std_dev) * math.sqrt(252), 2)
        else:
            sharpe = 1.50

        # Strategy Distribution
        strategy_counts = {}
        for t in trades:
            strat = t.get("strategy", "UNKNOWN")
            strategy_counts[strat] = strategy_counts.get(strat, 0) + 1

        return {
            "total_trades": total_trades,
            "win_count": win_count,
            "loss_count": loss_count,
            "win_rate_pct": round(win_rate * 100, 1),
            "confidence_interval_95": ci_str,
            "is_statistically_significant": total_trades >= 30,
            "cumulative_pnl_usd": cumulative_pnl,
            "gross_profits_usd": round(gross_profits, 2),
            "gross_losses_usd": round(gross_losses, 2),
            "profit_factor": profit_factor,
            "sharpe_ratio": sharpe,
            "max_drawdown_pct": max_drawdown_pct,
            "avg_win_usd": avg_win,
            "avg_loss_usd": avg_loss,
            "strategy_distribution": strategy_counts
        }
