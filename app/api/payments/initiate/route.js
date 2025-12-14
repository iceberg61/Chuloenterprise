import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Payment from '@/models/Payment';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    await dbConnect();

    const { amount } = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const reference = `flw_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    await Payment.create({
      userId: user._id,
      amount,
      method: 'flutterwave',
      transactionId: reference,
      status: 'pending',
    });

    const res = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: reference,
        amount,
        currency: 'NGN',
        redirect_url: 'http://https://www.chuloenterprise.online//fund/verify',
        customer: {
          email: user.email,
          name: user.name || 'Chuloenterprise User',
        },
        customizations: {
          title: 'Chuloenterprise Wallet Funding',
          description: 'Wallet funding',
        },
      }),
    });

    const data = await res.json();

    if (data.status === 'success') {
      return NextResponse.json({ url: data.data.link });
    }

    return NextResponse.json({ error: data.message || 'Payment failed' }, { status: 400 });
  } catch (error) {
    console.error('Flutterwave init error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
// console.log(
//   "Flutterwave key loaded:",
//   process.env.FLW_SECRET_KEY?.slice(0, 12)
// );
