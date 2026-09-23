import { NextRequest, NextResponse } from 'next/server';
import { AUDITED_LEADERBOARD_AGENTS, LeaderboardEntry } from '@/lib/data/leaderboard-agents';
import { fetchRealBasePool } from '@/lib/data/base-dex';

// In-memory runtime cache for dynamically registered user audits
const dynamicSubmissions: LeaderboardEntry[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenFilter = searchParams.get('token')?.toUpperCase();
    const gradeFilter = searchParams.get('grade')?.toUpperCase();
    const query = searchParams.get('q')?.toLowerCase();

    // Merge static baseline with newly submitted community audits
    let list = [...dynamicSubmissions, ...AUDITED_LEADERBOARD_AGENTS];

    if (tokenFilter && tokenFilter !== 'ALL') {
      list = list.filter((a) => a.token.toUpperCase() === tokenFilter);
    }

    if (gradeFilter && gradeFilter !== 'ALL') {
      list = list.filter((a) => a.grade.toUpperCase() === gradeFilter);
    }

    if (query) {
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.archetype.toLowerCase().includes(query) ||
          a.developer.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      entries: list,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Leaderboard retrieval error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { strategy, metrics, integrity, receipt } = body;

    if (!strategy || !receipt || !integrity) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: strategy, integrity and receipt required' },
        { status: 400 }
      );
    }

    // Check if already registered
    const exists = dynamicSubmissions.some((s) => s.receiptId === receipt.receiptId);
    if (!exists) {
      const newEntry: LeaderboardEntry = {
        id: `agent_${receipt.receiptId.slice(-8)}`,
        name: strategy.name || 'Custom Base Agent',
        developer: '0x' + receipt.attestationDigest.slice(2, 6) + '...' + receipt.attestationDigest.slice(-4),
        token: strategy.token,
        tokenAddress: strategy.customTokenAddress,
        archetype: strategy.archetype.replace('_', ' ').toUpperCase(),
        integrityScore: integrity.score,
        grade: integrity.grade,
        sharpeRatio: metrics.sharpeRatio,
        sortinoRatio: metrics.sortinoRatio,
        maxDrawdown: metrics.maxDrawdownPercent,
        totalReturn: metrics.totalReturnPercent,
        winRate: metrics.winRatePercent,
        receiptId: receipt.receiptId,
        attestationDigest: receipt.attestationDigest,
        verifiedAt: new Date().toISOString(),
        status: integrity.grade === 'FAIL' ? 'FLAGGED' : 'VERIFIED',
      };

      dynamicSubmissions.unshift(newEntry);
    }

    return NextResponse.json({
      success: true,
      message: 'Agent registered to verified leaderboard.',
      totalCount: dynamicSubmissions.length + AUDITED_LEADERBOARD_AGENTS.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
