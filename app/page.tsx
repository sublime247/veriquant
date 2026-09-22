import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  ShieldCheck,
  Cpu,
  Activity,
  ArrowRight,
  Lock,
  Layers,
  FileCheck,
  Flame,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 border-b border-zinc-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            BASE MAINNET PROTOCOL • ACTIVE ORACLE
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-100 max-w-4xl mx-auto leading-tight">
            The Tamper-Proof Quant Oracle for <span className="text-emerald-400">AI Trading Agents</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Eliminating curve-fitted bots and fabricated PnL screenshots on Base. 
            Deterministic backtests against real DEX liquidity, institutional risk scoring, and SHA-256 cryptographic attestation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/audit"
              className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-emerald-950/60"
            >
              Launch Strategy Auditor <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/leaderboard"
              className="px-6 py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-sm flex items-center gap-2 transition-colors"
            >
              Verified Leaderboard
            </Link>
          </div>

          {/* Quick Stats Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12">
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
              <div className="text-2xl font-bold text-emerald-400">8453</div>
              <div className="text-xs text-zinc-500 mt-1">Base Mainnet Native</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
              <div className="text-2xl font-bold text-zinc-100">0.25 USDC</div>
              <div className="text-xs text-zinc-500 mt-1">x402 Machine Payment</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
              <div className="text-2xl font-bold text-blue-400">SHA-256</div>
              <div className="text-xs text-zinc-500 mt-1">Cryptographic Proofs</div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
              <div className="text-2xl font-bold text-zinc-100">MCP</div>
              <div className="text-xs text-zinc-500 mt-1">Model Context Protocol</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Existing Bots Fail vs VeriQuant */}
      <section className="py-16 border-b border-zinc-800 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">
              The Problem with Crypto AI Agents
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              99% of trading agents claim 80%+ win rates. When funded with real capital, they fail catastrophically due to ignored liquidity frictions and severe curve-fitting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Flame className="w-5 h-5" />
                UNVERIFIED "ALPHA" (THE STATUS QUO)
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✕</span>
                  Zero slippage modeling: backtests pretend $50,000 can swap without price impact.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✕</span>
                  Ignored gas costs: high-frequency trades bleed capital to L2 sequencers.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✕</span>
                  Curve-fitted parameters: 5 cherry-picked trades presented as "sustainable edge."
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">✕</span>
                  Manipulated PnL screenshots on X and Telegram.
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                VERIQUANT DETERMINISTIC ORACLE
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  Real AMM Depth: Slippage modeled dynamically against Aerodrome & Uniswap V3 pools.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  Base L2 EIP-4844 Accounting: Exact gas fees deducted from net trading PnL.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  Institutional Integrity Engine: Flags low sample size, martingale risk, and drawdown.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  Tamper-evident SHA-256 Digest: Strategy hash bound to dataset hash and performance.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Exchange & Judge Alignment */}
      <section className="py-16 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-zinc-100">
              Built for Exchanges, Launchpads & DAO Vetting
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Designed specifically to meet the quantitative due-diligence standards of WEEX, BingX, HuoStarter, Up10, and the Orion DAO.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <h3 className="text-sm font-bold text-zinc-200">Copy-Trading Desks</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Exchanges like WEEX and BingX can ingest VeriQuant receipts via x402 before listing an autonomous trader in their copy-trading marketplaces.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <h3 className="text-sm font-bold text-zinc-200">Orion Agent Store</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Eliminates subjective vetting. Agents submitted to Orion receive an automated Quant Integrity score directly tied to their on-chain track record.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-2">
              <h3 className="text-sm font-bold text-zinc-200">Agent-to-Agent Economy</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Autonomous capital allocators query VeriQuant through Model Context Protocol (MCP) to rebalance funds only into verified AAA/AA strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Machine-to-Machine Integration (x402 & MCP) */}
      <section className="py-16 bg-zinc-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-zinc-100">
              Machine-to-Machine Integration
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              VeriQuant exposes native machine protocols for autonomous software agents on Base.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* x402 Terminal */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 font-bold text-zinc-200">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  HTTP 402 PAYMENT PROTOCOL
                </span>
                <span className="text-emerald-400">0.25 USDC</span>
              </div>
              <div className="p-3 rounded bg-zinc-950 text-[11px] text-zinc-300 overflow-x-auto">
                <code>{`# Query audit with x402 payment header
curl -X POST https://veriquant-eta.vercel.app/api/v1/audit \\
  -H "Content-Type: application/json" \\
  -H "x-payment-tx: 0x8453a9...fee" \\
  -d '{"name":"AlphaBot","token":"AERO","archetype":"momentum_rsi"}'`}</code>
              </div>
            </div>

            {/* MCP Terminal */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 font-bold text-zinc-200">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  MODEL CONTEXT PROTOCOL (MCP)
                </span>
                <span className="text-blue-400">JSON-RPC</span>
              </div>
              <div className="p-3 rounded bg-zinc-950 text-[11px] text-zinc-300 overflow-x-auto">
                <code>{`// AI Agent calling VeriQuant via MCP
const response = await mcpClient.callTool({
  name: "veriquant_audit_strategy",
  arguments: { token: "AERO", entryThreshold: 30, exitThreshold: 70 }
});`}</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 bg-zinc-950 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>VERIQUANT // BASE MAINNET QUANT ORACLE • EIP-4844 VERIFIED</div>
          <div className="flex items-center gap-4">
            <Link href="/audit" className="hover:text-zinc-300">Auditor</Link>
            <Link href="/leaderboard" className="hover:text-zinc-300">Leaderboard</Link>
            <Link href="/api/mcp" className="hover:text-zinc-300">MCP Endpoint</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
