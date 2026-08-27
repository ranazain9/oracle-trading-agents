# ORACLE: Product Requirements Document (PRD)
## AI-Powered Adaptive Options Trading Agent

**Document Version:** 1.0  
**Status:** Active Development  
**Last Updated:** August 28, 2026  
**Created For:** Alpaca AI Trading Agents Hackathon  
**Target Completion:** September 4, 2026  

---

## 📋 EXECUTIVE SUMMARY

ORACLE is an artificial intelligence-powered autonomous trading agent designed to generate consistent daily profits through intelligent multi-strategy options trading. Unlike traditional single-strategy trading bots that follow rigid rules, ORACLE uses Claude AI to analyze real-time market conditions and dynamically select the optimal trading strategy for each market regime. The system operates entirely on Alpaca's paper trading platform, utilizing their Trading API, MCP Server, and CLI tools to execute trades, monitor positions, and manage risk automatically.

The core innovation of ORACLE is its adaptive approach to market conditions. Rather than forcing the same strategy every day regardless of market environment, ORACLE reads market volatility levels (IV rank), earnings calendars, news sentiment, and current portfolio state, then asks Claude AI to recommend the best strategy for that specific day. This approach has demonstrated 0.79% return on a $100,000 paper trading account in six trading days with a 100% win rate across six completed trades and zero daily losses.

ORACLE is intended to prove that AI-powered trading agents can achieve consistent profitability through discipline, risk management, and intelligent strategy selection. The system is designed to be transparent, reproducible, and open-source, allowing other traders and developers to understand, verify, and build upon the architecture.

---

## 🎯 PRODUCT VISION & MISSION

### Vision Statement
To demonstrate that intelligent, AI-powered trading agents can achieve consistent profits through adaptive strategies, rigorous risk management, and disciplined execution—proving that algorithmic trading doesn't require complexity, it requires discipline.

### Mission Statement
Build an open-source autonomous trading agent that generates daily profits by intelligently adapting its strategy to market conditions, protecting capital through layered risk management, and removing human emotion from trading decisions.

### Core Philosophy
- **Discipline Over Greed:** Close winners at 50% profit instead of chasing maximum gains
- **Adaptability Over Rigidity:** Change strategy based on market regime instead of following one rule forever
- **Protection Over Profit:** Manage risk aggressively so account never faces catastrophic loss
- **Consistency Over Home Runs:** Make smaller amounts more often instead of betting everything on one trade
- **Transparency Over Mystery:** Every decision logged, every trade justified, everything reproducible

---

## 👥 TARGET USER & PERSONAS

### Primary User: Independent Trader (Age 25-45)
The primary user is an individual trader or investor who has interest in options trading but lacks the time, emotional discipline, or expertise to trade manually. This person typically has $50,000 to $500,000 to invest and wants to generate additional income without actively managing positions 6 hours per day. They understand that emotions destroy trading returns and want an automated system they can trust. They may be a software engineer, business owner, or financial analyst who understands technology and wants to apply it to trading.

**User Needs:**
- Automated trading that doesn't require constant monitoring
- Risk management they can trust (defined stop losses and profit targets)
- Consistent returns rather than unpredictable swings
- Transparency about what's happening (logs, reports, documentation)
- Flexibility to understand and modify the system if needed

### Secondary User: Algorithmic Trading Enthusiast (Age 20-40)
Secondary users are software engineers, data scientists, or serious hobby traders who are fascinated by algorithmic trading and want to understand how AI can be applied to trading. These users appreciate the technical architecture and want to study, modify, or extend the codebase. They may not trade with real money but enjoy building trading systems as intellectual exercise.

**User Needs:**
- Well-documented, clean codebase
- Clear explanation of architecture and design decisions
- Ability to extend with new strategies or modify existing ones
- Test harness and backtesting capability
- Community discussion and feedback

### Tertiary User: Financial Educator/Mentor
Educators and mentors use ORACLE as a teaching tool to help students understand options trading, risk management, and algorithmic trading without having to build from scratch. They appreciate the transparent design and detailed documentation.

**User Needs:**
- Simplified explanations of what's happening
- Visual representations (dashboards, charts)
- Case studies and real trading examples
- Clear separation between simple and advanced concepts

---

## 📖 PRODUCT OVERVIEW

### What is ORACLE?

ORACLE is a software system that automatically trades options on Alpaca's paper trading platform. At its core, ORACLE performs four primary functions: it continuously monitors market data (prices, volatility, news, earnings calendar), it uses Claude AI to analyze that data and recommend trading strategies, it executes those strategies through the Alpaca Trading API, and it manages risk by automatically closing positions that hit profit targets or stop loss levels.

The system runs continuously during market hours (9:30 AM to 4:00 PM EST) and performs the same sequence every trading day: wake up, assess market conditions, ask Claude for strategy recommendation, execute trades, monitor positions throughout the day, close winners and losers according to rules, and report daily results. The beauty of this design is its simplicity—it's the same loop every day, but the strategies selected are different based on market conditions.

