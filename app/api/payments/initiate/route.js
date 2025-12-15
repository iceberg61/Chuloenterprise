import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Payment from '@/models/Payment';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

export async function POST(req) {
  try {
    await dbConnect();

    const { amount } = await req.json();
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount < 100) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // ✅ SAFE COOKIE PARSING
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = cookieHeader
      .split('; ')
      .find(c => c.startsWith('token='))
      ?.split('=')[1];

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
      amount: parsedAmount,
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
        amount: parsedAmount,
        currency: 'NGN',
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/fund/verify`,
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

    if (data.status !== 'success') {
      console.error('Flutterwave init failed:', data);
      return NextResponse.json(
        { error: data.message || 'Payment initialization failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: data.data.link });
  } catch (error) {
    console.error('Flutterwave init error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
