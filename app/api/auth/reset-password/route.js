import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req) {
  try {
    await dbConnect();
    const { email, otp, newPassword } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (
      !user.otpVerified ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be 8+ characters' }, { status: 400 });
    }

    // <-- IMPORTANT: don't hash here, let model pre-save do it once
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.otpVerified = false;
    await user.save();

    // send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Your password has been successfully reset',
      html: `...`, // keep your template
    });

    console.log(" Password updated for:", user.email);
    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('RESET ERROR:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