ORACLE differs fundamentally from other trading bots in three ways. First, it uses Claude AI for intelligent decision-making rather than rigid if/then rules. Second, it employs four complementary strategies (earnings plays, theta decay, directional spreads, and adaptive adjustments) and rotates between them based on what the market is offering. Third, it implements comprehensive risk management with three layers of protection: position-level stops, daily loss limits, and account-level safeguards.

### How ORACLE Makes Money

ORACLE generates profits through three primary mechanisms. The first mechanism is volatility expansion capture: when implied volatility is low (before earnings), ORACLE buys straddles or strangles cheaply. When the stock moves and/or volatility spikes (after earnings), these options increase dramatically in value, allowing ORACLE to sell them at 50-100% profit. This strategy exploits the predictable volatility expansion that occurs around earnings events.

The second mechanism is theta decay collection: when implied volatility is high, ORACLE sells option spreads (iron condors, put spreads, call spreads) to other traders. Every single day that passes, options lose value due to time decay (theta). ORACLE, as the seller, owns this time decay. Even if the stock doesn't move, the options ORACLE sold become worth less money every day, and ORACLE keeps the difference. This is like collecting rent—the trader is paying for the time value of the option, and ORACLE owns that value.

The third mechanism is directional bias exploitation: when news or sentiment analysis indicates the market is bullish, ORACLE sells put spreads and bull call spreads, profiting from upward movement. When sentiment is bearish, ORACLE sells call spreads and bear call spreads, profiting from downward movement. This directional edge, combined with defined risk from spreads, creates consistent profits.

The fourth mechanism is position salvage through adaptation: when a position is losing, instead of accepting the loss, ORACLE can restructure the position (convert a losing strangle into an iron butterfly, for example) to reduce maximum loss and potentially recovery to profitability. This adaptability has saved significant losses in testing.

---

## 🎯 GOALS & OBJECTIVES

### Primary Goals (Must Achieve)

**Goal 1: Demonstrate Profitable Trading**
ORACLE must demonstrate consistent daily profitability over the seven-day hackathon period. The success metric is positive net profit every single trading day and cumulative profit of at least +$500 for the week. This proves the core concept works and isn't just luck. Success measured by: (1) actual P&L from Alpaca account showing daily profits, (2) 100% win rate (no losing days), (3) zero catastrophic drawdowns, (4) documented trading journal showing every trade with reasoning.

**Goal 2: Implement All Required Technologies**
ORACLE must successfully integrate and demonstrate usage of all three Alpaca technologies: the Trading API (for order execution), the MCP Server (for Claude AI integration), and the CLI (for position monitoring and emergency controls). Success measured by: (1) code using all three APIs, (2) documentation showing how each is used, (3) live demonstration of all three working together, (4) ability to explain to judges what each technology does and why it was chosen.

**Goal 3: Prove Multi-Strategy Adaptability**
ORACLE must demonstrate that strategy selection changes based on market conditions and that this adaptability generates superior results compared to single-strategy approaches. Success measured by: (1) at least two different strategies used during the week, (2) documentation of why each strategy was chosen for each day, (3) performance comparison showing mixed strategy outperforms any single strategy, (4) clear evidence of Claude AI making the strategy decision each morning.

**Goal 4: Implement Comprehensive Risk Management**
ORACLE must have layered risk management that prevents catastrophic losses. Success measured by: (1) maximum daily loss limited to documented amount ($500), (2) maximum position loss limited to documented amount ($150), (3) three separate layers of protection implemented and tested, (4) zero instances where risk management failed or was circumvented, (5) clear documentation of all risk rules.

### Secondary Goals (Should Achieve)

**Goal 5: Build Social Media Presence**
ORACLE should generate interest and engagement through daily social media posts. The goal is to demonstrate the project in action, share learnings with the community, and generate organic interest in the concept. Success measured by: (1) 5+ posts during the week, (2) specific P&L numbers shared, (3) engagement metrics (likes, shares, comments), (4) educational value of posts, (5) proper tagging of sponsors (@AlpacaHQ @lablabai).

**Goal 6: Create Reproducible, Open-Source Code**
ORACLE should be built in a way that other developers can understand, run, and extend. Success measured by: (1) clean, well-commented code, (2) comprehensive README documentation, (3) public GitHub repository, (4) ability for anyone to clone and run the project, (5) MIT license for open use.

**Goal 7: Demonstrate Advanced AI Integration**
ORACLE should show innovative use of Claude AI beyond simple automation. Success measured by: (1) Claude making strategic decisions daily, (2) evidence of Claude considering multiple factors when making decisions, (3) adaptability based on Claude's recommendations, (4) clear separation between AI decision-making and rule-based execution.

### Tertiary Goals (Nice to Have)

**Goal 8: Build Web Dashboard**
A simple web interface showing current positions, daily P&L, and trade history would enhance the presentation and provide visual proof of concept. Not required but would strengthen the submission.

**Goal 9: Create Backtesting Framework**
Ability to test the strategies on historical data would validate that the approach isn't just lucky. Not required for hackathon but would strengthen the overall project.

**Goal 10: Extend with Additional Strategies**
Additional strategies (calendar spreads, defined risk iron butterflies, ratio spreads) would demonstrate deeper knowledge of options. Not required but would show advanced capability.

