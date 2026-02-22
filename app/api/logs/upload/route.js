import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/dbConnect";
import Log from "@/models/Log";
import cloudinary from "@/lib/cloudinary"; // ✅ NEW

export const runtime = "nodejs";

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

    const formData = await req.formData();

    const platform = formData.get("platform");
    const title = formData.get("title");
    const description = formData.get("description");
    const price = Number(formData.get("price"));
    const credentials = JSON.parse(formData.get("credentials") || "[]");
    const file = formData.get("logo");

    if (Number.isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }

    let logoPath = "";

    // ✅ CLOUDINARY UPLOAD START
    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

      const uploaded = await cloudinary.uploader.upload(base64Image, {
        folder: "social-logs",
        transformation: [
          { width: 300, height: 300, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      });

      logoPath = uploaded.secure_url;
    }
    // ✅ CLOUDINARY UPLOAD END

    const log = await Log.create({
      platform: platform.toLowerCase(),
      title: title.trim(),
      description: description || "",
      price,
      credentials,
      quantity: credentials.length,
      logo: logoPath,
      isSold: false,
    });

    return NextResponse.json({ success: true, log }, { status: 201 });

  } catch (error) {
    console.error("POST ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}