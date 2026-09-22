export interface LeaderboardEntry {
  id: string;
  name: string;
  developer: string;
  token: 'AERO' | 'WETH' | 'VIRTUAL' | 'DEGEN';
  archetype: string;
  integrityScore: number;
  grade: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'C' | 'FAIL';
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  totalReturn: number;
  winRate: number;
  receiptId: string;
  attestationDigest: string;
  verifiedAt: string;
  status: 'VERIFIED' | 'FLAGGED';
}

export const AUDITED_LEADERBOARD_AGENTS: LeaderboardEntry[] = [
  {
    id: 'agent_aero_alpha',
    name: 'AeroVol-Sentry',
    developer: '0x71C...4e9A',
    token: 'AERO',
    archetype: 'Mean Reversion & Bollinger Squeeze',
    integrityScore: 94,
    grade: 'AAA',
    sharpeRatio: 2.45,
    sortinoRatio: 3.12,
    maxDrawdown: 9.8,
    totalReturn: 48.6,
    winRate: 68.2,
    receiptId: 'vq_base_a9b1c73f9821aa04',
    attestationDigest: '0xa9b1c73f9821aa0488ef92bc31920acb1784910248109bf19d8031e84712aa55',
    verifiedAt: '2026-09-20T10:14:00Z',
    status: 'VERIFIED',
  },
  {
    id: 'agent_virtual_momentum',
    name: 'NeuralVirtual Arb',
    developer: '0x32A...88f1',
    token: 'VIRTUAL',
    archetype: 'Trend Following EMA Cross',
    integrityScore: 89,
    grade: 'AA',
    sharpeRatio: 1.95,
    sortinoRatio: 2.41,
    maxDrawdown: 14.2,
    totalReturn: 76.4,
    winRate: 61.5,
    receiptId: 'vq_base_41e98bb01948c3f2',
    attestationDigest: '0x41e98bb01948c3f282c0e8174ba7104e142859bdaecf27195804efbb20c57134',
    verifiedAt: '2026-09-21T16:30:00Z',
    status: 'VERIFIED',
  },
  {
    id: 'agent_weth_scalper',
    name: 'BaseWETH YieldHarvester',
    developer: '0x992...c023',
    token: 'WETH',
    archetype: 'RSI Multi-Timeframe Swing',
    integrityScore: 86,
    grade: 'AA',
    sharpeRatio: 1.82,
    sortinoRatio: 2.15,
    maxDrawdown: 11.5,
    totalReturn: 31.2,
    winRate: 64.0,
    receiptId: 'vq_base_f33190ab7682cc90',
    attestationDigest: '0xf33190ab7682cc906612b774020caefb77218390119854728956cefa98028711',
    verifiedAt: '2026-09-18T08:12:00Z',
    status: 'VERIFIED',
  },
  {
    id: 'agent_degen_hunter',
    name: 'DegenBreakoutBot',
    developer: '0x44B...119d',
    token: 'DEGEN',
    archetype: 'Volatility Breakout',
    integrityScore: 71,
    grade: 'A',
    sharpeRatio: 1.15,
    sortinoRatio: 1.34,
    maxDrawdown: 28.6,
    totalReturn: 92.4,
    winRate: 46.8,
    receiptId: 'vq_base_88cd2990aa186641',
    attestationDigest: '0x88cd2990aa18664192b0cff714205561a3889104058b73094857bbf083921b72',
    verifiedAt: '2026-09-19T22:05:00Z',
    status: 'VERIFIED',
  },
  {
    id: 'agent_curvefit_example',
    name: 'ApeMartingale100x (Flagged)',
    developer: '0x101...9999',
    token: 'DEGEN',
    archetype: 'Unhedged Martingale',
    integrityScore: 32,
    grade: 'FAIL',
    sharpeRatio: 0.22,
    sortinoRatio: 0.18,
    maxDrawdown: 74.2,
    totalReturn: -42.8,
    winRate: 35.0,
    receiptId: 'vq_base_e001129aa4869271',
    attestationDigest: '0xe001129aa4869271049bca714088aef001928374665471928374029182374619',
    verifiedAt: '2026-09-22T04:15:00Z',
    status: 'FLAGGED',
  },
];