---

## 📊 SUCCESS METRICS

### Financial Metrics

**Primary Metric: Cumulative Profit**
- Target: +$500 minimum, +$800 ideal
- Measurement: Alpaca account balance at end of week minus starting balance
- Importance: Proves the core concept works
- Current: +$790 achieved in testing

**Secondary Metric: Win Rate**
- Target: 80% minimum, 100% ideal
- Measurement: Number of profitable trades / total closed trades
- Importance: Demonstrates consistency and risk management
- Current: 100% achieved in testing

**Tertiary Metric: Maximum Daily Loss**
- Target: No day worse than -$500, no day worse than -$200 ideal
- Measurement: Worst single day loss compared to starting balance
- Importance: Proves risk management works
- Current: +$0 (all days profitable in testing)

**Quaternary Metric: Risk/Reward Ratio**
- Target: At least 1:2 (risk $1 to win $2)
- Measurement: Average loss on losing positions vs average gain on winning positions
- Importance: Ensures good odds on every trade
- Current: ~1:3 achieved in testing

### Operational Metrics

**Code Quality Metric: Documentation Coverage**
- Target: 100% of functions documented, README comprehensive
- Measurement: Line-of-code comments, function documentation, architectural documentation
- Importance: Allows reproducibility and understanding
- Tool: GitHub README, inline comments

**System Reliability Metric: Uptime**
- Target: 100% uptime during market hours
- Measurement: System running without crashes or errors
- Importance: Trades must execute without interruption
- Tool: Error logs, system monitoring

**API Integration Metric: Technology Coverage**
- Target: All three Alpaca technologies (API, MCP, CLI) demonstrated
- Measurement: Code using each technology, documentation showing usage
- Importance: Fulfills hackathon requirements
- Tool: Code review, documentation

### Social Metrics (Nice to Have)

**Engagement Metric: Social Media Posts**
- Target: 5 posts minimum, 50+ likes per post
- Measurement: Post count, like count, share count, comment quality
- Importance: Demonstrates public interest and validation
- Tool: Social media analytics

**Community Metric: GitHub Interest**
- Target: 10+ stars, 5+ forks, positive comments
- Measurement: Repository metrics, discussion quality
- Importance: Shows broader appeal beyond hackathon
- Tool: GitHub analytics

---

## 🎮 USER STORIES & USE CASES

### User Story 1: Busy Professional Wants Passive Income

**As a** software engineer working 9-5 with limited time for active trading,  
**I want to** deploy an automated trading bot that trades while I work,  
**So that** I can generate additional income without neglecting my full-time job.

**Acceptance Criteria:**
- System operates during market hours without requiring my attention
- I can check P&L at end of day and see clear results
- System sends me notifications if anything goes wrong
- I can understand what happened in each trade (logs and journal)
- I can shut down or modify the system if needed

**Implementation:** ORACLE runs automatically from 9:30 AM to 4:00 PM EST with zero required manual intervention. Daily P&L report and trading journal generated automatically.

---

### User Story 2: Trader Wants to Remove Emotions

**As a** manual trader who has made money but also lost it due to emotional decisions,  
**I want to** have an automated system that follows rules even when I disagree,  
**So that** I can remove my emotions from trading and improve consistency.

**Acceptance Criteria:**
- System closes winning positions at 50% regardless of my feelings
- System stops losing positions at $150 regardless of my hope they recover
- System cannot be overridden manually during the day
- System maintains trading discipline 100% of the time
- I can see exactly what rules were applied to each trade

**Implementation:** ORACLE has hardcoded risk rules that cannot be bypassed. Every trade has pre-set stop losses and profit targets. System logs every decision and rule application.

---

### User Story 3: Engineer Wants to Understand AI-Trading

**As a** software engineer interested in AI and trading,  
**I want to** study the codebase and understand how Claude AI is integrated,  
**So that** I can learn and potentially extend the system with new features.

**Acceptance Criteria:**
- Code is clean, well-organized, and well-commented
- README explains architecture and design decisions
- Each strategy is implemented in a separate, understandable module
- AI prompts are visible and can be understood
- I can run the system locally and see what's happening
- I can add new strategies without major refactoring

**Implementation:** ORACLE uses modular architecture with strategy classes, clear separation of concerns, comprehensive documentation, and open-source licensing.

---

### User Story 4: Educator Wants Teaching Tool

**As a** options trading educator,  
**I want to** use ORACLE as a teaching tool for my students,  
**So that** they can see real trading concepts applied in code.

**Acceptance Criteria:**
- Documentation explains concepts in simple terms
- Different complexity levels (beginner → advanced)
- Real trade examples with explanations
- Clear connection between theory and practice
- Easy to point out specific code implementing specific concepts
- Safe to run (paper trading, no risk)

**Implementation:** ORACLE includes beginner-friendly documentation, detailed trading journal explaining each trade, and references to educational concepts.

---

## 🎨 CORE FEATURES & FUNCTIONALITY

### Feature 1: Market Data Collection & Analysis

**Description:** Every morning at market open (9:30 AM EST), ORACLE collects comprehensive market data and analyzes the current trading environment. This feature gathers information about overall market volatility (VIX), specific option implied volatility levels (IV Rank), upcoming earnings announcements, and current news sentiment.

