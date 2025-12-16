// app/api/auth/reset/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import sendEmail from "@/lib/sendEmail";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    console.log("🔁 RESET PASSWORD HIT");

    await dbConnect();
    const body = await req.json();
    console.log("📦 Reset payload:", body);

    const email = (body.email || "").trim().toLowerCase();
    const otp = (body.otp || "").toString().trim();
    const newPassword = (body.newPassword || "").trim();

    console.log("📧 Email:", email);
    console.log("🔢 OTP:", otp);
    console.log("🔐 New password length:", newPassword.length);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("👤 User found:", user.email);
    console.log("🔐 OLD HASH:", user.password);

    const hashed = await bcrypt.hash(newPassword, 12);
    console.log("🔐 MANUAL HASH:", hashed);

    user.password = hashed;
    user.otp = null;
    user.otpExpiry = null;
    user.otpVerified = false;

    await user.save();

    console.log("🔐 FINAL STORED HASH:", user.password);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ RESET ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
