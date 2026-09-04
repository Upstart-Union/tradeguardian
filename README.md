# TradeGuardian: One-Page Architecture & Hackathon Write-Up

## 1. Executive Summary & Strategy Overview
**TradeGuardian** is an institutional-grade, multi-agent options trading and risk certification desk powered by Alpaca's Trading API, FastMCP Server, and CLI tooling. Operating exclusively in Alpaca's paper trading environment, TradeGuardian replaces emotional trading with an autonomous consensus pipeline that identifies high-probability options spreads, stress-tests trades through an adversarial agent, enforces deterministic capital preservation gates, and manages live positions with automated take-profit and stop-loss guardrails.

## 2. Autonomous Multi-Agent AI Logic
TradeGuardian implements a specialized 5-agent consensus swarm:

1. **Research Agent (Momentum & Volatility Scanner):**
   - Continuously ingests 1-minute and daily bars across US equities, mega-tech leaders, and index ETFs.
   - Calculates 20-day baseline SMAs, 14-period RSI, and Relative Volume ($RVol = \frac{\text{Current Volume}}{\text{20-Day Avg Volume}}$).
   - Dynamically formulates directional theses (Bullish/Bearish) with an algorithmic confidence score.

2. **Devil's Advocate Agent (Adversarial Stress Tester):**
   - Interrogates the Research Agent's thesis by checking for overextended RSI readings, macro volatility, and reversal risks before any order can proceed.

3. **Options Strategy Agent (Contract & Spread Architect):**
   - Queries Alpaca's Options Market Data API (`OptionsFeed.INDICATIVE`).
   - Filters OCC-standard contracts (`ROOT + YYMMDD + [C/P] + STRIKE`) targeting 14–45 DTE.
   - Automatically constructs defined-risk vertical spreads (**Bull Call Spreads** for upward expansion; **Bear Put Spreads** for downside hedges), fixing maximum loss and risk-reward ratios prior to execution.

4. **Guardian Risk Agent (Hard Compliance & Sizing Engine):**
   - Enforces pre-trade risk certification gates:
     - **Single-Trade Exposure:** Caps individual trade value to $\le 7.5\%$ of account equity.
     - **Concentration Limits:** Prevents over-allocation across correlated underlyings ($\le 25\%$).
     - **Buying Power & Margin Protection:** Blocks orders that risk deficit margin calls.
   - Generates cryptographic audit trail records for compliance verification.

5. **Position Manager & Autonomous Trader (Execution & Lifecycle Guard):**
   - Background execution loop monitoring active Alpaca positions:
     - 🎯 **Take-Profit Target (+50% options / +15% spot):** Autonomous profit realization.
     - 🛑 **Stop-Loss Guardrail (-25% options / -5% spot):** Immediate risk severance.
     - ⏳ **Expiration Guard (DTE $\le 1$ day):** Closes contracts approaching expiry to eliminate pin risk.

## 3. Alpaca Infrastructure Implementation
TradeGuardian natively utilizes Alpaca's full developer ecosystem:

| Alpaca Component | Integration & Usage |
| :--- | :--- |
| **Alpaca Trading API (`alpaca-py`)** | Connects to `paper-api.alpaca.markets` for account balance, buying power, equity history, and live order execution. |
| **Alpaca Options Data API** | Ingests live option chains, contract identifiers, bids, asks, and indicative prices via `OptionDataClient`. |
| **Alpaca FastMCP Server** | Implements the Model Context Protocol (MCP) tool-calling standard (`/mcp` routes, live status monitoring) to allow LLMs and automated clients to query positions and execute orders. |
| **Alpaca CLI Terminal** | An interactive, web-embedded Alpaca CLI terminal modal built directly into the UI, giving traders instant command-line control over orders and positions. |
| **Paper Trading Environment** | 100% paper-brokerage isolation with zero real capital exposure. |

---

## 4. Testable Results & Performance Metrics
- **Multi-Asset Deep Radar:** Evaluates 40+ liquid assets across equities, ETFs, and 24/7 benchmark crypto in parallel within $<2$ seconds.
- **Dynamic Screener:** Detects volume breakout runners with institutional participation ($RVol \ge 1.0x - 2.5x$).
- **Deterministic Capital Preservation:** 0% margin call rate across all automated simulated cycles, strictly bounded by Guardian single-position caps.
