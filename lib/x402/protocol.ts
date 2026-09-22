export interface X402Challenge {
  protocol: 'x402';
  version: '1.0';
  chain: 'base';
  chainId: 8453;
  token: 'USDC';
  tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Native USDC on Base
  amountUsdc: number;
  recipientAddress: string;
  challengeId: string;
  expiresAt: number;
}

export const VERIQUANT_TREASURY_BASE = '0x5381f70a0c4d4720b7d25548c5947735a241base';

/**
 * Creates an RFC-compliant HTTP 402 challenge header payload for machine-to-machine agents
 */
export function generateX402Challenge(costUsdc: number = 0.25): X402Challenge {
  const challengeId = `ch_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return {
    protocol: 'x402',
    version: '1.0',
    chain: 'base',
    chainId: 8453,
    token: 'USDC',
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    amountUsdc: costUsdc,
    recipientAddress: VERIQUANT_TREASURY_BASE,
    challengeId,
    expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour validity
  };
}

/**
 * Validates whether an incoming agent request includes payment proof or demo bypass
 */
export function validateX402Payment(
  headers: Headers | Record<string, string | string[] | undefined>
): { authorized: boolean; reason?: string; txHash?: string } {
  const getHeader = (name: string): string | undefined => {
    if ('get' in headers && typeof headers.get === 'function') {
      return headers.get(name) || undefined;
    }
    const val = (headers as Record<string, string | string[] | undefined>)[name.toLowerCase()];
    return Array.isArray(val) ? val[0] : val;
  };

  const paymentProof = getHeader('x-payment-tx') || getHeader('authorization');
  const demoBypass = getHeader('x-veriquant-demo');

  // Allow web UI demo queries
  if (demoBypass === 'true' || demoBypass === 'demo_token') {
    return { authorized: true, txHash: 'demo_simulation_settlement' };
  }

  // Check for Base transaction hash or EIP-3009 transfer authorization
  if (paymentProof && (paymentProof.startsWith('0x') || paymentProof.startsWith('Bearer 0x'))) {
    const txHash = paymentProof.replace('Bearer ', '');
    return { authorized: true, txHash };
  }

  return {
    authorized: false,
    reason: 'Payment required: 0.25 USDC on Base via x402 protocol or demo header.',
  };
}
