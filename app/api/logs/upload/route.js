import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Log from "@/models/Log";

export async function POST(req) {
  try {
    await dbConnect();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const price = Number(body.price);
    const quantity = Number(body.quantity || 1);

    if (Number.isNaN(price) || price <= 0) {
      return NextResponse.json(
        { error: "Invalid price value" },
        { status: 400 }
      );
    }

    const log = await Log.create({
      platform: body.platform.toLowerCase(),
      title: body.title,
      description: body.description || "",
      price,
      quantity,
      username: body.username || "",
      password: body.password || "",
    });

    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (error) {
    console.error("Upload log error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
