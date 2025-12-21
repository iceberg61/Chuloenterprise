import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  emailPassword: String,
  twoFA: String,
});

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },

    // log reference
    logId: { type: mongoose.Schema.Types.ObjectId, ref: "Log", required: true },

    // single product, multiple accounts
    title: { type: String, required: true },
    platform: { type: String, required: true },

    accounts: [AccountSchema], 

    qty: { type: Number, default: 1 },
    amount: { type: Number, required: true },
    status: { type: String, default: "Completed" },
    reference: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
