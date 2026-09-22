import { NextRequest, NextResponse } from 'next/server';
import { verifyReceiptIntegrity } from '@/lib/crypto/attestation';
import { VeriQuantReceipt } from '@/lib/quant/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const receipt: VeriQuantReceipt = body.receipt;

    if (!receipt || !receipt.attestationDigest) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload. Missing receipt or attestationDigest.' },
        { status: 400 }
      );
    }

    const isValid = await verifyReceiptIntegrity(receipt);

    return NextResponse.json({
      success: true,
      valid: isValid,
      receiptId: receipt.receiptId,
      chain: receipt.chain,
      attestationDigest: receipt.attestationDigest,
      score: receipt.score,
      grade: receipt.grade,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
