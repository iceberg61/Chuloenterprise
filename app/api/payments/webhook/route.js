import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();

    // 🔍 Log raw headers
    console.log("🔔 Webhook hit");
    console.log("📨 Headers:", Object.fromEntries(req.headers.entries()));

    const body = await req.json();

    // 🔍 Log FULL payload (very important)
    console.log("📦 Full Flutterwave Payload:", JSON.stringify(body, null, 2));

    const signature = req.headers.get("verif-hash");

    console.log("🔐 Signature received:", signature);
    console.log("🔐 Expected signature:", process.env.FLW_SECRET_HASH);

    if (!signature || signature !== process.env.FLW_SECRET_HASH) {
      console.error("❌ Invalid webhook signature");
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("✅ Signature verified");

    const reference = body.txRef;
    const amount = Number(body.amount);
    const status = body.status;

    console.log("🔗 txRef:", reference);
    console.log("💰 amount:", amount);
    console.log("📣 status:", status);
    console.log("📣 event type:", body["event.type"] || body.event);

    if (!reference) {
      console.warn("⚠️ Missing txRef — ignoring");
      return NextResponse.json({ received: true });
    }

    if (status !== "successful") {
      console.warn("⚠️ Non-successful status — ignoring");
      return NextResponse.json({ received: true });
    }

    const payment = await Payment.findOne({
      transactionId: reference,
    });

    console.log("🔍 Payment lookup result:", payment);

    if (!payment) {
      console.warn("❌ No matching payment found in DB");
      return NextResponse.json({ received: true });
    }

    // 🛡️ Idempotency
    if (payment.status === "success") {
      console.log("♻️ Payment already processed — skipping");
      return NextResponse.json({ received: true });
    }

    if (Number(payment.amount) !== amount) {
      console.error("❌ Amount mismatch", {
        dbAmount: payment.amount,
        webhookAmount: amount,
      });
      return NextResponse.json({ received: true });
    }

    payment.status = "success";
    await payment.save();

    const updatedUser = await User.findByIdAndUpdate(
      payment.userId,
      { $inc: { balance: payment.amount } },
      { new: true }
    );

    console.log("💳 User credited:", {
      userId: payment.userId,
      newBalance: updatedUser?.balance,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("🔥 Flutterwave webhook error:", err);
    return new Response("Server error", { status: 500 });
  }
}
