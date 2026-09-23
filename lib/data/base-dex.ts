import { Candle } from '../quant/types';

// Benchmark tokens on Base
export const BASE_TOKENS = {
  AERO: {
    symbol: 'AERO',
    name: 'Aerodrome Finance',
    address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
    poolAddress: '0x6cDcb1C4A4D1C3C6d054b27AC5B77e89eAFb971d', // Aerodrome AERO/USDC
    defaultPrice: 0.72,
    volatilityAnnual: 1.25,
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0x4200000000000000000000000000000000000006',
    poolAddress: '0xb4885bc63399bf5518b994c1d0c153334ee579d0', // Aerodrome WETH/USDC
    defaultPrice: 2450,
    volatilityAnnual: 0.65,
  },
  VIRTUAL: {
    symbol: 'VIRTUAL',
    name: 'Virtuals Protocol (AI Agents)',
    address: '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b',
    poolAddress: '0x21594b992F68495dD28d605834b58889d0a727c7', // Aerodrome VIRTUAL/WETH
    defaultPrice: 0.76,
    volatilityAnnual: 1.65,
  },
  DEGEN: {
    symbol: 'DEGEN',
    name: 'Degen (Base)',
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
    poolAddress: '0xc9034c3e7fde0fb35902048d26dec099e101f6e6',
    defaultPrice: 0.0045,
    volatilityAnnual: 1.95,
  },
} as const;

export type SupportedToken = keyof typeof BASE_TOKENS;

export interface TokenPoolMetadata {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  pairAddress: string;
  dexId: string;
  priceUsd: number;
  liquidityUsd: number;
  volume24h: number;
  priceChange24h: number;
  baseTokenSymbol: string;
  quoteTokenSymbol: string;
}

/**
 * Searches/resolves any token symbol or contract address on Base using DexScreener
 */
export async function fetchRealBasePool(query: string): Promise<TokenPoolMetadata | null> {
  try {
    const isAddress = query.startsWith('0x') && query.length === 42;
    const url = isAddress
      ? `https://api.dexscreener.com/latest/dex/tokens/${query}`
      : `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VeriQuant/1.0; +https://veriquant-eta.vercel.app)' },
      next: { revalidate: 30 }, // cache for 30s
    });

    if (!res.ok) return null;
    const json = await res.json();
    const pairs = (json.pairs || []).filter((p: any) => p.chainId === 'base');
    if (pairs.length === 0) return null;

    // Pick pair with highest liquidity
    const top = pairs.reduce((best: any, curr: any) => {
      const bestLiq = Number(best?.liquidity?.usd || 0);
      const currLiq = Number(curr?.liquidity?.usd || 0);
      return currLiq > bestLiq ? curr : best;
    }, pairs[0]);

    return {
      tokenAddress: top.baseToken.address,
      tokenSymbol: top.baseToken.symbol,
      tokenName: top.baseToken.name,
      pairAddress: top.pairAddress,
      dexId: top.dexId,
      priceUsd: Number(top.priceUsd || top.priceNative || 0),
      liquidityUsd: Number(top.liquidity?.usd || 0),
      volume24h: Number(top.volume?.h24 || 0),
      priceChange24h: Number(top.priceChange?.h24 || 0),
      baseTokenSymbol: top.baseToken.symbol,
      quoteTokenSymbol: top.quoteToken.symbol,
    };
  } catch (err) {
    console.warn('Error fetching real Base pool from DexScreener:', err);
    return null;
  }
}

/**
 * Fetches real historical OHLCV candles from GeckoTerminal Base pool
 */
export async function fetchRealBaseCandles(
  pairAddress: string,
  timeframe: '1h' | '4h' | '1d',
  limit: number = 250
): Promise<Candle[] | null> {
  try {
    let endpoint = `https://api.geckoterminal.com/api/v2/networks/base/pools/${pairAddress}/ohlcv/hour?limit=${limit}`;
    if (timeframe === '4h') {
      endpoint = `https://api.geckoterminal.com/api/v2/networks/base/pools/${pairAddress}/ohlcv/hour?aggregate=4&limit=${limit}`;
    } else if (timeframe === '1d') {
      endpoint = `https://api.geckoterminal.com/api/v2/networks/base/pools/${pairAddress}/ohlcv/day?limit=${limit}`;
    }

    const res = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; VeriQuant/1.0; +https://veriquant-eta.vercel.app)',
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const rawList: number[][] = json?.data?.attributes?.ohlcv_list || [];
    if (rawList.length < 10) return null;

    // GeckoTerminal returns candles in descending order [timestamp, open, high, low, close, volume]
    // We reverse to chronological ascending order
    const candles: Candle[] = rawList
      .map(([ts, open, high, low, close, vol]) => ({
        timestamp: ts,
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
        volume: Number(vol),
      }))
      .reverse();

    return candles;
  } catch (err) {
    console.warn('Error fetching GeckoTerminal candles:', err);
    return null;
  }
}

