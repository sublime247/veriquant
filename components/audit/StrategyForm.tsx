'use client';

import { useState } from 'react';
import { StrategyConfig, StrategyArchetype } from '@/lib/quant/types';
import { Play, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

interface StrategyFormProps {
  onRunAudit: (config: StrategyConfig) => void;
  loading: boolean;
}

const PRESET_STRATEGIES: Record<string, Partial<StrategyConfig>> = {
  aero_momentum: {
    name: 'Aero Alpha Momentum',
    archetype: 'momentum_rsi',
    token: 'AERO',
    timeframe: '4h',
    entryThreshold: 32,
    exitThreshold: 68,
    stopLossPercent: 4.5,
    takeProfitPercent: 9.0,
    positionSizePercent: 30,
    maxSlippagePercent: 0.3,
    leverage: 1,
  },
  virtual_trend: {
    name: 'Virtuals AI Trend Harvester',
    archetype: 'trend_ema',
    token: 'VIRTUAL',
    timeframe: '4h',
    entryThreshold: 35,
    exitThreshold: 70,
    stopLossPercent: 5.0,
    takeProfitPercent: 12.0,
    positionSizePercent: 25,
    maxSlippagePercent: 0.4,
    leverage: 1,
  },
  weth_mean_revert: {
    name: 'Base WETH Mean Reversion',
    archetype: 'mean_reversion',
    token: 'WETH',
    timeframe: '1h',
    entryThreshold: 30,
    exitThreshold: 60,
    stopLossPercent: 2.5,
    takeProfitPercent: 5.0,
    positionSizePercent: 35,
    maxSlippagePercent: 0.15,
    leverage: 2,
  },
  degen_breakout: {
    name: 'Degen High-Vol Breakout',
    archetype: 'breakout_volatility',
    token: 'DEGEN',
    timeframe: '1h',
    entryThreshold: 28,
    exitThreshold: 75,
    stopLossPercent: 7.0,
    takeProfitPercent: 18.0,
    positionSizePercent: 20,
    maxSlippagePercent: 0.5,
    leverage: 1,
  },
};

export default function StrategyForm({ onRunAudit, loading }: StrategyFormProps) {
  const [config, setConfig] = useState<StrategyConfig>({
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

  const [nlPrompt, setNlPrompt] = useState('');

  const handleApplyPreset = (key: string) => {
    const preset = PRESET_STRATEGIES[key];
    if (preset) {
      setConfig((prev) => ({ ...prev, ...preset }));
    }
  };

  const handleParseNlPrompt = () => {
    const p = nlPrompt.toLowerCase();
    const updated: Partial<StrategyConfig> = { ...config };

    if (p.includes('aero')) updated.token = 'AERO';
    else if (p.includes('weth') || p.includes('eth')) updated.token = 'WETH';
    else if (p.includes('virtual')) updated.token = 'VIRTUAL';
    else if (p.includes('degen')) updated.token = 'DEGEN';

    if (p.includes('trend') || p.includes('ema') || p.includes('cross')) {
      updated.archetype = 'trend_ema';
    } else if (p.includes('revert') || p.includes('dip')) {
      updated.archetype = 'mean_reversion';
    } else if (p.includes('breakout')) {
      updated.archetype = 'breakout_volatility';
    } else {
      updated.archetype = 'momentum_rsi';
    }

    // Extract numbers like 2x, 3x leverage
    const levMatch = p.match(/(\d+)x/);
    if (levMatch) {
      const lev = parseInt(levMatch[1]);
      if (lev >= 1 && lev <= 5) updated.leverage = lev;
    }

    // Extract stop loss
    const slMatch = p.match(/(\d+(\.\d+)?)%\s*stop/);
    if (slMatch) {
      updated.stopLossPercent = parseFloat(slMatch[1]);
    }

    // Extract take profit
    const tpMatch = p.match(/(\d+(\.\d+)?)%\s*(tp|take|profit)/);
    if (tpMatch) {
      updated.takeProfitPercent = parseFloat(tpMatch[1]);
    }

    setConfig(updated as StrategyConfig);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunAudit(config);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/60 font-mono space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            STRATEGY SPECIFICATION
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure agent parameters or select a verified benchmark archetype
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleApplyPreset('aero_momentum')}
            className="px-2 py-1 text-[11px] rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50"
          >
            AERO Momentum
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('virtual_trend')}
            className="px-2 py-1 text-[11px] rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50"
          >
            VIRTUAL Trend
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('weth_mean_revert')}
            className="px-2 py-1 text-[11px] rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50"
          >
            WETH Revert
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('degen_breakout')}
            className="px-2 py-1 text-[11px] rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50"
          >
            DEGEN Breakout
          </button>
        </div>
      </div>

      {/* Natural Language Prompt Assistant */}
      <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-2">
        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          NATURAL LANGUAGE STRATEGY PARSER
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            placeholder="e.g. Scalp AERO dips with 3.5% stop loss, 8% take profit and 2x leverage"
            className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleParseNlPrompt}
            className="px-3 py-1.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 text-xs shrink-0"
          >
            Parse
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strategy Name */}
        <div>
          <label className="text-xs text-zinc-400 block mb-1">AGENT / STRATEGY NAME</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Base Token Pair */}
        <div>
          <label className="text-xs text-zinc-400 block mb-1">BASE TOKEN PAIR (vs USDC)</label>
          <select
            value={config.token}
            onChange={(e) => setConfig({ ...config, token: e.target.value as any })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="AERO">AERO (Aerodrome Finance DEX)</option>
            <option value="WETH">WETH (Base Wrapped Ether)</option>
            <option value="VIRTUAL">VIRTUAL (Virtuals AI Agents)</option>
            <option value="DEGEN">DEGEN (Degen on Base)</option>
          </select>
        </div>

        {/* Timeframe */}
        <div>
          <label className="text-xs text-zinc-400 block mb-1">EVALUATION TIMEFRAME</label>
          <select
            value={config.timeframe}
            onChange={(e) => setConfig({ ...config, timeframe: e.target.value as any })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="1h">1 Hour (High Frequency Scalping)</option>
            <option value="4h">4 Hours (Swing & Momentum)</option>
            <option value="1d">1 Day (Macro Trend)</option>
          </select>
        </div>
      </div>

      {/* Numerical Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {/* Entry Threshold */}
        <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/80">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-400">ENTRY RSI LEVEL</span>
            <span className="text-emerald-400 font-bold">{config.entryThreshold}</span>
          </div>
          <input
            type="range"
            min="15"
            max="50"
            value={config.entryThreshold}
            onChange={(e) => setConfig({ ...config, entryThreshold: Number(e.target.value) })}
            className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded"
          />
          <div className="text-[10px] text-zinc-500 mt-1">Triggers entry when oversold</div>
        </div>

        {/* Exit Threshold */}
        <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/80">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-400">EXIT RSI LEVEL</span>
            <span className="text-emerald-400 font-bold">{config.exitThreshold}</span>
          </div>
          <input
            type="range"
            min="55"
            max="85"
            value={config.exitThreshold}
            onChange={(e) => setConfig({ ...config, exitThreshold: Number(e.target.value) })}
            className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded"
          />
          <div className="text-[10px] text-zinc-500 mt-1">Triggers exit when overbought</div>
        </div>

        {/* Stop Loss */}
        <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/80">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-400">STOP LOSS (%)</span>
            <span className="text-rose-400 font-bold">-{config.stopLossPercent}%</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="15.0"
            step="0.5"
            value={config.stopLossPercent}
            onChange={(e) => setConfig({ ...config, stopLossPercent: Number(e.target.value) })}
            className="w-full accent-rose-500 h-1 bg-zinc-800 rounded"
          />
          <div className="text-[10px] text-zinc-500 mt-1">Capital preservation cut</div>
        </div>

        {/* Take Profit */}
        <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/80">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-400">TAKE PROFIT (%)</span>
            <span className="text-emerald-400 font-bold">+{config.takeProfitPercent}%</span>
          </div>
          <input
            type="range"
            min="2.0"
            max="30.0"
            step="0.5"
            value={config.takeProfitPercent}
            onChange={(e) => setConfig({ ...config, takeProfitPercent: Number(e.target.value) })}
            className="w-full accent-emerald-500 h-1 bg-zinc-800 rounded"
          />
          <div className="text-[10px] text-zinc-500 mt-1">Target profit exit</div>
        </div>
      </div>

      {/* Advanced Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
        <div>
          <label className="text-xs text-zinc-400 block mb-1">POSITION SIZING (% of capital)</label>
          <input
            type="number"
            min="5"
            max="100"
            value={config.positionSizePercent}
            onChange={(e) => setConfig({ ...config, positionSizePercent: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">MAX POOL SLIPPAGE (%)</label>
          <input
            type="number"
            min="0.1"
            max="3.0"
            step="0.1"
            value={config.maxSlippagePercent}
            onChange={(e) => setConfig({ ...config, maxSlippagePercent: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">LEVERAGE MULTIPLIER</label>
          <select
            value={config.leverage}
            onChange={(e) => setConfig({ ...config, leverage: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            <option value="1">1x (Spot AMM Swap)</option>
            <option value="2">2x Leverage</option>
            <option value="3">3x Leverage</option>
            <option value="5">5x High Risk</option>
          </select>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Simulates on Base Aerodrome/Uniswap V3 depth with EIP-4844 gas accounting</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/50"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'REPLAYING BASE MARKET FEEDS...' : 'EXECUTE VERIFIABLE AUDIT'}
        </button>
      </div>
    </form>
  );
}
