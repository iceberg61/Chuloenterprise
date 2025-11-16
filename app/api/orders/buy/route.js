import { NextResponse } from "next/server";
import dbConnect from '@/lib/dbConnect';
import User from "@/models/User";
import Log from "@/models/Log";
import Order from "@/models/Order";

export async function POST(req) {
  await dbConnect();

  try {
    const { userId, logId } = await req.json();

    const user = await User.findById(userId);
    const log = await Log.findById(logId);

    if (!user || !log) {
      return NextResponse.json({ error: "User or Log not found" }, { status: 404 });
    }

    if (log.isSold) {
      return NextResponse.json({ error: "This log has already been sold" }, { status: 400 });
    }

    if (user.balance < log.price) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    //  Deduct and mark as sold
    user.balance -= log.price;
    log.isSold = true;
    await Promise.all([user.save(), log.save()]); // ensure both saved

    //  Create order
    const order = await Order.create({
      userId: user._id,
      email: user.email,
      logId: log._id, 
      product: log.title,
      qty: 1,
      amount: log.price,
      status: "Completed",
      reference: `LOG-${Date.now()}`,
    });


    return NextResponse.json({
      success: true,
      message: "Purchase successful",
      order,
      newBalance: user.balance,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
