'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StrategyForm from '@/components/audit/StrategyForm';
import MetricGrid from '@/components/audit/MetricGrid';
import IntegrityCard from '@/components/audit/IntegrityCard';
import EquityChart from '@/components/audit/EquityChart';
import ProofBadge from '@/components/audit/ProofBadge';
import { StrategyConfig, BacktestResult } from '@/lib/quant/types';
import { runBacktestSimulation } from '@/lib/quant/engine';
import { Terminal, Database, Activity } from 'lucide-react';

export default function AuditPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  // Run initial default audit on mount so user immediately sees rich data
  useEffect(() => {
    handleRunAudit({
      name: 'Aero Alpha Momentum',
      archetype: 'momentum_rsi',
      token: 'AERO',
      timeframe: '4h',
      initialCapitalUsd: 10000,
      entryThreshold: 32,
      exitThreshold: 68,
      stopLossPercent: 4.5,
      takeProfitPercent: 9.0,
      positionSizePercent: 30,
      maxSlippagePercent: 0.3,
      leverage: 1,
    });
  }, []);

  const handleRunAudit = async (config: StrategyConfig) => {
    setLoading(true);
    try {
      // Execute via engine
      const res = await runBacktestSimulation(config);
      setResult(res);
    } catch (err) {
      console.error('Audit simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ORACLE WORKSTATION // DETERMINISTIC SIMULATION
            </div>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-zinc-100">
              AI Trading Agent Strategy Auditor
            </h1>
            <p className="text-sm text-zinc-400 font-mono mt-1">
              Deterministic replay against Base DEX liquidity pools (Aerodrome/Uniswap V3) with EIP-4844 gas accounting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 text-right font-mono text-xs">
              <div className="text-zinc-500">x402 Protocol Cost</div>
              <div className="text-emerald-400 font-bold mt-0.5">0.25 USDC / Audit</div>
            </div>
          </div>
        </div>

        {/* Strategy Form */}
        <StrategyForm onRunAudit={handleRunAudit} loading={loading} />

        {/* Results Presentation */}
        {result && (
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>AUDIT RESULTS FOR [{result.strategy.name.toUpperCase()}] • PAIR: {result.strategy.token}/USDC</span>
            </div>

            {/* Top KPIs */}
            <MetricGrid metrics={result.metrics} />

            {/* Integrity Diagnostic Card */}
            <IntegrityCard integrity={result.integrity} />

            {/* Charts: Equity Curve & Drawdown */}
            <EquityChart
              data={result.equityCurve}
              initialCapital={result.strategy.initialCapitalUsd}
            />

            {/* Cryptographic Attestation Proof Badge */}
            <ProofBadge receipt={result.receipt} />

            {/* Executed Trade Ledger */}
            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">
                    DETERMINISTIC TRADE LEDGER ({result.trades.length} EXECUTIONS)
                  </h3>
                </div>
                <span className="text-xs text-zinc-500">
                  Base Swap Slippage & Gas Deducted
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500">
                      <th className="pb-2">ID</th>
                      <th className="pb-2">DIR</th>
                      <th className="pb-2">ENTRY</th>
                      <th className="pb-2">EXIT</th>
                      <th className="pb-2">SIZE</th>
                      <th className="pb-2">NET PNL</th>
                      <th className="pb-2">RETURN</th>
                      <th className="pb-2">FRICTION</th>
                      <th className="pb-2">REASON</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {result.trades.slice(0, 8).map((t) => (
                      <tr key={t.id} className="hover:bg-zinc-800/30">
                        <td className="py-2.5 text-zinc-400">{t.id}</td>
                        <td className="py-2.5 text-emerald-400 font-bold">{t.direction}</td>
                        <td className="py-2.5 text-zinc-300">${t.entryPrice}</td>
                        <td className="py-2.5 text-zinc-300">${t.exitPrice}</td>
                        <td className="py-2.5 text-zinc-300">${t.sizeUsd}</td>
                        <td
                          className={`py-2.5 font-bold ${
                            t.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {t.netPnl >= 0 ? '+' : ''}${t.netPnl}
                        </td>
                        <td
                          className={`py-2.5 font-bold ${
                            t.pnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {t.pnlPercent >= 0 ? '+' : ''}{t.pnlPercent}%
                        </td>
                        <td className="py-2.5 text-zinc-500">
                          ${(t.gasCostUsd + t.slippageCostUsd).toFixed(2)}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              t.exitReason === 'TAKE_PROFIT'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : t.exitReason === 'STOP_LOSS'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {t.exitReason}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
