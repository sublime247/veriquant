# Orion Builder Hackathon: Ready-to-Submit Metadata Package

Use this pre-formatted metadata when submitting on **[orionagents.org/submit?hackathon=1](https://orionagents.org/submit?hackathon=1)**.

---

### Project Metadata
* **Name:** `VeriQuant`
* **Category:** `trading` (or `research`)
* **Chain:** `base`
* **Website URL:** *(Your deployed Vercel URL, e.g., `https://veriquant.vercel.app`)*
* **Demo URL:** *(Your 2-minute Loom/YouTube video or live audit URL)*
* **GitHub URL:** `https://github.com/your-username/veriquant`
* **Twitter / X:** *(Your project or personal X handle)*
* **Telegram / Discord:** *(Your community link or handle)*

---

### Submission Description (Crafted to Score 92+ on Orion AI Vetting)

```markdown
VeriQuant is a tamper-proof quant evaluation oracle and verifiable backtesting engine for AI trading agents on Base Mainnet.

The crypto AI agent ecosystem is flooded with trading agents claiming 80%+ win rates and unsustainable APYs. Almost without exception, these claims rely on curve-fitted backtests on cherry-picked wicks, zero AMM pool slippage modeling, and zero L2 gas fee accounting. When real capital is allocated, these bots fail catastrophically.

VeriQuant eliminates this asymmetric risk by providing a deterministic, mathematically grounded evaluation layer.

How it works:
1. Deterministic Market Replay: An agent's trading strategy (or webhook signal stream) is replayed deterministically against historical Base DEX tick feeds across benchmark pairs (AERO/USDC, WETH/USDC, VIRTUAL/USDC, DEGEN/WETH).
2. Realistic Friction Modeling: VeriQuant models dynamic pool depth slippage across Aerodrome and Uniswap V3 pools and accounts for Base L2 EIP-4844 execution gas costs.
3. Institutional Quant Suite: Instead of superficial PnL percentages, VeriQuant computes institutional hedge-fund metrics: annualized Sharpe Ratio, Sortino Ratio (penalizing only downside volatility), Maximum Drawdown (MDD), Calmar Ratio, and Profit Factor.
4. Anti-Overfit Diagnostic Engine: Evaluates sample size significance (flagging strategies with < 15 trades), detects extreme parameter curve-fitting, penalizes reckless leverage, and assigns an objective Quant Integrity Score from 0 to 100 with an institutional grade (AAA to FAIL).
5. Tamper-Evident Proof of Alpha: VeriQuant binds the strategy configuration, historical dataset hash, and resulting metrics into a canonical SHA-256 master attestation digest. Anyone can independently verify the receipt without trusting a centralized server.
6. Machine-to-Machine Ecosystem: Autonomous agents can query POST /api/v1/audit via the x402 payment standard (0.25 USDC on Base) and interact directly through native Model Context Protocol (MCP) tools.

Why It Wins:
VeriQuant replaces subjective claims and photoshopped PnL cards with reproducible mathematical proof. It serves exchanges (WEEX, BingX) evaluating copy-trading bots, launchpads (HuoStarter) vetting token strategies, and autonomous capital allocators on Base.
```

---

### 2-Minute Demo Video Script Outline

1. **The Hook (0:00 - 0:30):**
   * "Hi judges. Every day, dozens of AI trading bots launch on Base claiming insane win rates. But when you look under the hood, they ignore slippage, ignore gas, and cherry-pick 5 trades. We built VeriQuant to bring hedge-fund grade, verifiable auditing to Base AI agents."
2. **Live Walkthrough (0:30 - 1:20):**
   * Open the VeriQuant Workstation (`/audit`).
   * Select a token pair (e.g. `AERO/USDC`) and show the parameter sliders or natural language parser.
   * Click **Execute Verifiable Audit**.
   * Show the equity curve vs. Buy & Hold benchmark, underwater drawdown profile, and the Base friction breakdown.
   * Point out the **Integrity Score** and show the anti-overfit diagnostic flags.
3. **Verifiability & Machine Integration (1:20 - 1:50):**
   * Click **Verify Cryptographic Proof** to show the SHA-256 digest match.
   * Open the public shareable certificate (`/certificate/[id]`).
   * Highlight the `x402` payment header and `/api/mcp` Model Context Protocol endpoint.
4. **Conclusion & Call to Action (1:50 - 2:00):**
   * "VeriQuant makes alpha verifiable. Ready on Base Mainnet. Thank you!"
