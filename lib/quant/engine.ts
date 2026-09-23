import {
  StrategyConfig,
  Candle,
  Trade,
  EquityPoint,
  BacktestResult,
} from './types';
import { calculateRSI, calculateEMA, calculateATR } from './indicators';
import { calculateQuantMetrics } from './metrics';
import { evaluateStrategyIntegrity } from './overfit';
import { getBaseCandles, generateDeterministicBaseCandles, computeDatasetHash } from '../data/base-dex';
import { generateReceipt } from '../crypto/attestation';

export async function runBacktestSimulation(
  strategy: StrategyConfig,
  customCandles?: Candle[]
): Promise<BacktestResult> {
  let candles = customCandles && customCandles.length > 0 ? customCandles : null;
  let isLiveDEXData = false;
  let poolMetadata: any = undefined;

  if (!candles) {
    const liveFetch = await getBaseCandles(
      strategy.token,
      strategy.timeframe,
      strategy.customTokenAddress
    );
    candles = liveFetch.candles;
    isLiveDEXData = liveFetch.isLive;
    poolMetadata = liveFetch.metadata;
  }

  const datasetHash = await computeDatasetHash(candles);

  // Calculate indicators
  const closes = candles.map(c => c.close);
  const rsi = calculateRSI(candles, strategy.fastPeriod || 14);
  const emaFast = calculateEMA(closes, strategy.fastPeriod || 9);
  const emaSlow = calculateEMA(closes, strategy.slowPeriod || 21);
  const atr = calculateATR(candles, 14);

  // Simulation variables
  let cashUsd = strategy.initialCapitalUsd || 10000;
  let activePosition: {
    entryPrice: number;
    sizeUsd: number;
    entryTime: number;
    units: number;
    stopPrice: number;
    targetPrice: number;
  } | null = null;

  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  let peakEquity = cashUsd;
  const initialAssetPrice = candles[0].close;
  const initialBenchmarkShares = cashUsd / initialAssetPrice;

  // Base L2 fee constants (post Dencun / EIP-4844 blobs, Base swaps are cheap ~ $0.02 - $0.04)
  const baseGasCostPerTrade = 0.035;

  // Loop through candles starting after warmup period
  const warmup = Math.max(strategy.slowPeriod || 21, 20);

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const currentPrice = c.close;
    const timestamp = c.timestamp;

    // Check if we need to close active position
    if (activePosition && i >= warmup) {
      let exitPrice = 0;
      let exitReason: Trade['exitReason'] | null = null;

      // Check Stop Loss
      if (c.low <= activePosition.stopPrice) {
        exitPrice = activePosition.stopPrice;
        exitReason = 'STOP_LOSS';
      }
      // Check Take Profit
      else if (c.high >= activePosition.targetPrice) {
        exitPrice = activePosition.targetPrice;
        exitReason = 'TAKE_PROFIT';
      }
      // Check Signal Exit
      else if (
        strategy.archetype === 'momentum_rsi' &&
        rsi[i] >= strategy.exitThreshold
      ) {
        exitPrice = currentPrice;
        exitReason = 'SIGNAL_EXIT';
      } else if (
        strategy.archetype === 'trend_ema' &&
        emaFast[i] < emaSlow[i]
      ) {
        exitPrice = currentPrice;
        exitReason = 'SIGNAL_EXIT';
      }

      // If exit triggered, close the trade
      if (exitReason) {
        // Apply Base DEX slippage model (linear approximation of AMM depth)
        const slippagePercent = Math.min(strategy.maxSlippagePercent / 100, 0.004);
        const realizedExitPrice = exitPrice * (1 - slippagePercent);
        const slippageCost = activePosition.sizeUsd * slippagePercent;

        const pnl = (realizedExitPrice - activePosition.entryPrice) * activePosition.units * strategy.leverage;
        const netPnl = pnl - baseGasCostPerTrade;

        cashUsd += activePosition.sizeUsd + netPnl;

        trades.push({
          id: `tr_${trades.length + 1}`,
          entryTimestamp: activePosition.entryTime,
          exitTimestamp: timestamp,
          direction: 'LONG',
          entryPrice: Number(activePosition.entryPrice.toFixed(4)),
          exitPrice: Number(realizedExitPrice.toFixed(4)),
          sizeUsd: Number(activePosition.sizeUsd.toFixed(2)),
          grossPnl: Number(pnl.toFixed(2)),
          netPnl: Number(netPnl.toFixed(2)),
          pnlPercent: Number(((netPnl / activePosition.sizeUsd) * 100).toFixed(2)),
          gasCostUsd: baseGasCostPerTrade,
          slippageCostUsd: Number(slippageCost.toFixed(2)),
          exitReason,
        });

        activePosition = null;
      }
    }

    // Check if we should open a new position
    if (!activePosition && i >= warmup && i < candles.length - 1) {
      let shouldEnter = false;

      if (strategy.archetype === 'momentum_rsi') {
        // Oversold bounce
        shouldEnter = rsi[i] <= strategy.entryThreshold && rsi[i] > rsi[i - 1];
      } else if (strategy.archetype === 'trend_ema') {
        // Golden cross
        shouldEnter = emaFast[i] > emaSlow[i] && emaFast[i - 1] <= emaSlow[i - 1];
      } else if (strategy.archetype === 'mean_reversion') {
        // Price below 20 EMA + RSI < 40
        shouldEnter = currentPrice < emaSlow[i] * 0.98 && rsi[i] < 42;
      } else {
        // Breakout or custom: RSI < entry threshold
        shouldEnter = rsi[i] <= strategy.entryThreshold;
      }

      if (shouldEnter && cashUsd > 100) {
        const positionSizeUsd = cashUsd * (strategy.positionSizePercent / 100);
        const slippagePercent = Math.min(strategy.maxSlippagePercent / 100, 0.003);
        const executedEntryPrice = currentPrice * (1 + slippagePercent);
        const units = positionSizeUsd / executedEntryPrice;

        const stopPrice = executedEntryPrice * (1 - strategy.stopLossPercent / 100);
        const targetPrice = executedEntryPrice * (1 + strategy.takeProfitPercent / 100);

        cashUsd -= positionSizeUsd;
        cashUsd -= baseGasCostPerTrade; // Entry gas

        activePosition = {
          entryPrice: executedEntryPrice,
          sizeUsd: positionSizeUsd,
          entryTime: timestamp,
          units,
          stopPrice,
          targetPrice,
        };
      }
    }

    // Calculate current portfolio value (cash + mark-to-market position)
    let currentPortfolioValue = cashUsd;
    if (activePosition) {
      const openPnl = (currentPrice - activePosition.entryPrice) * activePosition.units * strategy.leverage;
      currentPortfolioValue += activePosition.sizeUsd + openPnl;
    }

    if (currentPortfolioValue > peakEquity) {
      peakEquity = currentPortfolioValue;
    }
    const drawdownPercent = peakEquity > 0 ? ((peakEquity - currentPortfolioValue) / peakEquity) * 100 : 0;
    const benchmarkEquity = initialBenchmarkShares * currentPrice;

    equityCurve.push({
      timestamp,
      equity: Number(currentPortfolioValue.toFixed(2)),
      benchmarkEquity: Number(benchmarkEquity.toFixed(2)),
      drawdownPercent: Number(drawdownPercent.toFixed(2)),
    });
  }

  // Close any lingering position at end
  if (activePosition) {
    const lastPrice = candles[candles.length - 1].close;
    const pnl = (lastPrice - activePosition.entryPrice) * activePosition.units * strategy.leverage;
    cashUsd += activePosition.sizeUsd + pnl - baseGasCostPerTrade;
    trades.push({
      id: `tr_${trades.length + 1}`,
      entryTimestamp: activePosition.entryTime,
      exitTimestamp: candles[candles.length - 1].timestamp,
      direction: 'LONG',
      entryPrice: Number(activePosition.entryPrice.toFixed(4)),
      exitPrice: Number(lastPrice.toFixed(4)),
      sizeUsd: Number(activePosition.sizeUsd.toFixed(2)),
      grossPnl: Number(pnl.toFixed(2)),
      netPnl: Number(pnl.toFixed(2)),
      pnlPercent: Number(((pnl / activePosition.sizeUsd) * 100).toFixed(2)),
      gasCostUsd: baseGasCostPerTrade,
      slippageCostUsd: 0,
      exitReason: 'END_OF_DATA',
    });
  }

  const finalEquity = equityCurve[equityCurve.length - 1]?.equity || cashUsd;
  const metrics = calculateQuantMetrics(
    strategy.initialCapitalUsd,
    finalEquity,
    equityCurve,
    trades,
    strategy.timeframe
  );

  const integrity = evaluateStrategyIntegrity(strategy, metrics, trades);
  const snapshotTimestamp = candles[candles.length - 1]?.timestamp || Math.floor(Date.now() / 1000);
  const receipt = await generateReceipt(strategy, datasetHash, metrics, integrity, snapshotTimestamp);

  return {
    strategy,
    metrics,
    integrity,
    equityCurve,
    trades,
    datasetHash,
    receipt,
    isLiveDEXData,
    poolMetadata,
  };
}
