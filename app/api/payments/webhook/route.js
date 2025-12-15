import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();

    // 🔔 Webhook hit
    console.log("🔔 Flutterwave webhook hit");

    const body = await req.json();
    const signature = req.headers.get("verif-hash");

    // 🔐 Verify webhook signature
    if (!signature || signature !== process.env.FLW_SECRET_HASH) {
      console.error("❌ Invalid Flutterwave signature");
      return new Response("Unauthorized", { status: 401 });
    }

    console.log("✅ Signature verified");

    // 🧠 Normalize event + status
    const event =
      body.event ||
      body?.["event.type"] ||
      body?.data?.event;

    const status = body?.data?.status;

    console.log("📣 Event received:", event);
    console.log("📣 Status received:", status);

    // ❌ Ignore non-successful payments
    if (status !== "successful") {
      console.log("ℹ️ Ignored non-successful event");
      return NextResponse.json({ received: true });
    }

    const reference = body?.data?.tx_ref;
    const amount = Number(body?.data?.amount);

    if (!reference) {
      console.error("❌ Missing tx_ref in webhook payload");
      return NextResponse.json({ received: true });
    }

    console.log("🔗 tx_ref:", reference);
    console.log("💰 amount:", amount);

    // 🔍 Find payment (NO status filter)
    const payment = await Payment.findOne({
      transactionId: reference,
    });

    if (!payment) {
      console.error("❌ Payment NOT found in DB:", reference);
      return NextResponse.json({ received: true });
    }

    console.log("🧾 Payment found:", {
      id: payment._id.toString(),
      status: payment.status,
      amount: payment.amount,
    });

    // 🛑 Idempotency guard
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

    // ✅ Mark payment as successful
    payment.status = "success";
    await payment.save();

    console.log("✅ Payment marked as success");

    // 💳 Credit user balance
    const user = await User.findByIdAndUpdate(
      payment.userId,
      { $inc: { balance: payment.amount } },
      { new: true }
    );

    console.log("💳 User credited successfully:", {
      userId: user?._id.toString(),
      newBalance: user?.balance,
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("🔥 Flutterwave webhook error:", err);
    return new Response("Server error", { status: 500 });
  }
}
