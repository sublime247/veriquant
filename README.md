# VeriQuant ⚡
> **The Tamper-Proof Quant Oracle & Verifiable Backtesting Engine for AI Trading Agents on Base.**

[![Chain](https://img.shields.io/badge/Chain-Base%20Mainnet%20(8453)-blue)](https://base.org)
[![Protocol](https://img.shields.io/badge/Protocol-x402%20Micropayments-emerald)](https://x402.org)
[![Interface](https://img.shields.io/badge/Interface-Model%20Context%20Protocol%20(MCP)-purple)](https://modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 1. Executive Summary & Problem

The crypto AI agent ecosystem is flooded with "autonomous trading bots" claiming 80%+ win rates and astronomical APYs. Almost without exception, these claims rely on:
1. **Unrealistic Backtests:** Zero AMM pool slippage modeling and zero L2 gas fee accounting.
2. **Extreme Curve-Fitting:** Cherry-picking 5 lucky trades during a localized pump and marketing it as "sustainable alpha."
3. **Fabricated Proof:** Photoshopped PnL cards and unprovable off-chain assertions.

When exchanges (like **WEEX** and **BingX**) or launchpads (like **HuoStarter** and **Orion Agents**) attempt to vet or list these agents, they face asymmetric information risk.

### The Solution: VeriQuant
**VeriQuant** is an open, deterministic quant evaluation oracle native to **Base (Chain ID 8453)**. It replays trading strategies against historical Base DEX liquidity depth (Aerodrome, Uniswap V3), enforces institutional hedge-fund risk metrics, flags curve-fitting, and emits **SHA-256 cryptographic attestation receipts**.

---

## 2. Architecture & How It Works

```
┌────────────────────────────────────────────────────────┐
│               Input: Agent Strategy                    │
│   • Rule Set (RSI, EMA, Bollinger, ATR)                │
│   • Natural Language Prompt ("Scalp AERO dips...")     │
│   • Base Token Pair (AERO, WETH, VIRTUAL, DEGEN)       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            VeriQuant Deterministic Engine              │
│   1. Replay against Base DEX Historical Tick Feed      │
│   2. Dynamic AMM Pool Slippage Model                   │
│   3. EIP-4844 Blob & L2 Gas Accounting                 │
│   4. Calculate Institutional Quant KPIs                │
│      (Sharpe, Sortino, Max Drawdown, Calmar, PF)       │
│   5. Anti-Overfit Diagnostic Engine                    │
└───────────────────────────┬────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│     Quant Integrity       │ │  Tamper-Evident Receipt   │
│   Score (0-100) & Grade   │ │  SHA-256 (Strat + Data    │
│   (AAA / AA / BBB / FAIL) │ │   + Metrics + Base Block) │
└───────────────────────────┘ └─────────────┬─────────────┘
                                            ▼
                              ┌───────────────────────────┐
                              │    Ecosystem Exposure     │
                              │ • x402 Micropayments      │
                              │ • Model Context Protocol  │
                              │ • Public Certificate URL  │
                              └───────────────────────────┘
```

---

## 3. Institutional Metric Suite

VeriQuant computes true hedge-fund performance metrics:

| Metric | Calculation / Description | Benchmark Target |
| :--- | :--- | :--- |
| **Sharpe Ratio** | Risk-adjusted return penalized by total volatility ($\frac{R_p - R_f}{\sigma_p}$). | $\ge 1.5$ (Institutional) |
| **Sortino Ratio** | Risk-adjusted return penalized **only by downside deviation**. | $\ge 2.0$ |
| **Max Drawdown (MDD)** | Maximum peak-to-trough equity decline observed. | $\le 20\%$ |
| **Calmar Ratio** | Ratio of annualized return to maximum drawdown. | $\ge 2.0$ |
| **Profit Factor** | Gross profits divided by gross losses. | $\ge 1.5$ |
| **Base L2 Friction** | Real DEX slippage + EIP-4844 execution gas. | Deducted from PnL |

---

## 4. Machine-to-Machine Protocols

### A. HTTP 402 Payment Required (`x402`)
Other autonomous agents on Base can audit strategies by paying **0.25 USDC** per audit:
```bash
curl -X POST https://veriquant.org/api/v1/audit \
  -H "Content-Type: application/json" \
  -H "x-payment-tx: 0x8453a9f029...txhash" \
  -d '{
    "name": "AlphaBot",
    "token": "AERO",
    "archetype": "momentum_rsi",
    "entryThreshold": 30,
    "exitThreshold": 70,
    "stopLossPercent": 4.0,
    "takeProfitPercent": 8.0
  }'
```

### B. Model Context Protocol (MCP)
VeriQuant exposes native tools over HTTP JSON-RPC at `/api/mcp`:
* `veriquant_audit_strategy`: Deterministically audits a strategy on Base AMMs.
* `veriquant_verify_receipt`: Validates a receipt's cryptographic SHA-256 digest.
* `veriquant_get_leaderboard`: Fetches the verified leaderboard.

---

## 5. Quickstart & Local Development

### Prerequisites
* Node.js 18+ or 22+
* npm or pnpm

### Setup
```bash
# 1. Clone the repository
git clone https://github.com/your-username/veriquant.git
cd veriquant

# 2. Install dependencies
npm install

# 3. Run automated verification test suite
npx tsx lib/quant/__tests__/verification.test.ts

# 4. Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the interactive Strategy Auditor.

---

## 6. Built for Partner Judges & Orion DAO
* **WEEX & BingX:** Provides the exact quantitative due-diligence layer required before onboarding automated bots to copy-trading desks.
* **HuoStarter & Orion Launchpad:** Automated risk scoring replaces manual, subjective vetting.
* **Base Builders:** Protects developers and capital allocators from predatory or flawed token strategies.
