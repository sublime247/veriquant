'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { LeaderboardEntry, AUDITED_LEADERBOARD_AGENTS } from '@/lib/data/leaderboard-agents';
import { Trophy, ShieldCheck, ExternalLink, Search, RefreshCw, AlertTriangle, ArrowRight, SlidersHorizontal, Plus } from 'lucide-react';

export default function LeaderboardPage() {
  const [agents, setAgents] = useState<LeaderboardEntry[]>(AUDITED_LEADERBOARD_AGENTS);
  const [filterToken, setFilterToken] = useState<string>('ALL');
  const [filterGrade, setFilterGrade] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (data.entries) {
          // Merge with any client-cached local audits
          const localSaved = localStorage.getItem('veriquant_client_audits');
          const localEntries: LeaderboardEntry[] = localSaved ? JSON.parse(localSaved) : [];
          
          // Deduplicate by receiptId
          const map = new Map<string, LeaderboardEntry>();
          localEntries.forEach((e) => map.set(e.receiptId, e));
          data.entries.forEach((e: LeaderboardEntry) => {
            if (!map.has(e.receiptId)) map.set(e.receiptId, e);
          });

          setAgents(Array.from(map.values()));
        }
      }
    } catch (err) {
      console.warn('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filtered = agents.filter((agent) => {
    if (filterToken !== 'ALL' && agent.token.toUpperCase() !== filterToken) return false;
    if (filterGrade === 'AAA_AA') {
      if (agent.grade !== 'AAA' && agent.grade !== 'AA') return false;
    } else if (filterGrade === 'FLAGGED') {
      if (agent.status !== 'FLAGGED') return false;
    } else if (filterGrade !== 'ALL') {
      if (agent.grade !== filterGrade) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = agent.name.toLowerCase().includes(q);
      const matchArch = agent.archetype.toLowerCase().includes(q);
      const matchDev = agent.developer.toLowerCase().includes(q);
      if (!matchName && !matchArch && !matchDev) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-1">
              <Trophy className="w-4 h-4" />
              <span>DYNAMIC BASE LEADERBOARD // {agents.length} AUDITED AGENTS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Verified Base Trading Agents
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Ranked by Quant Integrity Score, verifiable Sharpe alpha on Aerodrome & Uniswap V3, and SHA-256 receipts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLeaderboard}
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              Refresh
            </button>

            <Link
              href="/audit"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/50"
            >
              <Plus className="w-3.5 h-3.5" />
              Audit Your Agent
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agent name, strategy archetype, or developer wallet..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Grade Filter */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs shrink-0">
              <span className="text-[10px] text-zinc-500 px-2 uppercase">Grade:</span>
              {[
                { label: 'All', value: 'ALL' },
                { label: 'AAA / AA', value: 'AAA_AA' },
                { label: 'A', value: 'A' },
                { label: 'BBB', value: 'BBB' },
                { label: 'Flagged', value: 'FLAGGED' },
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => setFilterGrade(g.value)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                    filterGrade === g.value
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Token Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[10px] text-zinc-500 uppercase mr-1">Base Assets:</span>
            {['ALL', 'AERO', 'VIRTUAL', 'WETH', 'DEGEN', 'HIGHER', 'BRETT', 'CLANKER'].map((tok) => (
              <button
                key={tok}
                onClick={() => setFilterToken(tok)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                  filterToken === tok
                    ? 'bg-zinc-100 text-zinc-950 font-bold'
                    : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {tok}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
          <span>SHOWING {filtered.length} OF {agents.length} VERIFIED ENTRIES</span>
          <span>EIP-4844 / Base Mainnet (8453)</span>
        </div>

        {/* Leaderboard Table Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 text-zinc-400">
                  <th className="py-3 px-4">RANK</th>
                  <th className="py-3 px-4">AGENT NAME</th>
                  <th className="py-3 px-4">ASSET</th>
                  <th className="py-3 px-4">INTEGRITY</th>
                  <th className="py-3 px-4">SHARPE</th>
                  <th className="py-3 px-4">SORTINO</th>
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
                      <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span>{agent.archetype}</span>
                        <span>•</span>
                        <span className="text-zinc-600 font-mono">{agent.developer}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-bold text-[11px]">
                        {agent.token}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-emerald-400">
                          {agent.integrityScore}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                            agent.grade === 'AAA' || agent.grade === 'AA'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : agent.grade === 'A'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : agent.grade === 'BBB'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {agent.grade}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-zinc-200">
                      {agent.sharpeRatio}
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400">
                      {agent.sortinoRatio}
                    </td>

                    <td className="py-3.5 px-4 text-rose-400 font-semibold">
                      -{agent.maxDrawdown}%
                    </td>

                    <td
                      className={`py-3.5 px-4 font-bold ${
                        agent.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {agent.totalReturn >= 0 ? '+' : ''}
                      {agent.totalReturn}%
                    </td>

                    <td className="py-3.5 px-4 text-zinc-300">
                      {agent.winRate}%
                    </td>

                    <td className="py-3.5 px-4">
                      {agent.status === 'VERIFIED' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit font-bold">
                          <ShieldCheck className="w-3 h-3" /> VERIFIED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1 w-fit font-bold">
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
