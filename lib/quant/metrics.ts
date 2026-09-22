import { Trade, EquityPoint, QuantMetrics } from './types';

/**
 * Calculates hedge-fund grade quantitative performance metrics
 */
export function calculateQuantMetrics(
  initialCapital: number,
  finalEquity: number,
  equityCurve: EquityPoint[],
  trades: Trade[],
  timeframe: '1h' | '4h' | '1d'
): QuantMetrics {
  const totalReturnPercent = ((finalEquity - initialCapital) / initialCapital) * 100;

  // Periods per year
  const periodsPerYear = timeframe === '1h' ? 24 * 365 : timeframe === '4h' ? 6 * 365 : 365;

  // Periodic returns for Sharpe & Sortino calculation
  const returns: number[] = [];
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1].equity;
    const curr = equityCurve[i].equity;
    if (prev > 0) {
      returns.push((curr - prev) / prev);
    }
  }

  // Mean return and standard deviation
  const n = returns.length || 1;
  const meanReturn = returns.reduce((a, b) => a + b, 0) / n;
  
  // Variance & Standard Deviation
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  // Downside Deviation (Sortino)
  const downsideReturns = returns.filter(r => r < 0);
  const downsideVariance =
    downsideReturns.length > 0
      ? downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / n
      : 0.000001;
  const downsideStdDev = Math.sqrt(downsideVariance);

  // Annualized Metrics (Assuming risk-free rate = 4.5% = 0.045 annual)
  const annualizedReturn = Math.pow(1 + totalReturnPercent / 100, periodsPerYear / Math.max(n, 1)) - 1;
  const annualizedReturnPercent = isFinite(annualizedReturn) ? annualizedReturn * 100 : totalReturnPercent;
  
  const annualStdDev = stdDev * Math.sqrt(periodsPerYear);
  const annualDownsideStdDev = downsideStdDev * Math.sqrt(periodsPerYear);

  const riskFreeAnnual = 0.045;
  const excessReturn = (annualizedReturnPercent / 100) - riskFreeAnnual;

  const sharpeRatio = annualStdDev > 0 ? Number((excessReturn / annualStdDev).toFixed(2)) : 0;
  const sortinoRatio = annualDownsideStdDev > 0 ? Number((excessReturn / annualDownsideStdDev).toFixed(2)) : 0;

  // Maximum Drawdown
  let maxDrawdownPercent = 0;
  for (const pt of equityCurve) {
    if (pt.drawdownPercent > maxDrawdownPercent) {
      maxDrawdownPercent = pt.drawdownPercent;
    }
  }

  // Calmar Ratio
  const calmarRatio =
    maxDrawdownPercent > 0
      ? Number((annualizedReturnPercent / maxDrawdownPercent).toFixed(2))
      : Number((annualizedReturnPercent / 1).toFixed(2));

  // Trade analytics
  const winningTrades = trades.filter(t => t.netPnl > 0);
  const losingTrades = trades.filter(t => t.netPnl <= 0);
  const totalTrades = trades.length;
  const winRatePercent = totalTrades > 0 ? Number(((winningTrades.length / totalTrades) * 100).toFixed(1)) : 0;

  const grossProfit = winningTrades.reduce((sum, t) => sum + t.netPnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.netPnl, 0));
  const profitFactor =
    grossLoss > 0
      ? Number((grossProfit / grossLoss).toFixed(2))
      : grossProfit > 0
      ? 99.99
      : 0;

  // Gas and slippage
  const totalGasSpentUsd = Number(trades.reduce((sum, t) => sum + t.gasCostUsd, 0).toFixed(2));
  const totalSlippagePaidUsd = Number(trades.reduce((sum, t) => sum + t.slippageCostUsd, 0).toFixed(2));

  // Benchmark Return (Buy and hold)
  const initialBenchmark = equityCurve[0]?.benchmarkEquity || initialCapital;
  const finalBenchmark = equityCurve[equityCurve.length - 1]?.benchmarkEquity || initialCapital;
  const benchmarkReturnPercent = Number((((finalBenchmark - initialBenchmark) / initialBenchmark) * 100).toFixed(2));
  const alphaPercent = Number((totalReturnPercent - benchmarkReturnPercent).toFixed(2));

  // Average holding period
  const totalHoldingSeconds = trades.reduce((sum, t) => sum + (t.exitTimestamp - t.entryTimestamp), 0);
  const avgHoldingPeriodHours =
    totalTrades > 0 ? Number((totalHoldingSeconds / totalTrades / 3600).toFixed(1)) : 0;

  return {
    totalReturnPercent: Number(totalReturnPercent.toFixed(2)),
    annualizedReturnPercent: Number(annualizedReturnPercent.toFixed(2)),
    benchmarkReturnPercent,
    alphaPercent,
    sharpeRatio: isNaN(sharpeRatio) ? 0 : sharpeRatio,
    sortinoRatio: isNaN(sortinoRatio) ? 0 : sortinoRatio,
    maxDrawdownPercent: Number(maxDrawdownPercent.toFixed(2)),
    calmarRatio: isNaN(calmarRatio) ? 0 : calmarRatio,
    winRatePercent,
    profitFactor: isNaN(profitFactor) ? 0 : profitFactor,
    totalTrades,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    totalGasSpentUsd,
    totalSlippagePaidUsd,
    avgHoldingPeriodHours,
  };
}
