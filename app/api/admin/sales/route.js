import dbConnect from '@/lib/dbConnect';
import Purchase from '@/models/Purchase';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/verifyAdmin';

export async function GET() {
  await dbConnect();

  const admin = verifyAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const sales = await Purchase.find()
    .populate('user', 'username email')
    .populate('log', 'title price')
    .sort({ createdAt: -1 });

  return NextResponse.json({ sales });
}
