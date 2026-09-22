import { NextRequest, NextResponse } from 'next/server';
import { runBacktestSimulation } from '@/lib/quant/engine';
import { StrategyConfig } from '@/lib/quant/types';
import { generateX402Challenge, validateX402Payment } from '@/lib/x402/protocol';

export async function POST(req: NextRequest) {
  try {
    const paymentCheck = validateX402Payment(req.headers);

    // If client does not provide payment and didn't flag demo mode
    if (!paymentCheck.authorized) {
      const challenge = generateX402Challenge(0.25);
      return NextResponse.json(
        {
          error: 'Payment Required',
          message: 'Auditing an agent requires 0.25 USDC micro-payment on Base via x402, or demo authorization.',
          challenge,
        },
        {
          status: 402,
          headers: {
            'WWW-Authenticate': `x402 realm="VeriQuant Engine", token="USDC", chain="base", amount="0.25", recipient="${challenge.recipientAddress}"`,
            'X-Accept-Token': 'USDC',
            'X-Chain-Id': '8453',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const body = await req.json();

    // Default configuration if fields omitted
    const strategy: StrategyConfig = {
      name: body.name || 'Base Trading Agent',
      archetype: body.archetype || 'momentum_rsi',
      token: body.token || 'AERO',
      timeframe: body.timeframe || '4h',
      initialCapitalUsd: body.initialCapitalUsd || 10000,
      entryThreshold: body.entryThreshold !== undefined ? Number(body.entryThreshold) : 30,
      exitThreshold: body.exitThreshold !== undefined ? Number(body.exitThreshold) : 70,
      stopLossPercent: body.stopLossPercent !== undefined ? Number(body.stopLossPercent) : 4.0,
      takeProfitPercent: body.takeProfitPercent !== undefined ? Number(body.takeProfitPercent) : 8.0,
      positionSizePercent: body.positionSizePercent !== undefined ? Number(body.positionSizePercent) : 25,
      maxSlippagePercent: body.maxSlippagePercent !== undefined ? Number(body.maxSlippagePercent) : 0.3,
      leverage: body.leverage !== undefined ? Number(body.leverage) : 1,
      fastPeriod: body.fastPeriod ? Number(body.fastPeriod) : 14,
      slowPeriod: body.slowPeriod ? Number(body.slowPeriod) : 21,
    };

    const result = await runBacktestSimulation(strategy);

    return NextResponse.json(
      {
        success: true,
        settlementTx: paymentCheck.txHash,
        result,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown audit error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-payment-tx, x-veriquant-demo',
    },
  });
}
