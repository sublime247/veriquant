'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { AUDITED_LEADERBOARD_AGENTS, LeaderboardEntry } from '@/lib/data/leaderboard-agents';
import { Trophy, ShieldCheck, ExternalLink, Filter, AlertTriangle } from 'lucide-react';

export default function LeaderboardPage() {
  const [filterToken, setFilterToken] = useState<string>('ALL');

  const filtered = AUDITED_LEADERBOARD_AGENTS.filter((agent) => {
    if (filterToken === 'ALL') return true;
    return agent.token === filterToken;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span>VERIFIED AGENT STORE LEADERBOARD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Audited Base Trading Agents
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              AI trading agents ranked by Quant Integrity Score, verifiable risk-adjusted alpha, and tamper-evident SHA-256 receipts.
            </p>
          </div>

          {/* Token Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
            {['ALL', 'AERO', 'WETH', 'VIRTUAL', 'DEGEN'].map((tok) => (
              <button
                key={tok}
                onClick={() => setFilterToken(tok)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterToken === tok
                    ? 'bg-emerald-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tok}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400">
                  <th className="py-3 px-4">RANK</th>
                  <th className="py-3 px-4">AGENT NAME</th>
                  <th className="py-3 px-4">TOKEN</th>
                  <th className="py-3 px-4">INTEGRITY</th>
                  <th className="py-3 px-4">SHARPE</th>
                  <th className="py-3 px-4">MAX DRAWDOWN</th>
                  <th className="py-3 px-4">TOTAL RETURN</th>
                  <th className="py-3 px-4">WIN RATE</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4 text-right">PROOF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((agent, idx) => (
                  <tr key={agent.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-zinc-500 font-bold">
                      #{idx + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-100 flex items-center gap-2">
                        {agent.name}
                      </div>
                      <div className="text-[11px] text-zinc-500">{agent.archetype}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold">
                        {agent.token}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-emerald-400">
                          {agent.integrityScore}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {agent.grade}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-zinc-200">
                      {agent.sharpeRatio}
                    </td>

                    <td className="py-3.5 px-4 text-rose-400 font-semibold">
                      -{agent.maxDrawdown}%
                    </td>

                    <td className="py-3.5 px-4 text-emerald-400 font-bold">
                      +{agent.totalReturn}%
                    </td>

                    <td className="py-3.5 px-4 text-zinc-300">
                      {agent.winRate}%
                    </td>

                    <td className="py-3.5 px-4">
                      {agent.status === 'VERIFIED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> FLAGGED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/certificate/${agent.receiptId}`}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs inline-flex items-center gap-1 transition-colors"
                      >
                        Receipt <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
