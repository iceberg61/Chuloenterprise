import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    logId: { type: mongoose.Schema.Types.ObjectId, ref: "Log", required: true }, // 🔥 important
    product: { type: String, required: true },
    qty: { type: Number, default: 1 },
    amount: { type: Number, required: true },
    status: { type: String, default: "Completed" },
    reference: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
