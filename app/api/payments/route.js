import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import Payment from '@/models/Payment';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies(); 
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded userId:', decoded.id);

    const payments = await Payment.find({ userId: decoded.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('ERROR fetching payments:', error.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}