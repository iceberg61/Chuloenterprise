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
      return NextResponse.json(
        { error: "User or Log not found" },
        { status: 404 }
      );
    }

    if (qty > log.quantity) {
      return NextResponse.json(
        { error: "Not enough quantity available" },
        { status: 400 }
      );
    }

    const totalCost = log.price * qty;

    if (user.balance < totalCost) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Deduct user's balance
    user.balance -= totalCost;

    // Deduct quantity from log
    log.quantity -= qty;

    if (log.quantity === 0) {
      log.isSold = true;
    }

    // Create N cloned accounts
    const accounts = [];

    for (let i = 0; i < qty; i++) {
      accounts.push({
        username: log.username,
        password: log.password,
        email: log.email,
        emailPassword: log.emailPassword,
        twoFA: log.twoFA,
      });
    }

    // Create order with multiple accounts
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

    // SAVE modifications
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
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
