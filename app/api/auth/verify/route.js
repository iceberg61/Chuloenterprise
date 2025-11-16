import dbConnect from '../../../lib/dbConnect'; 
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  console.log(' AUTH VERIFY API HIT! Cookies:', request.headers.get('cookie'));
  
  try {
    await dbConnect();
    const cookies = request.headers.get('cookie') || '';
    const token = cookies.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    console.log('Token found:', token);

    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ user: { _id: user._id, username: user.username, balance: user.balance } });
  } catch (error) {
    console.error(' AUTH VERIFY ERROR:', error.message);
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
}