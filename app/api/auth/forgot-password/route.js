// app/api/auth/forgot-password/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import sendEmail from "@/lib/sendEmail";

const OTP_TTL_MS = 10 * 60 * 1000; 

export async function POST(req) {
  try {
    await dbConnect();
    const { email: rawEmail } = await req.json();
    const email = (rawEmail || "").trim().toLowerCase();

    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
    user.otpVerified = false; 
    await user.save();

    // send OTP email
    await sendEmail({
      to: user.email,
      subject: "Your Chuloenterprise Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reset Your Password</h2>
          <p>Hello ${user.username || ""},</p>
          <p>Use the code below to reset your password. It expires in 10 minutes.</p>
          <h1 style="color: #2563eb; letter-spacing: 4px;">${otp}</h1>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    console.log(`OTP sent to ${user.email}: ${otp}`);
    return NextResponse.json({ message: "OTP sent successfully" }, { status: 200 });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
