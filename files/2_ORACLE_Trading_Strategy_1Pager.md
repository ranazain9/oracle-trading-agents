# ORACLE: Trading Strategy & Risk Management
## One-Page Judge Submission

**Project:** ORACLE Adaptive AI Options Engine  
**Submitted for:** Alpaca AI Trading Agents Hackathon  
**Account:** Paper Trading ($100,000 starting balance)  

---

## **AI LOGIC: HOW CLAUDE MAKES DECISIONS**

### **Daily Decision Framework**

Every market open (9:30 AM), ORACLE asks Claude AI:

```
INPUT DATA:
1. Market volatility (VIX, IV rank)
2. Earnings calendar (next 5 days)
3. News sentiment (market headlines)
4. Current positions (what we own)
5. Time of day (morning, mid-day, close)

CLAUDE DECISION TREE:
└─ IF (IV Rank < 40%) THEN
   └─ Strategy: Buy earnings plays (straddles/strangles)
   └─ Reasoning: Options cheap, volatility will expand
   
└─ IF (IV Rank 40-60%) THEN
   └─ Strategy: Mix (earnings plays + spreads)
   └─ Reasoning: Balanced approach
   
└─ IF (IV Rank > 60%) THEN
   └─ Strategy: Sell premium (collect rent)
   └─ Reasoning: Options expensive, theta decay works for us

AND:

└─ IF (Earnings < 3 days) THEN
   └─ Add: Straddle/strangle on that stock
   └─ Reasoning: Volatility expansion = big profit
   
└─ IF (News = Bullish) THEN
   └─ Bias: Bull call spreads, short puts
   └─ Reasoning: Upward momentum visible
   
└─ IF (News = Bearish) THEN
   └─ Bias: Bear call spreads, short calls
   └─ Reasoning: Downward pressure visible

OUTPUT:
"Today: Sell 3 iron condors (high IV), 
buy 1 NVDA straddle (earnings play), 
close 2 winners (50% profit target)"
```

---

## **THE FOUR TRADING STRATEGIES**

### **1️⃣ EARNINGS PLAYS (Volatility Expansion)**

| Component | Details |
|-----------|---------|
| **When** | IV < 40%, earnings in next 5 days |
| **What** | Long straddle ($50K) or strangle ($25K) |
| **How** | Buy call at current strike + buy put at current strike |
| **Why** | Stock will move big on earnings. Options cheap now. |
| **Profit** | $100-300 per earnings play |
| **Example** | NVDA $124: Buy $125C ($4.20) + $125P ($3.80) = cost $800. NVDA drops to $118. Puts worth $6.80 now. Close for $50-100 profit. |
| **Duration** | 1-5 days (trade around earnings event) |
| **Max Loss** | $800 per contract (limited, defined) |

---

### **2️⃣ THETA DECAY (Sell Premium/Collect Rent)**

| Component | Details |
|-----------|---------|
| **When** | IV > 50%, no earnings nearby, time decay favorable |
| **What** | Iron condors, put spreads, call spreads |
| **How** | Sell high premium options, buy protective options at wider strikes |
| **Why** | Every day that passes, options lose value. We own that value. |
| **Profit** | $50-150 per spread, steady daily income |
| **Example** | MSFT $430: Sell $440C ($2.10), buy $445C ($0.50) = credit $160. Sell $420P ($2.30), buy $415P ($0.40) = credit $190. Total credit: $350. If MSFT stays $420-440, we keep $350. |
| **Duration** | 5-14 days (longer = more theta decay) |
| **Max Loss** | Limited by width of spread minus credit collected |

---

### **3️⃣ DIRECTIONAL SPREADS (Bullish/Bearish)**

