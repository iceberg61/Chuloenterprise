import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();

    // 🔔 LOG: webhook hit
    console.log("🔔 Flutterwave webhook hit");

    const body = await req.json();
    const signature = req.headers.get("verif-hash");

    // 🔐 Verify signature
    if (!signature || signature !== process.env.FLW_SECRET_HASH) {
      console.error("❌ Invalid Flutterwave signature");
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("✅ Signature verified");

    // Only handle successful charges
    if (body.event !== "charge.completed" || body.data?.status !== "successful") {
      console.log("ℹ️ Ignored event:", body.event, body.data?.status);
      return NextResponse.json({ received: true });
    }

    const reference = body.data.tx_ref;
    const amount = Number(body.data.amount);

    console.log("🔗 tx_ref from Flutterwave:", reference);
    console.log("💰 amount from Flutterwave:", amount);

    // 🔍 FIND PAYMENT (NO status filter — IMPORTANT)
    const payment = await Payment.findOne({ transactionId: reference });

    if (!payment) {
      console.error("❌ Payment NOT found in DB for ref:", reference);
      return NextResponse.json({ received: true });
    }

    console.log("🧾 Payment found:", {
      id: payment._id.toString(),
      status: payment.status,
      amount: payment.amount,
    });

    // 🛑 Idempotency: already processed
    if (payment.status === "success") {
      console.warn("⚠️ Payment already processed:", reference);
      return NextResponse.json({ received: true });
    }

    // 🧮 Amount validation
    if (Number(payment.amount) !== amount) {
      console.error("❌ Amount mismatch", {
        expected: payment.amount,
        received: amount,
      });
      return NextResponse.json({ received: true });
    }

    // ✅ Mark payment successful
    payment.status = "success";
    await payment.save();

    console.log("✅ Payment marked as success");

    // 💳 Credit user
    const user = await User.findByIdAndUpdate(
      payment.userId,
      { $inc: { balance: payment.amount } },
      { new: true }
    );

    console.log("💳 User credited:", {
      userId: user?._id.toString(),
      newBalance: user?.balance,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("🔥 Flutterwave webhook error:", err);
    return new Response("Server error", { status: 500 });
  }
}
