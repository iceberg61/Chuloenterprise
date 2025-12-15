import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();

    console.log("🔔 Flutterwave webhook hit");

    const body = await req.json();
    const signature = req.headers.get("verif-hash");

    if (!signature || signature !== process.env.FLW_SECRET_HASH) {
      console.error("❌ Invalid Flutterwave signature");
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("✅ Signature verified");
    console.log("📦 Full payload:", JSON.stringify(body, null, 2));

    const event = body.event;
    const data = body.data || {};

    // 🚨 Only accept account transactions with money
    if (event !== "ACCOUNT_TRANSACTION") {
      console.log("ℹ️ Ignored event:", event);
      return NextResponse.json({ received: true });
    }

    if (!data.tx_ref || Number(data.amount) <= 0) {
      console.log("ℹ️ Invalid transaction data");
      return NextResponse.json({ received: true });
    }

    const reference = data.tx_ref;
    const amount = Number(data.amount);

    console.log("🔗 tx_ref:", reference);
    console.log("💰 amount:", amount);

    const payment = await Payment.findOne({
      transactionId: reference,
    });

    if (!payment) {
      console.error("❌ Payment not found:", reference);
      return NextResponse.json({ received: true });
    }

    if (payment.status === "success") {
      console.warn("⚠️ Already processed:", reference);
      return NextResponse.json({ received: true });
    }

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

    console.log("✅ Payment marked successful");

    // 💳 Credit user
    const user = await User.findByIdAndUpdate(
      payment.userId,
      { $inc: { balance: payment.amount } },
      { new: true }
    );

    console.log("💳 User credited:", {
      userId: user?._id,
      balance: user?.balance,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("🔥 Webhook error:", err);
    return new Response("Server error", { status: 500 });
  }
}