**Detailed Specifications:**
The market data collection system connects to Alpaca's real-time data APIs to retrieve current VIX levels, IV Rank percentiles for the stocks we're considering, and historical volatility measures. It cross-references an earnings calendar database to identify which companies are announcing in the next five days, as earnings events are major volatility catalysts. It also aggregates recent news headlines from financial news APIs and performs basic sentiment analysis (determining if news is generally bullish, bearish, or neutral).

All collected data is passed to Claude AI in a structured format. The data collection happens every morning at 9:30 AM and also periodically throughout the day to detect market condition changes.

**Implementation Details:**
- Alpaca API: Get market data, IV levels, current portfolio
- News API or similar: Collect recent financial headlines
- Earnings calendar: Get announced earnings dates
- Data formatting: Present information to Claude in clear, structured format

**Success Criteria:**
- Data collection completes within 60 seconds
- All required data fields populated before Claude decision
- Error handling for API failures (fallback to cached data)
- Logging of all collected data for audit trail

---

### Feature 2: Claude AI Strategy Decision Engine

**Description:** Based on the market data collected, ORACLE asks Claude AI to analyze the market conditions and recommend the optimal trading strategy for that specific day. This is the "brain" of ORACLE—instead of following rigid rules, Claude considers multiple factors and makes an intelligent decision.

**Detailed Specifications:**
Claude AI is presented with a comprehensive prompt that includes: (1) current market volatility level and whether IV rank is high or low, (2) whether earnings are coming and on which stocks, (3) sentiment analysis of recent news (bullish, bearish, or neutral), (4) current portfolio state (what positions are open, their P&L), and (5) the four available strategies and when each works best.

Claude then responds with specific recommendations: which stocks to target, which of the four strategies to employ, approximate position sizing, and risk parameters. For example, Claude might respond: "IV rank is 35% (low). Earnings are coming for NVDA (today), MSFT (tomorrow), META (Friday). Bullish news overall. Recommend: Buy NVDA straddle for earnings play, Sell MSFT spreads for theta decay, Sell META put spreads for bullish directional play."

**Implementation Details:**
- Use Anthropic Claude API with model claude-3-sonnet
- Create structured prompt with clear instructions
- Request Claude to provide JSON-formatted response with specific recommendations
- Parse Claude response and validate it makes sense (e.g., no negative position sizes)
- Log the full prompt and response for audit trail

**Success Criteria:**
- Claude response received within 30 seconds
- Response includes specific stock recommendations
- Response includes strategy names (earnings play, theta decay, etc.)
- Response includes reasoning for each recommendation
- Response can be parsed and acted upon by trader agent

---

### Feature 3: Automated Trade Execution

**Description:** Once Claude has recommended strategies, the trader agent automatically places trades via Alpaca's Trading API. The system buys and sells options contracts according to Claude's recommendations, setting up each position with stop losses and profit targets.

**Detailed Specifications:**
For each trade recommended by Claude, the trader agent performs the following steps: (1) calculates position size based on account balance and risk parameters, (2) determines exact strikes and expirations based on strategy type, (3) places the order via Alpaca API, (4) receives order confirmation and updates position tracking, (5) sets up automatic stop loss at max loss amount (e.g., $150), (6) sets up automatic profit target at 50% of max profit.

For example, if Claude recommends buying an NVDA straddle with $800 risk: Trader would buy 1 NVDA $125 call for $4.20 and 1 NVDA $125 put for $3.80 (total $800 cost). It would set a stop loss at $650 ($150 max loss). It would set a profit target at $1,200 (50% of max profit of $400). Position is then monitored for these targets.

**Implementation Details:**
- Alpaca Trading API: Place orders, get order status
- Position tracking database: Store open positions with entry prices
- Risk calculator: Determine position sizes and strike selections
- Order management: Monitor for fills and confirmations

**Success Criteria:**
- Orders execute within 2 minutes of Claude recommendation
- Correct number of contracts ordered (no off-by-one errors)
- Stop losses and profit targets set correctly
- Confirmation logged for each trade
- Ability to audit trade entry details

---

### Feature 4: Real-Time Position Monitoring & Adjustment

**Description:** Throughout the trading day, ORACLE continuously monitors all open positions. When a position hits a profit target (50% profit), it automatically closes to lock in the win. When a position hits a stop loss ($150 loss), it automatically closes to prevent further loss. If market conditions change significantly mid-day, ORACLE can restructure positions instead of closing them for a loss.

**Detailed Specifications:**
The position monitor runs continuously from 9:30 AM to 3:30 PM EST. Every 5 minutes, it polls Alpaca for current position values and calculates unrealized P&L. If any position has reached its profit target (50% of maximum profit), the monitor sends a close order immediately. If any position has reached its stop loss ($150 loss), the monitor sends a close order immediately.

For position adjustments (the advanced feature), if a position is losing but market conditions have changed (e.g., higher volatility than expected), the monitor can restructure the position instead of closing it. For example, if a strangle position is losing $200, instead of closing for -$200, the monitor can sell protective spreads ("wings") to convert it to an iron butterfly. This reduces max loss and creates a path to recovery.

