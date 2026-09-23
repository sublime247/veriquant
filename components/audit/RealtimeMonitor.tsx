'use client';

import { useState, useEffect } from 'react';
import { Radio, Play, Pause, Activity, Zap, Shield, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

interface RealtimeMonitorProps {
  token: string;
  customAddress?: string;
  archetype: string;
  entryThreshold: number;
  exitThreshold: number;
}

interface TickEvent {
  id: string;
  timestamp: string;
  price: number;
  rsi: number;
  signalState: string;
  message: string;
}

export default function RealtimeMonitor({
  token,
  customAddress,
  archetype,
  entryThreshold,
  exitThreshold,
}: RealtimeMonitorProps) {
  const [isRunning, setIsRunning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);
  const [events, setEvents] = useState<TickEvent[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const fetchTick = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          token,
          archetype,
          entry: entryThreshold.toString(),
          exit: exitThreshold.toString(),
        });
        if (customAddress) params.append('address', customAddress);

        const res = await fetch(`/api/v1/live-tick?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setLiveData(data);

          // Add to events ledger
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

          const newEvt: TickEvent = {
            id: `evt_${Date.now()}`,
            timestamp: timeStr,
            price: data.liveTelemetry.currentPrice,
            rsi: data.indicatorState.rsi,
            signalState: data.agentSignal.state,
            message: data.agentSignal.explanation,
          };

          setEvents((prev) => [newEvt, ...prev.slice(0, 19)]);
        }
      } catch (err) {
        console.warn('Realtime tick poll failed:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchTick();

    if (isRunning) {
      interval = setInterval(fetchTick, 4000); // Poll every 4s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, token, customAddress, archetype, entryThreshold, exitThreshold]);

  const currentPrice = liveData?.liveTelemetry?.currentPrice || 0;
  const currentRsi = liveData?.indicatorState?.rsi || 50;
  const signalState = liveData?.agentSignal?.state || 'MONITORING';
  const fastEma = liveData?.indicatorState?.fastEma || 0;
  const slowEma = liveData?.indicatorState?.slowEma || 0;

  return (
    <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/70 font-mono space-y-6">
      {/* Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            LIVE AGENT EXECUTION MONITOR
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Streaming live Base DEX block ticks, computing real-time indicators & evaluating triggers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isRunning
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Pause Stream' : 'Resume Live Stream'}
          </button>

          <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 flex items-center gap-1.5">
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>4s Poll</span>
          </div>
        </div>
      </div>

      {/* Main Telemetry & Indicator HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Live Price & State */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
          <div className="text-xs text-zinc-500 uppercase flex items-center justify-between">
            <span>CURRENT TICK PRICE</span>
            <span className="text-[10px] text-zinc-400">Base Mainnet</span>
          </div>
          <div className="text-2xl font-bold text-zinc-100 mt-2">
            ${currentPrice < 0.01 ? currentPrice.toFixed(6) : currentPrice.toFixed(4)}
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Live Agent State:</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                signalState === 'BUY_TRIGGER_MET'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : signalState === 'SELL_TRIGGER_MET'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
              }`}
            >
              {signalState}
            </span>
          </div>
        </div>

        {/* RSI Live Indicator Gauge */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 uppercase">LIVE 14-RSI GAUGE</span>
            <span
              className={`font-bold ${
                currentRsi <= entryThreshold
                  ? 'text-emerald-400'
                  : currentRsi >= exitThreshold
                  ? 'text-rose-400'
                  : 'text-zinc-200'
              }`}
            >
              {currentRsi}
            </span>
          </div>

          {/* Gauge Bar */}
          <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden relative border border-zinc-800">
            {/* Oversold threshold marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-emerald-500/80 z-10"
              style={{ left: `${entryThreshold}%` }}
              title={`Entry: ${entryThreshold}`}
            />
            {/* Overbought threshold marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-10"
              style={{ left: `${exitThreshold}%` }}
              title={`Exit: ${exitThreshold}`}
            />
            {/* Current RSI fill indicator */}
            <div
              className={`h-full transition-all duration-300 ${
                currentRsi <= entryThreshold
                  ? 'bg-emerald-500'
                  : currentRsi >= exitThreshold
                  ? 'bg-rose-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, currentRsi))}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-zinc-500 pt-1">
            <span>Oversold (&le;{entryThreshold})</span>
            <span>Neutral (50)</span>
            <span>Overbought (&ge;{exitThreshold})</span>
          </div>
        </div>

        {/* Trend & EMA Spread */}
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between">
          <div className="text-xs text-zinc-500 uppercase">TREND MOMENTUM & EMA SPREAD</div>
          <div className="space-y-1 mt-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">Fast EMA (9):</span>
              <span className="text-zinc-200 font-semibold">${fastEma}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Slow EMA (21):</span>
              <span className="text-zinc-200 font-semibold">${slowEma}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Spread:</span>
            <span
              className={`font-bold ${
                fastEma >= slowEma ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {fastEma >= slowEma ? '+' : ''}
              {(((fastEma - slowEma) / (slowEma || 1)) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Live Agent Signal Log */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 font-bold text-zinc-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            REAL-TIME EVENT LEDGER (STREAMING)
          </span>
          <span className="text-[11px] text-zinc-500">Auto-updating on each block</span>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/90 max-h-56 overflow-y-auto divide-y divide-zinc-800/60 text-xs">
          {events.length === 0 ? (
            <div className="p-4 text-center text-zinc-500">
              Connecting to Base DEX tick pipeline...
            </div>
          ) : (
            events.map((evt) => (
              <div
                key={evt.id}
                className="p-3 flex items-start justify-between gap-3 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-zinc-500 shrink-0 mt-0.5 font-mono">
                    [{evt.timestamp}]
                  </span>

                  <div>
                    <div className="text-zinc-200 font-medium">{evt.message}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      Base Block Price: ${evt.price} • RSI: {evt.rsi}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] shrink-0 font-bold ${
                    evt.signalState === 'BUY_TRIGGER_MET'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : evt.signalState === 'SELL_TRIGGER_MET'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {evt.signalState}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
