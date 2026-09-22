import { NextRequest, NextResponse } from 'next/server';
import { VERIQUANT_MCP_TOOLS } from '@/lib/mcp/spec';
import { runBacktestSimulation } from '@/lib/quant/engine';
import { verifyReceiptIntegrity } from '@/lib/crypto/attestation';

export async function GET() {
  return NextResponse.json({
    protocol: 'mcp',
    version: '2024-11-05',
    serverInfo: {
      name: 'veriquant-base-oracle',
      version: '1.0.0',
    },
    tools: VERIQUANT_MCP_TOOLS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, arguments: args } = body;

    if (tool === 'veriquant_audit_strategy') {
      const result = await runBacktestSimulation({
        name: args.name || 'AI Quant Agent',
        token: args.token || 'AERO',
        archetype: args.archetype || 'momentum_rsi',
        timeframe: args.timeframe || '4h',
        initialCapitalUsd: 10000,
        entryThreshold: Number(args.entryThreshold ?? 30),
        exitThreshold: Number(args.exitThreshold ?? 70),
        stopLossPercent: Number(args.stopLossPercent ?? 4.0),
        takeProfitPercent: Number(args.takeProfitPercent ?? 8.0),
        positionSizePercent: 25,
        maxSlippagePercent: 0.3,
        leverage: Number(args.leverage ?? 1),
      });

      return NextResponse.json({
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                receiptId: result.receipt.receiptId,
                attestationDigest: result.receipt.attestationDigest,
                score: result.integrity.score,
                grade: result.integrity.grade,
                verdict: result.integrity.verdict,
                metrics: result.metrics,
                auditNotes: result.integrity.auditNotes,
                flags: result.integrity.flags,
              },
              null,
              2
            ),
          },
        ],
      });
    }

    if (tool === 'veriquant_verify_receipt') {
      const isValid = await verifyReceiptIntegrity(args.receipt);
      return NextResponse.json({
        content: [
          {
            type: 'text',
            text: JSON.stringify({ verified: isValid, receiptId: args.receiptId }),
          },
        ],
      });
    }

    return NextResponse.json(
      { error: `Unsupported tool: ${tool}` },
      { status: 400 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'MCP execution error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
