'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VeriQuantReceipt } from '@/lib/quant/types';
import { ShieldCheck, Copy, Check, ExternalLink, RefreshCw, KeyRound } from 'lucide-react';

interface ProofBadgeProps {
  receipt: VeriQuantReceipt;
}

export default function ProofBadge({ receipt }: ProofBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);

  const copyReceipt = () => {
    navigator.clipboard.writeText(JSON.stringify(receipt, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt }),
      });
      const data = await res.json();
      setVerificationResult(data.valid);
    } catch {
      setVerificationResult(false);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/80 font-mono space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <KeyRound className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-semibold text-zinc-200">
            TAMPER-EVIDENT CRYPTOGRAPHIC RECEIPT
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${verifying ? 'animate-spin' : ''}`} />
            {verifying ? 'Verifying...' : 'Verify Cryptographic Proof'}
          </button>

          <button
            onClick={copyReceipt}
            className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy JSON'}
          </button>

          <Link
            href={`/certificate/${receipt.receiptId}`}
            className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs text-emerald-400 flex items-center gap-1.5 transition-colors"
          >
            Certificate <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {verificationResult !== null && (
        <div
          className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
            verificationResult
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>
            {verificationResult
              ? 'Digest match confirmed! The SHA-256 master attestation perfectly matches all strategy and dataset components.'
              : 'Digest mismatch! The receipt payload appears tampered.'}
          </span>
        </div>
      )}

      {/* Cryptographic Hashes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase">Receipt Identifier</div>
          <div className="text-zinc-200 font-semibold truncate mt-0.5">{receipt.receiptId}</div>
        </div>

        <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase">Chain & Settlement Protocol</div>
          <div className="text-zinc-200 font-semibold truncate mt-0.5">
            Base Mainnet (8453) • {receipt.gasModel}
          </div>
        </div>

        <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase">Strategy Canonical Hash</div>
          <div className="text-zinc-400 truncate mt-0.5 font-mono">{receipt.strategyHash}</div>
        </div>

        <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/60">
          <div className="text-[10px] text-zinc-500 uppercase">Base DEX Dataset Hash</div>
          <div className="text-zinc-400 truncate mt-0.5 font-mono">{receipt.datasetHash}</div>
        </div>

        <div className="md:col-span-2 p-3 rounded bg-zinc-900/90 border border-blue-500/20">
          <div className="text-[10px] text-blue-400 uppercase font-bold">
            Master Attestation Digest (SHA-256)
          </div>
          <div className="text-blue-200 font-mono text-xs break-all mt-1">
            {receipt.attestationDigest}
          </div>
        </div>
      </div>
    </div>
  );
}
