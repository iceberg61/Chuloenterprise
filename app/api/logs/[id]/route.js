import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Log from "@/models/Log";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { cookies } from "next/headers";

export const runtime = "nodejs";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  await dbConnect();
  const user = await User.findById(decoded.id);

  return user?.role === "admin" ? user : null;
}

// ⭐ FIXED GET ROUTE ⭐
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    await dbConnect();
    const log = await Log.findById(id);

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    return NextResponse.json(log);
  } catch (error) {
    console.log("LOG FETCH ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = await params;

  await dbConnect();
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();

  delete data._id;
  delete data.__v;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.isSold;

  const updatedLog = await Log.findByIdAndUpdate(id, data, { new: true });

  if (!updatedLog) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(updatedLog);
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  await dbConnect();
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await Log.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
