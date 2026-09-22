import { runBacktestSimulation } from '../engine';
import { verifyReceiptIntegrity } from '../../crypto/attestation';

async function runTests() {
  console.log('--- STARTING VERIQUANT VERIFICATION SUITE ---');

  // Test 1: Determinism
  const config = {
    name: 'Determinism Test Bot',
    archetype: 'momentum_rsi' as const,
    token: 'AERO' as const,
    timeframe: '4h' as const,
    initialCapitalUsd: 10000,
    entryThreshold: 30,
    exitThreshold: 70,
    stopLossPercent: 4.0,
    takeProfitPercent: 8.0,
    positionSizePercent: 25,
    maxSlippagePercent: 0.3,
    leverage: 1,
  };

  const run1 = await runBacktestSimulation(config);
  const run2 = await runBacktestSimulation(config);

  if (run1.receipt.attestationDigest !== run2.receipt.attestationDigest) {
    throw new Error('FAIL: Attestation digests are not deterministic!');
  }
  console.log('✓ TEST 1 PASSED: Deterministic replay matches exactly.');

  // Test 2: Cryptographic Receipt Integrity
  const isValid = await verifyReceiptIntegrity(run1.receipt);
  if (!isValid) {
    throw new Error('FAIL: Valid receipt failed integrity check!');
  }
  console.log('✓ TEST 2 PASSED: Receipt cryptographic validation succeeded.');

  // Test 3: Tamper Detection
  const tamperedReceipt = {
    ...run1.receipt,
    metrics: { ...run1.receipt.metrics, sharpe: 99.9 },
    metricsHash: '0x1234567890abcdef', // forged hash
  };
  const isTamperedValid = await verifyReceiptIntegrity(tamperedReceipt);
  if (isTamperedValid) {
    throw new Error('FAIL: Tampered receipt was accepted!');
  }
  console.log('✓ TEST 3 PASSED: Tamper detection successfully rejected forged receipt.');

  // Test 4: Anti-Overfit Flagging
  const overfitConfig = {
    ...config,
    name: 'Overfit Martingale Bot',
    leverage: 5,
    stopLossPercent: 45.0, // Dangerous stop loss
  };
  const overfitRun = await runBacktestSimulation(overfitConfig);
  if (overfitRun.integrity.score >= 80) {
    throw new Error('FAIL: Dangerous high-leverage strategy was not penalized!');
  }
  console.log(`✓ TEST 4 PASSED: Anti-overfitting engine properly penalized reckless strategy (Score: ${overfitRun.integrity.score}, Grade: ${overfitRun.integrity.grade}).`);

  console.log('============================================');
  console.log('ALL VERIQUANT TEST SUITES PASSED CLEANLY! 🚀');
  console.log('============================================');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