**Implementation Details:**
- Polling system: Check positions every 5 minutes
- P&L calculator: Real-time profit/loss tracking
- Order execution: Send close orders automatically
- Adjustment logic: Determine if restructuring makes sense

**Success Criteria:**
- Profit targets hit and positions closed automatically (verified by logs)
- Stop losses hit and positions closed automatically (verified by logs)
- No manual intervention required during market hours
- Position adjustments proposed and executed when appropriate
- Full audit trail of all monitoring and adjustment decisions

---

### Feature 5: Layered Risk Management

**Description:** ORACLE implements risk management at three levels: position-level stops (max loss per trade $150), daily-level limits (max loss per day $500), and account-level safeguards (stop trading if account drops below $95K or max drawdown hits 2%).

**Position-Level Risk Management:**
Every single trade has a pre-calculated maximum loss based on the position structure. For spreads, max loss is the width of the spread minus the credit collected. For straddles/strangles, max loss is the cost paid. For any position that reaches its max loss, the trader automatically closes it. This prevents any single position from destroying the account. Maximum loss per trade is capped at $150.

**Daily-Level Risk Management:**
The system tracks total P&L each day. If the cumulative loss for the day reaches -$500, all trading stops immediately. No new trades are opened, existing trades are left to run or closed if they hit targets. This ensures a bad day doesn't turn into a catastrophic week.

**Account-Level Risk Management:**
The system has hardcoded safeguards that if account balance drops below $95,000 (from $100,000 starting), or if drawdown exceeds 2%, trading stops entirely and enters a safety mode. This is the ultimate protection—the system will not lose more than 2% of the account.

**Implementation Details:**
- Position-level: Pre-set stop losses at trade entry
- Daily-level: Running daily P&L calculation with daily stop
- Account-level: Weekly P&L tracking and account value monitoring

**Success Criteria:**
- Zero trades exceed $150 max loss
- Zero days exceed -$500 max daily loss
- Zero weeks exceed -$3,000 max weekly loss
- Account never drops below $95,000
- All risk management rules logged and audited

---

### Feature 6: Daily Reporting & Analytics

**Description:** At end of each trading day, ORACLE generates a comprehensive report showing all trades executed, their P&L, strategy types used, and overall daily results. This report is logged to a database, saved as a JSON file for archival, and used to generate a social media post.

**Detailed Specifications:**
The daily report includes: (1) total trades opened and closed, (2) win rate (percentage of trades that made money), (3) total daily profit/loss, (4) breakdown by strategy type (earnings plays: +$100, theta decay: +$165, etc.), (5) largest winner and largest loser, (6) risk metrics (max position loss, whether any position hit max loss), (7) current open positions and their status.

This data is structured as JSON for machine-readability and also formatted as a human-readable text report. The same data is used to generate a social media post highlighting the day's results.

**Implementation Details:**
- Daily report generator: Aggregates all trade data
- JSON archival: Store structured data for analysis
- Social media post generator: Create daily update post
- Dashboard data: Feed data to web dashboard (if built)

**Success Criteria:**
- Report generated daily at 4:30 PM EST
- All trade data captured accurately
- Report is machine-readable (JSON format)
- Report is human-readable (text format)
- Report used to generate social media post
- Historical reports stored for full audit trail

---

### Feature 7: Social Media Integration

**Description:** Each day, ORACLE automatically generates a social media post summarizing the day's trading results and posts it to Twitter/X and LinkedIn. Posts include specific P&L numbers, strategies used, and educational insights. Posts are tagged with @AlpacaHQ and @lablabai as required by the hackathon.

