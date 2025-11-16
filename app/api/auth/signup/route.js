import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import sendEmail from '@/lib/sendEmail'; 

export async function POST(request) {
  try {
    await dbConnect();
    const { username, email, password } = await request.json();

    // CHECK IF USER EXISTS
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or email already taken' },
        { status: 400 }
      );
    }

    // CREATE USER
    const user = await User.create({ username, email, password });

    // GENERATE TOKEN
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    //  Send Welcome Email
    await sendEmail({
      to: email,
      subject: 'Welcome to Social Logs ',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Hey ${username}, welcome to <span style="color:#2563eb;">Social Logs</span>!</h2>
          <p>Your account has been successfully created </p>
          <p>You can now buy, sell, and manage your social media logs with ease.</p>
          <p>We’re excited to have you on board </p>
          <br/>
          <p style="font-size:14px;color:#888;">If you didn’t sign up for this account, please ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        balance: user.balance || 0
      }
    });

  } catch (error) {
    console.error('REGISTER ERROR:', error.message);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
