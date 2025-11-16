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

    const reference = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await Payment.create({
      userId: user._id,
      amount,
      method: 'paystack',
      transactionId: reference,
      status: 'pending',
    });

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount * 100,
        reference,
        callback_url: `${req.headers.get('origin')}/fund`,
      }),
    });

    const data = await res.json();

    if (data.status) {
      return NextResponse.json({ url: data.data.authorization_url });
    } else {
      return NextResponse.json({ error: data.message || 'Payment failed' });
    }
  } catch (error) {
    console.error('Paystack init error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}