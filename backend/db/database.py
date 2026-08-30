"""
ORACLE Trading System - Embedded SQLite Database Engine & Migration Utility
Zero-dependency, thread-safe database connection management with WAL (Write-Ahead Logging).
"""
import sqlite3
import json
import datetime
from pathlib import Path
from typing import Optional

from backend.core.logging import logger

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DB_PATH = DATA_DIR / "oracle.db"
TRADES_JSON = DATA_DIR / "trades.json"
BACKTEST_JSON = DATA_DIR / "historical_backtest.json"
HITL_JSON = DATA_DIR / "hitl_history.json"


def get_db_connection() -> sqlite3.Connection:
    """
    Returns a configured sqlite3 connection with Row factory and WAL mode.
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH), timeout=15.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init_db():
    """
    Initializes database schema and automatically migrates legacy JSON files into SQLite.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()

        # 1. Trades Ledger Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS trades (
            trade_id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            strategy TEXT NOT NULL,
            status TEXT NOT NULL,
            entry_price REAL NOT NULL,
            exit_price REAL,
            cost_or_credit_usd REAL DEFAULT 0.0,
            profit_target_usd REAL DEFAULT 0.0,
            stop_loss_usd REAL DEFAULT 0.0,
            pnl_usd REAL,
            exit_reason TEXT,
            entry_date TEXT NOT NULL,
            exit_date TEXT,
            order_legs TEXT,
            created_at TEXT NOT NULL
        );
        """)

        # 2. HITL Governance & Proposals Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS hitl_proposals (
            proposal_id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            strategy TEXT NOT NULL,
            allocation_usd REAL DEFAULT 500.0,
            strikes TEXT,
            reasoning TEXT,
            status TEXT NOT NULL,
            operator_name TEXT,
            notes TEXT,
            timestamp TEXT NOT NULL
        );
        """)

        # 3. Agent Telemetry Logs Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS agent_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            level TEXT NOT NULL,
            agent TEXT,
            message TEXT NOT NULL
        );
        """)

        # 4. Portfolio Snapshots Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS portfolio_snapshots (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            equity REAL NOT NULL,
            cash REAL NOT NULL,
            buying_power REAL NOT NULL,
            net_delta REAL DEFAULT 0.0,
            net_gamma REAL DEFAULT 0.0,
            net_theta REAL DEFAULT 0.0,
            net_vega REAL DEFAULT 0.0
        );
        """)

        # 5. Autonomous 24/7 Daemon Execution Runs Table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS daemon_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id TEXT NOT NULL,
            phase TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            status TEXT NOT NULL,
            summary TEXT,
            details TEXT
        );
        """)

        conn.commit()

        # Run automatic migrations for legacy JSON records
        _migrate_trades(conn)
        _migrate_hitl(conn)

        logger.info(f"[DB] SQLite Database Initialized & Synced at: {DB_PATH}")

    except Exception as e:
        logger.error(f"Error initializing SQLite database: {e}")
        conn.rollback()
    finally:
        conn.close()


def _migrate_trades(conn: sqlite3.Connection):
    """Imports existing trade records from JSON into SQLite if database is empty."""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM trades;")
    row = cursor.fetchone()
    if row and row["count"] > 0:
        return  # Already populated

    trades_to_import = []
    if TRADES_JSON.exists():
        try:
            with open(TRADES_JSON, "r") as f:
                trades_to_import = json.load(f)
        except Exception:
            trades_to_import = []

    if not trades_to_import and BACKTEST_JSON.exists():
        try:
            with open(BACKTEST_JSON, "r") as f:
                trades_to_import = json.load(f)
        except Exception:
            trades_to_import = []

    if not isinstance(trades_to_import, list):
        return

    now_iso = datetime.datetime.utcnow().isoformat()
    for t in trades_to_import:
        if not isinstance(t, dict):
            continue
        trade_id = t.get("trade_id") or f"TRADE_{t.get('symbol', 'NVDA')}_{int(datetime.datetime.utcnow().timestamp())}"
        symbol = t.get("symbol", "NVDA")
        strategy = t.get("strategy", "EARNINGS_STRADDLE")
        status = t.get("status", "OPEN")
        entry_price = float(t.get("underlying_entry_price", t.get("entry_price", 100.0)))
        exit_price = float(t.get("exit_price")) if t.get("exit_price") is not None else None
        cost = float(t.get("cost_or_credit_usd", 500.0))
        pt = float(t.get("profit_target_usd", 250.0))
        sl = float(t.get("stop_loss_usd", 150.0))
        pnl = float(t.get("pnl_usd")) if t.get("pnl_usd") is not None else None
        exit_reason = t.get("exit_reason")
        entry_date = t.get("entry_date", now_iso)
        exit_date = t.get("exit_date")
        legs_json = json.dumps(t.get("order_legs", []))

        cursor.execute("""
        INSERT OR IGNORE INTO trades (
            trade_id, symbol, strategy, status, entry_price, exit_price,
            cost_or_credit_usd, profit_target_usd, stop_loss_usd, pnl_usd,
            exit_reason, entry_date, exit_date, order_legs, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            trade_id, symbol, strategy, status, entry_price, exit_price,
            cost, pt, sl, pnl, exit_reason, entry_date, exit_date, legs_json, now_iso
        ))

    conn.commit()


def _migrate_hitl(conn: sqlite3.Connection):
    """Imports existing HITL history records from JSON into SQLite."""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count FROM hitl_proposals;")
    row = cursor.fetchone()
    if row and row["count"] > 0:
        return

    history_to_import = []
    if HITL_JSON.exists():
        try:
            with open(HITL_JSON, "r") as f:
                history_to_import = json.load(f)
        except Exception:
            history_to_import = []

    if not isinstance(history_to_import, list):
        return

    for h in history_to_import:
        if not isinstance(h, dict):
            continue
        prop_id = h.get("proposal_id", f"PROP_{int(datetime.datetime.utcnow().timestamp())}")
        symbol = h.get("symbol", "NVDA")
        strategy = h.get("strategy", "THETA_IRON_CONDOR")
        alloc = float(h.get("allocation_usd", 500.0))
        strikes = json.dumps(h.get("strikes", []))
        reasoning = h.get("reasoning", "Standard multi-agent strategy proposal")
        status = h.get("status", "APPROVED")
        op = h.get("operator_name", "Lead Risk Officer")
        notes = h.get("notes", "Auto-migrated sign-off")
        ts = h.get("timestamp", datetime.datetime.utcnow().isoformat())

        cursor.execute("""
        INSERT OR IGNORE INTO hitl_proposals (
            proposal_id, symbol, strategy, allocation_usd, strikes,
            reasoning, status, operator_name, notes, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            prop_id, symbol, strategy, alloc, strikes,
            reasoning, status, op, notes, ts
        ))

    conn.commit()
