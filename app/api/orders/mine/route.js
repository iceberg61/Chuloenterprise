import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function POST(req) {
  await dbConnect();

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const orders = await Order.find({ userId })
      .populate("logId")
      .sort({ createdAt: -1 });

    const formatted = orders.map((order) => ({
      _id: order._id,
      title: order.title || order.product,
      platform: order.platform || order.logId?.platform,
      accounts: order.accounts || [],
      purchasedAt: order.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching user purchases:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
