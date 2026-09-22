import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://veriquant-eta.vercel.app'),
  title: {
    default: 'VeriQuant | Tamper-Proof Quant Oracle for Base AI Agents',
    template: '%s | VeriQuant',
  },
  description:
    'Deterministic backtesting against real Base DEX liquidity, institutional risk vetting (Sharpe, Drawdown, Friction), x402 micropayments, and SHA-256 cryptographic attestation.',
  keywords: [
    'VeriQuant',
    'Base Mainnet',
    'AI Trading Agents',
    'Quant Oracle',
    'Verifiable Backtesting',
    'DeFi',
    'Aerodrome',
    'Sharpe Ratio',
    'x402 Protocol',
    'Model Context Protocol',
    'MCP',
    'EIP-4844',
  ],
  authors: [{ name: 'VeriQuant Core Team' }],
  creator: 'VeriQuant',
  publisher: 'VeriQuant',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://veriquant-eta.vercel.app',
    siteName: 'VeriQuant',
    title: 'VeriQuant | Tamper-Proof Quant Oracle for Base AI Agents',
    description:
      'Deterministic backtesting against real Base DEX liquidity, institutional risk vetting, and SHA-256 cryptographic attestation.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'VeriQuant - Tamper-Proof Quant Oracle for Base AI Agents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VeriQuant | Tamper-Proof Quant Oracle for Base AI Agents',
    description:
      'Deterministic backtesting against real Base DEX liquidity, institutional risk vetting, and SHA-256 cryptographic attestation.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
