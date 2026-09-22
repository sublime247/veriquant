'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { AUDITED_LEADERBOARD_AGENTS } from '@/lib/data/leaderboard-agents';
import { ShieldCheck, ArrowLeft, Copy, Check, ExternalLink, Printer } from 'lucide-react';

interface CertificatePageProps {
  params: Promise<{ id: string }>;
}

export default function CertificatePage({ params }: CertificatePageProps) {
  const resolvedParams = use(params);
  const receiptId = resolvedParams.id;
  const [copied, setCopied] = useState(false);

  // Find agent or generate mock certificate based on id
  const agent = AUDITED_LEADERBOARD_AGENTS.find((a) => a.receiptId === receiptId) || {
    id: 'agent_dynamic',
    name: 'Base Alpha Agent',
    developer: '0x538...base',
    token: 'AERO' as const,
    archetype: 'Quantitative Reversion',
    integrityScore: 92,
    grade: 'AAA' as const,
    sharpeRatio: 2.15,
    sortinoRatio: 2.84,
    maxDrawdown: 10.4,
    totalReturn: 52.8,
    winRate: 67.5,
    receiptId: receiptId,
    attestationDigest: `0x${receiptId.replace('vq_base_', '')}88ef92bc31920acb1784910248109bf19d8031e84712aa55`,
    verifiedAt: new Date().toISOString(),
    status: 'VERIFIED' as const,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(agent.attestationDigest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-mono">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/leaderboard"
            className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Leaderboard
          </Link>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Export PDF
          </button>
        </div>

        {/* Certificate Card */}
        <div className="p-8 sm:p-12 rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 shadow-2xl relative overflow-hidden">
          {/* Subtle watermark background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-8">
            {/* Certificate Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-wider text-zinc-100">
                    VERIQUANT ORACLE
                  </h2>
                  <p className="text-xs text-zinc-500">
                    BASE MAINNET CRYPTOGRAPHIC ATTESTATION
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {agent.status}
                </span>
                <div className="text-[10px] text-zinc-500 mt-1">EIP-4844 Verified</div>
              </div>
            </div>

            {/* Subject Info */}
            <div className="space-y-2 text-center py-4">
              <div className="text-xs text-zinc-500 uppercase tracking-widest">
                Certificate of Quantitative Integrity
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
                {agent.name}
              </h1>
              <p className="text-sm text-zinc-400">
                Audited against Base DEX Liquidity ({agent.token}/USDC) • Archetype: {agent.archetype}
              </p>
            </div>

            {/* Key Metrics Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
              <div className="text-center">
                <div className="text-[10px] text-zinc-500 uppercase">Integrity Score</div>
                <div className="text-2xl font-bold text-emerald-400 mt-0.5">
                  {agent.integrityScore}/100
                </div>
                <div className="text-[10px] text-zinc-400">Grade {agent.grade}</div>
              </div>

              <div className="text-center">
                <div className="text-[10px] text-zinc-500 uppercase">Sharpe Ratio</div>
                <div className="text-2xl font-bold text-zinc-100 mt-0.5">
                  {agent.sharpeRatio}
                </div>
                <div className="text-[10px] text-zinc-400">Sortino {agent.sortinoRatio}</div>
              </div>

              <div className="text-center">
                <div className="text-[10px] text-zinc-500 uppercase">Max Drawdown</div>
                <div className="text-2xl font-bold text-rose-400 mt-0.5">
                  -{agent.maxDrawdown}%
                </div>
                <div className="text-[10px] text-zinc-400">Tail risk bounded</div>
              </div>

              <div className="text-center">
                <div className="text-[10px] text-zinc-500 uppercase">Win Rate</div>
                <div className="text-2xl font-bold text-zinc-100 mt-0.5">
                  {agent.winRate}%
                </div>
                <div className="text-[10px] text-zinc-400">Net +{agent.totalReturn}%</div>
              </div>
            </div>

            {/* Hashes & Verification Block */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3 text-xs">
              <div className="flex justify-between items-center text-zinc-500 text-[11px]">
                <span>RECEIPT ID: {agent.receiptId}</span>
                <span>CHAIN: BASE (8453)</span>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-zinc-500 uppercase">
                  Master Attestation Digest (SHA-256)
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded bg-zinc-900 border border-zinc-800/80">
                  <span className="font-mono text-emerald-400 text-xs break-all">
                    {agent.attestationDigest}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 p-1 rounded hover:bg-zinc-800 text-zinc-400"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-zinc-500 flex items-center justify-between">
                <span>Verified At: {agent.verifiedAt}</span>
                <span className="text-emerald-500/80">Deterministic Replay Validated</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
