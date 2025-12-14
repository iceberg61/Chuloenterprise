// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Payment from "@/models/Payment";
// import User from "@/models/User";

// export async function POST(req) {
//   try {
//     await dbConnect();

//     const body = await req.json();
//     const signature = req.headers.get("verif-hash");

//     if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
//       return new Response("Unauthorized", { status: 401 });
//     }

//     if (body.event === "charge.completed" && body.data.status === "successful") {
//       const reference = body.data.tx_ref;
//       const amount = body.data.amount;

//       const payment = await Payment.findOne({
//         transactionId: reference,
//         status: "pending",
//       });

//       if (!payment) {
//         return NextResponse.json({ received: true });
//       }

//       if (Number(payment.amount) !== Number(amount)) {
//         console.warn("Amount mismatch:", reference);
//         return NextResponse.json({ received: true });
//       }

//       payment.status = "success";
//       await payment.save();

//       await User.findByIdAndUpdate(payment.userId, {
//         $inc: { balance: payment.amount },
//       });
//     }

//     return NextResponse.json({ received: true });
//   } catch (err) {
//     console.error("Flutterwave webhook error:", err);
//     return new Response("Server error", { status: 500 });
//   }
// }
