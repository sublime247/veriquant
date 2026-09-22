'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { EquityPoint } from '@/lib/quant/types';

interface EquityChartProps {
  data: EquityPoint[];
  initialCapital: number;
}

export default function EquityChart({ data, initialCapital }: EquityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center border border-zinc-800 rounded-xl bg-zinc-950/40 text-zinc-500 font-mono text-sm">
        No equity trajectory data available.
      </div>
    );
  }

  // Format data for Recharts (subsample if needed for smooth rendering)
  const chartData = data.map((pt, idx) => {
    const d = new Date(pt.timestamp * 1000);
    return {
      index: idx,
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      equity: pt.equity,
      benchmark: pt.benchmarkEquity,
      drawdown: -Math.abs(pt.drawdownPercent),
    };
  });

  return (
    <div className="space-y-4">
      {/* Portfolio Equity vs Benchmark */}
      <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-mono font-medium text-zinc-200">
              EQUITY TRAJECTORY (USD)
            </h4>
            <p className="text-xs text-zinc-500 font-mono">
              Agent Strategy vs Buy & Hold Benchmark on Base
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Strategy
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600 inline-block"></span>
              Benchmark
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickLine={false}
              />
              <YAxis
                stroke="#71717a"
                tick={{ fontSize: 11, fill: '#71717a' }}
                tickFormatter={(val) => `$${val.toLocaleString()}`}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: '#27272a',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
              />
              <Line
                type="monotone"
                dataKey="equity"
                name="Strategy Equity"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                name="Buy & Hold"
                stroke="#71717a"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Underwater Drawdown Area */}
      <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-mono font-medium text-zinc-400">
            UNDERWATER DRAWDOWN PROFILE (%)
          </h4>
          <span className="text-xs text-rose-400/80 font-mono">
            Capital At Risk Exposure
          </span>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis
                stroke="#71717a"
                tick={{ fontSize: 10, fill: '#71717a' }}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                domain={[-50, 0]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  borderColor: '#27272a',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
                formatter={(value: any) => [`${value}%`, 'Drawdown']}
              />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.25}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
