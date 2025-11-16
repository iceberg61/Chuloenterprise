import { NextResponse } from "next/server";
import dbConnect from '@/lib/dbConnect';
import Order from "@/models/Order";

export async function POST(req) {
  await dbConnect();

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch orders and include the log details
    const orders = await Order.find({ userId })
      .populate("logId") // include log data (username, password, title, platform)
      .sort({ createdAt: -1 });

    // Transform into the structure needed by your UI
    const formatted = orders.map((order) => ({
      _id: order._id,
      logTitle: order.logId?.title || "Unknown Log",
      logPlatform: order.logId?.platform || "Unknown",
      logUsername: order.logId?.username || "",
      logPassword: order.logId?.password || "",
      purchasedAt: order.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching user purchases:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
