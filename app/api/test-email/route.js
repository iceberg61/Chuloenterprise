import { NextResponse } from "next/server";
import  sendEmail from "@/lib/sendEmail";

export async function GET() {
  await sendEmail("yourPersonalEmail@example.com", "Test Email", "<p>Working!</p>");
  return NextResponse.json({ message: "Email sent" });
}
