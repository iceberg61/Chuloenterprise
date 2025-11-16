import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Log from "@/models/Log";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    await dbConnect();

    // Read token from httpOnly cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verify failed:", err.message);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check admin role
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bodyText = await req.text();
    if (!bodyText) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    const body = JSON.parse(bodyText);
    const {
      platform,
      title,
      description = "",
      price,
      quantity = 1,
      username = "",
      password = "",
    } = body;

    if (!platform || !title || typeof price === "undefined") {
      return NextResponse.json(
        { error: "Missing required fields (platform, title, price)" },
        { status: 400 }
      );
    }

    const newLog = await Log.create({
      platform: platform.toLowerCase(),
      title,
      description,
      price: Number(price),
      quantity: Number(quantity),
      username,
      password,
    });

    return NextResponse.json({ success: true, log: newLog }, { status: 201 });
  } catch (error) {
    console.error("Error uploading log:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
