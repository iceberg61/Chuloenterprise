// app/api/auth/reset/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import sendEmail from "@/lib/sendEmail";

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

    if (!email || !otp || !newPassword) {
      console.log("❌ Missing required fields");
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("👤 User found:", user.email);
    console.log("🔐 OLD HASH:", user.password);

    // ✅ IMPORTANT FIX — DO NOT HASH HERE
    user.password = newPassword;

    // clear OTP fields
    user.otp = null;
    user.otpExpiry = null;
    user.otpVerified = false;

    await user.save(); // 🔥 pre('save') hashes ONCE

    console.log("🔐 FINAL STORED HASH:", user.password);

    // optional confirmation email
    await sendEmail({
      to: user.email,
      subject: "Your password has been changed",
      html: `<p>Your password was successfully updated.</p>`,
    });


    console.log("✅ Password reset completed for:", user.email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ RESET ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