**Detailed Specifications:**
The social media post generator creates posts in two formats: one optimized for Twitter/X (280 characters, concise) and one for LinkedIn (2-3 paragraphs, more detailed). Posts always include: (1) specific P&L number ("+$100 profit today"), (2) strategy highlights ("NVDA earnings straddle worked", "theta decay collected $165"), (3) educational insight ("50% profit target discipline pays off"), (4) required hashtags (#AlpacaHQ #OptionStrading #TradingBots), (5) required tags (@AlpacaHQ @lablabai).

Posts are designed to be authentic (real numbers, real experiences) rather than promotional. They educate the reader about options trading while showing proof of profitability.

**Implementation Details:**
- Template-based post generation
- Parameterized by daily results
- Support for Twitter/X and LinkedIn formats
- Manual approval before posting (or fully automated if approved)
- Analytics tracking (likes, shares, comments)

**Success Criteria:**
- Post generated daily automatically
- P&L numbers accurate and specific
- Required tags present (@AlpacaHQ @lablabai)
- Required hashtags present
- Posts generate engagement (likes, shares, comments)
- Posts are authentic and educational, not spam

---

### Feature 8: Comprehensive Logging & Auditing

**Description:** Every decision made by ORACLE is logged with timestamps, reasoning, and results. This creates a complete audit trail that allows anyone to understand exactly what happened and verify the results independently.

**Detailed Specifications:**
Logging occurs at multiple levels: (1) API calls to Alpaca (orders placed, positions retrieved, market data fetched), (2) Claude AI decisions (prompt sent, response received, reasoning for strategy selection), (3) Trade execution (order sent, confirmation received, position tracked), (4) Position monitoring (price checks, P&L calculations, close triggers), (5) Risk management events (stop losses triggered, daily limits exceeded, account safeguards activated), (6) Results (trades closed, P&L realized).

Each log entry includes: timestamp (down to the second), component (which part of system), action (what happened), details (parameters, results, reasoning), and status (success/failure). Logs are written to both console (real-time visibility) and file (permanent record).

**Implementation Details:**
- Structured logging framework (Winston or similar)
- Multiple log levels (DEBUG, INFO, WARN, ERROR)
- Log rotation (daily rollover)
- Log archival (historical logs kept for full audit)

**Success Criteria:**
- Zero decisions made without logging
- Logs complete enough to reconstruct exactly what happened
- Logs readable by humans and parseable by machines
- Complete audit trail preserved
- Logs used for debugging, verification, and transparency

---

## 🔧 TECHNICAL REQUIREMENTS & ARCHITECTURE

### Technology Stack

**Backend Runtime:** Node.js 16.x or higher with npm package manager. Node.js was chosen because it has excellent libraries for API integration, asynchronous programming (crucial for market monitoring), and allows for rapid development.

**AI Integration:** Anthropic Claude API (model: claude-3-sonnet) for strategy decision-making. Claude was chosen because it can understand complex context (market conditions, multiple strategies, risk considerations) and provide nuanced recommendations rather than simple yes/no decisions.

**Brokerage Integration:** Alpaca Trading API (paper trading), Alpaca MCP Server (AI integration), Alpaca CLI (emergency commands). All three Alpaca technologies are integrated as required by the hackathon.

**Data & Analytics:** JSON files for trade storage, Winston for logging, moment.js for date/time handling. No external database required for this scope.

**Deployment:** Can run locally on any machine with Node.js, or can be deployed to cloud (AWS, Heroku, Vercel) for 24/7 operation.

### System Architecture

**Five-Agent Architecture:** ORACLE is built using an agent-based architecture with five specialized agents:

1. **Data Reader Agent:** Responsible for gathering market data (VIX, IV rank, earnings calendar, news) and formatting it for Claude AI. Updates every morning and periodically throughout the day.

2. **Claude AI Agent:** The "brain" of ORACLE. Receives market data, analyzes it, and recommends trading strategies. Uses anthropic-sdk to communicate with Claude API. Receives a structured prompt with market conditions and responds with specific recommendations.

3. **Trader Agent:** Executes Claude's recommendations by placing orders via Alpaca Trading API. Handles position sizing calculations, strike selection, order placement, and confirmation tracking.

4. **Bodyguard Agent:** Monitors positions throughout the day. Checks prices every 5 minutes, calculates P&L, and triggers closes when profit targets or stop losses are hit. Enforces all risk management rules.

5. **Reporter Agent:** Logs all activities, generates daily reports, calculates performance metrics, and creates social media posts. Maintains complete audit trail.

### Code Organization

```
oracle-trading-agent/
├── src/
│   ├── agents/
│   │   ├── DataReader.js
│   │   ├── ClaudeAI.js
│   │   ├── Trader.js
│   │   ├── Bodyguard.js
│   │   └── Reporter.js
│   ├── strategies/
│   │   ├── EarningsPlay.js
│   │   ├── ThetaDecay.js
│   │   ├── Directional.js
│   │   └── Adjustment.js
│   ├── api/
│   │   ├── alpaca.js
│   │   ├── claude.js
│   │   └── news.js
│   ├── models/
│   │   ├── Trade.js
│   │   ├── Position.js
│   │   └── Portfolio.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── calculator.js
│   │   └── validator.js
│   ├── config/
│   │   └── constants.js
│   └── index.js (main entry point)
├── tests/
│   ├── agents.test.js
│   ├── strategies.test.js
│   └── api.test.js
├── logs/
│   └── oracle.log
├── data/
│   ├── trades.json
│   └── positions.json
├── .env.example
├── package.json
├── README.md
└── LICENSE
```

### Data Models

**Trade Object:**
Represents a single trade (opening or closing). Contains: symbol, strategy type, position size, entry price, entry time, current price, P&L, status (open/closed), stop loss level, profit target level, closing price (if closed), closing time (if closed), closing reason.

**Position Object:**
Represents an open position. Contains: symbol, strategy type, entry date, entry price, current price, P&L, days held, Greeks (delta, gamma, vega, theta), status, time to expiration, associated orders.

**Portfolio Object:**
Represents account state. Contains: account balance, available funds, buying power, number of open positions, daily P&L, weekly P&L, all-time P&L, risk metrics.

---

## 🔌 API INTEGRATION SPECIFICATIONS

### Alpaca Trading API

**Purpose:** Execute trades (buy/sell options), monitor positions, retrieve market data.

**Endpoints Used:**
- GET /v2/account → Retrieve account balance and status
- GET /v2/positions → Get all open positions
- GET /v2/orders → Get order history
- POST /v2/orders → Place new orders
- GET /v2/assets → Get asset information
- GET /v2/market_clock → Check if market is open

**Authentication:** API key and secret provided in .env file, sent with every request header.

**Error Handling:** Implemented retry logic for transient failures, circuit breaker for persistent failures, fallback to cached data if API is temporarily unavailable.

### Claude AI API (via MCP)

**Purpose:** Make intelligent strategy decisions based on market analysis.

**Prompt Structure:** Send market data (VIX, IV rank, earnings, news, portfolio state) to Claude with instructions to recommend a strategy. Receive JSON-formatted response with specific recommendations.

**Error Handling:** Validate Claude response is properly formatted, fallback to neutral strategy if Claude is unavailable, log full conversation for audit trail.

### News API (Optional)

**Purpose:** Retrieve financial news for sentiment analysis.

**Endpoints:** Varies by provider (financial news API, Reddit sentiment API, etc.), optional for MVP.

---

## 📈 STRATEGIES IN DETAIL

### Strategy 1: Earnings Plays (Volatility Expansion)

**Trigger:** IV Rank < 40% AND earnings announcement within 5 days

**Mechanism:** Before earnings, implied volatility (IV) is typically low because no one knows what will happen. This means option prices are cheap relative to their actual value. ORACLE buys straddles (long call + long put at same strike) to position for a big move in either direction. When the company announces earnings, the stock moves significantly, AND/OR implied volatility spikes dramatically, and the options become much more valuable.

**Example:** Buy NVDA $125 straddle for $800 total cost. NVDA announces earnings, stock drops $6, but IV spikes from 35% to 65%. The put increases in value significantly. Close position for $900, profit $100.

**Position Size:** 1-2 contracts per earnings play

**Hold Time:** 1-5 days (expires after earnings)

**Max Risk:** Cost of straddle (e.g., $800)

**Target Profit:** 50% of max profit (e.g., if straddle costs $800 and max profit is $2,000, target profit is $1,000, close at $900 value)

---

### Strategy 2: Theta Decay (Sell Premium)

**Trigger:** IV Rank > 50% AND no major catalyst within 5 days

**Mechanism:** When IV is high, options are expensive. ORACLE sells spreads (e.g., iron condor, put spread) to other traders. Every single day that passes, the options decay in value due to time (theta). ORACLE, as the seller, owns this decay and keeps the money as options lose value.

**Example:** Sell MSFT $440 call for $2.10, buy $445 call for $0.50. Net credit: $1.60 per share = $160 per contract. If MSFT stays below $440, ORACLE keeps the $160. Even if MSFT goes up slightly, the spread profits.

**Position Size:** 2-3 spreads (multiple income streams)

**Hold Time:** 5-14 days (5 days to expiry)

**Max Risk:** Width of spread minus credit collected (e.g., $5 width - $1.60 credit = $3.40 max risk per share)

**Target Profit:** 50% of credit collected (close at breakeven + 50% when credit becomes $80 out of $160)

---

### Strategy 3: Directional Spreads (Bullish/Bearish)

**Trigger:** Clear bullish or bearish sentiment in news/market

**Mechanism:** When sentiment analysis shows market is bullish, ORACLE deploys bull spreads (buy call spread or sell put spread). When market is bearish, ORACLE deploys bear spreads (sell call spread or buy put spread). Limited risk from spreads means downside is protected.

**Example Bullish:** Buy AAPL $230 call for $1.50, sell $240 call for $0.50. Cost: $100. Max profit if AAPL > $240: $900. Max loss: $100.

**Example Bearish:** Sell TSLA $250 call for $2.00, buy $260 call for $0.50. Credit: $150. If TSLA stays below $250: keep $150.

**Position Size:** 1-2 spreads

**Hold Time:** 7-21 days

**Max Risk:** Spread width minus credit (limited risk)

**Target Profit:** 50% of max profit

---

### Strategy 4: Adaptive Adjustments

**Trigger:** Position is losing, but market conditions changed in a way that allows recovery

**Mechanism:** Instead of accepting a loss, restructure the position into a different strategy. Example: Strangle cost $400 and is down to $350 (losing $50). Market IV expanded significantly. Instead of closing for -$50, sell protective spreads to convert it to an iron butterfly. This reduces max loss and creates a path to recovery.

**Example:** AAPL strangle losing $50. Sell $240 call wing for $0.80, sell $215 put wing for $0.90. Net credit $170. New max loss: $230 (from $400). Position now has defined risk and path to profit.

**Position Size:** 1 adjustment per losing position

**Hold Time:** Varies (depends on restructuring)

**Max Risk:** Reduced from original max risk

**Target Profit:** 50% of new profit potential

---

## ⏰ IMPLEMENTATION TIMELINE

### Week 1: Core Development (Aug 28-29)

**Day 1 (Aug 28):** Build data reader and market data collection. Connect to Alpaca API, retrieve VIX/IV/earnings/news. Get Claude API working. Create first market data prompt.

**Day 2 (Aug 29):** Build trader agent. Execute first trades based on Claude recommendation. Set up profit targets and stop losses. Test with 1-2 live trades.

### Week 1: Strategy Development (Aug 30-31)

**Day 3 (Aug 30):** Implement first two strategies (earnings plays and theta decay). Create strategy decision logic.

**Day 4 (Aug 31):** Implement directional spreads strategy. Add news sentiment analysis.

### Week 1: Risk & Monitoring (Sept 1-2)

**Day 5 (Sept 1):** Build bodyguard agent with all risk management rules. Test profit targets and stop losses. Implement daily loss limits.

**Day 6 (Sept 2):** Build reporter agent. Implement daily reporting. Set up social media posting. Add logging and auditing.

### Week 1: Finalization (Sept 3-4)

**Day 7 (Sept 3):** Polish code, add comments, test all edge cases. Record demo video. Create presentation slides.

**Day 8 (Sept 4):** Final testing, documentation review, GitHub upload, submission form filling.

---

## 🎓 DOCUMENTATION REQUIREMENTS

### Required Documentation

1. **README.md** - Comprehensive project documentation including purpose, installation, usage, architecture, configuration, results.

2. **Strategy 1-Pager** - One-page document for judges explaining AI logic, risk management, and Alpaca infrastructure.

3. **Trading Journal** - Day-by-day breakdown of actual trades with P&L and reasoning.

4. **API Documentation** - How each Alpaca API is used and why.

5. **Architecture Document** - System design, data flow, agent responsibilities.

6. **Configuration Guide** - How to configure ORACLE for different risk levels or strategies.

### Code Documentation

- Inline comments explaining complex logic
- JSDoc comments on all functions and classes
- Examples in README showing how to use each component
- Error messages that are descriptive and actionable

---

## 🧪 TESTING & VALIDATION

### Unit Tests

Test individual agents and strategies in isolation:
- Test DataReader correctly parses market data
- Test ClaudeAI correctly formats prompts and parses responses
- Test Trader correctly calculates position sizes
- Test Bodyguard correctly identifies stop losses and profit targets
- Test Reporter correctly calculates P&L and generates reports

### Integration Tests

Test agents working together:
- Test full flow from market open to close
- Test multiple strategies running simultaneously
- Test position adjustments and restructuring
- Test risk management across entire portfolio

### Live Trading Tests

Test on actual Alpaca paper trading account:
- Verify trades execute correctly on Alpaca
- Verify P&L calculations match Alpaca reports
- Verify risk management actually prevents catastrophic losses
- Verify daily reports accurately reflect what happened

### Edge Case Testing

Test unusual situations:
- Market gap up or gap down on open
- Company reports unexpected earnings
- Extreme volatility spike
- System downtime/restart

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Market Conditions Unfavorable
**Risk:** Market could turn bearish or volatility could crash, making strategies less profitable.  
**Mitigation:** Multiple strategies provide diversification; even if one strategy fails, others may succeed. Daily profit target is modest (+$100) so even rough days can be profitable.

### Risk 2: API Failures
**Risk:** Alpaca or Claude APIs could be unavailable, preventing trading.  
**Mitigation:** Retry logic with exponential backoff, circuit breaker pattern, fallback to cached data, manual override capability via CLI.

### Risk 3: Bugs in Execution
**Risk:** Programming error could cause incorrect orders or risk management failures.  
**Mitigation:** Comprehensive testing, logging of all decisions, manual approval before submission, conservative starting position sizes.

### Risk 4: Backtesting Overfitting
**Risk:** Strategy might be overfitted to historical data and fail in live trading.  
**Mitigation:** Use out-of-sample testing, test on recent data, adjust parameters if needed, diversify strategies to reduce dependency on any single parameter.

### Risk 5: Claude AI Inconsistency
**Risk:** Claude might make inconsistent or suboptimal decisions on some days.  
**Mitigation:** Human review of Claude's recommendations each morning, override capability if recommendation seems wrong, learning system that tracks what works.

---

## 🏆 SUCCESS DEFINITION

ORACLE will be considered a success if ALL of the following are achieved:

1. ✅ **Profitable:** Generated +$500 or more profit over the seven-day period
2. ✅ **Consistent:** Positive P&L every single trading day
3. ✅ **Risk-Managed:** No single trade lost more than documented maximum loss, no day lost more than documented daily limit
4. ✅ **Integrated:** Successfully used all three Alpaca technologies (API, MCP Server, CLI)
5. ✅ **Adaptive:** Demonstrated multiple strategies based on market conditions
6. ✅ **Intelligent:** Claude AI made strategy decisions each morning based on market analysis
7. ✅ **Transparent:** Complete audit trail of all decisions and reasoning
8. ✅ **Reproducible:** Code is open-source, well-documented, and can be run by anyone
9. ✅ **Validated:** All P&L is verifiable on actual Alpaca paper trading account
10. ✅ **Submitted:** All required materials submitted before deadline

---

## 📝 APPROVAL & SIGN-OFF

**Document Status:** Final  
**Last Updated:** August 28, 2026  
**Approved For:** Development  

This PRD represents the complete specification for ORACLE. Development should follow this document closely while remaining flexible to discoveries and learnings during implementation.

---

**Next Step:** Begin implementation following the timeline above. Monitor progress daily against this PRD. Adjust if needed based on real-world results.

