# Live Trading Implementation Specification

> **Document Version:** 1.0
> **Created:** 2026-02-06
> **Status:** Planning / Pre-Implementation
> **Author:** Platform Owner

---

## Table of Contents

1. [Overview & Goals](#1-overview--goals)
2. [Legal Considerations](#2-legal-considerations)
3. [Architecture](#3-architecture)
4. [Prerequisites & Checklists](#4-prerequisites--checklists)
5. [UI/UX Flow Design](#5-uiux-flow-design)
6. [Database Schema Changes](#6-database-schema-changes)
7. [Safety Gates & Performance Thresholds](#7-safety-gates--performance-thresholds)
8. [Code Changes - Dashboard (Build Now)](#8-code-changes---dashboard-build-now)
9. [Code Changes - n8n Bot (Build Later)](#9-code-changes---n8n-bot-build-later)
10. [Go-Live Runbook](#10-go-live-runbook)
11. [Appendix: Risk Acknowledgment Text](#11-appendix-risk-acknowledgment-text)

---

## 1. Overview & Goals

### 1.1 Purpose

This document outlines the complete implementation plan for enabling live trading capabilities on the NATN Dashboard platform. The goal is to build the infrastructure, safety gates, and UI flows now while keeping actual live trading disabled until all prerequisites are met.

### 1.2 Key Principles

1. **Safety First** - Multiple gates and confirmations before live trading is possible
2. **Progressive Trust** - Strategies must prove themselves in paper trading first
3. **Owner-Only** - Live trading is restricted to the platform owner only
4. **Audit Trail** - All decisions and overrides are logged
5. **Conservative Defaults** - Live trading starts with tighter limits than paper

### 1.3 Current State

| Component | Status |
|-----------|--------|
| Database schema supports `'live'` mode | ✅ Exists |
| Paper trading activation (owner-only) | ✅ Exists |
| n8n bot executes paper trades | ✅ Exists |
| Live trading UI | ❌ Not built |
| Safety gates & checklists | ❌ Not built |
| n8n live API switching | ❌ Not built |
| Performance tracking for gating | ❌ Not built |

### 1.4 Target State

- Owner can progress from paper → live trading through a guided, gated process
- Non-owners see clear messaging that live trading is unavailable
- System enforces minimum paper trading period per strategy
- System blocks live trading for underperforming strategies (with override option)
- Live trading uses more conservative limits than paper
- All live trading decisions are auditable

---

## 2. Legal Considerations

> **IMPORTANT DISCLAIMER:** This section is for informational purposes only and does not constitute legal advice. Consult a qualified securities attorney before engaging in live algorithmic trading.

### 2.1 Personal Use Context

The intended use case is:
- Platform owner trading their own capital
- Using personal Alpaca brokerage account
- Algorithmic execution of personal trading strategies
- No management of other people's money
- No investment advice provided to others

### 2.2 Generally Acceptable

- Trading your own money through self-built tools
- Using broker APIs (Alpaca, etc.) for personal algorithmic trading
- Alpaca Markets is a registered broker-dealer (FINRA/SIPC member) - they handle brokerage regulatory compliance

### 2.3 Potential Regulatory Triggers (Avoid These)

| Activity | Risk |
|----------|------|
| Managing other people's money | Requires RIA registration |
| Providing investment advice | May require advisor registration |
| Selling trading signals/strategies | Could trigger regulations |
| Operating as a fund | Requires fund registration |

### 2.4 Recommended Due Diligence

Before enabling live trading:

- [ ] **Consult a securities attorney** - One-time consultation for peace of mind
- [ ] **Review Alpaca Terms of Service** - Confirm compliance with their automated trading policies
- [ ] **Review Alpaca Margin & Pattern Day Trader rules** - Understand account restrictions
- [ ] **Document personal use intent** - Keep records that this is personal trading
- [ ] **Understand tax implications** - Algorithmic trading may have specific tax considerations

### 2.5 Platform Safeguards

The platform is designed to prevent regulatory issues:
- Live trading restricted to owner only (enforced at database level)
- Other users cannot trade real money on this platform
- No investment advice or recommendations provided
- Clear disclaimers that paper trading is for educational purposes

---

## 3. Architecture

### 3.1 Current System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NATN Dashboard                            │
│                     (React Frontend)                             │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Strategy   │  │  Backtest   │  │  Trading Activation     │  │
│  │  Builder    │  │  Engine     │  │  (Paper Only Currently) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Writes config + trading_mode
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                 │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ strategies  │  │  backtest   │  │    user_profiles        │  │
│  │   table     │  │  _results   │  │    (role: owner)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Reads active strategy
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      n8n Trading Bot                             │
│                   (Separate Repository)                          │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Schedule   │  │   Signal    │  │  Order Execution        │  │
│  │  Trigger    │  │  Analysis   │  │  (Paper API only)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Executes trades
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Alpaca Markets                                │
│                                                                  │
│  ┌─────────────────────────┐  ┌───────────────────────────────┐ │
│  │  Paper Trading API      │  │  Live Trading API             │ │
│  │  paper-api.alpaca.      │  │  api.alpaca.markets           │ │
│  │  markets                │  │  (NOT CONNECTED YET)          │ │
│  └─────────────────────────┘  └───────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Target Architecture Changes

```
Dashboard Additions:
├── Live Trading Readiness Assessment UI
├── Safety Gates & Checklists
├── Performance Threshold Checks
├── Override Flow with Reason Capture
├── Owner-only Live Trading Controls
└── Conservative Limits Configuration

Database Additions:
├── live_trading_readiness table (tracks per-strategy readiness)
├── trading_overrides table (audit log of overrides)
├── live_trading_config table (conservative limits for live)
└── Updated RLS policies

n8n Bot Additions (Later):
├── Environment detection (paper vs live)
├── API endpoint switching logic
├── Live-specific risk controls
└── Enhanced alerting for live trades
```

### 3.3 Data Flow for Live Trading

```
1. Strategy created → trading_mode = 'none'
2. Paper trading activated → trading_mode = 'paper', activated_at = now()
3. Paper trading runs for minimum period (e.g., 14 days)
4. Performance evaluated against thresholds
5. Owner completes live readiness checklist
6. Owner acknowledges risks
7. Live trading activated → trading_mode = 'live'
8. n8n detects 'live' mode → uses live API endpoint
9. Real trades execute on Alpaca
```

---

## 4. Prerequisites & Checklists

### 4.1 Alpaca Account Prerequisites

Before live trading is possible, owner must complete:

| Step | Description | Verification |
|------|-------------|--------------|
| 1 | Create Alpaca brokerage account (not just paper) | Account exists |
| 2 | Complete identity verification (KYC) | Account approved |
| 3 | Fund the account | Balance > $0 |
| 4 | Generate live API keys | Keys stored securely |
| 5 | Understand Pattern Day Trader (PDT) rules | If account < $25k |
| 6 | Review margin requirements | Understand leverage limits |

### 4.2 Platform Prerequisites (Per Strategy)

| Requirement | Threshold | Rationale |
|-------------|-----------|-----------|
| Minimum paper trading days | 14 days | Strategy needs time to prove itself |
| Minimum paper trades executed | 10 trades | Need statistical significance |
| Backtest completed | At least 1 | Understand historical performance |
| Paper trading profitable | > 0% return OR override | Don't go live with losing strategy |
| Max drawdown acceptable | < 20% OR override | Risk management check |

### 4.3 Owner Acknowledgment Checklist

Before activating live trading, owner must confirm:

- [ ] I understand this will use REAL MONEY
- [ ] I have reviewed the strategy's paper trading performance
- [ ] I accept the risk of financial loss
- [ ] I have set appropriate stop-loss limits
- [ ] I understand the platform provides no guarantees
- [ ] I have consulted appropriate legal/financial advisors
- [ ] I have verified my Alpaca live API keys are configured
- [ ] I understand I can deactivate live trading at any time

---

## 5. UI/UX Flow Design

### 5.1 Trading Activation States

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRADING MODE STATES                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐ │
│  │  NONE   │ ──▶  │  PAPER  │ ──▶  │  READY  │ ──▶  │  LIVE   │ │
│  │         │      │         │      │         │      │         │ │
│  │ Default │      │ Testing │      │ Gated   │      │ Active  │ │
│  └─────────┘      └─────────┘      └─────────┘      └─────────┘ │
│       │                │                │                │      │
│       │                │                │                │      │
│       ▼                ▼                ▼                ▼      │
│   "Activate       "Running"        "Complete         "LIVE"    │
│    Paper"          badge           checklist"        badge     │
│    button                          button            + Kill    │
│                                                      switch    │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Strategy Detail Page - Trading Section

#### State: No Trading Active (trading_mode = 'none')

```
┌─────────────────────────────────────────────────────────────────┐
│  TRADING ACTIVATION                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  This strategy is not currently active for trading.             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [  Activate for Paper Trading  ]                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Paper trading uses simulated money to test your strategy.      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### State: Paper Trading Active (trading_mode = 'paper')

```
┌─────────────────────────────────────────────────────────────────┐
│  TRADING STATUS                                    🟢 PAPER      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Paper Trading Active                                            │
│  ─────────────────                                               │
│  Started: January 15, 2026 (22 days ago)                        │
│  Trades Executed: 18                                             │
│  Paper P&L: +$1,234.56 (+4.12%)                                 │
│  Last Execution: 2 hours ago (success)                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [  Deactivate Paper Trading  ]                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  LIVE TRADING READINESS                                          │
│  ─────────────────────                                           │
│                                                                  │
│  ✅ Minimum 14 days paper trading (22 days)                     │
│  ✅ Minimum 10 paper trades (18 trades)                         │
│  ✅ Backtest completed (3 backtests)                            │
│  ✅ Paper trading profitable (+4.12%)                           │
│  ✅ Max drawdown acceptable (8.3% < 20%)                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [  Begin Live Trading Setup  ]                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### State: Paper Trading Active - NOT Ready for Live

```
┌─────────────────────────────────────────────────────────────────┐
│  TRADING STATUS                                    🟡 PAPER      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Paper Trading Active                                            │
│  ─────────────────                                               │
│  Started: February 1, 2026 (5 days ago)                         │
│  Trades Executed: 3                                              │
│  Paper P&L: -$156.23 (-0.52%)                                   │
│  Last Execution: 1 hour ago (success)                           │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  LIVE TRADING READINESS                                          │
│  ─────────────────────                                           │
│                                                                  │
│  ❌ Minimum 14 days paper trading (5/14 days)                   │
│  ❌ Minimum 10 paper trades (3/10 trades)                       │
│  ✅ Backtest completed (1 backtest)                             │
│  ⚠️  Paper trading not profitable (-0.52%)                      │
│  ✅ Max drawdown acceptable (2.1% < 20%)                        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [  Begin Live Trading Setup  ]  (Disabled)              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Complete all requirements above to enable live trading setup.  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### State: Failed Checks with Override Option

```
┌─────────────────────────────────────────────────────────────────┐
│  LIVE TRADING READINESS                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ Minimum 14 days paper trading (21 days)                     │
│  ✅ Minimum 10 paper trades (15 trades)                         │
│  ✅ Backtest completed (2 backtests)                            │
│  ❌ Paper trading not profitable (-3.45%)                       │
│  ✅ Max drawdown acceptable (12.1% < 20%)                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ⚠️  WARNING: Strategy is not profitable in paper        │    │
│  │                                                          │    │
│  │  This strategy has lost money during paper trading.      │    │
│  │  Proceeding to live trading is not recommended.          │    │
│  │                                                          │    │
│  │  You may override this check if you understand the       │    │
│  │  risks and have a documented reason.                     │    │
│  │                                                          │    │
│  │  ┌────────────────────────────────────────────────────┐  │    │
│  │  │  [  Override & Proceed Anyway  ]                    │  │    │
│  │  └────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Override Flow Modal

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️  OVERRIDE SAFETY CHECK                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  You are about to override the following safety check:          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ❌ Paper trading not profitable (-3.45%)                │    │
│  │                                                          │    │
│  │  This strategy lost $1,035.00 during 21 days of         │    │
│  │  paper trading with 15 trades executed.                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Please provide your reason for overriding this check:          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [                                                    ]  │    │
│  │  [  Example: Market conditions during paper period     ]  │    │
│  │  [  were unusually bearish. Strategy is designed for   ]  │    │
│  │  [  long-term performance.                             ]  │    │
│  │  [                                                    ]  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ☐ I understand this override will be logged for audit          │
│  ☐ I accept full responsibility for this decision               │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────────────────┐     │
│  │  [    Cancel    ]   │  │  [  Confirm Override  ]        │     │
│  └────────────────────┘  └────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Live Trading Setup Wizard

#### Step 1: Account Verification

```
┌─────────────────────────────────────────────────────────────────┐
│  LIVE TRADING SETUP                              Step 1 of 4    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Alpaca Account Verification                                     │
│  ───────────────────────────                                     │
│                                                                  │
│  Before enabling live trading, confirm your Alpaca account      │
│  is properly configured:                                         │
│                                                                  │
│  ☐ I have a funded Alpaca brokerage account (not just paper)   │
│  ☐ My account has completed identity verification (KYC)         │
│  ☐ I have generated live API keys (not paper keys)              │
│  ☐ My live API keys are configured in the n8n bot               │
│  ☐ I understand Pattern Day Trader (PDT) rules if applicable    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ℹ️  Need help setting up Alpaca?                        │    │
│  │  Visit: https://alpaca.markets/docs/trading/             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────────────────┐     │
│  │  [    Cancel    ]   │  │  [  Next: Risk Settings  ]     │     │
│  └────────────────────┘  └────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 2: Conservative Limits

```
┌─────────────────────────────────────────────────────────────────┐
│  LIVE TRADING SETUP                              Step 2 of 4    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Conservative Limits for Live Trading                            │
│  ────────────────────────────────────                            │
│                                                                  │
│  Live trading will use MORE CONSERVATIVE limits than paper.     │
│  You can adjust these after gaining live trading experience.    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Setting              │  Paper Value  │  Live Value     │    │
│  ├───────────────────────┼───────────────┼─────────────────┤    │
│  │  Max Position Size    │  20%          │  10%            │    │
│  │  Max Daily Trades     │  5            │  3              │    │
│  │  Max Daily Loss       │  -2%          │  -1%            │    │
│  │  Stop Loss            │  -7%          │  -5%            │    │
│  │  Take Profit          │  +15%         │  +10%           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ☐ I understand live trading will use these conservative       │
│    limits initially                                              │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────────────────┐     │
│  │  [    Back     ]    │  │  [  Next: Review Strategy  ]   │     │
│  └────────────────────┘  └────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 3: Strategy Review

```
┌─────────────────────────────────────────────────────────────────┐
│  LIVE TRADING SETUP                              Step 3 of 4    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Strategy Performance Review                                     │
│  ───────────────────────────                                     │
│                                                                  │
│  Strategy: "Tech Growth Momentum"                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  PAPER TRADING SUMMARY                                   │    │
│  │  ─────────────────────                                   │    │
│  │  Duration:        22 days                                │    │
│  │  Total Trades:    18                                     │    │
│  │  Win Rate:        61%                                    │    │
│  │  Total Return:    +4.12%                                 │    │
│  │  Max Drawdown:    -8.3%                                  │    │
│  │  Sharpe Ratio:    1.24                                   │    │
│  │                                                          │    │
│  │  BACKTEST SUMMARY (1 year)                               │    │
│  │  ─────────────────────────                               │    │
│  │  Total Return:    +18.5%                                 │    │
│  │  Max Drawdown:    -12.1%                                 │    │
│  │  Sharpe Ratio:    1.45                                   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ☐ I have reviewed the strategy performance and accept it      │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────────────────┐     │
│  │  [    Back     ]    │  │  [  Next: Final Confirmation ] │     │
│  └────────────────────┘  └────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 4: Final Confirmation

```
┌─────────────────────────────────────────────────────────────────┐
│  LIVE TRADING SETUP                              Step 4 of 4    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️  FINAL CONFIRMATION - REAL MONEY                            │
│  ─────────────────────────────────                               │
│                                                                  │
│  You are about to enable LIVE TRADING with REAL MONEY.          │
│                                                                  │
│  Please read and confirm each statement:                         │
│                                                                  │
│  ☐ I understand this will execute trades with REAL MONEY        │
│                                                                  │
│  ☐ I understand I can LOSE MONEY and accept this risk           │
│                                                                  │
│  ☐ I have reviewed the strategy's paper trading performance     │
│                                                                  │
│  ☐ I have set appropriate risk limits (stop-loss, position      │
│    sizing, daily loss limits)                                    │
│                                                                  │
│  ☐ I understand the platform provides NO GUARANTEES of          │
│    profit or performance                                         │
│                                                                  │
│  ☐ I have consulted appropriate legal and financial advisors    │
│    as needed                                                     │
│                                                                  │
│  ☐ I understand I can DEACTIVATE live trading at any time       │
│    using the kill switch                                         │
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────────────────┐     │
│  │  [    Cancel    ]   │  │  [  🔴 ACTIVATE LIVE TRADING ] │     │
│  └────────────────────┘  └────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.5 Live Trading Active State

```
┌─────────────────────────────────────────────────────────────────┐
│  TRADING STATUS                                    🔴 LIVE       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️  LIVE TRADING ACTIVE - REAL MONEY                           │
│  ───────────────────────────────────                             │
│                                                                  │
│  Strategy: "Tech Growth Momentum"                                │
│  Started: February 6, 2026 (Today)                              │
│  Mode: LIVE (Conservative Limits)                                │
│                                                                  │
│  Today's Activity:                                               │
│  ─────────────────                                               │
│  Trades: 1                                                       │
│  P&L: +$45.23                                                   │
│  Last Execution: 32 minutes ago (success)                       │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │  [  🛑 STOP LIVE TRADING (Kill Switch)  ]                │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ℹ️  This will immediately stop all live trading. You can       │
│     reactivate after a 1-hour cooling-off period.               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.6 Non-Owner View

```
┌─────────────────────────────────────────────────────────────────┐
│  TRADING                                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ℹ️  PAPER TRADING ONLY                                  │    │
│  │                                                          │    │
│  │  Live trading with real money is not available on        │    │
│  │  this platform. You can use paper trading to test        │    │
│  │  your strategies with simulated funds.                   │    │
│  │                                                          │    │
│  │  Paper trading is a great way to:                        │    │
│  │  • Test strategy performance without risk                │    │
│  │  • Learn how the trading system works                    │    │
│  │  • Validate your ideas before using real capital         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  [  Activate for Paper Trading  ]                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Database Schema Changes

### 6.1 New Tables

#### `live_trading_readiness`

Tracks per-strategy readiness for live trading.

```sql
CREATE TABLE live_trading_readiness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Readiness checks
  paper_trading_start_date TIMESTAMPTZ,
  paper_trading_days INTEGER DEFAULT 0,
  paper_trades_count INTEGER DEFAULT 0,
  paper_total_return_percent DECIMAL(10,4),
  paper_max_drawdown_percent DECIMAL(10,4),
  backtests_completed INTEGER DEFAULT 0,

  -- Check results (computed)
  meets_duration_requirement BOOLEAN DEFAULT FALSE,
  meets_trades_requirement BOOLEAN DEFAULT FALSE,
  meets_backtest_requirement BOOLEAN DEFAULT FALSE,
  meets_profitability_requirement BOOLEAN DEFAULT FALSE,
  meets_drawdown_requirement BOOLEAN DEFAULT FALSE,

  -- Overall status
  is_ready_for_live BOOLEAN DEFAULT FALSE,

  -- Timestamps
  last_evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(strategy_id)
);

-- Index for quick lookups
CREATE INDEX idx_readiness_strategy ON live_trading_readiness(strategy_id);
CREATE INDEX idx_readiness_user ON live_trading_readiness(user_id);
```

#### `trading_overrides`

Audit log for when owner overrides safety checks.

```sql
CREATE TABLE trading_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- What was overridden
  check_name TEXT NOT NULL,  -- e.g., 'profitability', 'drawdown', 'duration'
  check_value TEXT,          -- e.g., '-3.45%'
  threshold_value TEXT,      -- e.g., '0%'

  -- Owner's reason
  override_reason TEXT NOT NULL,

  -- Acknowledgments
  acknowledged_audit_log BOOLEAN DEFAULT FALSE,
  acknowledged_responsibility BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Index for audit queries
CREATE INDEX idx_overrides_strategy ON trading_overrides(strategy_id);
CREATE INDEX idx_overrides_user ON trading_overrides(user_id);
CREATE INDEX idx_overrides_created ON trading_overrides(created_at DESC);
```

#### `live_trading_config`

Stores conservative limits for live trading (separate from paper config).

```sql
CREATE TABLE live_trading_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conservative limits (defaults are tighter than paper)
  max_position_size_percent DECIMAL(5,2) DEFAULT 10.0,  -- Paper: 20%
  max_daily_trades INTEGER DEFAULT 3,                    -- Paper: 5
  max_daily_loss_percent DECIMAL(5,2) DEFAULT 1.0,       -- Paper: 2%
  stop_loss_percent DECIMAL(5,2) DEFAULT 5.0,            -- Paper: 7%
  take_profit_percent DECIMAL(5,2) DEFAULT 10.0,         -- Paper: 15%

  -- Activation tracking
  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  deactivation_reason TEXT,  -- 'manual', 'loss_limit', 'error', etc.

  -- Cooling-off period
  cooloff_until TIMESTAMPTZ,  -- Can't reactivate until this time

  -- Setup completion
  setup_completed_at TIMESTAMPTZ,
  setup_step_completed INTEGER DEFAULT 0,  -- 0-4 wizard steps

  -- Acknowledgments stored
  acknowledged_real_money BOOLEAN DEFAULT FALSE,
  acknowledged_loss_risk BOOLEAN DEFAULT FALSE,
  acknowledged_reviewed_performance BOOLEAN DEFAULT FALSE,
  acknowledged_risk_limits BOOLEAN DEFAULT FALSE,
  acknowledged_no_guarantees BOOLEAN DEFAULT FALSE,
  acknowledged_consulted_advisors BOOLEAN DEFAULT FALSE,
  acknowledged_can_deactivate BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(strategy_id)
);

CREATE INDEX idx_live_config_strategy ON live_trading_config(strategy_id);
CREATE INDEX idx_live_config_user ON live_trading_config(user_id);
```

### 6.2 Schema Updates to Existing Tables

#### Update `strategies` table

```sql
-- Add columns for better tracking
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS
  paper_trading_started_at TIMESTAMPTZ;

ALTER TABLE strategies ADD COLUMN IF NOT EXISTS
  live_trading_started_at TIMESTAMPTZ;

ALTER TABLE strategies ADD COLUMN IF NOT EXISTS
  paper_trades_count INTEGER DEFAULT 0;

ALTER TABLE strategies ADD COLUMN IF NOT EXISTS
  paper_total_pnl DECIMAL(15,2) DEFAULT 0;

-- Update trading_mode check constraint if needed
-- (Already supports 'live' based on existing schema)
```

### 6.3 Row Level Security (RLS) Policies

```sql
-- live_trading_readiness: Users can only see their own
CREATE POLICY "Users can view own readiness"
  ON live_trading_readiness FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can update readiness"
  ON live_trading_readiness FOR ALL
  USING (auth.uid() = user_id);

-- trading_overrides: Users can only see/create their own
CREATE POLICY "Users can view own overrides"
  ON trading_overrides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only owner can create overrides"
  ON trading_overrides FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- live_trading_config: Owner only
CREATE POLICY "Only owner can manage live config"
  ON live_trading_config FOR ALL
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Update strategies RLS for live trading
CREATE POLICY "Only owner can set live trading mode"
  ON strategies FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    -- Allow any user to set 'none' or 'paper'
    (NEW.trading_mode IN ('none', 'paper'))
    OR
    -- Only owner can set 'live'
    (NEW.trading_mode = 'live' AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'owner'
    ))
  );
```

### 6.4 Database Functions

```sql
-- Function to evaluate strategy readiness
CREATE OR REPLACE FUNCTION evaluate_live_trading_readiness(p_strategy_id UUID)
RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_paper_start TIMESTAMPTZ;
  v_paper_days INTEGER;
  v_paper_trades INTEGER;
  v_paper_return DECIMAL;
  v_paper_drawdown DECIMAL;
  v_backtest_count INTEGER;
BEGIN
  -- Get strategy info
  SELECT user_id, paper_trading_started_at, paper_trades_count
  INTO v_user_id, v_paper_start, v_paper_trades
  FROM strategies
  WHERE id = p_strategy_id;

  -- Calculate paper trading days
  v_paper_days := COALESCE(
    EXTRACT(DAY FROM NOW() - v_paper_start)::INTEGER,
    0
  );

  -- Get backtest count
  SELECT COUNT(*) INTO v_backtest_count
  FROM backtest_results
  WHERE strategy_id = p_strategy_id;

  -- TODO: Calculate paper return and drawdown from trade history
  -- (This would require a trades table or calculation from backtest_results)
  v_paper_return := 0;  -- Placeholder
  v_paper_drawdown := 0;  -- Placeholder

  -- Upsert readiness record
  INSERT INTO live_trading_readiness (
    strategy_id, user_id,
    paper_trading_start_date, paper_trading_days, paper_trades_count,
    paper_total_return_percent, paper_max_drawdown_percent,
    backtests_completed,
    meets_duration_requirement, meets_trades_requirement,
    meets_backtest_requirement, meets_profitability_requirement,
    meets_drawdown_requirement, is_ready_for_live,
    last_evaluated_at
  ) VALUES (
    p_strategy_id, v_user_id,
    v_paper_start, v_paper_days, v_paper_trades,
    v_paper_return, v_paper_drawdown,
    v_backtest_count,
    v_paper_days >= 14,
    v_paper_trades >= 10,
    v_backtest_count >= 1,
    v_paper_return >= 0,
    v_paper_drawdown <= 20,
    (v_paper_days >= 14 AND v_paper_trades >= 10 AND v_backtest_count >= 1),
    NOW()
  )
  ON CONFLICT (strategy_id) DO UPDATE SET
    paper_trading_start_date = EXCLUDED.paper_trading_start_date,
    paper_trading_days = EXCLUDED.paper_trading_days,
    paper_trades_count = EXCLUDED.paper_trades_count,
    paper_total_return_percent = EXCLUDED.paper_total_return_percent,
    paper_max_drawdown_percent = EXCLUDED.paper_max_drawdown_percent,
    backtests_completed = EXCLUDED.backtests_completed,
    meets_duration_requirement = EXCLUDED.meets_duration_requirement,
    meets_trades_requirement = EXCLUDED.meets_trades_requirement,
    meets_backtest_requirement = EXCLUDED.meets_backtest_requirement,
    meets_profitability_requirement = EXCLUDED.meets_profitability_requirement,
    meets_drawdown_requirement = EXCLUDED.meets_drawdown_requirement,
    is_ready_for_live = EXCLUDED.is_ready_for_live,
    last_evaluated_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 7. Safety Gates & Performance Thresholds

### 7.1 Required Thresholds

| Gate | Threshold | Can Override? | Rationale |
|------|-----------|---------------|-----------|
| Minimum paper days | 14 days | No | Need time to see varied market conditions |
| Minimum paper trades | 10 trades | No | Need statistical significance |
| Backtest completed | ≥ 1 | No | Must understand historical performance |
| Paper profitability | ≥ 0% return | Yes | Losing strategy shouldn't go live |
| Max drawdown | ≤ 20% | Yes | Risk management |

### 7.2 Override Policy

When owner overrides a check:

1. **Reason Required** - Must provide text explanation (min 20 characters)
2. **Acknowledgments Required**:
   - "I understand this override will be logged for audit"
   - "I accept full responsibility for this decision"
3. **Logged Permanently** - Stored in `trading_overrides` table
4. **Cannot Override Hard Gates** - Duration and trade count cannot be bypassed

### 7.3 Conservative Live Limits

| Setting | Paper Default | Live Default | Reasoning |
|---------|---------------|--------------|-----------|
| Max Position Size | 20% | 10% | Limit per-trade exposure |
| Max Daily Trades | 5 | 3 | Reduce overtrading risk |
| Max Daily Loss | -2% | -1% | Tighter loss limit |
| Stop Loss | -7% | -5% | Exit losses earlier |
| Take Profit | +15% | +10% | Secure gains earlier |

### 7.4 Auto-Pause Triggers

Live trading should automatically pause if:

| Trigger | Action | Cooldown |
|---------|--------|----------|
| Daily loss limit hit | Pause until next day | Until market open |
| Max daily trades reached | Pause until next day | Until market open |
| Order execution error | Pause + alert owner | 1 hour or manual resume |
| API connection failure | Pause + alert owner | 1 hour or manual resume |
| Manual kill switch | Pause + log reason | 1 hour (configurable) |

### 7.5 Weekly Review Prompt

After live trading is active for 7 days, prompt owner to review:

- Total trades executed
- P&L performance
- Any errors or issues
- Whether to continue or adjust limits

---

## 8. Code Changes - Dashboard (Build Now)

These changes can be implemented immediately without needing live API access.

### 8.1 New Files to Create

```
src/
├── components/
│   └── trading/
│       ├── LiveTradingReadiness.tsx      # Readiness checklist component
│       ├── LiveTradingSetupWizard.tsx    # 4-step setup wizard
│       ├── OverrideModal.tsx             # Override confirmation modal
│       ├── TradingKillSwitch.tsx         # Emergency stop button
│       ├── ConservativeLimitsForm.tsx    # Live limits configuration
│       └── NonOwnerTradingMessage.tsx    # "Paper only" message
├── hooks/
│   ├── useLiveTradingReadiness.ts        # Fetch/evaluate readiness
│   ├── useTradingOverrides.ts            # Manage overrides
│   └── useLiveTradingConfig.ts           # Manage live config
├── lib/
│   └── live-trading/
│       ├── readiness-checks.ts           # Threshold evaluation logic
│       ├── conservative-limits.ts        # Default live limits
│       └── types.ts                      # TypeScript types
└── types/
    └── live-trading.ts                   # Type definitions
```

### 8.2 Type Definitions

```typescript
// src/types/live-trading.ts

export interface LiveTradingReadiness {
  strategyId: string;
  userId: string;

  // Raw values
  paperTradingStartDate: string | null;
  paperTradingDays: number;
  paperTradesCount: number;
  paperTotalReturnPercent: number | null;
  paperMaxDrawdownPercent: number | null;
  backtestsCompleted: number;

  // Check results
  meetsDurationRequirement: boolean;
  meetsTradesRequirement: boolean;
  meetsBacktestRequirement: boolean;
  meetsProfitabilityRequirement: boolean;
  meetsDrawdownRequirement: boolean;

  // Overall
  isReadyForLive: boolean;
  lastEvaluatedAt: string | null;
}

export interface ReadinessCheck {
  id: string;
  name: string;
  description: string;
  threshold: string;
  currentValue: string;
  passed: boolean;
  canOverride: boolean;
  overrideWarning?: string;
}

export interface TradingOverride {
  id: string;
  strategyId: string;
  userId: string;
  checkName: string;
  checkValue: string;
  thresholdValue: string;
  overrideReason: string;
  acknowledgedAuditLog: boolean;
  acknowledgedResponsibility: boolean;
  createdAt: string;
}

export interface LiveTradingConfig {
  strategyId: string;
  userId: string;

  // Conservative limits
  maxPositionSizePercent: number;
  maxDailyTrades: number;
  maxDailyLossPercent: number;
  stopLossPercent: number;
  takeProfitPercent: number;

  // Activation
  activatedAt: string | null;
  deactivatedAt: string | null;
  deactivationReason: string | null;
  cooloffUntil: string | null;

  // Setup wizard progress
  setupCompletedAt: string | null;
  setupStepCompleted: number;

  // Acknowledgments
  acknowledgments: {
    realMoney: boolean;
    lossRisk: boolean;
    reviewedPerformance: boolean;
    riskLimits: boolean;
    noGuarantees: boolean;
    consultedAdvisors: boolean;
    canDeactivate: boolean;
  };
}

export interface LiveTradingSetupStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
  checks?: { label: string; checked: boolean }[];
}

export const READINESS_THRESHOLDS = {
  MIN_PAPER_DAYS: 14,
  MIN_PAPER_TRADES: 10,
  MIN_BACKTESTS: 1,
  MIN_PROFIT_PERCENT: 0,
  MAX_DRAWDOWN_PERCENT: 20,
} as const;

export const CONSERVATIVE_LIVE_DEFAULTS = {
  maxPositionSizePercent: 10,  // Paper: 20
  maxDailyTrades: 3,           // Paper: 5
  maxDailyLossPercent: 1,      // Paper: 2
  stopLossPercent: 5,          // Paper: 7
  takeProfitPercent: 10,       // Paper: 15
} as const;
```

### 8.3 Component: LiveTradingReadiness

```typescript
// src/components/trading/LiveTradingReadiness.tsx

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLiveTradingReadiness } from '@/hooks/useLiveTradingReadiness';
import { OverrideModal } from './OverrideModal';
import { ReadinessCheck } from '@/types/live-trading';

interface Props {
  strategyId: string;
  onBeginSetup: () => void;
}

export function LiveTradingReadiness({ strategyId, onBeginSetup }: Props) {
  const { readiness, checks, isLoading, refetch } = useLiveTradingReadiness(strategyId);
  const [overrideCheck, setOverrideCheck] = React.useState<ReadinessCheck | null>(null);

  if (isLoading) {
    return <div>Evaluating readiness...</div>;
  }

  const allRequiredPassed = checks
    .filter(c => !c.canOverride)
    .every(c => c.passed);

  const allPassed = checks.every(c => c.passed);
  const hasOverridableFailures = checks.some(c => !c.passed && c.canOverride);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Trading Readiness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {checks.map((check) => (
          <div key={check.id} className="flex items-start gap-3">
            {check.passed ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : check.canOverride ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-medium">{check.name}</div>
              <div className="text-sm text-muted-foreground">
                {check.currentValue} / {check.threshold}
              </div>
              {!check.passed && check.canOverride && (
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-yellow-600"
                  onClick={() => setOverrideCheck(check)}
                >
                  Override this check
                </Button>
              )}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <Button
            onClick={onBeginSetup}
            disabled={!allRequiredPassed}
            className="w-full"
          >
            {allPassed
              ? 'Begin Live Trading Setup'
              : hasOverridableFailures
                ? 'Override Required Checks First'
                : 'Complete All Requirements First'
            }
          </Button>
          {!allRequiredPassed && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Complete the required checks above to proceed.
            </p>
          )}
        </div>
      </CardContent>

      {overrideCheck && (
        <OverrideModal
          check={overrideCheck}
          strategyId={strategyId}
          onClose={() => setOverrideCheck(null)}
          onSuccess={() => {
            setOverrideCheck(null);
            refetch();
          }}
        />
      )}
    </Card>
  );
}
```

### 8.4 Component: NonOwnerTradingMessage

```typescript
// src/components/trading/NonOwnerTradingMessage.tsx

import React from 'react';
import { Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function NonOwnerTradingMessage() {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Paper Trading Only</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>
          Live trading with real money is not available on this platform.
          You can use paper trading to test your strategies with simulated funds.
        </p>
        <p className="text-sm text-muted-foreground">
          Paper trading is a great way to:
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside">
          <li>Test strategy performance without risk</li>
          <li>Learn how the trading system works</li>
          <li>Validate your ideas before using real capital</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
```

### 8.5 Hook: useLiveTradingReadiness

```typescript
// src/hooks/useLiveTradingReadiness.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import {
  LiveTradingReadiness,
  ReadinessCheck,
  READINESS_THRESHOLDS
} from '@/types/live-trading';

export function useLiveTradingReadiness(strategyId: string) {
  const query = useQuery({
    queryKey: ['live-trading-readiness', strategyId],
    queryFn: async () => {
      // Fetch readiness data
      const { data, error } = await supabase
        .from('live_trading_readiness')
        .select('*')
        .eq('strategy_id', strategyId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as LiveTradingReadiness | null;
    },
  });

  // Build checks array from readiness data
  const checks: ReadinessCheck[] = query.data ? [
    {
      id: 'duration',
      name: 'Minimum paper trading period',
      description: `At least ${READINESS_THRESHOLDS.MIN_PAPER_DAYS} days of paper trading`,
      threshold: `${READINESS_THRESHOLDS.MIN_PAPER_DAYS} days`,
      currentValue: `${query.data.paperTradingDays} days`,
      passed: query.data.meetsDurationRequirement,
      canOverride: false,
    },
    {
      id: 'trades',
      name: 'Minimum paper trades',
      description: `At least ${READINESS_THRESHOLDS.MIN_PAPER_TRADES} trades executed`,
      threshold: `${READINESS_THRESHOLDS.MIN_PAPER_TRADES} trades`,
      currentValue: `${query.data.paperTradesCount} trades`,
      passed: query.data.meetsTradesRequirement,
      canOverride: false,
    },
    {
      id: 'backtest',
      name: 'Backtest completed',
      description: 'At least one backtest run',
      threshold: `${READINESS_THRESHOLDS.MIN_BACKTESTS} backtest`,
      currentValue: `${query.data.backtestsCompleted} backtests`,
      passed: query.data.meetsBacktestRequirement,
      canOverride: false,
    },
    {
      id: 'profitability',
      name: 'Paper trading profitable',
      description: 'Strategy should not be losing money',
      threshold: `≥ ${READINESS_THRESHOLDS.MIN_PROFIT_PERCENT}%`,
      currentValue: `${query.data.paperTotalReturnPercent?.toFixed(2) ?? 'N/A'}%`,
      passed: query.data.meetsProfitabilityRequirement,
      canOverride: true,
      overrideWarning: 'This strategy has lost money during paper trading.',
    },
    {
      id: 'drawdown',
      name: 'Maximum drawdown acceptable',
      description: 'Peak-to-trough loss within limits',
      threshold: `≤ ${READINESS_THRESHOLDS.MAX_DRAWDOWN_PERCENT}%`,
      currentValue: `${query.data.paperMaxDrawdownPercent?.toFixed(2) ?? 'N/A'}%`,
      passed: query.data.meetsDrawdownRequirement,
      canOverride: true,
      overrideWarning: 'This strategy has experienced significant drawdown.',
    },
  ] : [];

  return {
    readiness: query.data,
    checks,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

### 8.6 Updates to StrategyDetailPage

The existing `StrategyDetailPage.tsx` needs to be updated to:

1. Import and use `NonOwnerTradingMessage` for non-owners
2. Show `LiveTradingReadiness` component when paper trading is active (owner only)
3. Add the Live Trading Setup wizard flow
4. Add kill switch for active live trading

Key changes to `src/pages/StrategyDetailPage.tsx`:

```typescript
// Add imports
import { NonOwnerTradingMessage } from '@/components/trading/NonOwnerTradingMessage';
import { LiveTradingReadiness } from '@/components/trading/LiveTradingReadiness';
import { LiveTradingSetupWizard } from '@/components/trading/LiveTradingSetupWizard';
import { TradingKillSwitch } from '@/components/trading/TradingKillSwitch';

// In the trading section:
{isOwner ? (
  <>
    {tradingMode === 'none' && (
      // Existing paper trading activation button
    )}
    {tradingMode === 'paper' && (
      <>
        {/* Existing paper trading status */}
        <LiveTradingReadiness
          strategyId={strategyId}
          onBeginSetup={() => setShowLiveSetup(true)}
        />
      </>
    )}
    {tradingMode === 'live' && (
      <>
        {/* Live trading status */}
        <TradingKillSwitch strategyId={strategyId} />
      </>
    )}
  </>
) : (
  <NonOwnerTradingMessage />
)}
```

### 8.7 Database Migration

```sql
-- File: supabase/migrations/XXX_live_trading_infrastructure.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create live_trading_readiness table
CREATE TABLE IF NOT EXISTS live_trading_readiness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  paper_trading_start_date TIMESTAMPTZ,
  paper_trading_days INTEGER DEFAULT 0,
  paper_trades_count INTEGER DEFAULT 0,
  paper_total_return_percent DECIMAL(10,4),
  paper_max_drawdown_percent DECIMAL(10,4),
  backtests_completed INTEGER DEFAULT 0,

  meets_duration_requirement BOOLEAN DEFAULT FALSE,
  meets_trades_requirement BOOLEAN DEFAULT FALSE,
  meets_backtest_requirement BOOLEAN DEFAULT FALSE,
  meets_profitability_requirement BOOLEAN DEFAULT FALSE,
  meets_drawdown_requirement BOOLEAN DEFAULT FALSE,

  is_ready_for_live BOOLEAN DEFAULT FALSE,

  last_evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(strategy_id)
);

-- Create trading_overrides table
CREATE TABLE IF NOT EXISTS trading_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  check_name TEXT NOT NULL,
  check_value TEXT,
  threshold_value TEXT,
  override_reason TEXT NOT NULL,

  acknowledged_audit_log BOOLEAN DEFAULT FALSE,
  acknowledged_responsibility BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create live_trading_config table
CREATE TABLE IF NOT EXISTS live_trading_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  max_position_size_percent DECIMAL(5,2) DEFAULT 10.0,
  max_daily_trades INTEGER DEFAULT 3,
  max_daily_loss_percent DECIMAL(5,2) DEFAULT 1.0,
  stop_loss_percent DECIMAL(5,2) DEFAULT 5.0,
  take_profit_percent DECIMAL(5,2) DEFAULT 10.0,

  activated_at TIMESTAMPTZ,
  deactivated_at TIMESTAMPTZ,
  deactivation_reason TEXT,
  cooloff_until TIMESTAMPTZ,

  setup_completed_at TIMESTAMPTZ,
  setup_step_completed INTEGER DEFAULT 0,

  acknowledged_real_money BOOLEAN DEFAULT FALSE,
  acknowledged_loss_risk BOOLEAN DEFAULT FALSE,
  acknowledged_reviewed_performance BOOLEAN DEFAULT FALSE,
  acknowledged_risk_limits BOOLEAN DEFAULT FALSE,
  acknowledged_no_guarantees BOOLEAN DEFAULT FALSE,
  acknowledged_consulted_advisors BOOLEAN DEFAULT FALSE,
  acknowledged_can_deactivate BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(strategy_id)
);

-- Add tracking columns to strategies table
ALTER TABLE strategies ADD COLUMN IF NOT EXISTS
  paper_trading_started_at TIMESTAMPTZ;

ALTER TABLE strategies ADD COLUMN IF NOT EXISTS
  live_trading_started_at TIMESTAMPTZ;

ALTER TABLE strategies ADD COLUMN IF NOT EXISTS
  paper_trades_count INTEGER DEFAULT 0;

ALTER TABLE strategies ADD COLUMN IF NOT EXISTS
  paper_total_pnl DECIMAL(15,2) DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_readiness_strategy
  ON live_trading_readiness(strategy_id);
CREATE INDEX IF NOT EXISTS idx_readiness_user
  ON live_trading_readiness(user_id);
CREATE INDEX IF NOT EXISTS idx_overrides_strategy
  ON trading_overrides(strategy_id);
CREATE INDEX IF NOT EXISTS idx_overrides_user
  ON trading_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_overrides_created
  ON trading_overrides(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_config_strategy
  ON live_trading_config(strategy_id);
CREATE INDEX IF NOT EXISTS idx_live_config_user
  ON live_trading_config(user_id);

-- Enable RLS
ALTER TABLE live_trading_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_trading_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_trading_readiness
CREATE POLICY "Users can view own readiness"
  ON live_trading_readiness FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own readiness"
  ON live_trading_readiness FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policies for trading_overrides
CREATE POLICY "Users can view own overrides"
  ON trading_overrides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only owner can create overrides"
  ON trading_overrides FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for live_trading_config
CREATE POLICY "Only owner can manage live config"
  ON live_trading_config FOR ALL
  USING (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid() AND role = 'owner'
    )
  );
```

---

## 9. Code Changes - n8n Bot (Build Later)

These changes require live API keys and should only be implemented when ready to go live.

### 9.1 Environment Variables

Add to n8n bot environment:

```bash
# Existing (Paper)
ALPACA_PAPER_API_KEY=your_paper_key
ALPACA_PAPER_API_SECRET=your_paper_secret
ALPACA_PAPER_API_URL=https://paper-api.alpaca.markets

# New (Live)
ALPACA_LIVE_API_KEY=your_live_key
ALPACA_LIVE_API_SECRET=your_live_secret
ALPACA_LIVE_API_URL=https://api.alpaca.markets
```

### 9.2 Workflow Changes

#### Config Node Update

The "Config" node in the n8n workflow needs to:

1. Read `trading_mode` from strategy
2. Select appropriate API credentials
3. Apply conservative limits for live mode

```javascript
// Config node - pseudocode for changes
const strategy = $input.first().json;
const tradingMode = strategy.trading_mode; // 'paper' or 'live'

// Select API based on mode
const apiConfig = tradingMode === 'live' ? {
  apiKey: $env.ALPACA_LIVE_API_KEY,
  apiSecret: $env.ALPACA_LIVE_API_SECRET,
  apiUrl: $env.ALPACA_LIVE_API_URL,
} : {
  apiKey: $env.ALPACA_PAPER_API_KEY,
  apiSecret: $env.ALPACA_PAPER_API_SECRET,
  apiUrl: $env.ALPACA_PAPER_API_URL,
};

// For live mode, fetch and apply conservative limits
let riskLimits;
if (tradingMode === 'live') {
  // Fetch from live_trading_config table
  // Apply tighter limits
  riskLimits = {
    maxPositionSize: 0.10,  // 10% vs 20%
    maxDailyTrades: 3,      // vs 5
    maxDailyLoss: -0.01,    // -1% vs -2%
  };
} else {
  riskLimits = {
    maxPositionSize: 0.20,
    maxDailyTrades: 5,
    maxDailyLoss: -0.02,
  };
}

return [{
  json: {
    ...strategy.config,
    _trading_mode: tradingMode,
    _api_config: apiConfig,
    _risk_limits: riskLimits,
    _is_live: tradingMode === 'live',
  }
}];
```

#### API Call Updates

All Alpaca API nodes need to:

1. Use dynamic API URL from config
2. Use dynamic API credentials from config

#### Enhanced Alerting for Live

For live trades, add more prominent Telegram notifications:

```
🔴 LIVE TRADE EXECUTED
Symbol: AAPL
Action: BUY
Shares: 5
Price: $150.25
Total: $751.25

⚠️ This is a REAL trade with REAL money
```

### 9.3 Safety Additions

1. **Pre-trade confirmation log** - Log every live trade decision before execution
2. **Post-trade verification** - Verify order was filled correctly
3. **Daily summary** - Send end-of-day summary for live trading days
4. **Error escalation** - More aggressive alerting for live trading errors

---

## 10. Go-Live Runbook

When you're ready to enable live trading, follow this checklist:

### 10.1 Pre-Implementation (One-Time)

- [ ] Consult securities attorney regarding personal trading
- [ ] Review and understand Alpaca terms of service
- [ ] Understand tax implications of algorithmic trading
- [ ] Set up separate record-keeping for trades

### 10.2 Alpaca Account Setup

- [ ] Create funded Alpaca brokerage account
- [ ] Complete identity verification (KYC)
- [ ] Fund account with intended capital
- [ ] Generate live API keys
- [ ] Test live API keys with read-only calls first
- [ ] Understand account's PDT status and limitations

### 10.3 n8n Bot Preparation

- [ ] Add live API credentials to n8n environment
- [ ] Update Config node with live/paper switching logic
- [ ] Update all Alpaca API nodes to use dynamic URL
- [ ] Add enhanced live trading alerts
- [ ] Test with paper mode still active
- [ ] Review and test error handling paths

### 10.4 Dashboard Preparation

- [ ] Deploy all "Build Now" code changes
- [ ] Run database migration for new tables
- [ ] Test readiness evaluation with paper strategy
- [ ] Test override flow
- [ ] Test setup wizard flow (without final activation)
- [ ] Verify non-owner messaging displays correctly

### 10.5 Final Activation

- [ ] Choose strategy with good paper trading track record
- [ ] Complete all readiness checks (or document overrides)
- [ ] Complete 4-step setup wizard
- [ ] Double-check conservative limits are acceptable
- [ ] Confirm all acknowledgments
- [ ] Activate live trading
- [ ] Monitor first execution closely
- [ ] Verify trade execution in Alpaca dashboard

### 10.6 Post-Activation Monitoring

- [ ] Check daily for successful executions
- [ ] Review P&L regularly
- [ ] Watch for any error notifications
- [ ] Complete weekly review at 7 days
- [ ] Adjust conservative limits after gaining confidence

---

## 11. Appendix: Risk Acknowledgment Text

### 11.1 Final Confirmation Acknowledgments

These are the exact texts users must acknowledge before activating live trading:

1. **Real Money**
   > "I understand this will execute trades using REAL MONEY from my funded Alpaca brokerage account."

2. **Loss Risk**
   > "I understand that algorithmic trading involves significant risk and I may LOSE MONEY. Past performance in paper trading or backtesting does not guarantee future results."

3. **Performance Review**
   > "I have reviewed this strategy's paper trading performance and backtest results. I understand the strategy's historical returns, drawdowns, and risk characteristics."

4. **Risk Limits**
   > "I have configured appropriate risk management settings including stop-loss limits, position sizing, and daily loss limits. I understand these are my responsibility."

5. **No Guarantees**
   > "I understand this platform provides NO GUARANTEES of profit, performance, or trading success. The platform is provided as-is for personal use."

6. **Advisor Consultation**
   > "I have consulted with appropriate legal, tax, and financial advisors as needed for my situation, or I have chosen to proceed without such consultation at my own risk."

7. **Deactivation**
   > "I understand I can DEACTIVATE live trading at any time using the kill switch. After deactivation, there is a cooling-off period before I can reactivate."

### 11.2 Override Acknowledgments

When overriding a safety check:

1. **Audit Log**
   > "I understand this override will be permanently logged for audit purposes, including my reason and the current date/time."

2. **Responsibility**
   > "I accept full responsibility for this decision to override the safety check. I understand the risks described and choose to proceed anyway."

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-06 | Platform Owner | Initial specification |

---

## Next Steps

1. Review this document thoroughly
2. Decide which "Build Now" items to implement first
3. Set up Alpaca brokerage account (can do in parallel)
4. Consult with securities attorney
5. Implement dashboard changes
6. Run sufficient paper trading period
7. When ready, implement n8n changes and go live

---

*This document is for internal use only. It describes the implementation plan for enabling live trading on a personal trading platform.*
