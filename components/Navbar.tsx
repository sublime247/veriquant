'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Cpu, Terminal, Trophy, ExternalLink } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400/60 transition-colors">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold tracking-wider text-zinc-100 flex items-center gap-1.5 text-base">
                VERIQUANT
                <span className="text-[10px] uppercase font-normal px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  BASE
                </span>
              </span>
              <span className="text-[10px] text-zinc-500 tracking-tight font-mono">
                QUANT ORACLE & ATTESTATION
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-mono">
            <Link
              href="/audit"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/audit'
                  ? 'bg-zinc-800 text-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Audit Engine
            </Link>
            <Link
              href="/leaderboard"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === '/leaderboard'
                  ? 'bg-zinc-800 text-emerald-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              Leaderboard
            </Link>
            <Link
              href="/api/mcp"
              target="_blank"
              className="px-3 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors flex items-center gap-1"
            >
              MCP Spec <ExternalLink className="w-3 h-3 text-zinc-500" />
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Base Mainnet (8453)
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            <span className="text-zinc-500">x402:</span>
            <span className="text-emerald-400">0.25 USDC</span>
          </div>

          <Link
            href="/audit"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-mono font-medium text-xs transition-colors shadow-lg shadow-emerald-950/40"
          >
            Launch Audit
          </Link>
        </div>
      </div>
    </header>
  );
}
