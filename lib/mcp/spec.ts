/**
 * Model Context Protocol (MCP) tool schema specifications for VeriQuant
 */
export const VERIQUANT_MCP_TOOLS = [
  {
    name: 'veriquant_audit_strategy',
    description:
      'Deterministically audits an AI agent trading strategy against historical Base DEX liquidity (Aerodrome/Uniswap V3). Computes Sharpe, Sortino, Max Drawdown, slippage friction, and detects curve-fitting. Emits a tamper-evident cryptographic receipt on Base.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the trading agent or strategy',
        },
        token: {
          type: 'string',
          enum: ['WETH', 'AERO', 'VIRTUAL', 'DEGEN'],
          description: 'Base token pair to evaluate against USDC',
        },
        archetype: {
          type: 'string',
          enum: ['momentum_rsi', 'mean_reversion', 'breakout_volatility', 'trend_ema'],
          description: 'Core algorithmic strategy archetype',
        },
        timeframe: {
          type: 'string',
          enum: ['1h', '4h', '1d'],
          default: '4h',
          description: 'Candle timeframe for evaluation',
        },
        entryThreshold: {
          type: 'number',
          description: 'Entry condition value (e.g. RSI level like 30)',
        },
        exitThreshold: {
          type: 'number',
          description: 'Exit condition value (e.g. RSI level like 70)',
        },
        stopLossPercent: {
          type: 'number',
          description: 'Stop loss percentage (e.g. 3.5)',
        },
        takeProfitPercent: {
          type: 'number',
          description: 'Take profit percentage (e.g. 8.0)',
        },
        leverage: {
          type: 'number',
          default: 1,
          description: 'Leverage multiplier (1x to 5x)',
        },
      },
      required: ['name', 'token', 'archetype', 'entryThreshold', 'exitThreshold', 'stopLossPercent', 'takeProfitPercent'],
    },
  },
  {
    name: 'veriquant_verify_receipt',
    description:
      'Verifies the cryptographic authenticity of a VeriQuant attestation receipt issued for an agent on Base.',
    inputSchema: {
      type: 'object',
      properties: {
        receiptId: {
          type: 'string',
          description: 'Receipt identifier (e.g. vq_base_7a90a1f32d30cc01)',
        },
        attestationDigest: {
          type: 'string',
          description: 'The SHA-256 master attestation digest to verify',
        },
      },
      required: ['receiptId'],
    },
  },
  {
    name: 'veriquant_get_leaderboard',
    description:
      'Retrieves the verified leaderboard of audited AI trading agents on Base ranked by Quant Integrity Score.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          default: 10,
          description: 'Number of agents to return',
        },
      },
    },
  },
];
