import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();
    const signature = req.headers.get("verif-hash");

    if (!signature || signature !== process.env.FLW_SECRET_HASH) {
      return new Response("Unauthorized", { status: 401 });
    }

    
    const event = body.event;
    const data = body.data;

    if (event !== "charge.completed") {
      return NextResponse.json({ received: true });
    }

    const reference = data?.tx_ref;
    const amount = Number(data?.amount);
    const status = data?.status;

    if (!reference || status !== "successful") {
      return NextResponse.json({ received: true });
    }

    const payment = await Payment.findOne({
      transactionId: reference,
    });

    if (!payment) {
      return NextResponse.json({ received: true });
    }

    if (payment.status === "success") {
      return NextResponse.json({ received: true });
    }

    if (Number(payment.amount) !== amount) {
      return NextResponse.json({ received: true });
    }

    payment.status = "success";
    await payment.save();

    await User.findByIdAndUpdate(payment.userId, {
      $inc: { balance: payment.amount },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Flutterwave webhook error:", err);
    return new Response("Server error", { status: 500 });
  }
}
