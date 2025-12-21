import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const runtime = "nodejs"; 

export async function GET() {
  try {
    await dbConnect();

    //  Await the cookies() call
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Extracted token from cookie:", token);

    //  Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  Fetch orders for this user
    const orders = await Order.find({ email: decoded.email }).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
 