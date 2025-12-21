// app/api/auth/reset/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import sendEmail from "@/lib/sendEmail";

export async function POST(req) {
  try {
    await dbConnect();

    const { email: rawEmail, otp: rawOtp, newPassword: rawPassword } =
      await req.json();

    const email = (rawEmail || "").trim().toLowerCase();
    const otp = (rawOtp || "").toString().trim();
    const newPassword = (rawPassword || "").trim();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "Email, OTP and new password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    if (!user.otpVerified) {
      return NextResponse.json({ error: "OTP not verified" }, { status: 400 });
    }

    
    user.password = newPassword;

    
    user.otp = null;
    user.otpExpiry = null;
    user.otpVerified = false;

    await user.save();

    
    await sendEmail({
      to: user.email,
      subject: "Your password has been changed",
      html: `<p>Your password was successfully updated.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