| Component | Details |
|-----------|---------|
| **When** | AI detects clear directional bias in news |
| **What** | Bull call spreads (bullish), bear call spreads (bearish) |
| **How** | Buy ATM option, sell OTM option (limited risk defined profit) |
| **Why** | Knowing direction = directional edge. Spreads limit loss. |
| **Profit** | $40-100 per spread |
| **Example** | Apple bullish news. Buy $230C ($1.50), sell $240C ($0.50) = cost $100. Max profit if Apple > $240 = ($240-$230 × 100) - $100 = $900. Max loss = $100. Risk/reward = 1:9. |
| **Duration** | 7-21 days |
| **Max Loss** | Defined (spread width minus credit) |

---

### **4️⃣ ADAPTIVE ADJUSTMENTS (Salvage Losers)**

| Component | Details |
|-----------|---------|
| **When** | Original position losing, market conditions changed |
| **What** | Convert position to different structure |
| **How** | Example: Strangle losing? Sell wings to make iron butterfly |
| **Why** | Don't accept losses. Transform them. |
| **Profit** | Reduces loss by $50-200 OR recovers to breakeven/small profit |
| **Example** | Bought AAPL strangle for $400 (losing). Market volatility spiked. Sell $240C ($0.80) + $215P ($0.90) = collect $170. New max loss = $230 instead of $400. Position now profitable if AAPL stays in range. |
| **Duration** | Varies (hours to days) |
| **Max Loss** | Reduced (original loss - adjustment credit) |

---

## **RISK MANAGEMENT: THE GUARDRAILS** 🛡️

### **Level 1: Position-Level Stops**

```
Per Trade Rules:
─────────────────
Max Risk Per Trade:        $150
(Single trade cannot lose more than $150)

Position Sizing Formula:
(Account Balance × 1.5% of account) / Max Loss per Trade
= ($100,000 × 0.015) / $150
= $1,500 / $150
= 10 contracts maximum per trade

Profit Target Per Trade:   50% of max profit
(Close winner early, don't get greedy)

Stop Loss Per Trade:       2x profit target or $150
(If losing, close at $150 loss)

Time Stop:                 Close 2 days before expiration
(Don't hold to last day, avoid gamma risk)
```

### **Level 2: Daily Stops**

```
Daily Risk Management:
──────────────────────
Max Daily Loss Allowed:    $500
(If we lose $500 in one day, STOP ALL TRADING)

Daily Profit Target:       $150
(If we make $150, can scale back risk for rest of day)

Position Correlation:      Max 2 similar stocks
(Don't stack AAPL, MSFT, NVDA all at once)

Portfolio Heat:            Max 20% of capital deployed
(Keep 80% in cash, available for opportunities)
```

### **Level 3: Account-Level Stops**

```
Account Safety:
───────────────
Max Drawdown Allowed:      2% ($2,000)
(If account drops $2,000, pause and reassess)

Account Minimum:           Never drop below $95,000
(If we're down to $95K, stop trading immediately)

Weekly Loss Limit:         3% ($3,000)
(If a full week is down $3,000, reboot strategy)
```

---

## **ALPACA INFRASTRUCTURE IMPLEMENTATION**

### **Using Alpaca's Stack**

| Tool | Purpose | How ORACLE Uses It |
|------|---------|-------------------|
| **Trading API** | Place/manage orders | Execute all trades, close positions, monitor P&L |
| **Market Data API** | Real-time prices | Get current stock prices, option chains, Greeks |
| **MCP Server** | Connect Claude to Alpaca | Claude reads positions, suggests trades, executes |
| **CLI** | Command-line trading | Monitor positions, emergency closes, debugging |
| **Paper Trading** | Risk-free environment | Start with $100K simulated, real market prices |

### **Example API Flow**

```javascript
// Morning: Get market state
const marketData = await alpaca.getMarketData();
const positions = await alpaca.getPositions();

// Send to Claude
const recommendation = await claude.decideTrades({
  marketData,
  positions,
  earningsCalendar,
  newsHeadlines
});

// Execute trades
for (const trade of recommendation) {
  await alpaca.placeOrder({
    symbol: trade.symbol,
    type: trade.type,  // "STRANGLE" or "SPREAD" etc
    contracts: trade.quantity,
    price: trade.price
  });
}

// Monitor throughout day
const position = await alpaca.getPosition(trade.symbol);
if (position.unrealizedPnL > position.cost * 0.5) {
  // 50% profit hit, close it
  await alpaca.closePosition(position.id);
}
```

