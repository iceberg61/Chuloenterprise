import { NextResponse } from "next/server";
import dbConnect from '@/lib/dbConnect';
import Order from "@/models/Order";

export async function GET(req) {
  await dbConnect();

  const userId = req.headers.get("user-id"); 

  if (!userId) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const orders = await Order.find({ userId })
    .populate("logId") 
    .sort({ createdAt: -1 });

  return NextResponse.json(orders);
}
