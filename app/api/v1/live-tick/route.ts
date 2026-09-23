import { NextRequest, NextResponse } from 'next/server';
import { getBaseCandles } from '@/lib/data/base-dex';
import { calculateRSI, calculateEMA } from '@/lib/quant/indicators';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token') || 'AERO';
    const address = searchParams.get('address') || undefined;
    const archetype = searchParams.get('archetype') || 'momentum_rsi';
    const entryThreshold = Number(searchParams.get('entry') || 30);
    const exitThreshold = Number(searchParams.get('exit') || 70);

    const { candles, isLive, metadata } = await getBaseCandles(token, '1h', address);

    if (candles.length === 0) {
      return NextResponse.json({ success: false, error: 'No candle data available' }, { status: 400 });
    }

    const currentCandle = candles[candles.length - 1];
    const previousCandle = candles[candles.length - 2] || currentCandle;
    const currentPrice = currentCandle.close;

    // Calculate live indicator values
    const closes = candles.map((c) => c.close);
    const rsiSeries = calculateRSI(candles, 14);
    const currentRsi = Number((rsiSeries[rsiSeries.length - 1] || 50).toFixed(1));
    const previousRsi = Number((rsiSeries[rsiSeries.length - 2] || 50).toFixed(1));

    const fastEmaSeries = calculateEMA(closes, 9);
    const slowEmaSeries = calculateEMA(closes, 21);
    const currentFastEma = Number((fastEmaSeries[fastEmaSeries.length - 1] || currentPrice).toFixed(4));
    const currentSlowEma = Number((slowEmaSeries[slowEmaSeries.length - 1] || currentPrice).toFixed(4));

    // Determine current live signal state
    let signalState: 'MONITORING' | 'BUY_TRIGGER_MET' | 'SELL_TRIGGER_MET' = 'MONITORING';
    let signalExplanation = 'Price action within normal boundaries. Monitoring for setup.';

    if (archetype === 'momentum_rsi') {
      if (currentRsi <= entryThreshold) {
        signalState = 'BUY_TRIGGER_MET';
        signalExplanation = `Live RSI (${currentRsi}) dropped below oversold threshold (${entryThreshold}). Agent BUY triggered!`;
      } else if (currentRsi >= exitThreshold) {
        signalState = 'SELL_TRIGGER_MET';
        signalExplanation = `Live RSI (${currentRsi}) exceeded overbought threshold (${exitThreshold}). Take Profit / Exit triggered!`;
      } else {
        const distanceToBuy = (currentRsi - entryThreshold).toFixed(1);
        signalExplanation = `Current RSI: ${currentRsi}. Distance to Buy entry: +${distanceToBuy} points.`;
      }
    } else if (archetype === 'trend_ema') {
      if (currentFastEma > currentSlowEma) {
        signalState = 'BUY_TRIGGER_MET';
        signalExplanation = `Fast 9 EMA ($${currentFastEma}) is ABOVE Slow 21 EMA ($${currentSlowEma}). Bullish trend aligned!`;
      } else {
        signalState = 'MONITORING';
        signalExplanation = `Fast 9 EMA ($${currentFastEma}) below Slow 21 EMA ($${currentSlowEma}). Awaiting bullish crossover.`;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      isLiveDEX: isLive,
      poolMetadata: metadata,
      liveTelemetry: {
        symbol: metadata?.tokenSymbol || token,
        currentPrice,
        priceChange24h: metadata?.priceChange24h || 0,
        volume24h: metadata?.volume24h || 0,
        liquidityUsd: metadata?.liquidityUsd || 0,
        dexId: metadata?.dexId || 'aerodrome',
        pairAddress: metadata?.pairAddress || '',
      },
      indicatorState: {
        rsi: currentRsi,
        previousRsi,
        rsiTrend: currentRsi >= previousRsi ? 'RISING' : 'FALLING',
        fastEma: currentFastEma,
        slowEma: currentSlowEma,
        emaDistancePercent: Number((((currentFastEma - currentSlowEma) / currentSlowEma) * 100).toFixed(2)),
      },
      agentSignal: {
        state: signalState,
        explanation: signalExplanation,
        entryThreshold,
        exitThreshold,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Live tick error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
