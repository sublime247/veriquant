export interface Candle {
  timestamp: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type StrategyArchetype =
  | 'momentum_rsi'
  | 'mean_reversion'
  | 'breakout_volatility'
  | 'trend_ema'
  | 'custom';

export interface StrategyConfig {
  name: string;
  description?: string;
  archetype: StrategyArchetype;
  token: string;
  customTokenAddress?: string;
  timeframe: '1h' | '4h' | '1d';
  initialCapitalUsd: number;
  // Technical parameters
  fastPeriod?: number; // e.g., 9 or 14
  slowPeriod?: number; // e.g., 21 or 50
  entryThreshold: number; // e.g. RSI 30 or Bollinger lower band
  exitThreshold: number; // e.g. RSI 70
  stopLossPercent: number; // e.g. 3.5%
  takeProfitPercent: number; // e.g. 7.0%
  positionSizePercent: number; // e.g. 25% of portfolio per trade
  maxSlippagePercent: number; // e.g. 0.3%
  leverage: number; // 1 to 5
}

export interface Trade {
  id: string;
  entryTimestamp: number;
  exitTimestamp: number;
  direction: 'LONG';
  entryPrice: number;
  exitPrice: number;
  sizeUsd: number;
  grossPnl: number;
  netPnl: number;
  pnlPercent: number;
  gasCostUsd: number;
  slippageCostUsd: number;
  exitReason: 'TAKE_PROFIT' | 'STOP_LOSS' | 'SIGNAL_EXIT' | 'LIQUIDATION' | 'END_OF_DATA';
}

export interface EquityPoint {
  timestamp: number;
  equity: number;
  benchmarkEquity: number;
  drawdownPercent: number;
}

export interface QuantMetrics {
  totalReturnPercent: number;
  annualizedReturnPercent: number;
  benchmarkReturnPercent: number;
  alphaPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPercent: number;
  calmarRatio: number;
  winRatePercent: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalGasSpentUsd: number;
  totalSlippagePaidUsd: number;
  avgHoldingPeriodHours: number;
}

export interface IntegrityReport {
  score: number; // 0 to 100
  grade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'C' | 'FAIL';
  verdict: 'INSTITUTIONAL_READY' | 'QUALIFIED' | 'HIGH_RISK' | 'REJECTED_CURVE_FITTED';
  overfitRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  flags: {
    type: 'WARNING' | 'ALERT' | 'INFO';
    code: string;
    message: string;
  }[];
  summary: string;
  auditNotes: string[];
}

export interface VeriQuantReceipt {
  receiptId: string;
  timestamp: number;
  strategyName: string;
  token: string;
  timeframe: string;
  strategyHash: string;
  datasetHash: string;
  metricsHash: string;
  attestationDigest: string;
  chain: 'base';
  gasModel: 'Base_L2_EIP4844';
  verificationStatus: 'VERIFIED' | 'VALIDATED_X402';
  score: number;
  grade: string;
  metrics: {
    sharpe: number;
    sortino: number;
    maxDrawdown: number;
    totalReturn: number;
    winRate: number;
    profitFactor: number;
  };
}

export interface BacktestResult {
  strategy: StrategyConfig;
  metrics: QuantMetrics;
  integrity: IntegrityReport;
  equityCurve: EquityPoint[];
  trades: Trade[];
  datasetHash: string;
  receipt: VeriQuantReceipt;
  isLiveDEXData?: boolean;
  poolMetadata?: {
    tokenAddress: string;
    tokenSymbol: string;
    tokenName: string;
    pairAddress: string;
    dexId: string;
    priceUsd: number;
    liquidityUsd: number;
    volume24h: number;
    priceChange24h: number;
  };
}
