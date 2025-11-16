import User from '@/models/User';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  await dbConnect();
  
  try {
    const { refreshToken } = await req.json();
    
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }
    
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }
    
    const newAccessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    user.refreshToken = newRefreshToken;
    await user.save();
    
    return NextResponse.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}