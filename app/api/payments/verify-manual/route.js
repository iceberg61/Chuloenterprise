// import { NextResponse } from "next/server";
// import dbConnect from "@/lib/dbConnect";
// import Payment from "@/models/Payment";
// import User from "@/models/User";
// import jwt from "jsonwebtoken";
// import { cookies } from "next/headers";

// export async function POST(req) {
//   try {
//     await dbConnect();

//     const { reference } = await req.json();

//     // ✅ Await cookies
//     const cookieStore = await cookies();
//     const token = cookieStore.get("token")?.value;

//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return NextResponse.json({ error: "User not found" }, { status: 404 });
//     }

//     // 🚫 Disable manual verification in production
//     if (process.env.NODE_ENV === "production") {
//       return NextResponse.json(
//         { error: "Manual verification disabled" },
//         { status: 403 }
//       );
//     }

//     const payment = await Payment.findOne({
//       transactionId: reference,
//       userId: user._id,
//       status: "pending",
//     });

//     if (!payment) {
//       return NextResponse.json(
//         { error: "Payment not found or already processed" },
//         { status: 404 }
//       );
//     }

//     // ✅ Credit user
//     payment.status = "success";
//     await payment.save();

//     user.balance += payment.amount;
//     await user.save();

//     return NextResponse.json({
//       success: true,
//       newBalance: user.balance,
//       message: "Payment verified successfully",
//     });
//   } catch (error) {
//     console.error("Manual verify error:", error);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Manual verification disabled in production" },
    { status: 410 } // Gone
  );
}
