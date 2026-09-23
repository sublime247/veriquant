'use client';

import { ExternalLink, Radio, Droplets, BarChart3, TrendingUp, TrendingDown, Layers } from 'lucide-react';

interface LiveTelemetryBarProps {
  metadata?: {
    tokenAddress?: string;
    tokenSymbol: string;
    tokenName?: string;
    pairAddress: string;
    dexId: string;
    priceUsd: number;
    liquidityUsd: number;
    volume24h: number;
    priceChange24h: number;
  };
  isLive: boolean;
}

export default function LiveTelemetryBar({ metadata, isLive }: LiveTelemetryBarProps) {
  if (!metadata) {
    return (
      <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 font-mono text-xs text-zinc-500 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-zinc-600 animate-pulse" />
          Awaiting DEX pool connection...
        </span>
        <span>Base Mainnet (8453)</span>
      </div>
    );
  }

  const isPositive = metadata.priceChange24h >= 0;

  return (
    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 font-mono space-y-3">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2.5">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isLive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            ></span>
            {isLive ? 'LIVE BASE DEX POOL CONNECTED' : 'CALIBRATED FEED'}
          </span>

          <span className="text-zinc-200 font-bold">
            {metadata.tokenSymbol} / USD
          </span>

          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {metadata.dexId} DEX
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <a
            href={`https://basescan.org/address/${metadata.pairAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            <span className="truncate max-w-[120px] sm:max-w-none">
              Pool: {metadata.pairAddress.slice(0, 6)}...{metadata.pairAddress.slice(-4)}
            </span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>
      </div>

      {/* Real-time Ticker Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Price */}
        <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
            <span>LIVE PRICE</span>
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-rose-400" />
            )}
          </div>
          <div className="text-base font-bold text-zinc-100 mt-0.5">
            ${metadata.priceUsd < 0.01 ? metadata.priceUsd.toFixed(6) : metadata.priceUsd.toFixed(4)}
          </div>
          <div
            className={`text-[10px] font-semibold mt-0.5 ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {metadata.priceChange24h.toFixed(2)}% (24h)
          </div>
        </div>

        {/* Liquidity */}
        <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span>POOL LIQUIDITY</span>
          </div>
          <div className="text-base font-bold text-zinc-100 mt-0.5">
            ${metadata.liquidityUsd > 1000000
              ? `${(metadata.liquidityUsd / 1000000).toFixed(2)}M`
              : `${(metadata.liquidityUsd / 1000).toFixed(0)}K`}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">AMM Depth on Base</div>
        </div>

        {/* 24h Volume */}
        <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-zinc-400" />
            <span>24H VOLUME</span>
          </div>
          <div className="text-base font-bold text-zinc-100 mt-0.5">
            ${metadata.volume24h > 1000000
              ? `${(metadata.volume24h / 1000000).toFixed(2)}M`
              : `${(metadata.volume24h / 1000).toFixed(0)}K`}
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">Direct On-Chain Swaps</div>
        </div>

        {/* Execution Model */}
        <div className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-400" />
            <span>GAS & SLIPPAGE</span>
          </div>
          <div className="text-base font-bold text-emerald-400 mt-0.5">
            EIP-4844
          </div>
          <div className="text-[10px] text-zinc-500 mt-0.5">~$0.02 - $0.04 / Swap</div>
        </div>
      </div>
    </div>
  );
}
