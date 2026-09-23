import { NextRequest, NextResponse } from 'next/server';
import { fetchRealBasePool, BASE_TOKENS } from '@/lib/data/base-dex';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();

    if (!query) {
      // Return predefined benchmark tokens on Base
      const presets = Object.values(BASE_TOKENS).map((t) => ({
        symbol: t.symbol,
        name: t.name,
        address: t.address,
        defaultPrice: t.defaultPrice,
      }));
      return NextResponse.json({ success: true, tokens: presets });
    }

    const pool = await fetchRealBasePool(query);
    if (!pool) {
      return NextResponse.json(
        { success: false, error: `No active liquidity pools found on Base for '${query}'.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pool,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Token lookup failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
