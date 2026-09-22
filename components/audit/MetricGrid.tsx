'use client';

import { QuantMetrics } from '@/lib/quant/types';
import { TrendingUp, ShieldAlert, Activity, Percent, Fuel, Scale } from 'lucide-react';

interface MetricGridProps {
  metrics: QuantMetrics;
}

export default function MetricGrid({ metrics }: MetricGridProps) {
  const isPositive = metrics.totalReturnPercent >= 0;
  const isAlphaPositive = metrics.alphaPercent >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
      {/* Total Return */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span>NET RETURN</span>
          <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tracking-tight ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {metrics.totalReturnPercent}%
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          Ann: {metrics.annualizedReturnPercent}%
        </div>
      </div>

      {/* Alpha vs Benchmark */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span>ALPHA (EXCESS)</span>
          <Scale className="w-3.5 h-3.5 text-zinc-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tracking-tight ${
              isAlphaPositive ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {isAlphaPositive ? '+' : ''}
            {metrics.alphaPercent}%
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          vs B&H ({metrics.benchmarkReturnPercent}%)
        </div>
      </div>

      {/* Sharpe Ratio */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span>SHARPE RATIO</span>
          <Activity className="w-3.5 h-3.5 text-zinc-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tracking-tight ${
              metrics.sharpeRatio >= 1.5
                ? 'text-emerald-400'
                : metrics.sharpeRatio >= 1.0
                ? 'text-blue-400'
                : metrics.sharpeRatio >= 0.5
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {metrics.sharpeRatio}
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          Target &gt; 1.5 (Inst. grade)
        </div>
      </div>

      {/* Sortino Ratio */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span>SORTINO RATIO</span>
          <Activity className="w-3.5 h-3.5 text-zinc-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tracking-tight ${
              metrics.sortinoRatio >= 2.0
                ? 'text-emerald-400'
                : metrics.sortinoRatio >= 1.0
                ? 'text-blue-400'
                : 'text-amber-400'
            }`}
          >
            {metrics.sortinoRatio}
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          Downside-adjusted risk
        </div>
      </div>

      {/* Max Drawdown */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span>MAX DRAWDOWN</span>
          <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tracking-tight ${
              metrics.maxDrawdownPercent <= 15
                ? 'text-emerald-400'
                : metrics.maxDrawdownPercent <= 28
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            -{metrics.maxDrawdownPercent}%
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          Calmar: {metrics.calmarRatio}
        </div>
      </div>

      {/* Win Rate & Trades */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span>WIN RATE</span>
          <Percent className="w-3.5 h-3.5 text-zinc-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-zinc-100">
            {metrics.winRatePercent}%
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          {metrics.winningTrades}W / {metrics.losingTrades}L ({metrics.totalTrades} total)
        </div>
      </div>

      {/* Profit Factor */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span>PROFIT FACTOR</span>
          <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold tracking-tight ${
              metrics.profitFactor >= 2.0
                ? 'text-emerald-400'
                : metrics.profitFactor >= 1.2
                ? 'text-blue-400'
                : 'text-amber-400'
            }`}
          >
            {metrics.profitFactor}
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          Gross Win / Gross Loss
        </div>
      </div>

      {/* Base Execution Friction */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
          <span>BASE L2 FRICTION</span>
          <Fuel className="w-3.5 h-3.5 text-zinc-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-zinc-300">
            ${(metrics.totalGasSpentUsd + metrics.totalSlippagePaidUsd).toFixed(2)}
          </span>
        </div>
        <div className="text-[11px] text-zinc-500 mt-1">
          Gas: ${metrics.totalGasSpentUsd} | Slip: ${metrics.totalSlippagePaidUsd}
        </div>
      </div>
    </div>
  );
}
