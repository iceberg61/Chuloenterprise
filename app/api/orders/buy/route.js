import { NextResponse } from "next/server";
import dbConnect from '@/lib/dbConnect';
import User from "@/models/User";
import Log from "@/models/Log";
import Order from "@/models/Order";

export async function POST(req) {
  await dbConnect();

  try {
    const { userId, logId, qty } = await req.json();

    if (!qty || qty < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const user = await User.findById(userId);
    const log = await Log.findById(logId);

    if (!user || !log) {
      return NextResponse.json({ error: "User or Log not found" }, { status: 404 });
    }

    if (qty > log.quantity) {
      return NextResponse.json({ error: "Not enough quantity available" }, { status: 400 });
    }

    const totalCost = log.price * qty;

    if (user.balance < totalCost) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // deduct balance
    user.balance -= totalCost;

    // extract credentials for purchase
    const accounts = log.credentials.slice(0, qty);

    // update log
    log.credentials = log.credentials.slice(qty);
    log.quantity = log.credentials.length;
    log.isSold = log.quantity === 0;

    // create order
    const order = await Order.create({
      userId: user._id,
      email: user.email,
      logId: log._id,
      title: log.title,
      platform: log.platform,
      accounts,
      qty,
      amount: totalCost,
      status: "Completed",
      reference: `LOG-${Date.now()}`,
    });

    await Promise.all([user.save(), log.save()]);

    return NextResponse.json({
      success: true,
      message: "Purchase successful",
      order,
      newBalance: user.balance,
      remainingQty: log.quantity,
    });

  } catch (error) {
    console.error("Buy Log Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
