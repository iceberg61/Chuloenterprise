import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req) {
  try {
    await dbConnect();
    const { email } = await req.json();

    //  Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    //  Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    //  Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    //  Send OTP via Resend
    await sendEmail({
      to: email,
      subject: 'Your Social Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reset Your Password</h2>
          <p>Hello ${user.username || ''},</p>
          <p>Use the OTP below to reset your password. It expires in 10 minutes.</p>
          <h1 style="color: #2563eb; letter-spacing: 4px;">${otp}</h1>
          <p>If you didn’t request this, please ignore this message.</p>
          <p>— The Social-logs Team</p>
        </div>
      `,
    });

    console.log(` OTP sent to ${email}: ${otp}`);
    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
