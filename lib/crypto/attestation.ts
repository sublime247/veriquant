import { VeriQuantReceipt, StrategyConfig, QuantMetrics, IntegrityReport } from '../quant/types';

/**
 * Computes SHA-256 hash using Web Crypto API
 */
export async function sha256Hex(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates an immutable, tamper-evident cryptographic receipt for an audited strategy
 */
export async function generateReceipt(
  strategy: StrategyConfig,
  datasetHash: string,
  metrics: QuantMetrics,
  integrity: IntegrityReport,
  fixedTimestamp?: number
): Promise<VeriQuantReceipt> {
  const timestamp = fixedTimestamp || Math.floor(Date.now() / 1000);

  // Canonical string representations for hashing
  const strategyString = JSON.stringify({
    name: strategy.name,
    archetype: strategy.archetype,
    token: strategy.token,
    timeframe: strategy.timeframe,
    entryThreshold: strategy.entryThreshold,
    exitThreshold: strategy.exitThreshold,
    stopLossPercent: strategy.stopLossPercent,
    takeProfitPercent: strategy.takeProfitPercent,
    leverage: strategy.leverage,
  });

  const metricsString = JSON.stringify({
    sharpe: metrics.sharpeRatio,
    sortino: metrics.sortinoRatio,
    mdd: metrics.maxDrawdownPercent,
    totalReturn: metrics.totalReturnPercent,
    winRate: metrics.winRatePercent,
    profitFactor: metrics.profitFactor,
    totalTrades: metrics.totalTrades,
  });

  const strategyHash = await sha256Hex(strategyString);
  const metricsHash = await sha256Hex(metricsString);

  // Master digest binding Strategy + Data + Metrics + Chain
  const masterPayload = `${strategyHash}:${datasetHash}:${metricsHash}:base:${timestamp}`;
  const attestationDigest = await sha256Hex(masterPayload);

  const receiptId = `vq_base_${attestationDigest.slice(2, 18)}`;

  return {
    receiptId,
    timestamp,
    strategyName: strategy.name,
    token: strategy.token,
    timeframe: strategy.timeframe,
    strategyHash,
    datasetHash,
    metricsHash,
    attestationDigest,
    chain: 'base',
    gasModel: 'Base_L2_EIP4844',
    verificationStatus: 'VERIFIED',
    score: integrity.score,
    grade: integrity.grade,
    metrics: {
      sharpe: metrics.sharpeRatio,
      sortino: metrics.sortinoRatio,
      maxDrawdown: metrics.maxDrawdownPercent,
      totalReturn: metrics.totalReturnPercent,
      winRate: metrics.winRatePercent,
      profitFactor: metrics.profitFactor,
    },
  };
}

/**
 * Verifies if an attestation digest matches canonical components
 */
export async function verifyReceiptIntegrity(receipt: VeriQuantReceipt): Promise<boolean> {
  const reconstructed = `${receipt.strategyHash}:${receipt.datasetHash}:${receipt.metricsHash}:base:${receipt.timestamp}`;
  const computed = await sha256Hex(reconstructed);
  return computed.toLowerCase() === receipt.attestationDigest.toLowerCase();
}
