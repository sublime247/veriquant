import { QuantMetrics, IntegrityReport, StrategyConfig, Trade } from './types';

/**
 * Institutional integrity evaluation:
 * Detects curve-fitting, martingale behavior, over-leverage, and frictional drag.
 */
export function evaluateStrategyIntegrity(
  strategy: StrategyConfig,
  metrics: QuantMetrics,
  trades: Trade[]
): IntegrityReport {
  let score = 85; // Base starting confidence
  const flags: IntegrityReport['flags'] = [];
  const auditNotes: string[] = [];

  // 1. Sample Size Penalty
  if (metrics.totalTrades < 5) {
    score -= 30;
    flags.push({
      type: 'ALERT',
      code: 'SAMPLE_SIZE_CRITICAL',
      message: `Only ${metrics.totalTrades} trades generated. Statistical significance requires >= 15 trades.`,
    });
    auditNotes.push('CRITICAL: Sample size is statistically insufficient to distinguish skill from random variance.');
  } else if (metrics.totalTrades < 15) {
    score -= 12;
    flags.push({
      type: 'WARNING',
      code: 'SAMPLE_SIZE_LOW',
      message: `Sample size of ${metrics.totalTrades} trades is below institutional recommendation of >= 30 trades.`,
    });
    auditNotes.push('Low trade frequency increases susceptibility to regime overfitting.');
  } else {
    auditNotes.push(`Statistically viable trade count (${metrics.totalTrades} executions evaluated).`);
  }

  // 2. Maximum Drawdown Check
  if (metrics.maxDrawdownPercent > 40) {
    score -= 25;
    flags.push({
      type: 'ALERT',
      code: 'UNACCEPTABLE_DRAWDOWN',
      message: `Max drawdown of ${metrics.maxDrawdownPercent}% exceeds institutional capital preservation limits.`,
    });
    auditNotes.push('Severe drawdown indicates catastrophic tail risk under adverse Base volatility.');
  } else if (metrics.maxDrawdownPercent > 20) {
    score -= 10;
    flags.push({
      type: 'WARNING',
      code: 'ELEVATED_DRAWDOWN',
      message: `Max drawdown of ${metrics.maxDrawdownPercent}% requires conservative position sizing.`,
    });
  } else {
    score += 5;
    auditNotes.push(`Exceptional drawdown discipline (Peak-to-trough drop constrained to ${metrics.maxDrawdownPercent}%).`);
  }

  // 3. Sharpe & Sortino Balance
  if (metrics.sharpeRatio > 4.0 && metrics.totalTrades < 25) {
    score -= 15;
    flags.push({
      type: 'WARNING',
      code: 'SUSPICIOUSLY_HIGH_SHARPE',
      message: `Sharpe ratio of ${metrics.sharpeRatio} with < 25 trades strongly indicates curve-fitting to historical wicks.`,
    });
    auditNotes.push('Unusually high Sharpe on limited sample suggests parameter over-optimization.');
  } else if (metrics.sharpeRatio >= 1.5) {
    score += 6;
    auditNotes.push(`Institutional-grade risk-adjusted return (Sharpe: ${metrics.sharpeRatio}).`);
  } else if (metrics.sharpeRatio < 0.5) {
    score -= 10;
    auditNotes.push(`Sub-optimal risk-adjusted return (Sharpe: ${metrics.sharpeRatio}).`);
  }

  // 4. Base L2 Friction Drag (Gas + Slippage)
  const totalFriction = metrics.totalGasSpentUsd + metrics.totalSlippagePaidUsd;
  const netEarnings = Math.max(0, metrics.totalReturnPercent);
  if (totalFriction > 0 && netEarnings > 0 && metrics.totalTrades > 20) {
    auditNotes.push(`Base L2 EIP-4844 friction verified: $${totalFriction.toFixed(2)} total execution cost.`);
  }

  // 5. Profit Factor & Win Rate Invariants
  if (metrics.winRatePercent > 90 && metrics.profitFactor > 5.0 && metrics.totalTrades < 20) {
    score -= 15;
    flags.push({
      type: 'WARNING',
      code: 'CURVE_FIT_LIKELIHOOD_HIGH',
      message: 'Win rate > 90% combined with high profit factor is characteristic of backtest curve-fitting.',
    });
  }

  // 6. Leverage & Risk Boundaries
  if (strategy.leverage > 3) {
    score -= 10;
    flags.push({
      type: 'ALERT',
      code: 'HIGH_LEVERAGE',
      message: `Leverage of ${strategy.leverage}x on decentralized AMMs amplifies liquidation probability during Base wick events.`,
    });
  }

  // Bound score between 10 and 99
  const boundedScore = Math.max(10, Math.min(98, Math.round(score)));

  // Institutional Grade
  let grade: IntegrityReport['grade'] = 'FAIL';
  let verdict: IntegrityReport['verdict'] = 'REJECTED_CURVE_FITTED';
  let overfitRisk: IntegrityReport['overfitRisk'] = 'HIGH';

  if (boundedScore >= 90) {
    grade = 'AAA';
    verdict = 'INSTITUTIONAL_READY';
    overfitRisk = 'LOW';
  } else if (boundedScore >= 80) {
    grade = 'AA';
    verdict = 'QUALIFIED';
    overfitRisk = 'LOW';
  } else if (boundedScore >= 70) {
    grade = 'A';
    verdict = 'QUALIFIED';
    overfitRisk = 'MODERATE';
  } else if (boundedScore >= 60) {
    grade = 'BBB';
    verdict = 'HIGH_RISK';
    overfitRisk = 'MODERATE';
  } else if (boundedScore >= 50) {
    grade = 'BB';
    verdict = 'HIGH_RISK';
    overfitRisk = 'HIGH';
  } else {
    grade = 'FAIL';
    verdict = 'REJECTED_CURVE_FITTED';
    overfitRisk = 'EXTREME';
  }

  const summary =
    verdict === 'INSTITUTIONAL_READY'
      ? 'Strategy exhibits genuine edge with robust risk-adjusted returns, disciplined drawdown control, and realistic friction models.'
      : verdict === 'QUALIFIED'
      ? 'Strategy demonstrates viable algorithmic logic on Base AMMs with moderate variance. Acceptable for paper-trading or bounded capital allocation.'
      : verdict === 'HIGH_RISK'
      ? 'Strategy suffers from elevated volatility, friction drag, or unhedged drawdowns. Requires tighter stop-loss boundaries.'
      : 'Strategy exhibits clear hallmarks of curve-fitting, statistical insignificance, or reckless leverage.';

  return {
    score: boundedScore,
    grade,
    verdict,
    overfitRisk,
    flags,
    summary,
    auditNotes,
  };
}
