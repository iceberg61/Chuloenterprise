import dbConnect from '../../../../lib/dbConnect'; // Adjust path
import User from '../../../../models/User';

export async function GET(request, { params }) {
  console.log(' USER FETCH API HIT! UserID:', params.userId);
  
  try {
    await dbConnect();
    const user = await User.findById(params.userId);
    console.log('Fetched user:', user);
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    return Response.json({ user: { _id: user._id, username: user.username, balance: user.balance } });
  } catch (error) {
    console.error(' USER FETCH ERROR:', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}