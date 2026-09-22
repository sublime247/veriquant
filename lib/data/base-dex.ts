import { Candle } from '../quant/types';

// Benchmark tokens on Base
export const BASE_TOKENS = {
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0x4200000000000000000000000000000000000006',
    poolAddress: '0xd0b53d9277642d899df5c87a39668397368b3067', // Aerodrome WETH/USDC
    defaultPrice: 3150,
    volatilityAnnual: 0.65,
  },
  AERO: {
    symbol: 'AERO',
    name: 'Aerodrome Finance',
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    poolAddress: '0x2223b9d0075553e198642f4fd7c222ffc323f46f',
    defaultPrice: 1.15,
    volatilityAnnual: 1.25,
  },
  VIRTUAL: {
    symbol: 'VIRTUAL',
    name: 'Virtuals Protocol (AI Agents)',
    address: '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
    poolAddress: '0x8f78ee90d9841f3d4586411f1816f1f44053ef11',
    defaultPrice: 1.85,
    volatilityAnnual: 1.65,
  },
  DEGEN: {
    symbol: 'DEGEN',
    name: 'Degen (Base)',
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    poolAddress: '0xc9034c3e7fde0fb35902048d26dec099e101f6e6',
    defaultPrice: 0.0084,
    volatilityAnnual: 1.95,
  },
} as const;

export type SupportedToken = keyof typeof BASE_TOKENS;

/**
 * Generates deterministic pseudo-random series using Mulberry32
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic OHLCV generator mimicking Base DEX regimes:
 * - Real macro trends (bull impulse, chop, crash, recovery)
 * - Micro-liquidity volatility
 * - Volume spikes on big candles
 */
export function generateDeterministicBaseCandles(
  tokenSymbol: SupportedToken,
  timeframe: '1h' | '4h' | '1d',
  candleCount: number = 300
): Candle[] {
  const meta = BASE_TOKENS[tokenSymbol] || BASE_TOKENS.WETH;
  const seed = tokenSymbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 1337);
  const prng = mulberry32(seed);

  const secondsPerBar = timeframe === '1h' ? 3600 : timeframe === '4h' ? 14400 : 86400;
  // End timestamp anchored around recent Base block time
  const now = 1727000000; // Sept 2026 anchor
  const startTime = now - candleCount * secondsPerBar;

  const candles: Candle[] = [];
  let currentPrice: number = meta.defaultPrice;
  const barVol = (meta.volatilityAnnual / Math.sqrt(365 * (86400 / secondsPerBar)));

  for (let i = 0; i < candleCount; i++) {
    const timestamp = startTime + i * secondsPerBar;

    // Macro market cycle trend injection
    const cyclePhase = (i / candleCount) * 4 * Math.PI;
    const trendFactor = Math.sin(cyclePhase) * 0.004 + (prng() - 0.485) * barVol;

    // Price change
    const delta = currentPrice * trendFactor;
    const open = currentPrice;
    const close = Math.max(open * 0.1, open + delta);

    // Candle high/low with realistic wicks
    const wickHigh = Math.abs(prng()) * barVol * 0.8 * open;
    const wickLow = Math.abs(prng()) * barVol * 0.8 * open;
    const high = Math.max(open, close) + wickHigh;
    const low = Math.max(0.0001, Math.min(open, close) - wickLow);

    // Volume scales with volatility
    const baseVolume = meta.defaultPrice > 100 ? 500000 : 5000000;
    const volMultiplier = 1 + Math.abs(trendFactor) / barVol * 2 + prng();
    const volume = Math.round(baseVolume * volMultiplier);

    candles.push({
      timestamp,
      open: Number(open.toFixed(6)),
      high: Number(high.toFixed(6)),
      low: Number(low.toFixed(6)),
      close: Number(close.toFixed(6)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

/**
 * Computes deterministic SHA-256 fingerprint for a dataset
 */
export async function computeDatasetHash(candles: Candle[]): Promise<string> {
  if (candles.length === 0) return '0x00';
  const sample = candles
    .filter((_, idx) => idx % 10 === 0)
    .map(c => `${c.timestamp}:${c.open}:${c.close}`)
    .join('|');
  
  // Using Web Crypto API (supported natively in Node 18+ and browsers)
  const encoder = new TextEncoder();
  const data = encoder.encode(sample);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