/**
 * Generates deterministic fallback series if live network request is unavailable or rate-limited
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateDeterministicBaseCandles(
  tokenSymbol: string,
  timeframe: '1h' | '4h' | '1d',
  candleCount: number = 300
): Candle[] {
  const meta = (BASE_TOKENS as any)[tokenSymbol] || BASE_TOKENS.WETH;
  const seed = tokenSymbol.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 1337);
  const prng = mulberry32(seed);

  const secondsPerBar = timeframe === '1h' ? 3600 : timeframe === '4h' ? 14400 : 86400;
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - candleCount * secondsPerBar;

  const candles: Candle[] = [];
  let currentPrice: number = meta.defaultPrice;
  const barVol = (meta.volatilityAnnual / Math.sqrt(365 * (86400 / secondsPerBar)));

  for (let i = 0; i < candleCount; i++) {
    const timestamp = startTime + i * secondsPerBar;
    const cyclePhase = (i / candleCount) * 4 * Math.PI;
    const trendFactor = Math.sin(cyclePhase) * 0.004 + (prng() - 0.485) * barVol;

    const delta = currentPrice * trendFactor;
    const open = currentPrice;
    const close = Math.max(open * 0.1, open + delta);

    const wickHigh = Math.abs(prng()) * barVol * 0.8 * open;
    const wickLow = Math.abs(prng()) * barVol * 0.8 * open;
    const high = Math.max(open, close) + wickHigh;
    const low = Math.max(0.0001, Math.min(open, close) - wickLow);

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
 * Unified getter: fetches authentic live Base candles first, with resilient fallback
 */
export async function getBaseCandles(
  tokenSymbol: string,
  timeframe: '1h' | '4h' | '1d',
  customAddress?: string
): Promise<{ candles: Candle[]; isLive: boolean; metadata?: TokenPoolMetadata }> {
  const query = customAddress || tokenSymbol;
  const poolMeta = await fetchRealBasePool(query);

  if (poolMeta?.pairAddress) {
    const realCandles = await fetchRealBaseCandles(poolMeta.pairAddress, timeframe, 200);
    if (realCandles && realCandles.length >= 15) {
      return {
        candles: realCandles,
        isLive: true,
        metadata: poolMeta,
      };
    }
  }

  // Resilient fallback
  const fallback = generateDeterministicBaseCandles(tokenSymbol, timeframe, 250);
  return {
    candles: fallback,
    isLive: false,
    metadata: poolMeta || undefined,
  };
}

/**
 * Computes deterministic SHA-256 fingerprint for a dataset
 */
export async function computeDatasetHash(candles: Candle[]): Promise<string> {
  if (candles.length === 0) return '0x00';
  const sample = candles
    .filter((_, idx) => idx % 5 === 0)
    .map(c => `${c.timestamp}:${c.open}:${c.close}`)
    .join('|');

  const encoder = new TextEncoder();
  const data = encoder.encode(sample);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