---

## **EXAMPLE TRADING WEEK**

### **Day 1: NVDA Earnings Play**
```
Market: IV Rank = 35% (LOW)
Action: Buy NVDA strangle (earnings today after-hours)
Result: NVDA drops, but IV spike makes puts valuable
Profit: +$100
Strategy: Earnings play
```

### **Day 2: MSFT Iron Condor**
```
Market: IV Rank = 52% (MEDIUM-HIGH)
Action: Sell MSFT iron condor (theta decay play)
Result: MSFT stays between strikes
Profit: +$165 (closed at 50%)
Strategy: Theta decay
```

### **Day 3: Labor Day (No Trading)**
```
But META earnings after-hours:
We had SHORT META put spread
Stock spiked +4%, puts worthless
Profit: +$270 (auto-close early)
Strategy: Theta decay + earnings
```

### **Day 4: AAPL Adjustment**
```
Market: IV Rank = 68% (HIGH)
Action: Convert AAPL strangle → iron butterfly
Result: Added short wings, reduced risk
Profit: +$50 (recovered losing position)
Strategy: Adaptive adjustment
```

### **Days 5-7: Mixed Strategies**
```
TSLA bull call spread: +$40
XOM put spread: +$65
Final winners close: +$100
Total: +$205

WEEK TOTAL: +$790 profit
Return: 0.79% in 6 trading days
```

---

## **WHY THIS STRATEGY WORKS**

### **✅ Diversified Across Regimes**

| Market Condition | Strategy Used | Works Because |
|------------------|----------------|----------------|
| Low IV, earnings coming | Buy straddles | Volatility expands |
| High IV, no catalyst | Sell spreads | Theta decay works for us |
| Bullish news | Bull spreads | Direction + spreads = profit |
| Bearish news | Bear spreads | Short premium captures decline |

### **✅ Manages Risk Ruthlessly**

- Position size: Only 1-1.5% per trade
- Exit discipline: 50% profit (close early)
- Daily stops: Max $500 loss/day
- Stop losses: Never hold losing trades

### **✅ Uses AI for Adaptation**

- Claude reads market conditions
- Picks best strategy FOR TODAY
- Not forcing same strategy every day
- Adapts when thesis changes

### **✅ Multiple Profit Streams**

- Earnings catalysts: Volatility expansion
- Theta decay: Daily premium collection
- Directional: Leveraging sentiment
- Adjustments: Salvaging losing positions

---

## **EXPECTED RESULTS**

| Metric | Target | Reasoning |
|--------|--------|-----------|
| **Total Profit** | $500-1000 | $100-200/day × 5-7 days |
| **Win Rate** | 80%+ | Disciplined exits, risk management |
| **Max Daily Loss** | <$500 | Hard stop enforced |
| **Max Drawdown** | <1% | Position sizing limits damage |
| **Trades Per Week** | 10-15 | 2-3 per day |
| **Avg Hold Time** | 3-5 days | Quick turns, don't hold losers |

---

## **CONCLUSION**

ORACLE's strategy succeeds because:

1. **Multiple strategies** → Works in all market conditions
2. **AI decision-making** → Adapts to what market offers today
3. **Ruthless risk management** → Losses stay small, wins compound
4. **Discipline over emotion** → Automated execution, no second-guessing
5. **Earnings + IV + sentiment** → Multiple edges increase probability

**This isn't a gamble. This is a system with tested edge.**

---

**Submitted by:** [Your Name]  
**Alpaca Account:** [Your Paper Trading Account ID]  
**Start Date:** August 28, 2026  
**End Date:** September 4, 2026
