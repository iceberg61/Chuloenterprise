import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Payment from '@/models/Payment';
import User from '@/models/User';
import sendEmail from '@/lib/sendEmail';

export async function POST(req) {
  try {
    await dbConnect();

    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers.get('verif-hash');

    if (!signature || signature !== secretHash) {
      console.warn('Invalid Flutterwave signature');
      return new Response(null, { status: 401 });
    }

    const body = await req.json();

    if (body.event === 'charge.completed' && body.data.status === 'successful') {
      const { tx_ref, amount } = body.data;

      const payment = await Payment.findOneAndUpdate(
        { transactionId: tx_ref, status: 'pending' },
        { status: 'success' },
        { new: true }
      );

      if (payment) {
        const user = await User.findById(payment.userId);

        await User.findByIdAndUpdate(payment.userId, {
          $inc: { balance: amount },
        });

        if (user?.email) {
          await sendEmail({
            to: user.email,
            subject: 'Deposit Successful',
            html: `
              <h2>Payment Successful</h2>
              <p>Your payment of ₦${amount} was successful.</p>
              <p>Reference: ${tx_ref}</p>
              <p>Thank you for using Chuloenterprise.</p>
            `,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
