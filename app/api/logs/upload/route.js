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
    if (Number.isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    
    const credentials = Array.isArray(body.credentials)
      ? body.credentials.filter(c =>
          c.username?.trim() ||
          c.password?.trim() ||
          c.email?.trim() ||
          c.emailPassword?.trim() ||
          c.twoFA?.trim()
        )
      : [];

    const existingLog = await Log.findOne({
      platform: body.platform.toLowerCase(),
      title: body.title.trim(),
    });

    let log;

    if (existingLog) {
      existingLog.credentials.push(...credentials);
      existingLog.quantity = existingLog.credentials.length;
      existingLog.isSold = false;  
      await existingLog.save();
      log = existingLog;
    } else {
      log = await Log.create({
        platform: body.platform.toLowerCase(),
        title: body.title.trim(),
        description: body.description || "",
        price,
        credentials,
        quantity: credentials.length,
        isSold: false,
      });
    }

    return NextResponse.json({ success: true, log }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
