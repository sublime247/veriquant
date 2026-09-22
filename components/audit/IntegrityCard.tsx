'use client';

import { IntegrityReport } from '@/lib/quant/types';
import { ShieldCheck, AlertTriangle, AlertOctagon, Info, CheckCircle2 } from 'lucide-react';

interface IntegrityCardProps {
  integrity: IntegrityReport;
}

export default function IntegrityCard({ integrity }: IntegrityCardProps) {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'AAA':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'AA':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'A':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'BBB':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'BB':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'INSTITUTIONAL_READY':
        return 'INSTITUTIONAL GRADE READY';
      case 'QUALIFIED':
        return 'QUALIFIED FOR ALLOCATION';
      case 'HIGH_RISK':
        return 'HIGH RISK / SPECULATIVE';
      default:
        return 'CURVE-FITTED / REJECTED';
    }
  };

  return (
    <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/70 font-mono space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              QUANT INTEGRITY SCORE
              <span className={`px-2 py-0.5 rounded text-xs border ${getGradeColor(integrity.grade)}`}>
                GRADE {integrity.grade}
              </span>
            </h3>
            <p className="text-xs text-zinc-500">
              Anti-overfitting analysis, sample size verification & Base liquidity friction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-3xl font-bold tracking-tight text-emerald-400">
              {integrity.score}
              <span className="text-sm text-zinc-500 font-normal">/100</span>
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {getVerdictLabel(integrity.verdict)}
            </div>
          </div>
        </div>
      </div>

      {/* Summary statement */}
      <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
        {integrity.summary}
      </div>

      {/* Flags & Anomaly Warnings */}
      {integrity.flags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">
            RISK DETECTIONS & ANOMALIES ({integrity.flags.length})
          </h4>
          <div className="grid gap-2">
            {integrity.flags.map((flag, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                  flag.type === 'ALERT'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    : flag.type === 'WARNING'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                }`}
              >
                {flag.type === 'ALERT' ? (
                  <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                ) : flag.type === 'WARNING' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                ) : (
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                )}
                <div>
                  <span className="font-bold tracking-wide">[{flag.code}]</span>{' '}
                  <span>{flag.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Observations */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">
          DETERMINISTIC OBSERVATIONS
        </h4>
        <div className="grid gap-1.5 text-xs text-zinc-400">
          {integrity.auditNotes.map((note, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
