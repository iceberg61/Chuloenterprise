import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Log from "@/models/Log";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

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

/* =========================
   GET SINGLE LOG
========================= */
export async function GET(req, { params }) {
  try {
    const { id } = await params; // ✅ FIXED

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

/* =========================
   UPDATE LOG
========================= */
export async function PUT(req, { params }) {
  try {
    const { id } = await params; // ✅ FIXED

    await dbConnect();
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();

    const title = formData.get("title");
    const platform = formData.get("platform");
    const description = formData.get("description");
    const price = formData.get("price");
    const quantity = formData.get("quantity");
    const credentials = JSON.parse(formData.get("credentials") || "[]");
    const logoFile = formData.get("logo");

    const existingLog = await Log.findById(id);
    if (!existingLog) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let logoPath = existingLog.logo;

    if (logoFile && typeof logoFile !== "string") {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/uploads");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}_${logoFile.name}`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, buffer);

      logoPath = `/uploads/${fileName}`;
    }

    const updatedLog = await Log.findByIdAndUpdate(
      id,
      {
        title,
        platform,
        description,
        price: Number(price),
        quantity: Number(quantity),
        credentials,
        logo: logoPath,
      },
      { new: true }
    );

    return NextResponse.json(updatedLog);

  } catch (error) {
    console.log("PUT ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/* =========================
   DELETE LOG
========================= */
export async function DELETE(req, { params }) {
  try {
    const { id } = await params; // ✅ FIXED

    await dbConnect();
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Log.findByIdAndDelete(id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.log("DELETE ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}