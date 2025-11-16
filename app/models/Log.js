import mongoose from "mongoose";

const LogSchema = new mongoose.Schema({
  platform: { type: String, required: true }, // e.g. Facebook, Instagram
  title: { type: String, required: true }, // e.g. HQ USA FACEBOOK MIGHT HAVE MULTIPLE ACCOUNTS
  description: { type: String },
  price: { type: Number, required: true }, // e.g. 3500
  quantity: { type: Number, default: 0 },
  username: { type: String, default: "" }, // ✅ New field
  password: { type: String, default: "" }, // ✅ New field
  isSold: { type: Boolean, default: false }, // ✅ Existing field
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Log || mongoose.model("Log", LogSchema);
